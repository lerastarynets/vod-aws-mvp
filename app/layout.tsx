import type { Metadata } from "next";
import "../style/index.css";
import "../style/common.css";
import Navigation from "../components/Navigation";
import ScrollToTop from "../components/ScrollToTop";

export const metadata: Metadata = {
  title: "VOD AWS MVP",
  description: "Video on Demand AWS MVP application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ScrollToTop />
        <Navigation />
        {children}
      </body>
    </html>
  );
}

