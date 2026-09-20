class ProjectDatabase:
    def __init__(self):
        self.records = []
        self.alerts = []
        self.graph_data = {"nodes": [], "edges": []}
        self.clusters = {}
        self.entities = {}
        self.transactions = {}
        self.is_processed = False

    def store_pipeline_results(self, records, G, wallet_to_cluster, cluster_metadata, alerts):
        self.records = records
        self.alerts = alerts
        self.clusters = cluster_metadata
        self.is_processed = True
        
        # Index transactions
        self.transactions = {rec["txid"]: rec for rec in records}
        
        # Build node and edge visualization dictionary for frontend graph viewer (Vis.js compatible)
        nodes = []
        edges = []
        
        for n, attrs in G.nodes(data=True):
            ntype = attrs.get("type", "unknown")
            cid = attrs.get("cluster_id", "")
            
            # Label node cleanly
            if ntype == "tx":
                label = f"Tx: {n[:8]}..."
                group = "tx"
            elif ntype == "ip":
                label = f"IP: {n}"
                group = "ip"
            else:
                label = f"Wallet: {n[:10]}..."
                group = "wallet"
                
            nodes.append({
                "id": n,
                "label": label,
                "type": ntype,
                "cluster_id": cid,
                "group": group,
                "amount": attrs.get("amount", 0.0),
                "timestamp": attrs.get("timestamp", "")
            })

        for u, v, attrs in G.edges(data=True):
            role = attrs.get("role", "connected")
            edges.append({
                "from": u,
                "to": v,
                "label": role,
                "role": role
            })

        self.graph_data = {"nodes": nodes, "edges": edges}

        # Index entities (wallets & IPs)
        for rec in records:
            for w in rec["input_wallets"] + rec["output_wallets"]:
                if w not in self.entities:
                    cid = wallet_to_cluster.get(w, "cluster_000")
                    c_meta = cluster_metadata.get(cid, {})
                    self.entities[w] = {
                        "id": w,
                        "type": "wallet",
                        "cluster_id": cid,
                        "cluster_confidence": c_meta.get("confidence", "MEDIUM"),
                        "transactions": []
                    }
                self.entities[w]["transactions"].append(rec["txid"])
                
            ip = rec["src_ip"]
            if ip not in self.entities:
                self.entities[ip] = {
                    "id": ip,
                    "type": "ip",
                    "transactions": []
                }
            self.entities[ip]["transactions"].append(rec["txid"])

    def get_summary(self):
        total_txs = len(self.records)
        total_alerts = len(self.alerts)
        critical_alerts = sum(1 for a in self.alerts if a["severity"] == "CRITICAL")
        high_alerts = sum(1 for a in self.alerts if a["severity"] == "HIGH")
        total_wallets = len([e for e in self.entities.values() if e["type"] == "wallet"])
        total_ips = len([e for e in self.entities.values() if e["type"] == "ip"])
        total_clusters = len(self.clusters)
        
        avg_risk = round(sum(a["risk_score"] for a in self.alerts) / max(1, len(self.alerts)), 1)
        
        return {
            "is_processed": self.is_processed,
            "total_transactions": total_txs,
            "total_alerts": total_alerts,
            "critical_alerts": critical_alerts,
            "high_alerts": high_alerts,
            "total_wallets": total_wallets,
            "total_ips": total_ips,
            "total_clusters": total_clusters,
            "average_risk_score": avg_risk
        }

db = ProjectDatabase()
