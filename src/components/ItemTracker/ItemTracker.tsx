import { EventItem, EventTypeConfig } from '@/types'

interface ItemTrackerProps {
  items: EventItem[]
  config: EventTypeConfig
  onSelectItem: (itemId: string) => void
}

export function ItemTracker({ items, config, onSelectItem }: ItemTrackerProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-8">
        {config.copy.emptyState}
      </p>
    )
  }

  return (
    <ul className="space-y-3" aria-label="Lista articole">
      {items.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          config={config}
          onSelect={() => onSelectItem(item.id)}
        />
      ))}
    </ul>
  )
}

interface ItemRowProps {
  item: EventItem
  config: EventTypeConfig
  onSelect: () => void
}

function ItemRow({ item, config, onSelect }: ItemRowProps) {
  const percent = Math.min(100, Math.round((item.raisedAmount / item.targetAmount) * 100))
  const remaining = Math.max(0, item.targetAmount - item.raisedAmount)

  return (
    <li className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{item.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {item.isFullyFunded
              ? 'Finanțat integral ✓'
              : `${remaining} RON rămași din ${item.targetAmount} RON`}
          </p>
        </div>
        {!item.isFullyFunded && (
          <button
            onClick={onSelect}
            className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: config.palette.primary }}
            aria-label={`${config.copy.donationVerb} pentru ${item.name}`}
          >
            {config.copy.donationVerb}
          </button>
        )}
        {item.isFullyFunded && (
          <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            Complet
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div
        className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${percent}% finanțat`}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: config.palette.accent }}
        />
      </div>
      <p className="mt-1 text-right text-xs text-gray-400">{percent}%</p>
    </li>
  )
}
