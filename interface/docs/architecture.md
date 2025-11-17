# Architecture de l'interface

Ce document décrit l'architecture logique et les flux de données de l'interface React (Vite).

1) Points d'entrée
- `src/main.jsx` : monte l'application, le router et le provider global si nécessaire.
- `src/App.jsx` : routes principales (/auth, /chat) et redirections suivant la session.

2) Pages principales
- `AuthPage.jsx` : gère l'inscription et la connexion.
- `ChatPage.jsx` : point central de l'application de chat ; contient le `Sidebar` et le `ChatWindow`.

3) Composants & responsabilités
- `Sidebar` : UI et gestion des conversations (create/delete/rename/select). Stocke rien par lui-même ; reçoit props depuis `ChatPage`.
- `ChatWindow` : affichage des messages, composer et gestion d'envoi local. Simule la réponse assistant.
- `RecorderButton` : capte l'audio et envoie le blob via callback.

4) State & persistance
- State principal (conversations, activeId) géré dans `ChatPage` via useState.
- Persistance : chaque modification écrit `localStorage.setItem(storageKey, JSON.stringify(conversations))`.
- Session : `src/utils/session.js` fournit `saveSession`, `getSession`, `clearSession`. La session contient token/user/expiry.

5) Flux d'un message (exemple)
1. Utilisateur tape un message et clique Envoyer.
2. `ChatWindow` appelle `onSend(text)` fourni par `ChatPage`.
3. `ChatPage.appendMessageToActive` ajoute message user au state et persiste.
4. `ChatWindow` (ou `ChatPage`) simule une réponse assistante (setTimeout) puis appelle `onReceive`.
5. `ChatPage` ajoute la réponse et persiste.

6) Points d'extension pour un backend réel
- Remplacer les stubs de `AuthPage` par appels HTTP vers `/auth/register` et `/auth/login`.
- Implémenter un endpoint `/chat/message` acceptant conversationId et message ; retourner réponse d'EliA.
- Ajouter gestion d'erreurs, indicateurs de loading, retry/backoff si nécessaire.

Conseil : conserver la même shape des messages pour éviter des refactors importants. Exemple :
```
{ role: 'user'|'assistant', text: '...', ts: 1670000000000 }
```
