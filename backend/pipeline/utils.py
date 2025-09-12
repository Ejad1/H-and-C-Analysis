import json
from pathlib import Path
from typing import Any, Dict

def read_json(path: Path) -> Any:
    with path.open('r', encoding='utf-8') as f:
        return json.load(f)

def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def list_cantiques(extracted_dir: Path):
    return sorted([p for p in extracted_dir.glob('cantique_*.json') if p.is_file()])
