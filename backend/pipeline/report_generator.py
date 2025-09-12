from __future__ import annotations
from typing import List
from pathlib import Path
import json
from .data_models import Cantique, CantiqueReport, RetrievalContext, BibleVerse
from .utils import read_json
from .config import CANTIQUES_EXTRACTED_DIR

DUMMY_VERSES = [
    BibleVerse(book='Psaumes', chapter=23, verse=1, text="L'Éternel est mon berger: je ne manquerai de rien."),
]

# Placeholder simple heuristics
THEME_KEYWORDS = {
    'adoration': ['ador', 'louange'],
    'grace': ['grâce', 'grace'],
    'foi': ['foi', 'croire'],
}

def simple_theme_detect(text: str) -> List[str]:
    lowered = text.lower()
    found = []
    for theme, kws in THEME_KEYWORDS.items():
        if any(k in lowered for k in kws):
            found.append(theme)
    return found[:3]

def load_cantique(path: Path) -> Cantique:
    raw = read_json(path)
    couplets = [
        {'index': i+1, 'texte': c['texte']} for i, c in enumerate(raw.get('couplets', []))
    ]
    return Cantique(
        numero=raw['numero'],
        auteur=raw.get('auteur'),
        nbre_couplets=raw.get('nbre_couplets', len(couplets)),
        couplets=couplets,
    )

def generate_report(cantique: Cantique) -> CantiqueReport:
    full_text = '\n'.join(c.texte for c in cantique.couplets)
    themes = simple_theme_detect(full_text)
    retrieval = RetrievalContext(query='cantique_'+str(cantique.numero), verses=DUMMY_VERSES)
    return CantiqueReport(
        cantique_numero=cantique.numero,
        titre=f'Cantique {cantique.numero}',
        themes_predits=themes,
        orientation=['adoration'] if 'adoration' in themes else [],
        emotions=['joie'] if 'adoration' in themes else [],
        retrieval=retrieval,
        references_bibliques=[f"{v.book} {v.chapter}:{v.verse}" for v in DUMMY_VERSES],
        analyse_theologique='Analyse placeholder.',
        resume=full_text[:180] + ('...' if len(full_text) > 180 else ''),
        usage_recommande=['louange générale'] if 'adoration' in themes else ['méditation'],
    )

