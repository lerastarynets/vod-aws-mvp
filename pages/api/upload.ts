import type { NextApiRequest, NextApiResponse } from "next";

interface UploadRequest {
  title: string;
  filename: string;
  contentType: string;
}

interface UploadResponse {
  videoId: string;
  uploadUrl: string;
  uploadKey: string;
}

export default async function POST(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse | { error: string }>
) {
  const { title, filename, contentType } = req.body as UploadRequest;

  // Validate required fields
  if (!title || !filename || !contentType) {
    return res.status(400).json({
      error: "Missing required fields: title, filename, and contentType are required",
    });
  }

  // Get API base URL from environment variable
  const apiBaseUrl = process.env.AWS_API_BASE_URL;
  if (!apiBaseUrl) {
    console.error("AWS_API_BASE_URL environment variable is not set");
    return res.status(500).json({
      error: "Server configuration error: API base URL not configured",
    });
  }

  try {
    // Call AWS API Gateway endpoint
    const response = await fetch(`${apiBaseUrl}/upload`, {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AWS API error:", response.status, errorText);
      return res.status(response.status).json({
        error: `Failed to get upload URL: ${errorText || response.statusText}`,
      });
    }

    const data = (await response.json()) as UploadResponse;
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error calling AWS API:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

