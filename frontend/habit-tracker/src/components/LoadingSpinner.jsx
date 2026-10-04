export default function LoadingSpinner({ full = false, size = 20 }) {
  const spinner = (
    <div
      role="status"
      aria-label="Loading"
      className="animate-spin rounded-full border-2 border-line border-t-fg"
      style={{ width: size, height: size }}
    />
  );
  if (!full) return spinner;
  return (
    <div className="flex min-h-[60vh] items-center justify-center">{spinner}</div>
  );
}
