const SkeletonCard = () => {
  return (
    <div className="bg-card rounded-xl p-4 shadow-card animate-pulse">
      <div className="w-full aspect-[4/3] bg-muted rounded-lg mb-4" />
      <div className="h-5 bg-muted rounded w-3/4 mb-2" />
      <div className="h-4 bg-muted rounded w-1/2 mb-3" />
      <div className="flex gap-2 mb-3">
        <div className="h-6 bg-muted rounded-full w-16" />
        <div className="h-6 bg-muted rounded-full w-20" />
        <div className="h-6 bg-muted rounded-full w-14" />
      </div>
      <div className="h-10 bg-muted rounded-lg w-full" />
    </div>
  );
};

export default SkeletonCard;
