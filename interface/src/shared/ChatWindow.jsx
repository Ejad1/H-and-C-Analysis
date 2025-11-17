import React, { useEffect, useRef, useState } from 'react'
import RecorderButton from './RecorderButton'

export default function ChatWindow({ user, conversation, onSend, onReceive, onPendingAssistant, onStartAssistant, onUpdateAssistant }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pulse, setPulse] = useState(false)
  const [sentAnim, setSentAnim] = useState(false)
  const listRef = useRef(null)
  const autoScrollRef = useRef(true)
  const pendingRef = useRef('')
  const streamIntervalRef = useRef(null)
  const streamStartedRef = useRef(false)
  // Animated pending placeholder state
  const PENDING_TEXTS = [
    "Je parcours les archives…",
    "Je rassemble les passages utiles…",
    "Je construis une réponse claire…",
  ]
  const [pendingAnimLabel, setPendingAnimLabel] = useState(PENDING_TEXTS[0])
  const pendingLabelIndexRef = useRef(0)
  const pendingShiftRef = useRef(0)
  const pendingRotateIntervalRef = useRef(null)
  const pendingShiftIntervalRef = useRef(null)

  // Frontend pacing config (milliseconds per character)
  // Faster defaults: smaller delay and slightly larger chunk step for smoother speed
  const FRONT_CHAR_DELAY_MS = 30
  const FRONT_CHUNK_STEP = 2

  function startStreamingDisplay() {
    if (streamIntervalRef.current) return
    streamIntervalRef.current = setInterval(() => {
      const pending = pendingRef.current
      if (!pending) return
      const take = pending.slice(0, FRONT_CHUNK_STEP)
      pendingRef.current = pending.slice(FRONT_CHUNK_STEP)
      if (typeof onUpdateAssistant === 'function') onUpdateAssistant(take)
      else onReceive(take)
      // if no more pending and stream finished, interval will be cleared elsewhere
    }, FRONT_CHAR_DELAY_MS)
  }

  function stopStreamingDisplay() {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current)
      streamIntervalRef.current = null
    }
    streamStartedRef.current = false
    pendingRef.current = ''
  }

  // start/stop pending placeholder animation
  function startPendingAnimation() {
    if (pendingRotateIntervalRef.current) return
    pendingRotateIntervalRef.current = setInterval(() => {
      pendingLabelIndexRef.current = (pendingLabelIndexRef.current + 1) % PENDING_TEXTS.length
      setPendingAnimLabel(PENDING_TEXTS[pendingLabelIndexRef.current])
    }, 900)
    if (!pendingShiftIntervalRef.current) {
      pendingShiftIntervalRef.current = setInterval(() => {
        pendingShiftRef.current = pendingShiftRef.current === 0 ? 4 : 0
        // force re-render
        setPendingAnimLabel((l) => l)
      }, 420)
    }
  }

  function stopPendingAnimation() {
    if (pendingRotateIntervalRef.current) {
      clearInterval(pendingRotateIntervalRef.current)
      pendingRotateIntervalRef.current = null
    }
    if (pendingShiftIntervalRef.current) {
      clearInterval(pendingShiftIntervalRef.current)
      pendingShiftIntervalRef.current = null
    }
    pendingLabelIndexRef.current = 0
    pendingShiftRef.current = 0
    setPendingAnimLabel(PENDING_TEXTS[0])
  }

  useEffect(() => {
    // Only auto-scroll if the user has not manually scrolled up.
    if (autoScrollRef.current) {
      const el = listRef.current
      if (el) el.scrollTo({ top: el.scrollHeight })
    }
    // detect pending assistant bubble and start/stop pending animation
    const hasPending = conversation?.messages?.some((m) => m.role === 'assistant' && m.pending)
    if (hasPending) startPendingAnimation()
    else stopPendingAnimation()
  }, [conversation])

  // keep track of user scroll actions; if user scrolls up, disable auto-scroll
  function handleScroll() {
    const el = listRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    // If the user is within 80px of the bottom, consider them 'at bottom'
    autoScrollRef.current = distanceFromBottom < 80
  }

  // Pulse the header when the assistant sends a new reply
  useEffect(() => {
    if (!conversation || !conversation.messages?.length) return
    const last = conversation.messages[conversation.messages.length - 1]
    if (last?.role === 'assistant') {
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 900)
      return () => clearTimeout(t)
    }
  }, [conversation?.messages?.length])

  // cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreamingDisplay()
      stopPendingAnimation()
    }
  }, [])

  async function handleSend(e) {
    e?.preventDefault()
    const txt = input.trim()
    if (!txt) return
    setInput('')
    onSend(txt)
    // small send animation
    setSentAnim(true)
    setTimeout(() => setSentAnim(false), 480)
    setLoading(true)
    // create a short 'thinking' / 'searching' placeholder immediately
    if (typeof onPendingAssistant === 'function') onPendingAssistant()

    // Call backend streaming endpoint and append tokens as they arrive
    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: txt }),
      })

      if (!res.ok) {
        // If stream endpoint is not found, fallback to non-streaming endpoint
        if (res.status === 404) {
          try {
            const r2 = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: txt }),
            })
            if (r2.ok) {
              const j = await r2.json()
              // animate fallback full reply
              if (!streamStartedRef.current) {
                streamStartedRef.current = true
                if (typeof onStartAssistant === 'function') onStartAssistant()
                startStreamingDisplay()
              }
              pendingRef.current += (j.reply || '')
              await new Promise((resolve) => {
                const check = () => {
                  if (!pendingRef.current) return resolve()
                  setTimeout(check, 30)
                }
                check()
              })
              stopStreamingDisplay()
            } else {
              const text = await r2.text()
              if (typeof onUpdateAssistant === 'function') onUpdateAssistant('Erreur serveur: ' + r2.status + ' ' + text)
              else onReceive('Erreur serveur: ' + r2.status + ' ' + text)
            }
          } catch (e) {
            if (typeof onUpdateAssistant === 'function') onUpdateAssistant('Erreur réseau lors de la requête au serveur.')
            else onReceive('Erreur réseau lors de la requête au serveur.')
          } finally {
            setLoading(false)
          }
          return
        }

        const text = await res.text()
        // fallback to a full receive (error) - show immediately
        if (!streamStartedRef.current) {
          streamStartedRef.current = true
          if (typeof onStartAssistant === 'function') onStartAssistant()
          startStreamingDisplay()
        }
        pendingRef.current += ('Erreur serveur: ' + res.status + ' ' + text)
        await new Promise((resolve) => {
          const check = () => {
            if (!pendingRef.current) return resolve()
            setTimeout(check, 30)
          }
          check()
        })
        stopStreamingDisplay()
        setLoading(false)
        return
      }

      // If the browser supports streaming responses, read and append chunks
      if (res.body && typeof res.body.getReader === 'function') {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let done = false
        while (!done) {
          const { value, done: readerDone } = await reader.read()
          done = readerDone
          if (value) {
            const chunk = decoder.decode(value)
            // on first incoming chunk, create assistant bubble and start paced display
            if (!streamStartedRef.current) {
              streamStartedRef.current = true
              if (typeof onStartAssistant === 'function') onStartAssistant()
              startStreamingDisplay()
            }
            pendingRef.current += chunk
          }
        }

        // wait for pending to drain, then stop interval
        await new Promise((resolve) => {
          const check = () => {
            if (!pendingRef.current) return resolve()
            setTimeout(check, 30)
          }
          check()
        })
        stopStreamingDisplay()
      } else {
        // streaming not supported; read the whole text and animate it
        const text = await res.text()
        if (!streamStartedRef.current) {
          streamStartedRef.current = true
          if (typeof onStartAssistant === 'function') onStartAssistant()
          startStreamingDisplay()
        }
        pendingRef.current += text
        // wait for pending to drain then stop
        await new Promise((resolve) => {
          const check = () => {
            if (!pendingRef.current) return resolve()
            setTimeout(check, 30)
          }
          check()
        })
        stopStreamingDisplay()
      }
    } catch (err) {
      if (typeof onUpdateAssistant === 'function') onUpdateAssistant('Erreur réseau lors de la requête au serveur.')
      else onReceive('Erreur réseau lors de la requête au serveur.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAudioSend(blob) {
    // For now send a placeholder to the chat endpoint so server can handle audio logic if implemented
    onSend('[Audio envoyé]')
    try {
      const fd = new FormData()
      fd.append('file', blob, 'recording.webm')
      // for now reuse the streaming chat endpoint with a placeholder query
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '[Audio envoyé]' }),
      })
      if (!res.ok) {
        // If stream endpoint missing, fallback to non-streaming endpoint
        if (res.status === 404) {
          try {
            const r2 = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: '[Audio envoyé]' }),
            })
            if (r2.ok) {
              const j2 = await r2.json()
              if (typeof onUpdateAssistant === 'function') onUpdateAssistant(j2.reply || '')
              else onReceive(j2.reply || '')
            } else {
              const txt = await r2.text()
              if (typeof onUpdateAssistant === 'function') onUpdateAssistant('Erreur serveur: ' + r2.status + ' ' + txt)
              else onReceive('Erreur serveur: ' + r2.status + ' ' + txt)
            }
          } catch (e) {
            if (typeof onUpdateAssistant === 'function') onUpdateAssistant('Erreur réseau lors de l\'envoi audio')
            else onReceive('Erreur réseau lors de l\'envoi audio')
          }
          return
        }
        const txt = await res.text()
        if (typeof onUpdateAssistant === 'function') onUpdateAssistant('Erreur serveur: ' + res.status + ' ' + txt)
        else onReceive('Erreur serveur: ' + res.status + ' ' + txt)
      } else {
        if (res.body && typeof res.body.getReader === 'function') {
          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          let done = false
          while (!done) {
            const { value, done: readerDone } = await reader.read()
            done = readerDone
            if (value) {
              const chunk = decoder.decode(value)
              if (!streamStartedRef.current) {
                streamStartedRef.current = true
                if (typeof onStartAssistant === 'function') onStartAssistant()
                startStreamingDisplay()
              }
              pendingRef.current += chunk
            }
          }
          await new Promise((resolve) => {
            const check = () => {
              if (!pendingRef.current) return resolve()
              setTimeout(check, 30)
            }
            check()
          })
          stopStreamingDisplay()
        } else {
          const text = await res.text()
          if (!streamStartedRef.current) {
            streamStartedRef.current = true
            if (typeof onStartAssistant === 'function') onStartAssistant()
            startStreamingDisplay()
          }
          pendingRef.current += text
          await new Promise((resolve) => {
            const check = () => {
              if (!pendingRef.current) return resolve()
              setTimeout(check, 30)
            }
            check()
          })
          stopStreamingDisplay()
        }
      }
    } catch (e) {
      if (typeof onUpdateAssistant === 'function') onUpdateAssistant('Erreur réseau lors de l\'envoi audio')
      else onReceive('Erreur réseau lors de l\'envoi audio')
    }
  }

  return (
    <div className="chat-window">
      <div className={`chat-top ${pulse ? 'pulse' : ''}`}>
        <span className="assistant-name">EliA — Assistant Biblique</span>
      </div>

      <div className="messages" ref={listRef} onScroll={handleScroll}>
        {!conversation && <div className="no-convo">Sélectionnez ou créez une conversation.</div>}
        {conversation?.messages?.map((m, idx) => {
          // Render pending assistant placeholder differently and animate it
          if (m.role === 'assistant' && m.pending) {
            const shift = pendingShiftRef.current || 0
            const pendingStyle = {
              fontStyle: 'italic',
              color: '#556',
              transform: `translateX(${shift}px)`,
              transition: 'transform 0.25s ease',
            }
            const bubbleStyle = {
              background: 'linear-gradient(90deg, rgba(240,245,255,1) 0%, rgba(235,242,249,1) 100%)',
              border: '1px dashed rgba(100,120,150,0.2)'
            }
            return (
              <div key={idx} className={`msg pending ${m.role}`}>
                <div className="bubble" style={bubbleStyle}>
                  <div className="text" style={pendingStyle}>{pendingAnimLabel}</div>
                  <div className="ts">{new Date(m.ts || Date.now()).toLocaleTimeString()}</div>
                </div>
              </div>
            )
          }

          return (
            <div key={idx} className={`msg ${m.role}`}>
              <div className="bubble">
                <div className="text">{m.text}</div>
                <div className="ts">{new Date(m.ts || Date.now()).toLocaleTimeString()}</div>
              </div>
            </div>
          )
        })}
      </div>

      <form className="composer" onSubmit={handleSend}>
        <input placeholder="Écrivez un message..." value={input} onChange={(e) => setInput(e.target.value)} />
        <div className="controls">
          <input aria-hidden type="file" style={{ display: 'none' }} />
          <button type="button" title="Uploader un fichier" className="btn-ghost" disabled>📎</button>
          <RecorderButton onSend={handleAudioSend} />
          <button type="submit" className={`btn-primary send-btn ${sentAnim ? 'sent' : ''}`} disabled={loading}>{loading ? '...' : '🚀 Envoyer'}</button>
        </div>
      </form>
    </div>
  )
}
