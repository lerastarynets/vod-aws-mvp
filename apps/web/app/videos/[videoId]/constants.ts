// Quality constants
export const QUALITY_AUTO = "AUTO";
export const QUALITY_1080P = "1080p";
export const QUALITY_720P = "720p";
export const QUALITY_480P = "480p";

// Height thresholds for quality detection
export const HEIGHT_1080P = 1080;
export const HEIGHT_720P = 720;
export const HEIGHT_480P = 480;

// HLS level constants
export const HLS_AUTO_LEVEL = -1;

// Helper function to get quality label from height
export const getQualityLabelFromHeight = (height: number): string => {
  if (height >= HEIGHT_1080P) return QUALITY_1080P;
  if (height >= HEIGHT_720P) return QUALITY_720P;
  if (height >= HEIGHT_480P) return QUALITY_480P;
  return `${height}p`;
};
