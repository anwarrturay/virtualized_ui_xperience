const PostSkeleton = () => {
  return (
    <div className="border-b border-gray-200 p-4 space-y-3 animate-pulse">
      {/* Title skeleton */}
      <div className="h-5 bg-gray-200 rounded-md w-3/4" />

      {/* Body skeleton */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        {/* <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" /> */}
      </div>
    </div>
  );
};

export default PostSkeleton;

