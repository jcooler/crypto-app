import type { ReactNode } from "react";

export function ErrorState({
  title = "Couldn't load this data",
  detail,
  onRetry,
}: {
  title?: string;
  detail?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <p className="font-medium text-body">{title}</p>
      {detail ? <p className="max-w-sm text-sm text-muted">{detail}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-lg border hairline bg-surface-2 px-4 py-2 text-sm font-medium text-body transition-colors hover:border-accent/40 hover:text-accent"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <p className="font-medium text-body">{title}</p>
      {detail ? <p className="max-w-sm text-sm text-muted">{detail}</p> : null}
    </div>
  );
}

export function SectionHeading({
  label,
  title,
  id,
  children,
}: {
  label: string;
  title: string;
  id?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="microlabel mb-1">{label}</p>
        <h2 id={id} className="text-xl font-semibold tracking-tight text-body">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
