import numpy as np
from sklearn.ensemble import IsolationForest

def run_anomaly_detection_and_scoring(feature_matrix, metadata_rows):
    """
    Fits IsolationForest on extracted feature matrix.
    Computes anomaly scores, maps them to 0-100 Risk Scores, assigns severity levels,
    and produces plain-English explanations.
    """
    X = np.array(feature_matrix, dtype=float)
    n_samples = len(X)
    
    if n_samples == 0:
        return []

    # Fit Isolation Forest (contamination ~ 10% for suspicious traffic detection)
    contamination_rate = max(0.05, min(0.20, 15.0 / max(1, n_samples)))
    iso = IsolationForest(contamination=contamination_rate, random_state=42)
    iso.fit(X)
    
    # Decision function returns higher for normal, negative/lower for anomalies
    raw_scores = iso.decision_function(X) # lower score = more anomalous
    
    # Normalize decision scores to 0-100 Risk Score (where 100 = highest risk)
    min_s, max_s = raw_scores.min(), raw_scores.max()
    range_s = max_s - min_s if max_s > min_s else 1.0
    
    results = []
    
    for i, meta in enumerate(metadata_rows):
        feat = X[i]
        raw_s = raw_scores[i]
        
        # Calculate raw 0-100 score (inverting so low decision score -> high risk)
        normalized_risk = float(100.0 * (1.0 - ((raw_s - min_s) / range_s)))
        
        # Rule-based boost based on domain flags (correlation, chain size, volume)
        boost = 0.0
        reasons = []
        
        # Check amount
        if feat[0] > 10.0:
            boost += 15.0
            reasons.append(f"Unusually high transaction volume ({feat[0]:.2f} BTC)")
        elif feat[0] > 5.0:
            boost += 8.0
            reasons.append(f"Elevated transaction volume ({feat[0]:.2f} BTC)")

        # Check chain size & cross-layer correlation
        if feat[7] == 1: # correlation_flag_int
            boost += 25.0
            reasons.append(f"Cross-layer network correlation flagged (rapid sequence of {int(feat[4])} txs from single host)")
        elif feat[4] >= 3:
            boost += 15.0
            reasons.append(f"High network chain velocity ({int(feat[4])} transactions within 300s window)")
            
        # Check CoinJoin pattern (>= 3 inputs and >= 3 outputs)
        if feat[2] >= 3 and feat[3] >= 3:
            boost += 20.0
            reasons.append(f"CoinJoin mixing pattern detected ({int(feat[2])} inputs, {int(feat[3])} outputs)")
            
        # Check Shared Infra / Tor / VPN
        infra_class = meta["chain_meta"].get("src_ip_infra_class", "plain_single_host")
        if infra_class == "tor_exit":
            boost += 10.0
            reasons.append("Broadcasted through known Tor exit node (anonymized origin)")
        elif infra_class == "vpn":
            boost += 8.0
            reasons.append("Broadcasted via commercial VPN infrastructure")
        elif feat[6] == 1:
            boost += 5.0
            reasons.append("Shared datacenter/IP infrastructure detected")

        # Calculate final composite risk score (cap at 99.9)
        final_risk = min(99.9, max(5.0, normalized_risk * 0.4 + boost * 0.6))
        final_risk = round(final_risk, 1)
        
        # Assign severity classification
        if final_risk >= 75.0:
            severity = "CRITICAL"
        elif final_risk >= 50.0:
            severity = "HIGH"
        elif final_risk >= 30.0:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        # Generate human-readable explanation string
        if not reasons:
            explanation = "Normal transaction pattern with standard network characteristics."
        else:
            explanation = "; ".join(reasons) + "."
            
        alert_id = f"ALT-{meta['txid'][-6:]}-{i:03d}"
        
        results.append({
            "alert_id": alert_id,
            "txid": meta["txid"],
            "timestamp": meta["timestamp"],
            "src_ip": meta["src_ip"],
            "amount": float(feat[0]),
            "fee": float(feat[1]),
            "primary_wallet": meta["primary_wallet"],
            "cluster_id": meta["cluster_id"],
            "cluster_confidence": meta["cluster_confidence"],
            "network_chain_id": meta["chain_meta"]["network_chain_id"],
            "network_chain_size": int(feat[4]),
            "src_ip_infra_class": infra_class,
            "correlation_flag": int(feat[7]),
            "anomaly_score": round(float(raw_s), 4),
            "risk_score": final_risk,
            "severity": severity,
            "explanation": explanation,
            "feature_vector": feat.tolist()
        })
        
    # Sort results by risk_score descending so highest risk appears first
    results.sort(key=lambda x: x["risk_score"], reverse=True)
    return results
