from __future__ import annotations
from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class Couplet(BaseModel):
    index: int = Field(..., description='Index du couplet (1-based)')
    texte: str

class Cantique(BaseModel):
    numero: int
    auteur: Optional[str] = None
    nbre_couplets: int
    couplets: List[Couplet]

class BibleVerse(BaseModel):
    book: str
    chapter: int
    verse: int
    text: str

class RetrievalContext(BaseModel):
    query: str
    verses: List[BibleVerse]

class ThemeScores(BaseModel):
    themes: Dict[str, float] = Field(default_factory=dict)

class EmotionScores(BaseModel):
    emotions: Dict[str, float] = Field(default_factory=dict)

class GeneratedInsights(BaseModel):
    resume: str
    thematique_principale: List[str]
    orientation: List[str]
    emotions: List[str]
    references_bibliques: List[str]
    usage_recommande: List[str]
    analyse_theologique: str

class CantiqueReport(BaseModel):
    cantique_numero: int
    titre: str
    themes_predits: List[str]
    orientation: List[str]
    emotions: List[str]
    retrieval: RetrievalContext
    references_bibliques: List[str]
    analyse_theologique: str
    resume: str
    usage_recommande: List[str]

