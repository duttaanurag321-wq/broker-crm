const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const IconToday = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 24} height={p.size || 24} {...base} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
    <path d="M8.5 14.5l2 2 4-4" />
  </svg>
)

export const IconPipeline = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 24} height={p.size || 24} {...base} {...p}>
    <path d="M3 5h18" />
    <path d="M6 12h12" />
    <path d="M10 19h4" />
  </svg>
)

export const IconLeads = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 24} height={p.size || 24} {...base} {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20c0-3.5 2.5-6 5.5-6s5.5 2.5 5.5 6" />
    <path d="M16 8.2c1.4.3 2.5 1.6 2.5 3.1 0 1.1-.5 2-1.4 2.6" />
    <path d="M15 14c2.6.4 4.5 2.6 4.5 5.6" />
  </svg>
)

export const IconReports = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 24} height={p.size || 24} {...base} {...p}>
    <path d="M5 20V10M12 20V4M19 20v-7" />
  </svg>
)

export const IconMore = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 24} height={p.size || 24} {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 8v5l3 2" />
  </svg>
)

export const IconWhatsapp = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} fill="currentColor" {...p}>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.34a9.9 9.9 0 0 0 4.62 1.15h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.51 2 12.04 2Zm5.8 14.02c-.24.68-1.4 1.3-1.94 1.36-.5.06-1.1.09-1.77-.11-.41-.12-.93-.3-1.6-.58-2.82-1.22-4.66-4.06-4.8-4.25-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07.99-2.36.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.42-.07.65.5.24.58.81 2 .88 2.15.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.18 1.53 1.91 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.16-.19.68-.8.87-1.07.19-.28.37-.23.62-.14.26.09 1.64.78 1.92.92.28.14.47.21.53.33.07.12.07.68-.17 1.36Z" />
  </svg>
)

export const IconCall = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} {...base} {...p}>
    <path d="M5.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3c0 1-.9 1.7-1.9 1.5-4-.7-7.6-2.6-10.3-5.3S3.7 8.4 3 4.4C2.8 3.4 3.5 2.5 4.5 2.5" />
  </svg>
)

export const IconPlus = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconChevron = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <path d="M9 6l6 6-6 6" />
  </svg>
)

export const IconBack = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} {...base} {...p}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
)

export const IconUpload = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} {...base} {...p}>
    <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
    <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>
)

export const IconCheck = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} {...base} {...p}>
    <path d="M4 12l5 5L20 6" />
  </svg>
)

export const IconFire = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="currentColor" {...p}>
    <path d="M12 2c1 3-2 4-2 7a2 2 0 1 0 4 0c1.5 1 2.5 3 2.5 5a6.5 6.5 0 1 1-13 0C3.5 9 6 6 8 4c0 2-1 3 0 4 1-2 3-3 4-6Z" />
  </svg>
)

export const IconClose = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const IconSearch = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
)

export const IconInbox = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} {...base} {...p}>
    <path d="M3 12h4.5l1.5 3h6l1.5-3H21" />
    <path d="M5.5 6h13a2 2 0 0 1 2 1.8L21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6l0.5-4.2A2 2 0 0 1 5.5 6z" />
  </svg>
)

export const IconFilter = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 20} height={p.size || 20} {...base} {...p}>
    <path d="M4 6h16M7 12h10M10.5 18h3" />
  </svg>
)

export const IconCalendar = (p) => (
  <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} {...base} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
)
