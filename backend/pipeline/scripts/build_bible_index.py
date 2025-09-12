from pathlib import Path
import json
import argparse
from backend.pipeline.config import BIBLE_RAW_DIR, BIBLE_PROCESSED_PATH
from backend.pipeline.utils import write_json

# Placeholder: expects raw text files bookXX.txt inside BIBLE_RAW_DIR
# Real implementation will parse verses with pattern 'Book Chapter:Verse Texte'

def process():
    data = []
    if not BIBLE_RAW_DIR.exists():
        print(f'Aucun dossier Bible trouvé: {BIBLE_RAW_DIR}')
        return
    for file in sorted(BIBLE_RAW_DIR.glob('*.txt')):
        with file.open('r', encoding='utf-8') as f:
            for line in f:
                line=line.strip()
                if not line:
                    continue
                # Very naive placeholder split
                parts = line.split('|')
                if len(parts) == 4:
                    book, chapter, verse, text = parts
                    data.append({
                        'book': book,
                        'chapter': int(chapter),
                        'verse': int(verse),
                        'text': text
                    })
    write_json(BIBLE_PROCESSED_PATH, data)
    print(f'Verses enregistrés: {len(data)} dans {BIBLE_PROCESSED_PATH}')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.parse_args()
    process()
