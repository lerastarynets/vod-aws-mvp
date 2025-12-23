"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface VideoItem {
  videoId: string;
  title: string;
  status: string;
  createdAt: string;
}

interface VideosResponse {
  items: VideoItem[];
  nextToken: string | null;
}

export default function Videos() {
  const [items, setItems] = useState<VideoItem[]>([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async (token: string | null = null) => {
    try {
      const url = token
        ? `/api/videos?nextToken=${encodeURIComponent(token)}`
        : "/api/videos";
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch videos");
      }

      const data = (await response.json()) as VideosResponse;
      
      if (token) {
        setItems((prev) => [...prev, ...data.items]);
      } else {
        setItems(data.items);
      }
      
      setNextToken(data.nextToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleLoadMore = () => {
    if (nextToken && !loadingMore) {
      setLoadingMore(true);
      fetchVideos(nextToken);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="global-container">
      <header>
        <span>Videos List</span>
      </header>

      <main>
        {loading && !items.length && (
          <div className="texts-container">
            <p>Loading videos...</p>
          </div>
        )}

        {error && (
          <div className="texts-container">
            <div style={{ color: "red", padding: "20px", border: "1px solid red", borderRadius: "4px", margin: "20px 0" }}>
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!loading && items.length === 0 && !error && (
          <div className="texts-container">
            <p>No videos found.</p>
            <Link href="/uploader" className="button">
              Upload your first video
            </Link>
          </div>
        )}

        {items.length > 0 && (
          <>
            <div style={{ overflowX: "auto", margin: "20px 0" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #ccc" }}>
                    <th style={{ padding: "12px", textAlign: "left" }}>Title</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Created At</th>
                    <th style={{ padding: "12px", textAlign: "left" }}/>
                  </tr>
                </thead>
                <tbody>
                  {items.map((video) => (
                    <tr key={video.videoId} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "12px" }}>{video.title}</td>
                      <td style={{ padding: "12px" }}>{video.status}</td>
                      <td style={{ padding: "12px" }}>{formatDate(video.createdAt)}</td>
                      <td style={{ padding: "12px" }}>
                        {video.status === "READY" && (
                        <Link 
                          href={`/videos/${video.videoId}`}
                          style={{ 
                            padding: "6px 12px", 
                            backgroundColor: "#0070f3", 
                            color: "white", 
                            textDecoration: "none", 
                            borderRadius: "4px",
                            display: "inline-block"
                          }}
                        >
                          View
                        </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {nextToken && (
              <div style={{ margin: "20px 0", textAlign: "center" }}>
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: loadingMore ? "#ccc" : "#0070f3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loadingMore ? "not-allowed" : "pointer",
                  }}
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

