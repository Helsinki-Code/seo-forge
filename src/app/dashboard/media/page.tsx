/* eslint-disable @next/next/no-img-element */
import { ImageIcon } from "lucide-react";
import { DemoBanner, PageHeader, StatusBadge, timeAgo } from "@/components/ui";
import MediaForm from "@/components/MediaForm";
import { getMedia } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const { data: assets, demo } = await getMedia();

  return (
    <>
      <PageHeader
        title="Media Studio"
        subtitle="On-brand images generated to match each article's tone and style."
      />
      <DemoBanner demo={demo} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <MediaForm />

        <section className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold">Asset library</h2>
          {assets.length === 0 && (
            <p className="panel p-6 text-xs text-fg-faint">
              No assets yet — generate media for an article to fill this library.
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {assets.map((m) => (
              <figure key={m.id} className="panel overflow-hidden">
                {m.image_url ? (
                  <img
                    src={m.image_url}
                    alt={m.alt_text ?? m.label ?? "Generated asset"}
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex aspect-video w-full items-center justify-center bg-panel-2"
                    role="img"
                    aria-label={m.alt_text ?? "Pending asset"}
                  >
                    <ImageIcon size={28} className="text-fg-faint" aria-hidden />
                  </div>
                )}
                <figcaption className="flex flex-col gap-1 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium">{m.label ?? "Asset"}</span>
                    <StatusBadge status={m.status} />
                  </div>
                  {m.article_url && (
                    <span className="truncate text-[11px] text-primary">{m.article_url}</span>
                  )}
                  {m.alt_text && (
                    <span className="line-clamp-2 text-[11px] text-fg-mute">
                      alt: {m.alt_text}
                    </span>
                  )}
                  <span className="text-[11px] text-fg-faint">{timeAgo(m.created_at)}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
