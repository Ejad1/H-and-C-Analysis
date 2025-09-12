from pathlib import Path
import argparse
import json
from typing import List
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import f1_score, classification_report

# Placeholder: expects annotation file annotations.json lines: {"numero": int, "themes": [..], "text": "..."}

def load_annotations(path: Path):
    items = []
    with path.open('r', encoding='utf-8') as f:
        for line in f:
            line=line.strip()
            if not line:
                continue
            items.append(json.loads(line))
    return items

def train(path: Path, model_out: Path):
    data = load_annotations(path)
    texts = [d['text'] for d in data]
    labels = [d['themes'] for d in data]
    mlb = MultiLabelBinarizer()
    Y = mlb.fit_transform(labels)
    pipe = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=12000, ngram_range=(1,2))),
        ('clf', LogisticRegression(max_iter=200, verbose=0))
    ])
    pipe.fit(texts, Y)
    preds = pipe.predict(texts)
    print('F1 micro:', f1_score(Y, preds, average='micro'))
    print(classification_report(Y, preds, target_names=mlb.classes_))
    # Serialize simple artifacts
    import joblib
    joblib.dump({'pipeline': pipe, 'mlb': mlb}, model_out)
    print('Modèle enregistré:', model_out)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--annotations', required=True)
    parser.add_argument('--out', required=True)
    args = parser.parse_args()
    train(Path(args.annotations), Path(args.out))
