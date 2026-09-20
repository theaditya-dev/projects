import random
from datetime import datetime, timedelta, timezone
import json

def generate_synthetic_dataset(num_records=250, seed=42):
    """
    Generates a realistic synthetic dataset combining Bitcoin transactions 
    and network layer metadata according to forensic correlation specifications.
    
    Includes engineered suspicious scenarios:
    1. Rapid Peel Chain / Velocity Burst
    2. CoinJoin mixing pattern
    3. Multi-cluster network chain (single host broadcasting multiple transactions rapidly)
    4. Shared infrastructure / Tor node activity
    """
    random.seed(seed)
    base_time = datetime.now(timezone.utc) - timedelta(hours=5)
    
    records = []

    # Normal IP pool & wallet pool
    normal_ips = [f"192.168.1.{i}" for i in range(1, 30)] + [f"10.0.4.{i}" for i in range(1, 20)]
    tor_ips = ["185.220.101.4", "185.220.101.5", "198.96.155.3"]
    vpn_ips = ["45.142.120.10", "45.142.120.11"]
    
    wallets = [f"bc1q_norm_{i:04d}" for i in range(1, 100)]
    
    current_time = base_time

    # Generate normal traffic (approx 180 txs)
    for i in range(180):
        current_time += timedelta(seconds=random.randint(15, 120))
        n_in = random.choice([1, 1, 1, 2, 2, 3])
        n_out = random.choice([1, 2, 2, 2, 3])
        
        in_wallets = random.sample(wallets, n_in)
        out_wallets = random.sample(wallets, n_out)
        
        amount = round(random.uniform(0.01, 2.5), 4)
        fee = round(amount * random.uniform(0.0001, 0.001), 6)
        
        records.append({
            "timestamp": current_time.isoformat(),
            "src_ip": random.choice(normal_ips),
            "dst_ip": "10.0.0.1",
            "port": 8333,
            "txid": f"tx_normal_{i:04d}",
            "input_wallets": in_wallets,
            "output_wallets": out_wallets,
            "amount": amount,
            "fee": fee,
            "script_type": random.choice(["p2wpkh", "p2pkh", "p2sh"]),
            "is_suspicious_ground_truth": False
        })

    # Suspicious Pattern 1: Rapid Peel Chain (Wallet A -> B -> C -> D in seconds with high amounts)
    peel_ip = "192.168.1.99"
    peel_wallets = [f"bc1q_peel_{i}" for i in range(6)]
    peel_time = base_time + timedelta(minutes=45)
    for i in range(len(peel_wallets) - 1):
        peel_time += timedelta(seconds=12) # rapid 12s gap
        records.append({
            "timestamp": peel_time.isoformat(),
            "src_ip": peel_ip,
            "dst_ip": "10.0.0.1",
            "port": 8333,
            "txid": f"tx_peel_chain_{i:02d}",
            "input_wallets": [peel_wallets[i], f"bc1q_peel_aux_{i}"],
            "output_wallets": [peel_wallets[i+1], f"bc1q_peel_change_{i}"],
            "amount": round(15.5 - (i * 0.5), 4),
            "fee": 0.0050,
            "script_type": "p2wpkh",
            "is_suspicious_ground_truth": True
        })

    # Suspicious Pattern 2: CoinJoin Mixing (>=3 inputs and >=3 outputs)
    cj_ip = "185.220.101.4" # Tor exit node
    cj_inputs = [f"bc1q_mix_in_{i}" for i in range(5)]
    cj_outputs = [f"bc1q_mix_out_{i}" for i in range(5)]
    cj_time = base_time + timedelta(hours=2)
    records.append({
        "timestamp": cj_time.isoformat(),
        "src_ip": cj_ip,
        "dst_ip": "10.0.0.1",
        "port": 9050,
        "txid": "tx_coinjoin_mix_01",
        "input_wallets": cj_inputs,
        "output_wallets": cj_outputs,
        "amount": 25.0,
        "fee": 0.012,
        "script_type": "p2sh",
        "is_suspicious_ground_truth": True
    })

    # Suspicious Pattern 3: High-velocity Network Chain from single host across multiple distinct wallet clusters
    chain_ip = "198.51.100.42"
    chain_time = base_time + timedelta(hours=3)
    for i in range(5):
        chain_time += timedelta(seconds=20) # <= 300s inter-arrival gap
        records.append({
            "timestamp": chain_time.isoformat(),
            "src_ip": chain_ip,
            "dst_ip": "10.0.0.1",
            "port": 8333,
            "txid": f"tx_network_chain_{i:02d}",
            "input_wallets": [f"bc1q_cluster_{i}_a", f"bc1q_cluster_{i}_b"], # distinct clusters
            "output_wallets": [f"bc1q_target_{i}"],
            "amount": round(8.0 + i * 2.5, 4),
            "fee": 0.008,
            "script_type": "p2wpkh",
            "is_suspicious_ground_truth": True
        })

    # Suspicious Pattern 4: Shared IP Fan-Out (Same IP used by > 8 distinct wallets)
    fan_ip = "45.142.120.10" # Shared VPN
    fan_time = base_time + timedelta(hours=4)
    for i in range(10):
        fan_time += timedelta(seconds=45)
        records.append({
            "timestamp": fan_time.isoformat(),
            "src_ip": fan_ip,
            "dst_ip": "10.0.0.1",
            "port": 443,
            "txid": f"tx_fanout_{i:02d}",
            "input_wallets": [f"bc1q_fan_in_{i}"],
            "output_wallets": [f"bc1q_fan_out_{i}"],
            "amount": round(0.5 + i * 0.1, 4),
            "fee": 0.001,
            "script_type": "p2pkh",
            "is_suspicious_ground_truth": True
        })

    # Sort records by timestamp
    records.sort(key=lambda x: x["timestamp"])
    return records

if __name__ == "__main__":
    data = generate_synthetic_dataset()
    print(f"Generated {len(data)} synthetic records.")
    with open("sample_dataset.json", "w") as f:
        json.dump(data, f, indent=2)
