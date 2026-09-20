import json
from datetime import datetime

REQUIRED_FIELDS = [
    "timestamp", "src_ip", "dst_ip", "port", "txid", 
    "input_wallets", "output_wallets", "amount", "fee"
]

def parse_and_validate_dataset(raw_data):
    """
    Parses and validates raw transaction and network log records from JSON or list of dicts.
    Returns cleaned records sorted by timestamp.
    """
    if isinstance(raw_data, str):
        try:
            records = json.loads(raw_data)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON data: {e}")
    elif isinstance(raw_data, list):
        records = raw_data
    else:
        raise ValueError("Unsupported data format. Expected JSON string or list of dicts.")

    cleaned_records = []
    
    for idx, rec in enumerate(records):
        # Fill defaults or validate required fields
        txid = rec.get("txid") or f"tx_unknown_{idx}"
        timestamp_str = rec.get("timestamp")
        
        try:
            # Standardize ISO 8601 parsing
            dt = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
        except Exception:
            dt = datetime.utcnow()
            
        src_ip = str(rec.get("src_ip", "0.0.0.0"))
        dst_ip = str(rec.get("dst_ip", "0.0.0.0"))
        port = int(rec.get("port", 8333))
        
        input_wallets = rec.get("input_wallets") or rec.get("inputs") or []
        if isinstance(input_wallets, str):
            input_wallets = [input_wallets]
            
        output_wallets = rec.get("output_wallets") or rec.get("outputs") or []
        if isinstance(output_wallets, str):
            output_wallets = [output_wallets]
            
        amount = float(rec.get("amount", 0.0))
        fee = float(rec.get("fee", 0.0001))
        script_type = str(rec.get("script_type", "p2wpkh"))
        ground_truth = bool(rec.get("is_suspicious_ground_truth", False))

        cleaned_records.append({
            "timestamp": dt.isoformat(),
            "datetime_obj": dt,
            "src_ip": src_ip,
            "dst_ip": dst_ip,
            "port": port,
            "txid": txid,
            "input_wallets": [str(w) for w in input_wallets],
            "output_wallets": [str(w) for w in output_wallets],
            "amount": amount,
            "fee": fee,
            "script_type": script_type,
            "is_suspicious_ground_truth": ground_truth
        })

    cleaned_records.sort(key=lambda x: x["datetime_obj"])
    return cleaned_records
