import { Event, EventTypeConfig } from '@/types'

interface StepSuccessProps {
  config: EventTypeConfig
  event: Event
  amount: number
}

export function StepSuccess({ config, event, amount }: StepSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full text-3xl"
        style={{ backgroundColor: config.palette.background }}
        aria-hidden="true"
      >
        ✓
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Mulțumim!</h2>
        <p className="mt-1 text-sm text-gray-600 max-w-xs">
          {config.copy.thankYouMessage}
        </p>
      </div>
      <div className="rounded-lg bg-gray-50 px-6 py-3 text-sm">
        <span className="text-gray-500">Ai donat </span>
        <span className="font-semibold text-gray-900">{amount} RON</span>
        <span className="text-gray-500"> pentru {event.name}</span>
      </div>
    </div>
  )
}
