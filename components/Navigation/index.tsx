"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navigation() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 1000,
      padding: "1rem 2rem",
      background: "linear-gradient(45deg, rgb(250, 91, 48) 0%, rgb(235, 137, 82) 50%, rgb(247, 181, 0) 100%)",
      borderBottom: "2px solid rgba(255, 255, 255, 0.2)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    }}>
      <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
          <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#ffffff" }}>
            VOD
          </span>
          <span style={{ fontSize: "0.9rem", color: "#ffffff", opacity: 0.9 }}>
            AWS MVP
          </span>
        </div>
      </Link>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Link 
          href="/uploader"
          style={{
            padding: "0.5rem 1rem",
            textDecoration: "none",
            color: "#ffffff",
            borderRadius: "5px",
            backgroundColor: hoveredLink === "upload" ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)",
            transition: "background-color 0.2s",
            fontWeight: 500,
          }}
          onMouseEnter={() => setHoveredLink("upload")}
          onMouseLeave={() => setHoveredLink(null)}
        >
          Upload
        </Link>
        <Link 
          href="/videos"
          style={{
            padding: "0.5rem 1rem",
            textDecoration: "none",
            color: "#ffffff",
            borderRadius: "5px",
            backgroundColor: hoveredLink === "videos" ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)",
            transition: "background-color 0.2s",
            fontWeight: 500,
          }}
          onMouseEnter={() => setHoveredLink("videos")}
          onMouseLeave={() => setHoveredLink(null)}
        >
          Videos
        </Link>
      </div>
    </nav>
  );
}

