import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VOD AWS MVP",
  description: "Video on Demand AWS MVP application",
};

export default function Home() {
  return (
    <div className="global-container">
      <header>
        <span>VOD AWS MVP</span>
      </header>

      <main>
        <div className="texts-container">
          <p>
            Welcome to VOD AWS MVP! 👋 <br />
            Upload, manage, and stream your videos using AWS infrastructure.
          </p>
          <p>
            This application provides video streaming capabilities powered by AWS services:
            <br />
            • Upload videos directly to S3 using presigned URLs
            <br />
            • Process videos with AWS Lambda and MediaConvert
            <br />
            • Stream videos using HLS (HTTP Live Streaming)
            <br />
            Built with Next.js, React, and AWS services for scalable video delivery.
          </p>
          <p>
            You can{" "}
            <a
              href="https://github.com/lerastarynets/vod-aws-mvp"
              target="_blank"
              rel="noopener noreferrer"
            >
              check the source code on GitHub
            </a>
            .
          </p>
        </div>

        <div className="status-container">
          <Link href="/uploader" className="button">
            Upload a video
          </Link>
          <Link href="/videos" className="button">
            See my videos
          </Link>
        </div>
      </main>
    </div>
  );
}

