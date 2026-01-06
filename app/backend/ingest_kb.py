import os, glob, math
from datetime import datetime
import psycopg2
from sentence_transformers import SentenceTransformer

KB_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../kb"))
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"  # 384-dim

def read_md(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def split_markdown(text: str, max_len: int = 600) -> list[str]:
    # simple splitter: split by paragraphs, then pack into ~600-char chunks
    paras = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks, cur = [], ""
    for p in paras:
        if len(cur) + len(p) + 2 <= max_len:
            cur = f"{cur}\n\n{p}" if cur else p
        else:
            if cur: chunks.append(cur)
            cur = p
    if cur: chunks.append(cur)
    return chunks

def connect():
    return psycopg2.connect("dbname=cloudai user=postgres password=postgres host=localhost port=5432")

def ensure_doc(cur, path, title):
    cur.execute("INSERT INTO documents (path, title, updated_at) VALUES (%s,%s,%s) ON CONFLICT (path) DO UPDATE SET title=EXCLUDED.title, updated_at=EXCLUDED.updated_at RETURNING id",
                (path, title, datetime.utcnow()))
    return cur.fetchone()[0]

def upsert_chunks(cur, doc_id, chunks, embs):
    # wipe and insert (simple + correct for now)
    cur.execute("DELETE FROM chunks WHERE document_id=%s", (doc_id,))
    rows = [(doc_id, i, chunks[i], [float(x) for x in embs[i]]) for i in range(len(chunks))]
    args_str = ",".join(cur.mogrify("(%s,%s,%s,%s)", r).decode("utf-8") for r in rows)
    cur.execute("INSERT INTO chunks (document_id, ord, content, embedding) VALUES " + args_str)

def main():
    model = SentenceTransformer(MODEL_NAME)
    conn = connect()
    conn.autocommit = False
    try:
        cur = conn.cursor()
        md_files = glob.glob(os.path.join(KB_ROOT, "services", "*.md")) + \
                   glob.glob(os.path.join(KB_ROOT, "patterns", "*.md")) + \
                   glob.glob(os.path.join(KB_ROOT, "policy", "*.md"))

        print(f"Ingesting {len(md_files)} KB files from {KB_ROOT}")
        for path in md_files:
            text = read_md(path)
            title = (text.splitlines()[0].lstrip("# ").strip() if text.strip().startswith("#") else os.path.basename(path))
            parts = split_markdown(text, max_len=700)
            if not parts: continue
            embs = model.encode(parts, show_progress_bar=False, normalize_embeddings=True)
            doc_id = ensure_doc(cur, os.path.relpath(path, KB_ROOT), title)
            upsert_chunks(cur, doc_id, parts, [list(e) for e in embs])
        conn.commit()
        print("KB ingestion complete ✅")
    except Exception as e:
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    main()
