'use client'

import { useState, useRef, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { CheckCircle, Send, Plus, Loader2, Sparkles, User, Bot, Layers } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

type Message = {
  role: 'user' | 'assistant' | 'thinking' | 'system';
  content: string;
}

export default function WorkspacePage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hey there! 👋 I\'m FlashBuild AI, your creative web development companion! I have access to valuable data insights and I\'m here to help you build stunning, interactive web experiences. What would you like to create today?' }
  ])
  const [input, setInput] = useState('')
  const [isStreamingEnabled, setIsStreamingEnabled] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewKey, setPreviewKey] = useState(1) // Used to force iframe reload
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const [userId, setUserId] = useState('')

  useEffect(() => {
    // Generate or retrieve userId
    let storedUserId = localStorage.getItem('flashbuild_user_id')
    if (!storedUserId) {
      storedUserId = `user_${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem('flashbuild_user_id', storedUserId)
    }
    setUserId(storedUserId)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          streaming: isStreamingEnabled,
          userId: userId // Pass userId to the agent
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      if (isStreamingEnabled) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let assistantMessage: Message = { role: 'assistant', content: '' }
        let thinkingMessage: Message | null = null

        setMessages(prev => [...prev, assistantMessage])

        while (true) {
          const { done, value } = await reader!.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(Boolean)

          for (const line of lines) {
            try {
              const event = JSON.parse(line)

              if (event.type === 'message_update') {
                const delta = event.assistantMessageEvent
                if (delta.type === 'text_delta') {
                  assistantMessage.content += delta.delta
                  setMessages(prev => {
                    const newMessages = [...prev]
                    newMessages[newMessages.length - 1] = { ...assistantMessage }
                    return newMessages
                  })
                } else if (delta.type === 'thinking_delta') {
                  if (!thinkingMessage) {
                    thinkingMessage = { role: 'thinking', content: '' }
                    setMessages(prev => {
                      const newMessages = [...prev]
                      // Insert thinking before assistant message if it just started
                      newMessages.splice(newMessages.length - 1, 0, thinkingMessage!)
                      return newMessages
                    })
                  }
                  thinkingMessage.content += delta.delta
                  setMessages(prev => {
                    const newMessages = [...prev]
                    const index = newMessages.findIndex(m => m === thinkingMessage)
                    if (index !== -1) {
                      newMessages[index] = { ...thinkingMessage! }
                    }
                    return newMessages
                  })
                } else if (delta.type === 'tool_result') {
                  // Check if the tool was 'write' and the file was preview_${userId}.html
                  if (delta.toolName === 'write') {
                    try {
                      const result = delta.result
                      // Check if result contains path information
                      if (result && typeof result === 'object') {
                        const resultStr = JSON.stringify(result)
                        if (resultStr.includes(`preview_${userId}.html`)) {
                          console.log('Detected preview file write, reloading preview...')
                          setPreviewKey(prev => prev + 1)
                        }
                      }
                    } catch (e) {
                      console.error('Error checking tool result:', e)
                    }
                  }
                }
              } else if (event.type === 'agent_end') {
                // Also reload preview at the end of agent execution
                console.log('Agent execution ended, reloading preview...')
                setPreviewKey(prev => prev + 1)
              }
            } catch (e) {
              console.error('Error parsing event:', e)
            }
          }
        }
      } else {
        const data = await response.json()
        const lastMessage = data.messages[data.messages.length - 1]
        setMessages(prev => [...prev, { role: 'assistant', content: lastMessage.content }])
        // For non-streaming, we might need to check if preview was written
        setPreviewKey(prev => prev + 1)
      }
    } catch (error) {
      console.error('Chat Error:', error)
      setMessages(prev => [...prev, { role: 'system', content: 'Error: Failed to connect to AI assistant.' }])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Sidebar />
      <div className="ml-64 h-screen bg-white dark:bg-deep-black flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-light-gray dark:border-dark-gray p-6 flex items-center justify-between bg-white/80 dark:bg-deep-black/80 backdrop-blur-md flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-off-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-electric-blue" />
              Workspace
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Collaborating with AI Engineer</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100 dark:bg-dark-gray p-1 rounded-lg">
              <button
                onClick={() => setIsStreamingEnabled(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${isStreamingEnabled ? 'bg-white dark:bg-deep-black shadow-sm text-electric-blue' : 'text-gray-500'}`}
              >
                Streaming
              </button>
              <button
                onClick={() => setIsStreamingEnabled(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${!isStreamingEnabled ? 'bg-white dark:bg-deep-black shadow-sm text-electric-blue' : 'text-gray-500'}`}
              >
                Static
              </button>
            </div>
          </div>
        </div>

        {/* Split-Screen Interface */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Chat Interface */}
          <div className="flex-1 border-r border-light-gray dark:border-dark-gray flex flex-col bg-gray-50/30 dark:bg-deep-black overflow-hidden">
            <div className="p-4 border-b border-light-gray dark:border-dark-gray bg-white dark:bg-deep-black flex justify-between items-center flex-shrink-0">
              <h2 className="font-semibold text-black dark:text-off-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-electric-blue" />
                Concept creation
              </h2>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Session Active</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-electric-blue text-white' :
                        m.role === 'thinking' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                          'bg-gray-200 dark:bg-dark-gray text-gray-600 dark:text-gray-300'
                        }`}>
                        {m.role === 'user' ? <User className="w-5 h-5" /> :
                          m.role === 'thinking' ? <Layers className="w-4 h-4 animate-pulse" /> :
                            <Bot className="w-5 h-5" />}
                      </div>
                      <div className={`p-4 rounded-2xl shadow-sm ${m.role === 'user'
                        ? 'bg-electric-blue text-white rounded-tr-none'
                        : m.role === 'thinking'
                          ? 'bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-200 text-xs italic rounded-tl-none font-mono whitespace-pre-wrap'
                          : 'bg-white dark:bg-dark-gray text-black dark:text-off-white border border-light-gray dark:border-gray-800 rounded-tl-none prose dark:prose-invert prose-sm max-w-none'
                        }`}>
                        {m.role === 'thinking' && <div className="mb-1 font-bold flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Thinking...</div>}
                        <div className=" break-words bot-insights-container ">
                          {m.role === 'assistant' ? (
                            m.content ? <ReactMarkdown>{m.content}</ReactMarkdown> : (i === messages.length - 1 && isProcessing ? '...' : '')
                          ) : (
                            m.content
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white dark:bg-deep-black border-t border-light-gray dark:border-dark-gray flex-shrink-0">
              <div className="max-w-4xl mx-auto relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Tell me what you'd like to create... "
                  rows={1}
                  className="w-full px-4 py-4 pr-14 border border-light-gray dark:border-dark-gray rounded-xl bg-gray-50 dark:bg-dark-gray text-black dark:text-off-white focus:outline-none focus:ring-2 focus:ring-electric-blue transition-all resize-none min-h-[56px] max-h-32"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isProcessing || !input.trim()}
                  className="absolute right-3 bottom-3 p-2 bg-electric-blue text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[10px] text-center mt-2 text-gray-400 uppercase tracking-widest font-medium">
                Uses User data to create concepts
              </p>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex-1 flex flex-col bg-[#F8F9FA] dark:bg-black">
            <div className="p-4 border-b border-light-gray dark:border-dark-gray bg-white dark:bg-deep-black flex justify-between items-center">
              <h2 className="font-semibold text-black dark:text-off-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-safety-orange" />
                Live Manifestation
              </h2>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
            </div>
            <div className="flex-1 relative overflow-hidden">
              <iframe
                key={previewKey}
                src={`/api/preview?t=${previewKey}&userId=${userId}`}
                className="w-full h-full border-none bg-white"
                title="UI Preview"
              />
              {!previewKey && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-dark-gray text-gray-400">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-electric-blue rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Waiting for AI to generate UI...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
