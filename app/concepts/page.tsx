'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/Sidebar'
import { Search, Filter, Plus, List, LayoutGrid, Sparkles, FileText, ArrowRight, X, Eye } from 'lucide-react'

const mockConcepts = [
  {
    id: 1,
    conceptId: 'FLB-001',
    title: 'Streamlined Checkout Flow',
    source: 'ai',
    matchScore: 94,
    status: 'concept',
    description: 'Reduce checkout steps and improve conversion',
    evidence: '342 checkout abandonments detected in Mixpanel. 15+ support tickets mentioning checkout confusion.',
    priority: 'High',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    conceptId: 'FLB-002',
    title: 'Dark Mode Toggle',
    source: 'manual',
    matchScore: 87,
    status: 'concept',
    description: 'User-requested feature for better UX',
    evidence: '45 user requests via Intercom. Trending in feature request board.',
    priority: 'Medium',
    createdAt: '2024-01-18',
  },
  {
    id: 3,
    conceptId: 'FLB-003',
    title: 'Advanced Search Filters',
    source: 'ai',
    matchScore: 91,
    status: 'manifesting',
    description: 'Based on user behavior analytics',
    evidence: 'Users spending 3x longer on search page. 60% exit without results.',
    priority: 'High',
    createdAt: '2024-01-20',
  },
  {
    id: 4,
    conceptId: 'FLB-004',
    title: 'Mobile App Redesign',
    source: 'manual',
    matchScore: 76,
    status: 'ready',
    description: 'Complete UI overhaul for mobile',
    evidence: 'Mobile bounce rate 40% higher than desktop. App store reviews mention outdated UI.',
    priority: 'Medium',
    createdAt: '2024-01-22',
  },
  {
    id: 5,
    conceptId: 'FLB-005',
    title: 'Real-time Collaboration',
    source: 'ai',
    matchScore: 89,
    status: 'concept',
    description: 'Enable multiple users to work simultaneously',
    evidence: '12 Slack threads requesting collaboration features. 8 enterprise deals lost due to lack of collaboration.',
    priority: 'High',
    createdAt: '2024-01-25',
  },
  {
    id: 6,
    conceptId: 'FLB-006',
    title: 'Export to PDF',
    source: 'manual',
    matchScore: 82,
    status: 'concept',
    description: 'Allow users to export reports as PDF',
    evidence: '25 support tickets requesting PDF export. Feature request upvoted 150+ times.',
    priority: 'Medium',
    createdAt: '2024-01-26',
  },
  {
    id: 7,
    conceptId: 'FLB-007',
    title: 'Custom Dashboard Widgets',
    source: 'ai',
    matchScore: 85,
    status: 'manifesting',
    description: 'Let users customize their dashboard layout',
    evidence: 'Dashboard engagement drops 50% after first week. Users requesting more flexibility.',
    priority: 'High',
    createdAt: '2024-01-28',
  },
  {
    id: 8,
    conceptId: 'FLB-008',
    title: 'Email Notifications',
    source: 'manual',
    matchScore: 73,
    status: 'ready',
    description: 'Configure email notification preferences',
    evidence: 'Users complaining about notification overload. Need granular controls.',
    priority: 'Low',
    createdAt: '2024-01-30',
  },
  {
    id: 9,
    conceptId: 'FLB-009',
    title: 'Bulk Actions',
    source: 'ai',
    matchScore: 88,
    status: 'concept',
    description: 'Perform actions on multiple items at once',
    evidence: 'Users manually processing 100+ items. Time tracking shows 2 hours/day on repetitive tasks.',
    priority: 'High',
    createdAt: '2024-02-01',
  },
  {
    id: 10,
    conceptId: 'FLB-010',
    title: 'API Rate Limiting',
    source: 'manual',
    matchScore: 79,
    status: 'manifesting',
    description: 'Implement rate limiting for API endpoints',
    evidence: 'API abuse detected. 3 incidents of DDoS attempts. Need protection.',
    priority: 'High',
    createdAt: '2024-02-03',
  },
  {
    id: 11,
    conceptId: 'FLB-011',
    title: 'Two-Factor Authentication',
    source: 'ai',
    matchScore: 92,
    status: 'ready',
    description: 'Add 2FA for enhanced security',
    evidence: 'Security audit flagged missing 2FA. Enterprise customers require it.',
    priority: 'High',
    createdAt: '2024-02-05',
  },
  {
    id: 12,
    conceptId: 'FLB-012',
    title: 'Keyboard Shortcuts',
    source: 'manual',
    matchScore: 68,
    status: 'concept',
    description: 'Add keyboard shortcuts for power users',
    evidence: 'Power users requesting shortcuts. Survey shows 80% want keyboard navigation.',
    priority: 'Low',
    createdAt: '2024-02-07',
  },
]

const kanbanColumns = [
  { id: 'concept', label: 'Concept' },
  { id: 'manifesting', label: 'Manifesting' },
  { id: 'ready', label: 'Ready for Dev' },
]

export default function ConceptsPage() {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'ai' | 'manual'>('all')
  const [selectedConcept, setSelectedConcept] = useState<typeof mockConcepts[0] | null>(null)
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const filteredConcepts = mockConcepts.filter((concept) => {
    const matchesSearch = concept.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         concept.conceptId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === 'all' || concept.source === filterType
    return matchesSearch && matchesFilter
  })

  const handleManifest = (conceptId: string) => {
    setIsLoading(conceptId)
    setTimeout(() => {
      setIsLoading(null)
      window.location.href = '/workspace'
    }, 1000)
  }

  const ConceptRow = ({ concept }: { concept: typeof mockConcepts[0] }) => (
    <tr className="border-b border-light-gray dark:border-dark-gray hover:bg-gray-50 dark:hover:bg-dark-gray/50 transition-colors">
      <td className="py-4 px-4">
        <div className="font-mono text-sm font-semibold text-electric-blue dark:text-electric-blue-dark">
          {concept.conceptId}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2 mb-1">
          {concept.source === 'ai' ? (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-semibold flex items-center gap-1 w-fit">
              <Sparkles className="w-3 h-3" />
              AI-Generated
            </span>
          ) : (
            <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-semibold flex items-center gap-1 w-fit">
              <FileText className="w-3 h-3" />
              Manual
            </span>
          )}
        </div>
        <h3 className="font-semibold text-black dark:text-off-white">{concept.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{concept.description}</p>
      </td>
      <td className="py-4 px-4">
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Match Score</div>
          <div className="text-lg font-bold text-safety-orange">{concept.matchScore}%</div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {concept.priority}
        </div>
      </td>
      <td className="py-4 px-4">
        <button
          onClick={() => setSelectedConcept(concept)}
          className="px-4 py-2 bg-electric-blue dark:bg-electric-blue-dark text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Details
        </button>
      </td>
    </tr>
  )

  const ConceptCard = ({ concept }: { concept: typeof mockConcepts[0] }) => (
    <div className="bg-white dark:bg-deep-black border border-light-gray dark:border-dark-gray rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="font-mono text-xs font-semibold text-electric-blue dark:text-electric-blue-dark mb-1">
            {concept.conceptId}
          </div>
          {concept.source === 'ai' ? (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI-Generated
            </span>
          ) : (
            <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-semibold flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Manual
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Match Score</div>
          <div className="text-lg font-bold text-safety-orange">{concept.matchScore}%</div>
        </div>
      </div>
      <h3 className="font-semibold mb-2 text-black dark:text-off-white">{concept.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{concept.description}</p>
      <button
        onClick={() => setSelectedConcept(concept)}
        className="w-full bg-electric-blue dark:bg-electric-blue-dark text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
      >
        <Eye className="w-4 h-4" />
        Details
      </button>
    </div>
  )

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-white dark:bg-deep-black p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-black dark:text-off-white">Concepts</h1>
            <p className="text-gray-600 dark:text-gray-400">The Intelligence Hub</p>
          </div>

          {/* Top Bar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-light-gray dark:border-dark-gray rounded-lg bg-white dark:bg-deep-black text-black dark:text-off-white focus:outline-none focus:ring-2 focus:ring-electric-blue dark:focus:ring-electric-blue-dark"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-light-gray dark:border-dark-gray rounded-lg bg-white dark:bg-deep-black text-black dark:text-off-white focus:outline-none focus:ring-2 focus:ring-electric-blue dark:focus:ring-electric-blue-dark"
            >
              <option value="all">All Types</option>
              <option value="ai">AI-Generated</option>
              <option value="manual">Manual</option>
            </select>
            <button 
              className="px-4 py-2 bg-safety-orange text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading !== null}
            >
              {isLoading === 'new' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  New Concept
                </>
              )}
            </button>
            <div className="flex items-center gap-2 border border-light-gray dark:border-dark-gray rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-electric-blue dark:bg-electric-blue-dark text-white' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-electric-blue dark:bg-electric-blue-dark text-white' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          {viewMode === 'list' ? (
            <div className="bg-white dark:bg-deep-black border border-light-gray dark:border-dark-gray rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-gray">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-off-white">ID</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-off-white">Concept</th>
                    <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700 dark:text-off-white">Match Score</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-off-white">Priority</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-off-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConcepts.map((concept) => (
                    <ConceptRow key={concept.id} concept={concept} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {kanbanColumns.map((column) => {
                const columnConcepts = filteredConcepts.filter((c) => c.status === column.id)
                return (
                  <div key={column.id} className="space-y-4">
                    <div className="bg-gray-50 dark:bg-dark-gray rounded-lg p-3">
                      <h3 className="font-semibold text-black dark:text-off-white">{column.label}</h3>
                      <span className="text-sm text-gray-500">{columnConcepts.length} items</span>
                    </div>
                    <div className="space-y-3">
                      {columnConcepts.map((concept) => (
                        <ConceptCard key={concept.id} concept={concept} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal/Slide-over */}
      {selectedConcept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedConcept(null)}>
          <div 
            className="bg-white dark:bg-deep-black rounded-lg shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-deep-black border-b border-light-gray dark:border-dark-gray p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-lg font-semibold text-electric-blue dark:text-electric-blue-dark">
                    {selectedConcept.conceptId}
                  </span>
                  {selectedConcept.source === 'ai' ? (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-sm font-semibold flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      AI-Generated
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded text-sm font-semibold flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Manual
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-black dark:text-off-white">{selectedConcept.title}</h2>
              </div>
              <button
                onClick={() => setSelectedConcept(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-gray rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Description</h3>
                <p className="text-black dark:text-off-white">{selectedConcept.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Evidence</h3>
                <p className="text-black dark:text-off-white">{selectedConcept.evidence}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Match Score</h3>
                  <div className="text-2xl font-bold text-safety-orange">{selectedConcept.matchScore}%</div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Priority</h3>
                  <div className="text-lg font-semibold text-black dark:text-off-white">{selectedConcept.priority}</div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Created</h3>
                  <div className="text-lg text-black dark:text-off-white">{selectedConcept.createdAt}</div>
                </div>
              </div>
              <div className="pt-4 border-t border-light-gray dark:border-dark-gray">
                <button
                  onClick={() => handleManifest(selectedConcept.conceptId)}
                  disabled={isLoading === selectedConcept.conceptId}
                  className="w-full bg-safety-orange text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading === selectedConcept.conceptId ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Manifesting...
                    </>
                  ) : (
                    <>
                      Manifest
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}