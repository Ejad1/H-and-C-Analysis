# Développement local — guide détaillé

Préambule : ce guide décrit comment développer, debuguer et tester localement l'interface.

Prérequis
- Node.js 18+
- npm (4.x+)

Installer les dépendances
```powershell
cd d:\Analyse_cantiques\interface
npm ci
```

Scripts utiles (depuis `interface/`)
- `npm run dev` : lance Vite en dev mode (hot reload)
- `npm run build` : build production (dist/)
- `npm run preview` : lance un serveur local qui sert `dist/`

Debugging
- Console logs : `AuthPage.jsx` contient des console.log sur les handlers. Ajoute d'autres logs si besoin.
- LocalStorage : DevTools → Application → Local Storage. Clés : `elia_token`, `elia_user`, `elia_convos_<email>`.
- MediaRecorder : vérifier permissions et types MIME pris en charge (webm principalement).

Règles de contributions
- Respecter la shape des messages (voir components.md).
- Écrire des composants réutilisables (pas de dépendance profonde sur global state).
- Documenter tout changement public dans `interface/README.md`.

Tests
- Recommander : ajouter Jest pour unit tests, et Playwright / Cypress pour e2e. (non inclus actuellement).

Branching & déploiement
- Travailler sur des branches par fonctionnalité et ouvrir PRs. Amplify peut être configuré pour déployer PR previews.
