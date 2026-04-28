/**
 * Streaming platform definitions — single source of truth for admin selects,
 * public badges, and the TMDB sync script.
 *
 * `id`             — stored in StreamingLink.platform in the DB
 * `label`          — displayed to users
 * `hex`            — brand background color; applied via inline style to avoid Tailwind purge issues
 * `tmdbProviderIds`— TMDB Watch Providers IDs that map to this platform
 *
 * Text is always white (#ffffff) — all hex values have sufficient contrast with white.
 */
export const STREAMING_PLATFORMS = [
  // French / Belgian platforms
  { id: "CANAL_PLUS", label: "Canal+",      hex: "#000000", tmdbProviderIds: [190, 63]     },
  { id: "OCS",        label: "OCS",         hex: "#1a3a6e", tmdbProviderIds: [56, 3]       },
  { id: "ARTE",       label: "Arte",        hex: "#c4421a", tmdbProviderIds: [234]          },
  { id: "FRANCE_TV",  label: "France.tv",   hex: "#0057a8", tmdbProviderIds: [735, 740]    },
  // Global majors
  { id: "NETFLIX",    label: "Netflix",     hex: "#e50914", tmdbProviderIds: [8]            },
  { id: "PRIME",      label: "Prime Video", hex: "#0091c0", tmdbProviderIds: [119, 9]      },
  { id: "DISNEY",     label: "Disney+",     hex: "#1b3a8c", tmdbProviderIds: [337]          },
  { id: "APPLE_TV",   label: "Apple TV+",   hex: "#333333", tmdbProviderIds: [350]          },
  { id: "MAX",        label: "Max",         hex: "#002be7", tmdbProviderIds: [1899, 384]   },
  { id: "PARAMOUNT",  label: "Paramount+",  hex: "#0057e9", tmdbProviderIds: [531]          },
  { id: "MUBI",       label: "MUBI",        hex: "#3a3a3a", tmdbProviderIds: [11]           },
  // US
  { id: "HULU",       label: "Hulu",        hex: "#1ce783", tmdbProviderIds: [15]           },
  { id: "PEACOCK",    label: "Peacock",     hex: "#000000", tmdbProviderIds: [386]          },
  // UK
  { id: "NOW",        label: "Now",         hex: "#00b0b9", tmdbProviderIds: [39]           },
  { id: "BRITBOX",    label: "BritBox",     hex: "#013c7b", tmdbProviderIds: [151]          },
  { id: "ITVX",       label: "ITVX",        hex: "#510073", tmdbProviderIds: [159]          },
  { id: "ALL4",       label: "All4",        hex: "#0066cc", tmdbProviderIds: [103]          },
  // Australia
  { id: "STAN",       label: "Stan",        hex: "#0063e5", tmdbProviderIds: [66]           },
  { id: "BINGE",      label: "Binge",       hex: "#0f3460", tmdbProviderIds: [613]          },
  // Canada
  { id: "CRAVE",      label: "Crave",       hex: "#e60073", tmdbProviderIds: [230]          },
  // Germany
  { id: "JOYN",       label: "Joyn",        hex: "#e4001b", tmdbProviderIds: [1771]         },
  { id: "RTL_PLUS",   label: "RTL+",        hex: "#ff6000", tmdbProviderIds: [692]          },
  { id: "ARD",        label: "ARD Mediathek",hex: "#003c8f", tmdbProviderIds: [223]         },
  { id: "ZDF",        label: "ZDF Mediathek",hex: "#e20025", tmdbProviderIds: [430]         },
  // Spain
  { id: "MOVISTAR",   label: "Movistar+",   hex: "#019df4", tmdbProviderIds: [149]          },
  { id: "ATRES",      label: "Atresplayer", hex: "#f06400", tmdbProviderIds: [62]           },
  { id: "RTVE",       label: "RTVE Play",   hex: "#0f4c81", tmdbProviderIds: [725]          },
];

/**
 * Regions synced from TMDB and shown in the availability table.
 * Order = left-to-right column order in the table.
 */
export const STREAMING_REGIONS = [
  { id: "FR", label: "France",      flag: "🇫🇷" },
  { id: "BE", label: "Belgium",     flag: "🇧🇪" },
  { id: "US", label: "USA",         flag: "🇺🇸" },
  { id: "GB", label: "UK",          flag: "🇬🇧" },
  { id: "CA", label: "Canada",      flag: "🇨🇦" },
  { id: "AU", label: "Australia",   flag: "🇦🇺" },
  { id: "DE", label: "Germany",     flag: "🇩🇪" },
  { id: "ES", label: "Spain",       flag: "🇪🇸" },
];

/**
 * Look up a platform definition by its DB id string.
 * Returns null if the id is unknown.
 */
export function getPlatformById(id) {
  return STREAMING_PLATFORMS.find((p) => p.id === id) ?? null;
}

/**
 * Look up a platform definition by a TMDB Watch Provider ID.
 * Used by the sync script to map TMDB provider data to our platform IDs.
 * Returns null if the provider is not in our list (silently skipped).
 */
export function getPlatformByTmdbId(tmdbId) {
  return STREAMING_PLATFORMS.find((p) => p.tmdbProviderIds?.includes(tmdbId)) ?? null;
}
