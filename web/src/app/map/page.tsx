import { JakartaBoard } from "@/components/organisms/JakartaBoard/JakartaBoard";
import { ServiceNotice } from "@/components/organisms/ServiceNotice/ServiceNotice";
import { FullBleed } from "@/components/templates/AppShell/AppShell";
import { getJakartaAir } from "@/lib/jakarta";

export const metadata = {
  title: "Jakarta air quality — Seviron",
  description:
    "Live ISPU readings across DKI Jakarta, sourced from the city's official monitoring network.",
};

/** Readings refresh on the server; see the TTL in `lib/jakarta`. */
export const revalidate = 600;

export default async function MapPage() {
  let data;
  try {
    data = await getJakartaAir();
  } catch (err) {
    return <ServiceNotice error={err} />;
  }

  return (
    <FullBleed>
      <JakartaBoard data={data} />
    </FullBleed>
  );
}
