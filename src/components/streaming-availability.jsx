import { getPlatformById, STREAMING_REGIONS } from "@/lib/streaming-platforms";

/**
 * StreamingAvailability — public-facing "Ou regarder" section.
 *
 * Renders colored platform badges grouped by region (FR always first).
 * Each badge is a real <a> link opening the streaming platform in a new tab.
 * Returns null when there are no links so the section is completely invisible.
 *
 * @param {{ streamingLinks: Array<{id: string, platform: string, region: string, url: string}> }} props
 */
export function StreamingAvailability({ streamingLinks }) {
  if (!streamingLinks || streamingLinks.length === 0) return null;

  // Group links by region, preserving insertion order within each group
  const byRegion = {};
  for (const link of streamingLinks) {
    if (!byRegion[link.region]) byRegion[link.region] = [];
    byRegion[link.region].push(link);
  }

  // FR first, then the rest alphabetically
  const sortedRegions = Object.keys(byRegion).sort((a, b) => {
    if (a === "FR") return -1;
    if (b === "FR") return 1;
    return a.localeCompare(b);
  });

  return (
    <section aria-labelledby="streaming-heading">
      <h2 id="streaming-heading" className="text-xl font-semibold mb-4">
        Où regarder
      </h2>

      <div className="space-y-4">
        {sortedRegions.map((region) => {
          const regionDef = STREAMING_REGIONS.find((r) => r.id === region);
          const regionLabel = regionDef ? regionDef.label : region;

          return (
            <div key={region}>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">
                {regionLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                {byRegion[region].map((link) => {
                  const platform = getPlatformById(link.platform);
                  const label = platform?.label ?? link.platform;
                  const hex = platform?.hex ?? "#444444";

                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Regarder ${label}${link.url ? "" : " (lien non disponible)"}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      style={{ backgroundColor: hex }}
                    >
                      {label}
                      <span aria-hidden="true" className="text-xs opacity-70">↗</span>
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
