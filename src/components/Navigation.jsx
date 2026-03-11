import { List, Star, Map, AlertTriangle } from 'lucide-react'

const TABS = [
  { id: 'list',      label: 'Liste',    Icon: List          },
  { id: 'favorites', label: 'Favoris',  Icon: Star          },
  { id: 'map',       label: 'Carte',    Icon: Map           },
  { id: 'traffic',   label: 'Trafic',   Icon: AlertTriangle },
]

export default function Navigation({ activeTab, onTabChange }) {
  return (
    <nav className="flex-shrink-0 bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] safe-bottom">
      <ul className="flex">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id
          return (
            <li key={id} className="flex-1">
              <button
                onClick={() => onTabChange(id)}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={`
                  w-full py-2.5 flex flex-col items-center gap-0.5 transition-colors
                  ${active ? 'text-tcl-red' : 'text-gray-400 active:text-gray-600'}
                `}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.8}
                  fill={active && id === 'favorites' ? 'currentColor' : 'none'}
                />
                <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>
                  {label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
