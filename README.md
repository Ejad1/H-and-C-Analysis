# Analyse des paroles de H & C (Hymnes et cantiques)

## Introduction

L'objectif est d'analyser les paroles de chaque cantique du receuil afin d'en tirer un commentaire biblique. Ensuite, il sera question en fonction des cantiques chantés chaque dimanche, de prédire dans une certaine mésure ceux de n'importe quel dimanche.

## Déroulement

### Extraction des paroles

Il s'agit ici de récupérer les paroles de chaque cantique et ceux par couplet.

Après une petite analyse, le document pdf des cantiques est une compilation d'image scannées. La méthode d'OCR (Optical Character Recognition) sera donc utilisée. L'OCR permet de lire les textes contenus dans une image.

### Nettoyage et structuration des données

### Pipeline d'analyse (ML / NLP)

Une première version de pipeline a été ajoutée dans `backend/pipeline` :

1. Modèles de données (`data_models.py`)
2. Génération de rapports simplifiés (`report_generator.py`)
3. Script d'analyse d'un cantique (`scripts/analyse_cantique.py`)
4. Script de préparation Bible (placeholder) (`scripts/build_bible_index.py`)
5. Script d'entraînement classification multi-label (placeholder) (`scripts/classify.py`)

#### Exécution (exemples)

Créer un rapport pour le cantique 1 (après extraction JSON dans `data/extracted`):

```bash
python -m backend.pipeline.scripts.analyse_cantique 1
```

Générer l'index Bible (format attendu provisoire : lignes `Livre|Chapitre|Verset|Texte` dans `data/bible_raw/*.txt`):

```bash
python -m backend.pipeline.scripts.build_bible_index
```

Entraîner un classifieur (annotations au format JSONL) :

```bash
python -m backend.pipeline.scripts.classify --annotations annotations.jsonl --out model.joblib
```

#### Étapes suivantes

- Ajouter le texte biblique réel et calcul d'embeddings
- Intégrer FAISS (ou fallback TF-IDF) pour la recherche de versets
- Implémenter véritable classification et calibrage des seuils
- Génération enrichie (RAG) avec références bibliques contextuelles
- Export Markdown détaillé par cantique

