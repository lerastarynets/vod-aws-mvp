import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  QUALITY_AUTO,
  HLS_AUTO_LEVEL,
  getQualityLabelFromHeight,
} from "./constants";

export interface QualityLevel {
  level: number;
  height: number;
  label: string;
}

export interface UseHlsPlayerReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  hlsRef: React.RefObject<Hls | null>;
  isHlsJsActive: boolean;
  qualityLevels: QualityLevel[];
  currentQuality: string;
  currentQualityIndex: number | null;
  handleQualityChange: (quality: string) => void;
  changeQuality: (levelIndex: number) => void;
}

export function useHlsPlayer(playbackUrl: string | null): UseHlsPlayerReturn {
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<string>(QUALITY_AUTO);
  const [currentQualityIndex, setCurrentQualityIndex] = useState<number | null>(null);
  const [isHlsJsActive, setIsHlsJsActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const lockedLevelIndexRef = useRef<number | null>(null); // Track manually selected level

  useEffect(() => {
    if (!playbackUrl || !videoRef.current) return;

    const video = videoRef.current;

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      setIsHlsJsActive(true);
      
      // Optimized HLS.js configuration based on article best practices
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        // Performance optimizations
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        backBufferLength: 90,
        // ABR (Adaptive Bitrate) settings
        abrEwmaFastLive: 3,
        abrEwmaSlowLive: 9,
        startLevel: -1, // Auto-select best quality initially
      });

      hls.loadSource(playbackUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Store available quality levels directly from HLS.js levels
        // Following article approach: store levels and create mapping for UI
        const levels = hls.levels;
        const qualityOptions: QualityLevel[] = [];

        levels.forEach((level, index) => {
          qualityOptions.push({
            level: index,
            height: level.height,
            label: getQualityLabelFromHeight(level.height),
          });
        });

        // Sort by height descending (highest quality first) for better UX
        qualityOptions.sort((a, b) => b.height - a.height);
        setQualityLevels(qualityOptions);

        video.play().catch((err) => {
          console.error("Error playing video:", err);
        });
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        // Following article approach: simply track the current quality level
        // When currentLevel is set, HLS.js respects it and won't auto-switch
        console.log(`Switched to quality level: ${data.level}`);
        
        // If we have a locked level and HLS.js tried to switch away, restore it
        if (lockedLevelIndexRef.current !== null && data.level !== lockedLevelIndexRef.current) {
          hls.currentLevel = lockedLevelIndexRef.current;
          return; // Don't update state, keep the locked quality
        }
        
        if (data.level === HLS_AUTO_LEVEL) {
          setCurrentQuality(QUALITY_AUTO);
          setCurrentQualityIndex(null);
          lockedLevelIndexRef.current = null;
        } else if (hls.levels && hls.levels[data.level]) {
          const level = hls.levels[data.level];
          setCurrentQuality(getQualityLabelFromHeight(level.height));
          setCurrentQualityIndex(data.level);
        }
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

      // Track seek events to maintain quality selection
      // When currentLevel is set, HLS.js respects it, but we ensure it persists after seeks
      const handleSeeked = () => {
        if (hlsRef.current && lockedLevelIndexRef.current !== null) {
          // Restore the manually selected quality after seek
          hlsRef.current.currentLevel = lockedLevelIndexRef.current;
        }
      };

      video.addEventListener("seeked", handleSeeked);

      hlsRef.current = hls;

      return () => {
        video.removeEventListener("seeked", handleSeeked);
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      setIsHlsJsActive(false);
      video.src = playbackUrl;
    } else {
      setIsHlsJsActive(false);
    }
  }, [playbackUrl]);

  // Following article approach: simple quality change by level index
  // Setting currentLevel locks the quality - HLS.js won't auto-switch unless set to -1
  const changeQuality = (levelIndex: number) => {
    if (hlsRef.current) {
      lockedLevelIndexRef.current = levelIndex;
      hlsRef.current.currentLevel = levelIndex;
    }
  };

  // Handle quality change by label (for UI compatibility)
  const handleQualityChange = (quality: string) => {
    if (!hlsRef.current) return;

    if (quality === QUALITY_AUTO) {
      // Allow auto-switching by setting to -1
      lockedLevelIndexRef.current = null;
      hlsRef.current.currentLevel = HLS_AUTO_LEVEL;
      setCurrentQuality(QUALITY_AUTO);
      setCurrentQualityIndex(null);
    } else {
      // Find the level matching the selected quality label
      const level = qualityLevels.find((l) => l.label === quality);
      if (level !== undefined) {
        lockedLevelIndexRef.current = level.level;
        changeQuality(level.level);
      }
    }
  };

  return {
    videoRef,
    hlsRef,
    isHlsJsActive,
    qualityLevels,
    currentQuality,
    currentQualityIndex,
    handleQualityChange,
    changeQuality,
  };
}
