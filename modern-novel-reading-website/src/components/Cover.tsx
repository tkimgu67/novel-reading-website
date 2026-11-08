/* eslint-disable @next/next/no-img-element */
export default function Cover({
  src,
  title,
  className = "",
  eager = false,
}: {
  src: string | null;
  title: string;
  className?: string;
  eager?: boolean;
}) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-sea/40 via-coal to-ink p-4 text-center ${className}`}
        aria-label={title}
      >
        <span className="font-display text-lg font-semibold leading-tight text-white/90">{title}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={`Cover of ${title}`}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`object-cover ${className}`}
    />
  );
}
