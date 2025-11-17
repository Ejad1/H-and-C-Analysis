import React, { useState, useRef } from 'react'

// Minimal chat UI. Backend endpoints will be wired later.
export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: "Bonjour — posez votre question sur la collection Bibliquest." },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef(null)

  function appendMessage(role, text) {
    setMessages((m) => [...m, { id: Date.now() + Math.random(), role, text }])
    // small timeout to scroll
    setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 50)
  }

  async function handleSend(e) {
    e.preventDefault()
    const q = input.trim()
    if (!q) return
    setInput('')
    appendMessage('user', q)
    setLoading(true)

    try {
      // Call the Python backend endpoint we added at POST /api/chat
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })
      if (!res.ok) {
        const text = await res.text()
        appendMessage('assistant', `Erreur serveur: ${res.status} ${text}`)
      } else {
        const j = await res.json()
        appendMessage('assistant', j.reply || 'Réponse vide du serveur')
      }
    } catch (err) {
      appendMessage('assistant', 'Erreur lors de la requête au serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-shell">
      <div className="chat-list" ref={listRef}>
        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.role}`}>
            <div className="bubble">
              <div className="role">{m.role}</div>
              <div className="text">{m.text}</div>
            </div>
          </div>
        ))}
      </div>

      <form className="composer" onSubmit={handleSend}>
        <input
          aria-label="Tapez votre question"
          placeholder="Posez votre question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={loading || !input.trim()}>{loading ? '...' : 'Envoyer'}</button>
      </form>
    </div>
  )
}
