"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface VideoData {
  videoId: string;
  title: string;
  status: string;
  playbackUrl: string;
  errorMessage?: string;
}

export default function VideoViewClient({
  videoId,
}: {
  videoId: string;
}) {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const uploaded = searchParams.get("uploaded");

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/videos/${videoId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch video");
        }

        const data = (await response.json()) as VideoData;
        setVideoData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  return (
    <div className="global-container">
      <header>
        {uploaded ? (
          <>
            <span>Video uploaded successfully</span> 🎉
          </>
        ) : (
          <span>Video Player</span>
        )}
      </header>

      <main>
        {loading && !videoData && (
          <div className="texts-container">
            <p>Loading video...</p>
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

        {videoData && (
          <>
            <div className="texts-container">
              <h2>{videoData.title}</h2>
              <p>Status: {videoData.status}</p>
            </div>

            {videoData.status === "ERROR" ? (
              <div className="texts-container">
                <div style={{ color: "red", padding: "20px", border: "1px solid red", borderRadius: "4px", margin: "20px 0" }}>
                  <h3>Video Processing Error</h3>
                  <p>{videoData.errorMessage || "An error occurred while processing the video."}</p>
                </div>
              </div>
            ) : videoData.playbackUrl ? (
              <div style={{ width: "100%", maxWidth: "1200px", margin: "20px auto" }}>
                <video
                  ref={videoRef}
                  controls
                  style={{ width: "100%", height: "auto", maxHeight: "600px" }}
                  playsInline
                >
                  <source src={videoData.playbackUrl} type="application/x-mpegURL" />
                  Your browser does not support the video tag or HLS playback.
                </video>
              </div>
            ) : (
              <div className="texts-container">
                <p>Video is still processing. Please check back later.</p>
              </div>
            )}
          </>
        )}

        <button
          className="upload"
          onClick={() => router.push(uploaded ? "/uploader" : "/videos")}
        >
          {uploaded ? "Upload Another Video" : "Back to Videos List"}
        </button>
      </main>
    </div>
  );
}

