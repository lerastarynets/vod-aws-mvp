import Head from "next/head";
import Image from "next/image";
import React from "react";

export default function Home() {
  return (
    <div className="global-container">
      <Head>
        <title>VOD AWS MVP</title>
        <meta
          name="description"
          content="Video on Demand AWS MVP application"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
            features examples such as <a href="/uploader">video uploader</a>,{" "}
            <a href="/videos">videos list</a> and player components.
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
          <a className="button" href="/uploader">
            Upload a video
          </a>
          <a className="button" href="/videos">
            See my videos
          </a>
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
