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
  // French platforms first (primary audience)
  { id: "CANAL_PLUS", label: "Canal+",      hex: "#000000", tmdbProviderIds: [190, 63]     },
  { id: "OCS",        label: "OCS",         hex: "#1a3a6e", tmdbProviderIds: [56, 3]       },
  { id: "ARTE",       label: "Arte",        hex: "#c4421a", tmdbProviderIds: [234]          },
  { id: "FRANCE_TV",  label: "France.tv",   hex: "#0057a8", tmdbProviderIds: [735, 740]    },
  // International / multi-region
  { id: "NETFLIX",    label: "Netflix",     hex: "#e50914", tmdbProviderIds: [8]            },
  { id: "PRIME",      label: "Prime Video", hex: "#0091c0", tmdbProviderIds: [119, 9]      },
  { id: "DISNEY",     label: "Disney+",     hex: "#1b3a8c", tmdbProviderIds: [337]          },
  { id: "APPLE_TV",   label: "Apple TV+",   hex: "#333333", tmdbProviderIds: [350]          },
  { id: "MAX",        label: "Max",         hex: "#002be7", tmdbProviderIds: [1899, 384]   },
  { id: "PARAMOUNT",  label: "Paramount+",  hex: "#0057e9", tmdbProviderIds: [531]          },
  { id: "MUBI",       label: "MUBI",        hex: "#3a3a3a", tmdbProviderIds: [11]           },
  { id: "HULU",       label: "Hulu",        hex: "#1ce783", tmdbProviderIds: [15]           },
];

/**
 * Regions available for streaming links.
 * FR is listed first — primary audience.
 */
export const STREAMING_REGIONS = [
  { id: "FR",   label: "France (FR)"   },
  { id: "INTL", label: "International" },
  { id: "BE",   label: "Belgique (BE)" },
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
