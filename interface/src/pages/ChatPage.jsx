import React, { useEffect, useMemo, useState } from 'react'
import Sidebar from '../shared/Sidebar'
import ChatWindow from '../shared/ChatWindow'
import { getSession } from '../utils/session'

export default function ChatPage({ onSignOut }) {
  const session = getSession()
  const user = session?.user || { firstName: 'Invité', lastName: '' }

  // Conversations stored in localStorage per user
  const storageKey = useMemo(() => `elia_convos_${user.email || 'anon'}`, [user.email])
  const [conversations, setConversations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]')
    } catch (e) {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(conversations))
  }, [conversations, storageKey])

  const [activeId, setActiveId] = useState(() => (conversations[0] ? conversations[0].id : null))

  function createConversation() {
    const id = Date.now().toString()
    const c = { id, title: new Date().toLocaleString(), messages: [] }
    setConversations((s) => [c, ...s])
    setActiveId(id)
  }

  function deleteConversation(id) {
    setConversations((s) => s.filter((c) => c.id !== id))
    if (activeId === id) setActiveId(null)
  }

  function renameConversation(id, title) {
    setConversations((s) => s.map((c) => (c.id === id ? { ...c, title } : c)))
  }

  function appendMessageToActive(message) {
    if (!activeId) return
    setConversations((s) => s.map((c) => (c.id === activeId ? { ...c, messages: [...c.messages, message] } : c)))
  }

  // Create a pending assistant bubble immediately to reassure the user.
  // This bubble is marked `pending: true` and will be finalized when the
  // first token arrives (so the timestamp reflects token arrival).
  function startPendingAssistantMessage() {
    if (!activeId) return
    setConversations((s) =>
      s.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, { role: 'assistant', text: "EliA cherche dans les textes...", ts: Date.now(), pending: true }] }
          : c
      )
    )
  }

  // Finalize the pending assistant bubble: clear the placeholder text and set
  // the timestamp to the arrival time of the first token.
  function finalizePendingAssistantMessage() {
    if (!activeId) return
    const now = Date.now()
    setConversations((s) =>
      s.map((c) => {
        if (c.id !== activeId) return c
        const msgs = [...c.messages]
        // find last pending assistant message
        let idx = msgs.map((m) => (m.role === 'assistant' && m.pending) ? 1 : 0).lastIndexOf(1)
        if (idx === -1) {
          // fallback: find last assistant
          idx = msgs.map((m) => m.role).lastIndexOf('assistant')
        }
        if (idx >= 0 && msgs[idx]) {
          const base = { ...msgs[idx] }
          delete base.pending
          base.text = ''
          base.ts = now
          msgs[idx] = base
        }
        return { ...c, messages: msgs }
      })
    )
  }

  function updateLastAssistantMessage(deltaText) {
    if (!activeId) return
    setConversations((s) =>
      s.map((c) => {
        if (c.id !== activeId) return c
        const msgs = [...c.messages]
        // find last assistant message index (fallback to last message)
        let idx = msgs.map((m) => m.role).lastIndexOf('assistant')
        if (idx === -1) idx = msgs.length - 1
        if (idx >= 0 && msgs[idx]) {
          msgs[idx] = { ...msgs[idx], text: (msgs[idx].text || '') + deltaText }
        }
        return { ...c, messages: msgs }
      })
    )
  }

  const activeConversation = conversations.find((c) => c.id === activeId) || null

  return (
    <div className="chat-page">
      <Sidebar
        user={user}
        conversations={conversations}
        onCreate={createConversation}
        onSelect={(id) => setActiveId(id)}
        onDelete={deleteConversation}
        onRename={renameConversation}
        onSignOut={onSignOut}
      />

      <ChatWindow
        user={user}
        conversation={activeConversation}
        onSend={(txt) => appendMessageToActive({ role: 'user', text: txt, ts: Date.now() })}
        onReceive={(txt) => appendMessageToActive({ role: 'assistant', text: txt, ts: Date.now() })}
        onPendingAssistant={() => startPendingAssistantMessage()}
        onStartAssistant={() => finalizePendingAssistantMessage()}
        onUpdateAssistant={(delta) => updateLastAssistantMessage(delta)}
      />
    </div>
  )
}
