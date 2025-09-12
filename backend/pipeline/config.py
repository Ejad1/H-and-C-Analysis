from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR.parent.parent / 'data'
BIBLE_RAW_DIR = DATA_DIR / 'bible_raw'
BIBLE_PROCESSED_PATH = DATA_DIR / 'bible_processed.json'
EMBEDDINGS_DIR = BASE_DIR / 'embeddings'
EMBEDDINGS_DIR.mkdir(exist_ok=True, parents=True)
BIBLE_INDEX_PATH = EMBEDDINGS_DIR / 'bible_faiss.index'
BIBLE_EMB_MATRIX_PATH = EMBEDDINGS_DIR / 'bible_embeddings.npy'
BIBLE_METADATA_PATH = EMBEDDINGS_DIR / 'bible_metadata.json'
REPORTS_DIR = BASE_DIR / 'outputs'
REPORTS_DIR.mkdir(exist_ok=True, parents=True)
CANTIQUES_EXTRACTED_DIR = DATA_DIR / 'extracted'

DEFAULT_MODEL_NAME = 'sentence-transformers/paraphrase-multilingual-mpnet-base-v2'

