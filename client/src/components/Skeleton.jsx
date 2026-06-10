export const SkeletonCard = () => (
  <div className="card animate-pulse space-y-3">
    <div className="h-4 rounded-lg w-3/4 skeleton"></div>
    <div className="h-3 rounded-lg w-1/2 skeleton"></div>
    <div className="h-3 rounded-lg w-2/3 skeleton"></div>
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);
