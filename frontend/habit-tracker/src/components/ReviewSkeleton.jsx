// Placeholder lines shown while an AI response is being written.
export default function ReviewSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2.5 py-1">
      <span className="skeleton w-[92%] animate-pulse" />
      <span className="skeleton w-full animate-pulse" />
      <span className="skeleton w-[64%] animate-pulse" />
    </div>
  );
}
