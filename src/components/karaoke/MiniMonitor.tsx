
"use client";
import { useEffect, useState } from "react";

export default function MiniMonitor() {
  const [castReady, setCastReady] = useState(false);

  useEffect(() => {
    // tunggu chrome.cast siap
    const initializeCastApi = () => {
      if (window.cast && window.cast.framework) {
        try {
            const context = window.cast.framework.CastContext.getInstance();
            context.setOptions({
              receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
              autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
            });
            setCastReady(true);
        } catch(e) {
            console.error("Failed to initialize cast framework. This can happen in a sandboxed environment.", e);
        }
      }
    };

    const interval = setInterval(() => {
      if (window.chrome && window.chrome.cast && window.chrome.cast.isAvailable) {
        initializeCastApi();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const startPresentation = () => {
    if ("presentation" in window) {
      try {
        const request = new window.PresentationRequest([
          "https://your-video-url.com" // ganti sesuai endpoint karaoke/video
        ]);
        request.start();
      } catch (e) {
        console.error(e);
        alert("Cast gagal, cek console!");
      }
    }
  };

  return (
    <div>
      <h2>MiniMonitor {castReady ? "(Ready)" : "(Loading...)"}</h2>
      <button
        onClick={startPresentation}
        disabled={!castReady}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Cast Video
      </button>
    </div>
  );
}
