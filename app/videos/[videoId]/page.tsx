import { Suspense } from "react";
import VideoViewClient from "./VideoViewClient";

export default async function VideoView({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  return (
    <Suspense fallback={<div className="global-container"><p>Loading...</p></div>}>
      <VideoViewClient videoId={videoId} />
    </Suspense>
  );
}

