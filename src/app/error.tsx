"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="display text-5xl font-bold text-rose">Something broke.</p>
      <p className="max-w-md text-sm text-fg-mute">
        {error.message || "An unexpected error occurred."}
        {error.digest && (
          <span className="mt-1 block text-xs text-fg-faint">ref: {error.digest}</span>
        )}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-dim"
      >
        Try again
      </button>
    </main>
  );
}
