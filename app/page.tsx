import Image from "next/image";
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
            Hey fellow dev! 👋 <br />
            In this basic sample app, you will find{" "}
            <a
              href="https://api.video"
              target="_blank"
              rel="noopener noreferrer"
            >
              api.video
            </a>{" "}
            features examples such as <Link href="/uploader">video uploader</Link>,{" "}
            <Link href="/videos">videos list</Link> and player components.
          </p>
          <p>
            This application provides video streaming capabilities using AWS infrastructure.
            <br />
            Built with Next.js, React, and AWS services for scalable video delivery.
          </p>
          <p>
            You can{" "}
            <a
              href="https://github.com/vercel/next.js"
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

      <footer>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}

