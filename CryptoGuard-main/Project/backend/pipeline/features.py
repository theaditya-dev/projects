FEATURE_NAMES = [
    "amount",
    "fee",
    "n_inputs",
    "n_outputs",
    "network_chain_size",
    "distinct_blockchain_clusters_in_chain",
    "is_shared_infra",
    "correlation_flag_int",
    "cluster_confidence_low"
]

def extract_ml_feature_matrix(records, wallet_to_cluster, cluster_metadata, tx_to_chain_meta):
    """
    Extracts the exact 9-element ML feature matrix for each transaction record.
    Preserves all handoff contract rules.
    """
    feature_rows = []
    metadata_rows = []
    
    for rec in records:
        txid = rec["txid"]
        inputs = rec["input_wallets"]
        outputs = rec["output_wallets"]
        
        amount = float(rec["amount"])
        fee = float(rec["fee"])
        n_inputs = len(inputs)
        n_outputs = len(outputs)
        
        chain_meta = tx_to_chain_meta.get(txid, {
            "network_chain_id": "none",
            "network_chain_size": 1,
            "distinct_blockchain_clusters_in_chain": 1,
            "src_ip_infra_class": "plain_single_host",
            "is_shared_infra": 0,
            "correlation_flag": 0
        })
        
        network_chain_size = int(chain_meta["network_chain_size"])
        distinct_clusters = int(chain_meta["distinct_blockchain_clusters_in_chain"])
        is_shared_infra = int(chain_meta["is_shared_infra"])
        correlation_flag_int = int(chain_meta["correlation_flag"])
        
        # Check input wallet cluster confidence
        primary_wallet = inputs[0] if inputs else (outputs[0] if outputs else "unknown")
        cid = wallet_to_cluster.get(primary_wallet, "cluster_000")
        c_meta = cluster_metadata.get(cid, {"cluster_confidence_low": 0, "confidence": "HIGH"})
        cluster_confidence_low = int(c_meta["cluster_confidence_low"])
        
        feature_vector = [
            amount,
            fee,
            n_inputs,
            n_outputs,
            network_chain_size,
            distinct_clusters,
            is_shared_infra,
            correlation_flag_int,
            cluster_confidence_low
        ]
        
        feature_rows.append(feature_vector)
        metadata_rows.append({
            "txid": txid,
            "timestamp": rec["timestamp"],
            "src_ip": rec["src_ip"],
            "primary_wallet": primary_wallet,
            "cluster_id": cid,
            "cluster_confidence": c_meta["confidence"],
            "chain_meta": chain_meta,
            "rec": rec
        })
        
    return feature_rows, metadata_rows
