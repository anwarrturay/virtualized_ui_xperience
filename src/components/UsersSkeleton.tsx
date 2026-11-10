
const UsersSkeleton = () => {
  return (
    <div className="animate-pulse border-b border-gray-200 p-5">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="h-14 w-14 shrink-0 rounded-full bg-gray-200" />

        <div className="flex-1 space-y-4">
          {/* Name */}
          <div className="h-5 w-2/5 rounded-md bg-gray-200" />

          {/* Username and email */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-gray-200" />
              <div className="h-3 w-24 rounded bg-gray-200" />
            </div>

            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-gray-200" />
              <div className="h-3 w-36 rounded bg-gray-200" />
            </div>
          </div>

          {/* Company */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersSkeleton;
