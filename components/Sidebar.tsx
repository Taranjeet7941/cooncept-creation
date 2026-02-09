'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brain, Code, Plug, Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'

const navItems = [
  { href: '/concepts', icon: Brain, label: 'Concepts' },
  { href: '/workspace', icon: Code, label: 'Workspace' },
  { href: '/integrations', icon: Plug, label: 'Integrations' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const isLanding = pathname === '/'

  if (isLanding) return null

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-deep-black border-r border-light-gray dark:border-dark-gray flex flex-col z-50">
      <div className="p-6 border-b border-light-gray dark:border-dark-gray">
        <Link href="/" className="text-2xl font-bold">
          <span className="text-safety-orange">Flash</span>
          <span className="text-electric-blue dark:text-electric-blue-dark">build</span>
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-electric-blue dark:bg-electric-blue-dark text-white'
                  : 'text-gray-700 dark:text-off-white hover:bg-gray-100 dark:hover:bg-dark-gray'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-light-gray dark:border-dark-gray">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-off-white hover:bg-gray-100 dark:hover:bg-dark-gray transition-colors"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
          <span className="font-medium">
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </button>
      </div>
    </div>
  )
}