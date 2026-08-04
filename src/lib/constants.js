// Pipeline stages a lead moves through. Order matters — it's used for
// the pipeline board columns and for sorting.
export const STAGES = [
  { key: 'new', label: 'New Lead', color: '#8E8E93' },
  { key: 'ongoing', label: 'Ongoing', color: '#0071E3' },
  { key: 'sv_scheduled', label: 'SV Scheduled', color: '#5E5CE6' },
  { key: 'sv_done', label: 'SV Done', color: '#30B0C7' },
  { key: 'negotiation_scheduled', label: 'Negotiation Scheduled', color: '#FF9500' },
  { key: 'negotiation_done', label: 'Negotiation Done', color: '#FF7A00' },
  { key: 'login_process', label: 'Login Process', color: '#AF52DE' },
  { key: 'won', label: 'Won', color: '#34C759' },
  { key: 'lost', label: 'Lost', color: '#FF3B30' }
]

export const STAGE_MAP = Object.fromEntries(STAGES.map((s) => [s.key, s]))

// Open stages = still active in the pipeline (not a final outcome)
export const OPEN_STAGES = STAGES.filter((s) => !['won', 'lost'].includes(s.key)).map((s) => s.key)

// Call / connect outcome for a single call attempt
export const CALL_OUTCOMES = [
  { key: 'IN', label: 'Interested', color: '#34C759', answered: true },
  { key: 'NI', label: 'Not Interested', color: '#FF3B30', answered: true },
  { key: 'NP', label: 'Not Picked', color: '#FF9500', answered: false },
  { key: 'NR', label: 'Not Reachable', color: '#8E8E93', answered: false },
  { key: 'OFF', label: 'Switched Off', color: '#6E6E73', answered: false }
]

export const CALL_OUTCOME_MAP = Object.fromEntries(CALL_OUTCOMES.map((c) => [c.key, c]))

export const LEAD_SOURCES = [
  'Reference',
  'Facebook Ads',
  'Google Ads',
  'Walk-in',
  'Portal (99acres/MagicBricks)',
  'Cold Call',
  'Channel Partner',
  'Other'
]

export const PROPERTY_TYPES = ['Apartment', 'Villa/Independent House', 'Plot/Land', 'Commercial', 'Office Space']

// Simple gamification thresholds
export const POINTS = {
  call_logged: 2,
  IN: 3,
  sv_done: 15,
  negotiation_done: 20,
  won: 100,
  lost: -2 // small nudge, never punitive — logging a Lost is still progress vs. no follow-up
}
