import { NextRequest, NextResponse } from "next/server";

interface VideoResponse {
  videoId: string;
  title: string;
  status: string;
  playbackUrl: string;
  errorMessage?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;

  if (!videoId) {
    return NextResponse.json(
      {
        error: "Missing videoId parameter",
      },
      { status: 400 }
    );
  }

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

  try {
    const response = await fetch(`${apiBaseUrl}/videos/${videoId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorText = errorData.message || response.statusText;
      console.error("AWS API error:", response.status, errorData);
      return NextResponse.json(
        {
          error: `Failed to fetch video: ${errorText}`,
        },
        { status: response.status }
      );
    }

    const data = (await response.json()) as VideoResponse;
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

