import type { Achievement, LogbookEntry } from './types'

/**
 * Given logbook entries, return which achievement IDs should unlock.
 * Matches by category + content keywords.
 */
export function matchAchievements(entries: LogbookEntry[]): string[] {
  const unlocked = new Set<string>()
  const categoryCounts: Record<string, number> = {}

  for (const entry of entries) {
    categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + 1
    const text = entry.content.toLowerCase()

    // Crew entries
    if (entry.category === 'crew') {
      unlocked.add('crew-interaction') // Kudos Giver
      // Secret: multiple crew entries or very positive
      if (entry.mood >= 5 || (categoryCounts['crew'] ?? 0) >= 2) {
        unlocked.add('crew-favorite')
      }
    }

    // Seat entries
    if (entry.category === 'seat') {
      if (text.match(/window|view|cloud|sunset|sunrise|sky|14a/)) {
        unlocked.add('cloud-lover') // Window seat lover
      }
      if (text.match(/aisle|legroom|stretch|move/)) {
        unlocked.add('aisle-runner')
      }
      if (text.match(/cockpit|captain|pilot/)) {
        unlocked.add('seat-achievement')
      }
    }

    // Delay entries
    if (entry.category === 'delay') {
      unlocked.add('delay-achievement') // Master of Patience
    }

    // Experience entries
    if (entry.category === 'experience') {
      if (text.match(/photo|picture|capture|cloud|view|sunrise|sunset|beautiful/)) {
        unlocked.add('cloud-capture')
      }
      if (text.match(/carry-on|backpack|light|minimal/)) {
        unlocked.add('light-traveler')
      }
      if (text.match(/check.?in|boarding pass|online|app/)) {
        unlocked.add('blitz-boarder')
      }
    }
  }

  // Secret: Sky Storyteller — wrote 3+ logbook entries
  if (entries.length >= 3) {
    unlocked.add('sky-storyteller')
  }

  return Array.from(unlocked)
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'seat-achievement',
    name: 'Sitzplatz-Achievement',
    description: 'Special: You got to sit in the cockpit!',
    imagePrompt: 'Cockpit seat view with glowing instrument panels',
    category: 'seat',
    icon: 'gauge',
    imageUrl: '/assets/pixel/sanwich-seater.png',
    collected: false,
  },
  {
    id: 'crew-interaction',
    name: 'Kudos Giver',
    description: 'Gave a nice compliment to the crew',
    imagePrompt: 'A friendly crew member receiving kudos from a passenger',
    category: 'crew',
    icon: 'star',
    imageUrl: '/assets/pixel/kuddos-giver.png',
    collected: false,
  },
  {
    id: 'timezone-achievement',
    name: 'Jetlag Survivor',
    description: 'Crossed multiple timezones and survived',
    imagePrompt: 'Multiple clocks floating among clouds',
    category: 'timezone',
    icon: 'clock',
    imageUrl: '/assets/pixel/jetlag-survivor.png',
    collected: false,
  },
  {
    id: 'delay-achievement',
    name: 'Master of Patience',
    description: 'Survived a flight delay with style',
    imagePrompt: 'A patient traveler waiting at the gate',
    category: 'delay',
    icon: 'shield',
    imageUrl: '/assets/pixel/master-of-patience.png',
    collected: false,
  },
  {
    id: 'cloud-capture',
    name: 'Cloud Capture',
    description: 'Took a stunning photo from the window seat',
    imagePrompt: 'A beautiful cloud photo through an airplane window',
    category: 'experience',
    icon: 'eye',
    imageUrl: '/assets/pixel/cloud-capture.png',
    collected: false,
  },
  {
    id: 'light-traveler',
    name: 'Light Traveler',
    description: 'Traveled with carry-on luggage only',
    imagePrompt: 'A traveler with a single backpack boarding a plane',
    category: 'experience',
    icon: 'luggage',
    imageUrl: '/assets/pixel/lightTraveler.png',
    collected: false,
  },
  {
    id: 'blitz-boarder',
    name: 'Blitz Boarder',
    description: 'Checked in online like a pro',
    imagePrompt: 'A phone showing a boarding pass with lightning speed',
    category: 'experience',
    icon: 'zap',
    imageUrl: '/assets/pixel/blitz-boarder.png',
    collected: false,
  },
  {
    id: 'flight-kilometers',
    name: '10K Sky High Club',
    description: 'Accumulated 10,000+ flight kilometers',
    imagePrompt: 'A golden counter showing 10000km in the sky',
    category: 'experience',
    icon: 'globe',
    imageUrl: '/assets/pixel/10k-sky-high-club.png',
    collected: false,
  },
  {
    id: 'queen-of-skies',
    name: 'Queen of the Skies',
    description: 'Flew on the legendary Boeing 747',
    imagePrompt: 'A majestic Boeing 747 wearing a crown in the clouds',
    category: 'experience',
    icon: 'crown',
    imageUrl: '/assets/pixel/queen-of-the-skies.png',
    collected: false,
  },
  {
    id: 'cloud-lover',
    name: 'Cloud Lover',
    description: 'Always picks the window seat for the views',
    imagePrompt: 'A dreamy cloud landscape seen from above',
    category: 'seat',
    icon: 'cloud',
    imageUrl: '/assets/pixel/cloud-lover.png',
    collected: false,
  },
  {
    id: 'aisle-runner',
    name: 'Aisle Runner',
    description: 'Prefers the aisle — always on the move',
    imagePrompt: 'A traveler stretching their legs in the aisle',
    category: 'seat',
    icon: 'footprints',
    imageUrl: '/assets/pixel/aisle-runner.png',
    collected: false,
  },
  {
    id: 'crew-favorite',
    name: 'Crew Favorite',
    description: '???',
    imagePrompt: 'A golden star badge given by a flight attendant',
    category: 'crew',
    icon: 'heart',
    collected: false,
    secret: true,
  },
  {
    id: 'sky-storyteller',
    name: 'Sky Storyteller',
    description: '???',
    imagePrompt: 'A book of stories floating among the clouds',
    category: 'experience',
    icon: 'book',
    collected: false,
    secret: true,
  },
]
