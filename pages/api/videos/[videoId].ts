import type { NextApiRequest, NextApiResponse } from "next";

interface VideoResponse {
  videoId: string;
  title: string;
  status: string;
  playbackUrl: string;
  errorMessage?: string;
}

export default async function GET(
  req: NextApiRequest,
  res: NextApiResponse<VideoResponse | { error: string }>
) {
  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({
      error: "Missing videoId parameter",
    });
  }

  const apiBaseUrl = process.env.AWS_API_BASE_URL;
  if (!apiBaseUrl) {
    console.error("AWS_API_BASE_URL environment variable is not set");
    return res.status(500).json({
      error: "Server configuration error: API base URL not configured",
    });
  }

  try {
    const response = await fetch(`${apiBaseUrl}/videos/${videoId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AWS API error:", response.status, errorText);
      return res.status(response.status).json({
        error: `Failed to fetch video: ${errorText || response.statusText}`,
      });
    }

    const data = (await response.json()) as VideoResponse;
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error calling AWS API:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
