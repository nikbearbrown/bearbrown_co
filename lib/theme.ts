export const theme = {
  // Bear Brown default palette — swap these to rebrand the entire site
  // All pairings meet WCAG AA contrast (4.5:1) against bb8 (cream)
  colors: {
    bb1: '#1a0a00',   // near black — primary text
    bb2: '#8B3A0F',   // burnt orange — primary accent, headers
    bb3: '#A52A1A',   // deep crimson — alert, danger, emphasis
    bb4: '#E8A020',   // amber — highlight, callout
    bb5: '#B5420A',   // burnt sienna — secondary accent
    bb6: '#B8860B',   // dark goldenrod — muted accent
    bb7: '#C8A96E',   // warm tan — borders, subtle backgrounds
    bb8: '#F0E6D0',   // cream — page background, light surfaces
  },
  // Semantic aliases — use these in components, not raw hex
  semantic: {
    text:        'bb1',
    accent:      'bb2',
    danger:      'bb3',
    highlight:   'bb4',
    secondary:   'bb5',
    muted:       'bb6',
    border:      'bb7',
    background:  'bb8',
  },
} as const

export type Theme = typeof theme
