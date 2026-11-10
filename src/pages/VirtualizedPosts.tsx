import { useState, useEffect, useRef, useCallback } from "react";
import type { Post } from "../types/post.type";
import axios from "axios";
import { useVirtualizer } from "@tanstack/react-virtual";
import PostSkeleton from "../components/PostSkeleton";

const PAGE_SIZE = 10;

export function VirtualizedPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const parentRef = useRef<HTMLDivElement>(null);

  // create a ref for nextpage, duplicate api requests.
  const nextPageRef = useRef(1);
  const fetchingRef = useRef(false);

  const fetchPosts = useCallback(
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

      setError(null);

      try {
        const response = await axios.get<Post[]>(
          "https://jsonplaceholder.typicode.com/posts",
          {
            params: {
              _page: page,
              _limit: PAGE_SIZE,
            },
          },
        );

        const newPosts = response.data;

        // Append new posts to the old posts.
        setPosts((prevPosts) => [...prevPosts, ...newPosts]);

        // prepare the nextpage.
        nextPageRef.current = page + 1;

        // check whether more posts exists.
        if (newPosts.length < PAGE_SIZE) {
          setHasMore(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
        setError("Unable to fetch Posts.");
      } finally {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, 1500 - elapsedTime);
        await new Promise((resolve) => setTimeout(resolve, remainingTime));
        setLoading(false);

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
    fetchPosts(1);
  }, [fetchPosts]);

  const virtualizer = useVirtualizer({
    count: posts.length + (loadingMore ? PAGE_SIZE : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 130,
    overscan: 5,
    getItemKey: (index) =>
      index < posts.length ? posts[index].id : `skeleton-${index}`,
  });

  const vis = virtualizer.getVirtualItems();

  // Detect when the user approaches the last end.
  useEffect(() => {
    const lastItem = vis[vis.length - 1];
    if (!lastItem) return;

    const nearEnd = lastItem.index >= posts.length - 3;

    if (nearEnd && hasMore && !loading && !loadingMore) {
      fetchPosts(nextPageRef.current);
    }
  }, [vis, posts.length, hasMore, loading, loadingMore, fetchPosts]);

  if (error) return <p>{error}</p>;

  if (posts.length === 0) {
    return <p>No posts found.</p>;
  }

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">Total Posts: {posts.length}</h2>
      {/* create scrollable container. */}
      {loading ? (
        <div className="h-[500px] overflow-auto">
          {Array.from({ length: 7 }).map((_, index) => (
            <PostSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div ref={parentRef} style={{ height: "500px", overflow: "auto" }}>
          {/* create a virtual space. */}
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {vis.map((vi) => {
              if (vi.index >= posts.length) {
                return (
                  <div
                    key={vi.key}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${vi.size}px`,
                      transform: `translateY(${vi.start}px)`,
                    }}
                  >
                    <PostSkeleton />
                  </div>
                );
              }
              // console.log(vi);
              const post = posts[vi.index];
              return (
                <div
                  key={vi.key}
                  data-index={vi.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${vi.start}px)`,
                  }}
                  className="border border-b-[#ccc] p-4"
                >
                  <h1 className="text-xl font-bold">
                    {post?.id} - {post?.title}
                  </h1>

                  <p className="mt-2">{post?.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
