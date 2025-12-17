import type { NextApiRequest, NextApiResponse } from "next";

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

export default async function GET(
  req: NextApiRequest,
  res: NextApiResponse<VideosResponse | { error: string }>
) {
  const apiBaseUrl = process.env.AWS_API_BASE_URL;
  if (!apiBaseUrl) {
    console.error("AWS_API_BASE_URL environment variable is not set");
    return res.status(500).json({
      error: "Server configuration error: API base URL not configured",
    });
  }

  // Get nextToken from query parameter if present
  const { nextToken } = req.query;
  const url = nextToken
    ? `${apiBaseUrl}/videos?nextToken=${encodeURIComponent(nextToken as string)}`
    : `${apiBaseUrl}/videos`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AWS API error:", response.status, errorText);
      return res.status(response.status).json({
        error: `Failed to fetch videos: ${errorText || response.statusText}`,
      });
    }

    const data = (await response.json()) as VideosResponse;
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error calling AWS API:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

