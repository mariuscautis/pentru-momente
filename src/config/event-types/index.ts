import { EventTypeConfig } from '@/types'
import { funeralConfig } from './funeral'
import { weddingConfig } from './wedding'
import { babyConfig } from './baby'
import { healthConfig } from './health'
import { customConfig } from './custom'
import { charityConfig } from './charity'
import { animalsConfig } from './animals'

const registry: Record<string, EventTypeConfig> = {
  inmormantare: funeralConfig,
  nunta: weddingConfig,
  bebe: babyConfig,
  sanatate: healthConfig,
  caritate: charityConfig,
  animale: animalsConfig,
  altele: customConfig,
}

export function getEventTypeConfig(slug: string): EventTypeConfig {
  const config = registry[slug]
  if (!config) throw new Error(`Unknown event type: ${slug}`)
  return config
}

export function getAllEventTypes(): EventTypeConfig[] {
  return Object.values(registry)
}

export function isValidEventType(slug: string): boolean {
  return slug in registry
}
