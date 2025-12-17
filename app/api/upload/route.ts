import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as UploadRequest;
    const { title, filename, contentType } = body;

    // Validate required fields
    if (!title || !filename || !contentType) {
      return NextResponse.json(
        {
          error: "Missing required fields: title, filename, and contentType are required",
        },
        { status: 400 }
      );
    }

    // Get API base URL from environment variable
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
      return NextResponse.json(
        {
          error: `Failed to get upload URL: ${errorText || response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = (await response.json()) as UploadResponse;
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

