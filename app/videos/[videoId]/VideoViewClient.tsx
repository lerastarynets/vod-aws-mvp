"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Hls from "hls.js";

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
  const hlsRef = useRef<Hls | null>(null);
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

  // Initialize HLS when videoData.playbackUrl is available
  useEffect(() => {
    if (!videoData?.playbackUrl || !videoRef.current) return;

    const video = videoRef.current;

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      // Use hls.js for browsers that don't support native HLS
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hls.loadSource(videoData.playbackUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((err) => {
          console.error("Error playing video:", err);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Fatal network error, trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Fatal media error, trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              console.error("Fatal error, cannot recover");
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = videoData.playbackUrl;
    } else {
      setError("Your browser does not support HLS playback");
    }

    // Cleanup function
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoData?.playbackUrl]);

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
              <div style={{ 
                width: "100%", 
                maxWidth: "1200px", 
                margin: "20px auto",
                minHeight: "400px",
                height: "600px",
                backgroundColor: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                overflow: "hidden"
              }}>
                <video
                  ref={videoRef}
                  controls
                  style={{ 
                    width: "100%", 
                    height: "100%",
                    objectFit: "contain"
                  }}
                  playsInline
                />
              </div>
            ) : (
              <div className="texts-container">
                <p>Video is still processing. Please check back later.</p>
              </div>
            )}
          </>
        )}

        <div style={{marginBottom: "40px" }}>
          <button
            className="upload"
            onClick={() => router.push(uploaded ? "/uploader" : "/videos")}
          >
            {uploaded ? "Upload Another Video" : "Back to Videos List"}
          </button>
        </div>
      </main>
    </div>
  );
}

