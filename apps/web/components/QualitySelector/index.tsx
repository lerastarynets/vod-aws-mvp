"use client";

import { useEffect, useRef, useState } from "react";
import { QUALITY_AUTO } from "../../app/videos/[videoId]/constants";
import type { QualityLevel } from "../../app/videos/[videoId]/useHlsPlayer";

interface QualitySelectorProps {
  qualityLevels: QualityLevel[];
  currentQuality: string;
  onQualityChange: (quality: string) => void;
  isVisible: boolean;
}

export default function QualitySelector({
  qualityLevels,
  currentQuality,
  onQualityChange,
  isVisible,
}: QualitySelectorProps) {
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
  const qualityMenuRef = useRef<HTMLDivElement>(null);

  const handleQualityChange = (quality: string) => {
    onQualityChange(quality);
    setShowQualityMenu(false);
  };

  // Close quality menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        qualityMenuRef.current &&
        !qualityMenuRef.current.contains(event.target as Node)
      ) {
        setShowQualityMenu(false);
      }
    };

    if (showQualityMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showQualityMenu]);

  if (!isVisible || qualityLevels.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: "60px",
        right: "20px",
        zIndex: 10,
      }}
      ref={qualityMenuRef}
    >
      <button
        onClick={() => setShowQualityMenu(!showQualityMenu)}
        style={{
          padding: "8px 16px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "#fff",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: 500,
          minWidth: "80px",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.9)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)")
        }
      >
        Quality: {currentQuality} ▼
      </button>
      {showQualityMenu && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            right: 0,
            marginBottom: "8px",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "4px",
            minWidth: "120px",
            overflow: "hidden",
          }}
        >
          {[QUALITY_AUTO, ...qualityLevels.map((l) => l.label)].map(
            (quality) => (
              <button
                key={quality}
                onClick={() => handleQualityChange(quality)}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  backgroundColor:
                    currentQuality === quality
                      ? "rgba(255, 255, 255, 0.2)"
                      : "transparent",
                  color: "#fff",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "14px",
                  display: "block",
                }}
                onMouseEnter={(e) => {
                  if (currentQuality !== quality) {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentQuality !== quality) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                {quality}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
