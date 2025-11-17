# Composants — détails et props

Ce fichier explique chaque composant visible et ses responsabilités, props et comportements importants.

1) `Sidebar.jsx`
- Props
  - `user` : { firstName, lastName, email }
  - `conversations` : array des conversations
  - `onCreate`, `onSelect`, `onDelete`, `onRename`, `onSignOut` : callbacks
- Comportements
  - Toggle thème (modifie `data-theme`).
  - Lors de fermeture (`open=false`) un bouton flottant `sidebar-toggle-floating` apparaît pour rouvrir.

2) `ChatWindow.jsx`
- Props
  - `user` : objet user
  - `conversation` : conversation active (ou null)
  - `onSend(text)` : callback appelé lorsque l'utilisateur envoie du texte
  - `onReceive(text)` : callback utilisé par le simulateur pour injecter la réponse
- Particularités
  - Scrolling automatique (scrollTo bottom) sur mise à jour
  - Simule assistant par `setTimeout` (à remplacer par appel réseau)

3) `RecorderButton.jsx`
- Props: `onSend(blob)`
- Utilisation: démarre / stoppe MediaRecorder et envoie un Blob webm

4) `AuthPage.jsx`
- Gère 2 panneaux (login / register) en stack ; transitions CSS pour un passage fluide.
- À l'inscription/login successful :
  - appelle `saveSession()`
  - appelle `onAuth(...)` prop
  - `navigate('/chat')`

5) `src/utils/session.js`
- Fonctions exposées : `saveSession`, `getSession`, `clearSession`.
- Format stocké :
  - `elia_token` : string
  - `elia_user` : JSON string

6) Concis : message shape

Tous les messages devraient suivre :
```
{ role: 'user'|'assistant', text: string, ts: number }
```

Ce fichier aide à comprendre quels composants remplacer ou étendre lorsque tu branches un vrai backend.
