# API — spécifications et point d'intégration

Ce document propose une API minimale attendue par le frontend et des exemples d'usage.

1) Auth

- POST /auth/register
  - Body (application/json): { firstName, lastName, email, password }
  - Response: { token, user: { email, firstName, lastName }, expiresAt }

- POST /auth/login
  - Body: { email, password }
  - Response: { token, user, expiresAt }

2) Chat

- POST /chat/message
  - Body: { conversationId, content }
  - Response: { reply: string, meta?: { sources?: [] } }

- GET /chat/conversation/:id
  - Retourne la conversation complète (messages)

3) Audio / Transcription

- POST /audio/transcribe
  - multipart/form-data: file=audio.webm
  - Response: { text: "transcription..." }

4) Sécurité & headers
- Le frontend attend un header `Authorization: Bearer <token>` pour endpoints protégés.

5) Exemple d'intégration côté frontend (fetch)
```js
// login
const r = await fetch('/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email, password}) })
const data = await r.json()
saveSession(data.token, data.user, data.expiresAt)
```

Notes : adapter les URLs en fonction de `VITE_API_URL` (env var exposée à l'app). Utiliser `fetch` ou `axios` selon préférence.
