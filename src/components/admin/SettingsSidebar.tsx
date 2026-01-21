import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { BackIcon, StarIcon, CloseIcon, MENU_SECTIONS } from './index'

interface SettingsSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  favoritesCount: number
}

export function SettingsSidebar({
  activeSection,
  setActiveSection,
  mobileMenuOpen,
  setMobileMenuOpen,
  favoritesCount
}: SettingsSidebarProps) {
  const { t } = useTranslation()

  return (
    <aside className={`
      fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50
      w-64 h-screen bg-dark-900 border-r border-dark-700/50 flex-shrink-0
      transform transition-transform duration-200 ease-in-out
      ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-dark-700/50">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="p-2 rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors">
            <BackIcon />
          </Link>
          <h1 className="text-lg font-bold text-dark-100">{t('admin.settings.title')}</h1>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="ml-auto p-2 rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors lg:hidden"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Menu */}
      <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]">
        {MENU_SECTIONS.map((section, sectionIdx) => (
          <div key={section.id}>
            {sectionIdx > 0 && <div className="my-3 border-t border-dark-700/50" />}
            {section.items.map((item) => {
              const isActive = activeSection === item.id
              const hasIcon = item.iconType === 'star'
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-accent-500/10 text-accent-400'
                      : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
                  }`}
                >
                  {hasIcon && <StarIcon filled={isActive && item.id === 'favorites'} />}
                  <span className="font-medium">{t(`admin.settings.${item.id}`)}</span>
                  {item.id === 'favorites' && favoritesCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-warning-500/20 text-warning-400">
                      {favoritesCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}
