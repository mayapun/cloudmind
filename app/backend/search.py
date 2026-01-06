from typing import List, Dict, Any
import numpy as np
import psycopg2
from sentence_transformers import SentenceTransformer

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
_model = None

def model():
    global _model
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
    return _model

def connect():
    return psycopg2.connect("dbname=cloudai user=postgres password=postgres host=localhost port=5432")

def kb_search(query: str, k: int = 5) -> List[Dict[str, Any]]:
    q_emb = model().encode([query], normalize_embeddings=True)[0]
    q_emb = [float(x) for x in np.array(q_emb)]
    with connect() as conn, conn.cursor() as cur:
        cur.execute("""
            SELECT d.title, d.path, c.ord, c.content,
                   1 - (c.embedding <=> %s::vector) AS score
            FROM chunks c
            JOIN documents d ON d.id = c.document_id
            ORDER BY c.embedding <=> %s::vector
            LIMIT %s
        """, (list(q_emb), list(q_emb), k))
        rows = cur.fetchall()
    return [
        {"title": r[0], "path": r[1], "ord": r[2], "content": r[3], "score": float(r[4])}
        for r in rows
    ]
