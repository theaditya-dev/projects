import networkx as nx

class WalletClusterEngine:
    """
    Union-Find data structure for Common-Input Wallet Clustering.
    """
    def __init__(self):
        self.parent = {}
        self.rank = {}

    def find(self, item):
        if item not in self.parent:
            self.parent[item] = item
            self.rank[item] = 0
            return item
        if self.parent[item] != item:
            self.parent[item] = self.find(self.parent[item])
        return self.parent[item]

    def union(self, item1, item2):
        root1 = self.find(item1)
        root2 = self.find(item2)
        if root1 != root2:
            if self.rank[root1] < self.rank[root2]:
                root1, root2 = root2, root1
            self.parent[root2] = root1
            if self.rank[root1] == self.rank[root2]:
                self.rank[root1] += 1

def build_entity_graph_and_clusters(records):
    """
    Builds NetworkX multi-layer entity graph (IP <-> Tx <-> Wallet) and performs 
    Common-Input Wallet Clustering adhering to domain rules:
    - Max input ceiling: 10 addresses for co-input clustering.
    - CoinJoin shape (>= 3 inputs AND >= 3 outputs) excluded from co-input clustering.
    - Cluster size > 50 marked low confidence.
    """
    G = nx.Graph()
    uf = WalletClusterEngine()
    
    # 1. First pass: Identify all wallet addresses & build graph nodes/edges
    all_wallets = set()
    for rec in records:
        txid = rec["txid"]
        src_ip = rec["src_ip"]
        
        # Add transaction node
        G.add_node(txid, type="tx", amount=rec["amount"], fee=rec["fee"], timestamp=rec["timestamp"])
        
        # Add IP node & broadcast edge
        G.add_node(src_ip, type="ip")
        G.add_edge(src_ip, txid, role="broadcast")
        
        # Add wallet nodes & input/output edges
        inputs = rec["input_wallets"]
        outputs = rec["output_wallets"]
        
        for w in inputs:
            all_wallets.add(w)
            uf.find(w) # Initialize in union-find
            G.add_node(w, type="wallet")
            G.add_edge(w, txid, role="input")
            
        for w in outputs:
            all_wallets.add(w)
            uf.find(w) # Initialize in union-find
            G.add_node(w, type="wallet")
            G.add_edge(txid, w, role="output")
            
        # 2. Co-input clustering rule checks:
        # Rule A: Skip CoinJoin transactions (>= 3 inputs AND >= 3 outputs)
        is_coinjoin = len(inputs) >= 3 and len(outputs) >= 3
        
        # Rule B: Skip if input count > 10 (input-count ceiling)
        exceeds_ceiling = len(inputs) > 10
        
        if not is_coinjoin and not exceeds_ceiling and len(inputs) > 1:
            base_wallet = inputs[0]
            for w in inputs[1:]:
                uf.union(base_wallet, w)

    # 3. Build cluster mappings and count sizes
    cluster_groups = {}
    for w in all_wallets:
        root = uf.find(w)
        if root not in cluster_groups:
            cluster_groups[root] = []
        cluster_groups[root].append(w)

    wallet_to_cluster = {}
    cluster_metadata = {}
    
    cluster_counter = 1
    for root, wallet_list in cluster_groups.items():
        cid = f"cluster_{cluster_counter:03d}"
        cluster_counter += 1
        size = len(wallet_list)
        is_low_confidence = size > 50 # Rule: Clusters > 50 wallets marked low confidence
        
        cluster_metadata[cid] = {
            "cluster_id": cid,
            "wallets": wallet_list,
            "size": size,
            "confidence": "LOW" if is_low_confidence else ("HIGH" if size > 1 else "MEDIUM"),
            "cluster_confidence_low": 1 if is_low_confidence else 0
        }
        
        for w in wallet_list:
            wallet_to_cluster[w] = cid
            G.nodes[w]["cluster_id"] = cid

    return G, wallet_to_cluster, cluster_metadata
