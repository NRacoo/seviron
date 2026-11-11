/**
 * Resolving the "active station" that every page is scoped to.
 *
 * Pages take a `?station=<id>` query parameter. When it is absent or stale
 * (the monitoring network's station list does change), we fall back to the
 * worst-performing station rather than erroring — the dashboard's job is to
 * surface the biggest exposure, so that is the most useful default.
 */

import { getJakartaAir } from "@/lib/jakarta";
import { getStationDetail } from "@/lib/station";
import type { JakartaSnapshot, StationDetail } from "@/types/jakarta";

export interface Selection {
  snapshot: JakartaSnapshot;
  detail: StationDetail;
  /** True when the requested station could not be found and we fell back. */
  fellBack: boolean;
}

export async function resolveStation(id?: string): Promise<Selection> {
  const snapshot = await getJakartaAir();

  const requested = id ? snapshot.stations.find((s) => s.id === id) : undefined;
  const target = requested ?? snapshot.summary.worst ?? snapshot.stations[0];

  if (!target) {
    throw new Error("The Jakarta monitoring network returned no stations.");
  }

  return {
    snapshot,
    detail: await getStationDetail(target.id),
    fellBack: Boolean(id) && !requested,
  };
}
