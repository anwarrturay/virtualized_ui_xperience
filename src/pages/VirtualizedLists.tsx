import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import type { User } from "../types/user.type";
import { useVirtualizer } from "@tanstack/react-virtual";
import UsersSkeleton from "../components/UsersSkeleton";

const PAGE_SIZE = 10;

const VirtualizedLists = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const parentRef = useRef<HTMLDivElement>(null);

  const nextPageRef = useRef(1);
  const fetchingRef = useRef(false);

  const getUsersFromDummyData = useCallback(
    async (page: number) => {
      if (fetchingRef.current || !hasMore) return;
      fetchingRef.current = true;

      const isFirstPage = page === 1;
      const startTime = Date.now();
      if (isFirstPage) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await axios.get<User[]>(
          "https://jsonplaceholder.typicode.com/users",
          {
            params: {
              _page: page,
              _limit: PAGE_SIZE,
            },
          },
        );

        // new users fetched.
        const newUsers = response.data;

        // Append new users to existing users.
        setUsers((prevUsers) => [...prevUsers, ...newUsers]);

        // update the next page load.
        nextPageRef.current = page + 1;

        // check if there are more pages to load.
        if (newUsers.length < PAGE_SIZE) {
          setHasMore(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Unable to fetch users.");
        }
      } finally {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 1500 - elapsedTime);
        await new Promise((resolve) => setTimeout(resolve, remainingTime));

        if (isFirstPage) {
          setLoading(false);
        } else {
          setLoadingMore(false);
        }

        fetchingRef.current = false;
      }
    },
    [hasMore],
  );

  useEffect(() => {
    getUsersFromDummyData(1);
  }, [getUsersFromDummyData]);

  const virtualizer = useVirtualizer({
    count: users.length + (loadingMore ? PAGE_SIZE : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
    getItemKey: (index) =>
      index < users.length ? users[index].id : `skeleton-${index}`,
  });

  const vis = virtualizer.getVirtualItems();

  useEffect(() => {
    // find the lastItem.
    const lastItem = vis[vis.length - 1];
    if (!lastItem) return;

    const nearEnd = lastItem.index >= users.length - 1;

    if (nearEnd && hasMore && !loading && !loadingMore) {
      getUsersFromDummyData(nextPageRef.current);
    }
  }, [vis, users.length, hasMore, loading, loadingMore, getUsersFromDummyData]);

  // in-case their is an error.
  if (error) {
    return <div>{error}</div>;
  }
  // in-case no user found.
  if (users.length === 0) {
    return (
      <div>
        <p>No users found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Scrollable container */}
      <div ref={parentRef} style={{ height: "500px", overflow: "auto" }}>
        {/* Creating the virtual space. */}
        {loading ? (
          <div className="h-[500px] overflow-auto">
            {Array.from({ length: 7 }).map((_, index) => (
              <UsersSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {vis.map((virtualItem) => {
              if (virtualItem.index >= users.length) {
                return (
                  <div
                    key={virtualItem.key}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <div className="h-[500px] overflow-auto">
                      {Array.from({ length: 7 }).map((_, index) => (
                        <UsersSkeleton key={index} />
                      ))}
                    </div>
                  </div>
                );
              }

              const user = users[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                    borderBottom: "1px solid #ddd",
                    padding: "10px",
                    boxSizing: "border-box",
                  }}
                >
                  <h1 className="text-xl font-bold">{user.name}</h1>
                  <div className="mt-4 flex flex-col gap-2">
                    <p className="text-base">{user.username}</p>
                    <p className="text-sm">{user.email}</p>
                    <p>{user.company.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualizedLists;
