from datetime import datetime

TOR_IPS = {"185.220.101.4", "185.220.101.5", "198.96.155.3"}
VPN_IPS = {"45.142.120.10", "45.142.120.11"}

def classify_infrastructure(ip_address, total_associated_wallets):
    """
    Classifies network IP infrastructure.
    """
    if ip_address in TOR_IPS:
        return "tor_exit"
    elif ip_address in VPN_IPS:
        return "vpn"
    elif total_associated_wallets >= 8:
        return "shared_datacenter"
    else:
        return "plain_single_host"

def analyze_network_chains_and_correlations(records, wallet_to_cluster):
    """
    Performs cross-layer correlation & network-chain detection.
    - Groups txs by src_ip with inter-arrival gap <= 300 seconds.
    - Flags chains matching: size >= 3, plain_single_host, >= 1 distinct blockchain cluster.
    """
    # 1. Group records by src_ip
    ip_records = {}
    ip_wallet_sets = {}
    
    for rec in records:
        ip = rec["src_ip"]
        if ip not in ip_records:
            ip_records[ip] = []
            ip_wallet_sets[ip] = set()
            
        ip_records[ip].append(rec)
        for w in rec["input_wallets"] + rec["output_wallets"]:
            ip_wallet_sets[ip].add(w)

    # Determine infra classification & shared infra status for each IP
    ip_infra_meta = {}
    for ip, wallets in ip_wallet_sets.items():
        total_wallets = len(wallets)
        infra_class = classify_infrastructure(ip, total_wallets)
        is_shared_infra = 1 if (infra_class in ["tor_exit", "vpn", "shared_datacenter"] or total_wallets >= 8) else 0
        ip_infra_meta[ip] = {
            "infra_class": infra_class,
            "is_shared_infra": is_shared_infra,
            "total_wallets": total_wallets
        }

    # 2. Extract network chains per src_ip (inter-arrival <= 300s)
    tx_to_chain_meta = {}
    chain_counter = 1
    
    for ip, rec_list in ip_records.items():
        # Sorted by datetime_obj
        rec_list.sort(key=lambda x: x["datetime_obj"])
        
        current_chain = []
        for i, rec in enumerate(rec_list):
            if not current_chain:
                current_chain.append(rec)
            else:
                prev_time = current_chain[-1]["datetime_obj"]
                curr_time = rec["datetime_obj"]
                gap_seconds = (curr_time - prev_time).total_seconds()
                
                if gap_seconds <= 300: # Rule: <= 300s gap
                    current_chain.append(rec)
                else:
                    # Finalize current chain
                    _finalize_chain(current_chain, chain_counter, ip_infra_meta[ip], wallet_to_cluster, tx_to_chain_meta)
                    chain_counter += 1
                    current_chain = [rec]
                    
        if current_chain:
            _finalize_chain(current_chain, chain_counter, ip_infra_meta[ip], wallet_to_cluster, tx_to_chain_meta)
            chain_counter += 1

    return tx_to_chain_meta, ip_infra_meta

def _finalize_chain(chain_records, chain_idx, ip_meta, wallet_to_cluster, tx_to_chain_meta):
    chain_id = f"chain_{chain_idx:03d}"
    chain_size = len(chain_records)
    
    # Calculate distinct blockchain clusters in this chain
    clusters_in_chain = set()
    for rec in chain_records:
        for w in rec["input_wallets"] + rec["output_wallets"]:
            if w in wallet_to_cluster:
                clusters_in_chain.add(wallet_to_cluster[w])
                
    distinct_cluster_count = len(clusters_in_chain)
    infra_class = ip_meta["infra_class"]
    
    # Rule: Cross-layer correlation flags chains with size >= 3, plain_single_host infra, and >= 1 distinct cluster
    correlation_flag = 1 if (chain_size >= 3 and infra_class == "plain_single_host" and distinct_cluster_count >= 1) else 0

    for rec in chain_records:
        tx_to_chain_meta[rec["txid"]] = {
            "network_chain_id": chain_id,
            "network_chain_size": chain_size,
            "distinct_blockchain_clusters_in_chain": distinct_cluster_count,
            "src_ip_infra_class": infra_class,
            "is_shared_infra": ip_meta["is_shared_infra"],
            "correlation_flag": correlation_flag
        }
