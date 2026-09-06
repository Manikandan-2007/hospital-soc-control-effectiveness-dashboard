"""
Event Processing Module
Handles telemetry events with strict temporal integrity:
- Deduplication: rejects or flags duplicate event_id
- Delay detection: calculates latency between event_timestamp and processing_timestamp
- Out-of-order processing: sorts events chronologically to prevent state corruption
- Recovery mechanism for simulated event injections
"""

from datetime import datetime, timezone
from typing import Dict, List, Any, Tuple

def parse_time(t_str: str) -> datetime:
    if not t_str:
        return datetime.min.replace(tzinfo=timezone.utc)
    t_str = t_str.strip()
    if t_str.endswith('Z'):
        t_str = t_str[:-1] + '+00:00'
    try:
        return datetime.fromisoformat(t_str)
    except Exception:
        return datetime.min.replace(tzinfo=timezone.utc)

class EventProcessor:
    def __init__(self, delay_threshold_hours: float = 2.0):
        self.delay_threshold_hours = delay_threshold_hours
        self.seen_event_ids = set()
        self.processed_events = []
        self.stats = {
            "total_received": 0,
            "unique_accepted": 0,
            "duplicates_dropped": 0,
            "delayed_events": 0,
            "out_of_order_corrected": 0
        }

    def process_telemetry_batch(self, raw_events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Takes raw telemetry event rows, deduplicates, detects delay,
        and produces a chronologically ordered event stream.
        """
        self.seen_event_ids.clear()
        self.stats = {
            "total_received": len(raw_events),
            "unique_accepted": 0,
            "duplicates_dropped": 0,
            "delayed_events": 0,
            "out_of_order_corrected": 0
        }

        unique_events = []
        duplicate_logs = []
        delayed_logs = []

        # 1. Deduplication and Delay Flagging
        for ev in raw_events:
            event_id = ev.get("event_id", "")
            if not event_id or event_id in self.seen_event_ids:
                self.stats["duplicates_dropped"] += 1
                duplicate_logs.append({
                    "event_id": event_id,
                    "reason": "Duplicate event_id detected. Ignored to preserve idempotent state.",
                    "raw": ev
                })
                continue

            self.seen_event_ids.add(event_id)
            ev_parsed = dict(ev)

            # Parse event time & processing time
            dt_event = parse_time(ev.get("event_timestamp", ""))
            dt_proc = parse_time(ev.get("processing_timestamp", ""))
            ev_parsed["_dt_event"] = dt_event
            ev_parsed["_dt_proc"] = dt_proc

            # Check for delay
            if dt_proc > dt_event:
                latency_hours = (dt_proc - dt_event).total_seconds() / 3600.0
                ev_parsed["latency_hours"] = round(latency_hours, 2)
                if latency_hours > self.delay_threshold_hours:
                    ev_parsed["is_delayed"] = True
                    self.stats["delayed_events"] += 1
                    delayed_logs.append({
                        "event_id": event_id,
                        "latency_hours": latency_hours,
                        "event_timestamp": ev.get("event_timestamp"),
                        "processing_timestamp": ev.get("processing_timestamp")
                    })
                else:
                    ev_parsed["is_delayed"] = False
            else:
                ev_parsed["latency_hours"] = 0.0
                ev_parsed["is_delayed"] = False

            unique_events.append(ev_parsed)

        self.stats["unique_accepted"] = len(unique_events)

        # 2. Check if events arrived out of order originally
        is_ordered = True
        for i in range(len(unique_events) - 1):
            if unique_events[i]["_dt_event"] > unique_events[i + 1]["_dt_event"]:
                is_ordered = False
                self.stats["out_of_order_corrected"] += 1

        # 3. Sort chronologically by event_timestamp
        chronological_events = sorted(unique_events, key=lambda x: x["_dt_event"])

        # 4. Clean up internal datetime objects for serialization
        final_stream = []
        latest_control_state = {}
        for ev in chronological_events:
            clean_item = {k: v for k, v in ev.items() if not k.startswith("_")}
            final_stream.append(clean_item)
            cid = ev.get("control_id")
            if cid:
                latest_control_state[cid] = {
                    "last_event_id": ev.get("event_id"),
                    "last_timestamp": ev.get("event_timestamp"),
                    "last_status": ev.get("control_status"),
                    "last_type": ev.get("event_type")
                }

        self.processed_events = final_stream
        return {
            "stats": self.stats,
            "duplicates": duplicate_logs,
            "delayed": delayed_logs,
            "events": final_stream,
            "latest_control_state": latest_control_state
        }

    def inject_simulated_event(self, anomaly_type: str, base_events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Injects an anomaly into the event stream and runs processor to show recovery:
        - 'duplicate': re-inserts an existing event ID with identical or slightly modified payload
        - 'delayed': injects an event with a 48-hour lag between event and processing time
        - 'out_of_order': appends an event with a timestamp from 3 days ago at the end of the batch
        """
        events_copy = [dict(e) for e in base_events]

        if anomaly_type == "duplicate":
            if events_copy:
                dup_event = dict(events_copy[0])
                dup_event["source"] = f"{dup_event.get('source', '')} [SIMULATED REPLAY]"
                events_copy.append(dup_event)
                result = self.process_telemetry_batch(events_copy)
                result["simulation_message"] = f"Injected duplicate event ID '{dup_event['event_id']}'. Successfully dropped duplicate without double-counting failure/success counters."
                return result

        elif anomaly_type == "delayed":
            delayed_event = {
                "event_id": f"SIM-DELAY-{len(events_copy)+1}",
                "control_id": "CTL-PTC-001",
                "asset_id": "AST-CTS-001",
                "event_timestamp": "2026-09-02T04:00:00Z",
                "event_type": "control_failure",
                "control_status": "control_failure",
                "source": "Simulated Delayed Edge Logger",
                "processing_timestamp": "2026-09-06T08:00:00Z"  # 100 hours delay
            }
            events_copy.append(delayed_event)
            result = self.process_telemetry_batch(events_copy)
            result["simulation_message"] = f"Injected delayed event '{delayed_event['event_id']}' (100h latency). Flagged as DELAYED; processed into historical record without corrupting current real-time state."
            return result

        elif anomaly_type == "out_of_order":
            out_event = {
                "event_id": f"SIM-OOO-{len(events_copy)+1}",
                "control_id": "CTL-SEG-001",
                "asset_id": "AST-ICU-001",
                "event_timestamp": "2026-09-01T06:00:00Z",  # Earlier than all recent events
                "event_type": "monitoring_heartbeat",
                "control_status": "control_success",
                "source": "Simulated Flapping Router Queue",
                "processing_timestamp": "2026-09-06T08:00:00Z"
            }
            # Append at end of list
            events_copy.append(out_event)
            result = self.process_telemetry_batch(events_copy)
            result["simulation_message"] = f"Injected out-of-order event '{out_event['event_id']}' dated 2026-09-01 at the end of batch. Re-ordered chronologically before evaluating latest control state."
            return result

        return self.process_telemetry_batch(events_copy)

if __name__ == "__main__":
    import os
    from data_validator import DataValidator
    data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
    v = DataValidator(data_dir)
    records, _ = v.load_csv("control_telemetry.csv", ["event_id"])
    ep = EventProcessor()
    out = ep.process_telemetry_batch(records)
    print("Processed batch stats:", out["stats"])
