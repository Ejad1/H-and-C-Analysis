from __future__ import annotations
from typing import List
import numpy as np

try:
    from sentence_transformers import SentenceTransformer
except ImportError:  # fallback
    SentenceTransformer = None  # type: ignore
    
from sklearn.feature_extraction.text import TfidfVectorizer

class EmbeddingBackend:
    def __init__(self, model_name: str | None = None):
        self.model_name = model_name
        self._model = None
        self._tfidf = None
        if SentenceTransformer and model_name:
            try:
                self._model = SentenceTransformer(model_name)
            except Exception:
                self._model = None
        if self._model is None:
            self._tfidf = TfidfVectorizer(max_features=4096)

    def fit_corpus(self, texts: List[str]):
        if self._model is None and self._tfidf is not None:
            self._tfidf.fit(texts)

    def encode(self, texts: List[str]) -> np.ndarray:
        if self._model is not None:
            return np.asarray(self._model.encode(texts, show_progress_bar=False, convert_to_numpy=True))
        assert self._tfidf is not None
        return self._tfidf.transform(texts).toarray().astype('float32')

