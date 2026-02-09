'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { MessageSquare, BarChart3, Code, CheckCircle2, Settings } from 'lucide-react'

const integrations = {
  feedback: [
    { id: 'gong', name: 'Gong', icon: '🎤', connected: false, description: 'Capture customer conversations' },
    { id: 'intercom', name: 'Intercom', icon: '💬', connected: true, lastSync: '2 hours ago', description: 'Customer support messages' },
    { id: 'slack', name: 'Slack', icon: '💼', connected: true, lastSync: '5 minutes ago', description: 'Team feedback channels' },
    { id: 'zendesk', name: 'Zendesk', icon: '🎫', connected: false, description: 'Support tickets and requests' },
  ],
  usage: [
    { id: 'mixpanel', name: 'Mixpanel', icon: '📊', connected: true, lastSync: '1 hour ago', description: 'User behavior analytics' },
    { id: 'posthog', name: 'PostHog', icon: '🔍', connected: false, description: 'Product analytics platform' },
    { id: 'ga', name: 'Google Analytics', icon: '📈', connected: false, description: 'Website traffic and events' },
  ],
  build: [
    { id: 'github', name: 'GitHub', icon: '🐙', connected: true, lastSync: '30 minutes ago', description: 'Code repository and issues' },
    { id: 'jira', name: 'Jira', icon: '🎯', connected: false, description: 'Project management and tickets' },
    { id: 'linear', name: 'Linear', icon: '📋', connected: false, description: 'Issue tracking and sprints' },
  ],
}

const categoryIcons = {
  feedback: MessageSquare,
  usage: BarChart3,
  build: Code,
}

export default function IntegrationsPage() {
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set())

  const handleConnect = (itemId: string) => {
    setLoadingItems(prev => new Set(prev).add(itemId))
    setTimeout(() => {
      setLoadingItems(prev => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
      alert(`${itemId} connected successfully!`)
    }, 1500)
  }

  const handleManage = (itemId: string) => {
    setLoadingItems(prev => new Set(prev).add(itemId))
    setTimeout(() => {
      setLoadingItems(prev => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }, 500)
  }

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-white dark:bg-deep-black p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-black dark:text-off-white">Integrations</h1>
            <p className="text-gray-600 dark:text-gray-400">The Connectivity Gallery</p>
          </div>

          {/* Categories */}
          {Object.entries(integrations).map(([category, items]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons]
            return (
              <div key={category} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Icon className="w-6 h-6 text-electric-blue dark:text-electric-blue-dark" />
                  <h2 className="text-2xl font-semibold text-black dark:text-off-white capitalize">
                    {category}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {category === 'feedback' && 'Where users talk'}
                    {category === 'usage' && 'Where users click'}
                    {category === 'build' && 'Where code lives'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-deep-black border border-light-gray dark:border-dark-gray rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{item.icon}</span>
                          <div>
                            <h3 className="font-semibold text-black dark:text-off-white">{item.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                          </div>
                        </div>
                      </div>
                      {item.connected ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-green-500">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">Active</span>
                          </div>
                          <p className="text-xs text-gray-500">Last sync: {item.lastSync}</p>
                          <button 
                            onClick={() => handleManage(item.id)}
                            disabled={loadingItems.has(item.id)}
                            className="w-full mt-4 px-4 py-2 border border-light-gray dark:border-dark-gray rounded-lg text-sm font-medium text-black dark:text-off-white hover:bg-gray-50 dark:hover:bg-dark-gray transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingItems.has(item.id) ? (
                              <>
                                <div className="w-4 h-4 border-2 border-gray-600 dark:border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                Loading...
                              </>
                            ) : (
                              <>
                                <Settings className="w-4 h-4" />
                                Manage
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleConnect(item.id)}
                          disabled={loadingItems.has(item.id)}
                          className="w-full mt-4 px-4 py-2 bg-electric-blue dark:bg-electric-blue-dark text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loadingItems.has(item.id) ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Connecting...
                            </>
                          ) : (
                            'Connect'
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}