"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface UploadResponse {
  videoId: string;
  uploadUrl: string;
  uploadKey: string;
}

export default function Uploader() {
  const [uploadProgress, setUploadProgress] = useState<number | undefined>(
    undefined,
  );
  const [video, setVideo] = useState<{ videoId: string } | undefined>(
    undefined,
  );
  const [ready, setReady] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const clearState = (): void => {
    setReady(false);
    setVideo(undefined);
    setUploadProgress(undefined);
    setError(undefined);
  };

  const handleSelectFile = async (
    e: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    e.preventDefault();
    clearState();
    
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const filename = file.name;
    const contentType = file.type || "video/mp4";
    
    // Extract title from filename (remove extension)
    const title = filename.replace(/\.[^/.]+$/, "");

    setUploading(true);
    setError(undefined);

    try {
      // Get upload URL from API
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          filename,
          contentType,
        }),
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to get upload URL");
      }

      const uploadData = (await uploadResponse.json()) as UploadResponse;
      setVideo({ videoId: uploadData.videoId });

      // Upload file directly to S3 using presigned URL
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200 || xhr.status === 204) {
          setUploadProgress(100);
          setReady(true);
        } else {
          setError(`Upload failed with status ${xhr.status}`);
        }
        setUploading(false);
      });

      xhr.addEventListener("error", () => {
        setError("Upload failed due to network error");
        setUploading(false);
      });

      xhr.addEventListener("abort", () => {
        setError("Upload was cancelled");
        setUploading(false);
      });

      xhr.open("PUT", uploadData.uploadUrl);
      xhr.setRequestHeader("Content-Type", contentType);
      xhr.send(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setUploading(false);
    }
  };

  const handleNavigate = (): void => {
    if (!video) return;
    router.push(`/videos/${video.videoId}`);
  };

  return (
    <div className="global-container">
      <header>
        <span>Video Uploader</span> 🚀
      </header>

      <main>
        <div className="texts-container">
          <p>
            Hey fellow dev! 👋 <br />
            Welcome to the video uploader powered by{" "}
            <a
              href="https://nextjs.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next.js
            </a>{" "}
            and AWS services.
          </p>
          <p>
            Upload your videos directly to AWS S3 using presigned URLs.
            <br />
            Select a video file and watch the upload progress in real-time.
          </p>
          <p>
            Please select a video file to upload 🎩
          </p>
        </div>

        {error && (
          <div style={{ color: "red", margin: "20px 0", padding: "10px", border: "1px solid red", borderRadius: "4px" }}>
            Error: {error}
          </div>
        )}

        {!uploadProgress && !uploading ? (
          <>
            <button
              className="upload"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              Select a video file
            </button>
            <input
              ref={inputRef}
              hidden
              type="file"
              accept="video/*"
              onChange={handleSelectFile}
            />
          </>
        ) : (
          <>
            {uploadProgress !== undefined && (
              <div style={{ margin: "20px 0" }}>
                <div style={{ marginBottom: "10px" }}>
                  Upload Progress: {uploadProgress}%
                </div>
                <div style={{ width: "100%", backgroundColor: "#e0e0e0", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${uploadProgress}%`,
                      height: "20px",
                      backgroundColor: "#4caf50",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {ready && video && (
          <button className="upload" onClick={handleNavigate}>
            View Video 🍿
          </button>
        )}
      </main>
    </div>
  );
}

