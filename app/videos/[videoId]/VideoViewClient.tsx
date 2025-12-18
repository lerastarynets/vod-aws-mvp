"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useHlsPlayer } from "./useHlsPlayer";
import QualitySelector from "../../../components/QualitySelector";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const uploaded = searchParams.get("uploaded");

  // Use HLS player hook
  const {
    videoRef,
    isHlsJsActive,
    qualityLevels,
    currentQuality,
    handleQualityChange,
  } = useHlsPlayer(videoData?.playbackUrl || null);

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
              <div style={{ 
                width: "100%", 
                maxWidth: "1200px", 
                margin: "20px auto",
                minHeight: "400px",
                height: "600px",
                backgroundColor: "#000",
                borderRadius: "8px",
                overflow: "hidden",
                position: "relative"
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
                <QualitySelector
                  qualityLevels={qualityLevels}
                  currentQuality={currentQuality}
                  onQualityChange={handleQualityChange}
                  isVisible={isHlsJsActive && qualityLevels.length > 0}
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

