# Déploiement — AWS Amplify (guide pratique)

Ce fichier regroupe les étapes pour déployer l'UI sur AWS Amplify et configurer le pipeline automatique.

1) Préparer le repo

- S'assurer que `interface/.amplify.yml` est présent (nous l'avons ajouté). Il contient :
  - preBuild: `npm ci`
  - build: `npm run build`
  - artifacts.baseDirectory: `dist`

2) Connecter Amplify

- Amplify Console → Host web app → Connect app → choisir le provider (ex GitHub) et autoriser l'accès.
- Sélectionner le repo et la branche (main).

3) Vérifier les settings

- Si Amplify build root = repo root, définir :
  - Frontend build command : `cd interface && npm ci && npm run build`
  - Build output directory : `interface/dist`
- Si Amplify root = `interface`, Amplify utilisera `.amplify.yml` et il suffit de mettre `dist` comme output.

4) Variables d'environnement

- Dans Amplify → App settings → Environment variables, définir variables nécessaires au runtime (ex: `VITE_API_URL`, `NODE_OPTIONS` si besoin).

5) Domaines & SSL

- Amplify fournit un sous-domaine `*.amplifyapp.com`. Pour un domaine personnalisé : Amplify → Domain management → Add domain. Choisir `ejad.com` (ou configurer manuellement les enregistrements DNS). Voir `README.md` pour instructions détaillées.

6) Déploiement automatique

- Après connexion, Amplify crée une pipeline CI/CD : chaque push sur la branche configurée déclenche build+deploy.

7) Invalidation / cache

- Amplify gère le CDN automatiquement. Pour CloudFront custom, utiliser `aws cloudfront create-invalidation` depuis GitHub Actions si tu utilises S3/CF.

8) Rollbacks & previews

- Amplify conserve les builds précédents ; tu peux rollback à une version antérieure depuis la console.
- Activer previews pour PRs si tu veux vérifier des branches avant merge.
