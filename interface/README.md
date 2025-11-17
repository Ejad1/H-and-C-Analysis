# Interface — Documentation complète

Ce document décrit l'interface React (`interface/`) du projet H-and-C-Analysis : organisation, composants, fonctionnement, variables d'environnement, développement local, build et déploiement (Amplify), stockage local et points d'extension pour le backend.

Langue : français. Taille : documentation complète et actionnable.

---

## Table des matières
- Vue d'ensemble
- Structure du dossier
- Quick start (dev & build)
- Architecture & flux de données
- Liste des composants principaux
- Auth & session (localStorage)
- Enregistrements audio
- Styling et thèmes
- Tests et débogage locaux
- Déploiement (AWS Amplify)
- Fichiers utiles dans `interface/`
- Checklist de maintenance
- Questions fréquentes

---

## Vue d'ensemble

L'interface est une application React (Vite). Elle fournit :
- page d'authentification (inscription / login) — fichier `src/pages/AuthPage.jsx`
- page principale de chat — `src/pages/ChatPage.jsx`
- composants partagés : `Sidebar`, `ChatWindow`, `RecorderButton` etc.

Le front est autonome : il stocke les conversations localement (localStorage) et utilise des stubs/fake server pour simuler l'authentification et les réponses du bot. Le backend n'est pas encore relié — la doc inclut la place et la méthode pour brancher les endpoints.

## Structure du dossier

Important : travailler dans `interface/`.

Arborescence clé (extrait) :

```
interface/
├─ .amplify.yml          # config Amplify (build)
├─ package.json
├─ src/
│  ├─ main.jsx
│  ├─ App.jsx
│  │
│  ├─ pages/
│  │  ├─ AuthPage.jsx
│  │  └─ ChatPage.jsx
│  │
│  ├─ shared/
│  │  ├─ Sidebar.jsx
│  │  ├─ ChatWindow.jsx
│  │  └─ RecorderButton.jsx
│  │
│  └─ utils/
│     └─ session.js
├─ styles.css
└─ docs/                 # documentation détaillée (générée)
```

Les fichiers `src/pages/*` orchestrent la logique de plus haut niveau. Les composants partagés sont dans `src/shared/`.

## Quick start (dev & build)

Prérequis : Node.js 18+ (recommandé). Ouvrir PowerShell (Windows) à la racine du repo.

Développement local (hot reload) :
```powershell
cd d:\Analyse_cantiques\interface
npm ci
npm run dev
```

Build de production :
```powershell
cd d:\Analyse_cantiques\interface
npm ci
npm run build
```
Le build produit le dossier `dist/` (output Vite). Le fichier `.amplify.yml` dans `interface/` est configuré pour publier `dist/`.

## Architecture & flux de données

- Route principale : `App.jsx` monte le router et redirige vers `AuthPage` ou `ChatPage` selon la session.
- `AuthPage` gère l'inscription/login via des fonctions simulées (`fakeServerRegister`, `fakeServerLogin`) et appelle `saveSession()` de `src/utils/session.js`.
- `ChatPage` lit la session via `getSession()` et charge les conversations depuis `localStorage` (clé : `elia_convos_<email>`).
- Les envois de message utilisent `appendMessageToActive` pour ajouter un message utilisateur, puis simulent une réponse d'EliA (setTimeout dans `ChatWindow.jsx`).

Flux résumé : UI -> handlers (onSend) -> update state -> persist localStorage -> simulate backend -> update state.

## Composants principaux

- `src/pages/AuthPage.jsx`
	- Formulaires d'inscription & login.
	- Appelle `saveSession(token,user,expiresAt)` pour persister.
	- Appelle `onAuth(...)` (prop) puis `navigate('/chat')`.

- `src/pages/ChatPage.jsx`
	- Gère la collection de conversations, la persistence & l'activation d'une conversation.
	- Persiste `elia_convos_<email>` dans localStorage.

- `src/shared/Sidebar.jsx`
	- Affiche avatar, nom, e‑mail et la liste des conversations.
	- Bouton flottant (lors de la fermeture) pour ré-ouvrir la sidebar.
	- Toggle thème (modifie `data-theme` sur `document.documentElement`).

- `src/shared/ChatWindow.jsx`
	- Zone messages + composer.
	- Simule une réponse assistante via `onReceive` (placeholder pour backend).
	- Composeur : input texte, bouton envoi, enregistrement audio (RecorderButton) et upload placeholder.

- `src/shared/RecorderButton.jsx`
	- Utilise MediaRecorder API pour capter audio (webm) et appelle `onSend(blob)`.

## Auth & session (localStorage)

Fichiers : `src/utils/session.js` (helper simple).

Comportement :
- `saveSession(token, user, expiresAt)` : stocke `elia_token` et `elia_user` en localStorage (token + expiry). Le token ici est factice.
- `getSession()` : retourne l'objet session si non expirée.
- `clearSession()` : supprime les clés.

Clés locales :
- `elia_token` : token de session
- `elia_user` : JSON stringifié de l'objet user (email, firstName, lastName...)
- `elia_convos_<email>` : conversations persistées pour cet utilisateur

Important : ceci est une solution de développement. Pour la production il faudra connecter un vrai backend et utiliser des cookies httpOnly ou un mécanisme sécurisé.

## Enregistrements audio

- `RecorderButton` : demande la permission microphone, démarre MediaRecorder et envoie un Blob audio (webm) à la callback `onSend`.
- Le frontend envoie actuellement `"[Audio envoyé]"` en tant que message simulé ; à brancher côté serveur :
	- Endpoint POST `/v1/audio/transcribe` qui reçoit form-data `file` puis renvoie un texte.
	- Après transcription, le backend peut répondre un message d'assistant.

## Styling et thèmes

- Styles centraux dans `styles.css`.
- Thèmes : `:root` (clair) et `[data-theme='dark']` (sombre). La sidebar expose un bouton qui bascule `document.documentElement.setAttribute('data-theme', 'dark')`.
- Tokens CSS : `--primary`, `--soft`, `--panel`, etc. Modifier ces variables pour changer le thème global.

## Tests et débogage locaux

- Outils : DevTools browser pour console & network. Vérifier console lors de l'auth et du click sur boutons (nous avons ajouté `console.log` dans `AuthPage.jsx` pour debug). 
- LocalStorage : ouvrir DevTools → Application → Local Storage pour inspecter `elia_*`.
- MediaRecorder : test dans un navigateur moderne (Chrome/Edge/Firefox) — vérifier permissions.

## Déploiement (AWS Amplify)

1. `.amplify.yml` dans `interface/` : présent et configuré pour builder `npm ci` puis `npm run build` et publier `dist`.
2. Si tu connectes Amplify au repo root, indique en console :
	 - Frontend build command : `cd interface && npm ci && npm run build`
	 - Build output directory : `interface/dist`
3. Si tu relies Amplify au dossier `interface` (app root), Amplify utilisera `.amplify.yml` et publiera `dist` automatiquement.

## API / backend (où intégrer)

Endpoints attendus (suggestion) :
- POST /auth/register — body { firstName, lastName, email, password }
- POST /auth/login — body { email, password } -> returns { token, user, expiresAt }
- POST /chat/message — body { conversationId, content } -> returns assistant reply
- POST /audio/transcribe — file form-data

Intégration côté frontend : remplacer les `fakeServerLogin` / `fakeServerRegister` par appels `fetch` ou `axios` vers ces endpoints, gérer erreurs, et stocker le token retourné via `saveSession()`.

## Fichiers utiles (dans `interface/`)

- `.amplify.yml` — config build Amplify
- `package.json` — scripts : `dev`, `build`, `preview` etc.
- `src/utils/session.js` — helpers session/localStorage
- `src/pages/AuthPage.jsx` — auth UI
- `src/pages/ChatPage.jsx` — logique conversations
- `src/shared/*` — composants partagés

## Checklist de maintenance rapide

- Mettre à jour `package.json` et verrouiller versions si passage production.
- Remplacer stubs d'auth par vrais endpoints.
- Ajouter tests unitaires / e2e (Jest / Playwright).
- Vérifier politique CORS sur le backend.

## FAQ rapide

- Q: Où sont sauvegardées les conversations ?
	- localStorage, clé `elia_convos_<email>`.
- Q: Comment changer le nom du bot ?
	- Modifier `ChatWindow.jsx` (`EliA`) et ajuster les réponses simulées.
- Q: Comment activer HTTPS ?
	- Amplify fournit HTTPS automatiquement pour le domaine `*.amplifyapp.com`. Pour un domaine personnalisé tu dois valider DNS et ACM.

---

Si tu veux, je crée aussi un `interface/docs/` détaillé (fichiers séparés par thème) pour faciliter la lecture. Veux‑tu que je fasse ça maintenant ?
# EliA — Interface Chat

This folder contains a minimal React (Vite) application implementing the EliA chat UI.

Quick start (Windows PowerShell):

```powershell
cd interface
npm install
npm run dev
```

What's included:
- Auth page (register/login). Currently uses local fake endpoints; replace with your AWS-backed API endpoints.
- Main chat UI with a sidebar (user info + conversation history) and a chat pane.
- Session handling: token stored in localStorage with expiry (1 hour). When token expires the user is logged out.
- Recorder button for audio capture (uses MediaRecorder); audio blob will be handed to a placeholder handler.

Next steps to wire to real backend:
- Replace `fakeServerRegister` / `fakeServerLogin` in `src/pages/AuthPage.jsx` with actual API calls to your AWS backend.
- Implement an `/api/chat` endpoint that receives user messages (and audio uploads) and returns assistant replies. Use the auth token header for authentication.
# Bibliquest Chat Interface

Minimal React (Vite) skeleton for the Bibliquest chatbot UI.

Quick start (from repository root on Windows PowerShell):

```powershell
cd interface
npm install
npm run dev
```

Then open the dev server URL printed by Vite (usually http://localhost:5173).

Next steps (after backend is ready):
- Implement `/api/chat` endpoint in the backend that accepts JSON { query: string } and returns a reply and optionally source passages.
- Replace the simulated response in `src/components/Chat.jsx` with a `fetch('/api/chat', { method: 'POST', body: JSON.stringify({query}) })` call.
- Add authentication or CORS if serving backend separately.
