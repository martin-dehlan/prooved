export function RatingDisplay({
  score,
  count,
}: {
  score: number | null;
  count: number | null;
}) {
  if (score == null && count == null) return null;
  return (
    <div className="text-sm text-zinc-700">
      {score != null && (
        <span className="font-medium">⭐ {score.toFixed(1)}</span>
      )}
      {count != null && <span className="ml-1 text-zinc-500">· {count}</span>}
    </div>
  );
}
