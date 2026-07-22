import { memo, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useNews } from "../../api/queries.ts";
import type { NewsItem } from "../../api/types.ts";
import { relativeTime } from "../../lib/format.ts";
import { EmptyState, ErrorState, SectionHeading } from "../ui/states.tsx";

const Thumb = memo(function Thumb({ item }: { item: NewsItem }) {
  const [failed, setFailed] = useState(false);
  if (!item.imgUrl || failed) {
    return (
      <div
        aria-hidden="true"
        className="flex aspect-video w-full items-center justify-center bg-surface-2 font-mono text-xs uppercase tracking-widest text-muted"
      >
        {item.source}
      </div>
    );
  }
  return (
    <img
      src={item.imgUrl}
      alt=""
      width={640}
      height={360}
      loading="lazy"
      onError={() => setFailed(true)}
      className="aspect-video w-full object-cover"
    />
  );
});

const NewsCard = memo(function NewsCard({ item }: { item: NewsItem }) {
  return (
    <li className="surface-panel group overflow-hidden transition-colors hover:border-accent/40">
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-full flex-col"
      >
        <Thumb item={item} />
        <span className="flex flex-1 flex-col gap-2 p-4">
          <span className="flex items-center justify-between gap-2">
            <span className="microlabel truncate">{item.source}</span>
            <time
              dateTime={new Date(item.feedDate).toISOString()}
              className="whitespace-nowrap font-mono text-[11px] text-muted"
            >
              {relativeTime(item.feedDate)}
            </time>
          </span>
          <span className="line-clamp-3 text-sm font-medium leading-snug text-body transition-colors group-hover:text-accent">
            {item.title}
          </span>
        </span>
      </a>
    </li>
  );
});

function NewsSkeleton() {
  return (
    <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className="surface-panel overflow-hidden">
          <Skeleton className="!block aspect-video" height="100%" containerClassName="block aspect-video" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton width={90} height={11} />
            <Skeleton count={2} height={14} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function NewsSection() {
  const { data, isPending, isError, refetch } = useNews();

  return (
    <section aria-labelledby="news-heading" className="pt-12">
      <SectionHeading id="news-heading" label="News" title="Latest in crypto" />
      {isPending ? (
        <NewsSkeleton />
      ) : isError ? (
        <div className="surface-panel">
          <ErrorState
            title="Couldn't load news"
            detail="The news feed didn't respond. It will retry automatically."
            onRetry={() => void refetch()}
          />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="surface-panel">
          <EmptyState title="No news right now" detail="New stories appear here as they're published." />
        </div>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}
