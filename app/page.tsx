'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import FlashHero from '@/components/FlashHero'

export default function LandingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleGetStarted = () => {
    setIsLoading('get-started')
    setTimeout(() => {
      router.push('/integrations')
    }, 500)
  }

  const handleWatchDemo = () => {
    setIsLoading('demo')
    setTimeout(() => {
      setIsLoading(null)
      alert('Demo video would play here')
    }, 1000)
  }

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-white dark:bg-deep-black">
        {/* Hero: Flash Lens + Noise Feed with bulge effect */}
        <FlashHero />

        {/* CTA and secondary content below hero */}
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-center mb-16">
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                disabled={isLoading !== null}
                className="px-8 py-4 bg-safety-orange text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading === 'get-started' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </>
                ) : (
                  'Get Started for Free'
                )}
              </button>
              <button
                onClick={handleWatchDemo}
                disabled={isLoading !== null}
                className="px-8 py-4 border-2 border-electric-blue dark:border-electric-blue-dark text-electric-blue dark:text-electric-blue-dark rounded-lg font-semibold hover:bg-electric-blue hover:text-white dark:hover:bg-electric-blue-dark dark:hover:text-deep-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading === 'demo' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </>
                ) : (
                  'Watch 60s Demo'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}