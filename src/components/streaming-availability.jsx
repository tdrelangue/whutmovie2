import { getPlatformById, STREAMING_PLATFORMS, STREAMING_REGIONS } from "@/lib/streaming-platforms";

/**
 * StreamingAvailability — availability table.
 *
 * Rows = platforms this movie is on (at least one region).
 * Columns = regions this movie has data for.
 * Cell = linked ✓ if available, — if not.
 */
export function StreamingAvailability({ streamingLinks }) {
  if (!streamingLinks || streamingLinks.length === 0) return null;

  // Build a lookup: platformId → regionId → link
  const lookup = {};
  for (const link of streamingLinks) {
    if (!lookup[link.platform]) lookup[link.platform] = {};
    lookup[link.platform][link.region] = link;
  }

  // Only show platforms and regions that appear in at least one link
  const presentPlatformIds = STREAMING_PLATFORMS
    .map((p) => p.id)
    .filter((id) => lookup[id]);

  const presentRegionIds = STREAMING_REGIONS
    .map((r) => r.id)
    .filter((id) => streamingLinks.some((l) => l.region === id));

  if (presentPlatformIds.length === 0 || presentRegionIds.length === 0) return null;

  const regions = STREAMING_REGIONS.filter((r) => presentRegionIds.includes(r.id));
  const platforms = STREAMING_PLATFORMS.filter((p) => presentPlatformIds.includes(p.id));

  return (
    <section aria-labelledby="streaming-heading">
      <h2 id="streaming-heading" className="text-xl font-semibold mb-4">
        Where to watch
      </h2>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground w-36 min-w-[9rem]">
                Platform
              </th>
              {regions.map((r) => (
                <th
                  key={r.id}
                  className="px-3 py-3 text-center font-medium text-muted-foreground min-w-[4rem]"
                >
                  <span className="block text-base leading-none mb-0.5">{r.flag}</span>
                  <span className="text-xs">{r.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {platforms.map((platform, i) => (
              <tr
                key={platform.id}
                className={`border-b border-border last:border-0 ${
                  i % 2 === 0 ? "" : "bg-muted/20"
                }`}
              >
                <td className="px-4 py-2.5">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: platform.hex }}
                  >
                    {platform.label}
                  </span>
                </td>
                {regions.map((region) => {
                  const link = lookup[platform.id]?.[region.id];
                  return (
                    <td key={region.id} className="px-3 py-2.5 text-center">
                      {link ? (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Watch on ${platform.label} in ${region.label}`}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          ✓
                        </a>
                      ) : (
                        <span className="text-muted-foreground/40 select-none">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Availability via subscription (flatrate) only · Data from TMDB
      </p>
    </section>
  );
}
