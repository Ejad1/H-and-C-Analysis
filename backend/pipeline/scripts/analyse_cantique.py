from pathlib import Path
import argparse
from backend.pipeline.report_generator import load_cantique, generate_report
from backend.pipeline.config import CANTIQUES_EXTRACTED_DIR, REPORTS_DIR
from backend.pipeline.utils import write_json

def main(numero: int):
    path = CANTIQUES_EXTRACTED_DIR / f'cantique_{numero:03d}.json'
    if not path.exists():
        raise SystemExit(f'Fichier {path} introuvable')
    cantique = load_cantique(path)
    report = generate_report(cantique)
    out_json = REPORTS_DIR / f'cantique_{numero:03d}_report.json'
    write_json(out_json, report.dict())
    print(f'Rapport écrit: {out_json}')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('numero', type=int, help='Numéro du cantique')
    args = parser.parse_args()
    main(args.numero)
