import { NextRequest, NextResponse } from "next/server";

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

export async function GET(request: NextRequest) {
  const apiBaseUrl = process.env.AWS_API_BASE_URL;
  if (!apiBaseUrl) {
    console.error("AWS_API_BASE_URL environment variable is not set");
    return NextResponse.json(
      {
        error: "Server configuration error: API base URL not configured",
      },
      { status: 500 }
    );
  }

  // Get nextToken from query parameter if present
  const { searchParams } = new URL(request.url);
  const nextToken = searchParams.get("nextToken");
  const url = nextToken
    ? `${apiBaseUrl}/videos?nextToken=${encodeURIComponent(nextToken)}`
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
      return NextResponse.json(
        {
          error: `Failed to fetch videos: ${errorText || response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = (await response.json()) as VideosResponse;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error calling AWS API:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

