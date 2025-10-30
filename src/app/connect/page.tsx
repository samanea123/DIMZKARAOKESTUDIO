"use client";

import { useEffect } from "react";

export default function ConnectPage() {
  useEffect(() => {
    // ✅ Muat Google Cast SDK bila belum ada
    if (!window.chrome?.cast || !window.cast) {
      const s = document.createElement("script");
      s.src =
        "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
      s.onload = () => console.log("✅ Cast SDK Loaded");
      document.body.appendChild(s);
    }
  }, []);

  const handleCast = () => {
    if (!window.cast || !window.chrome?.cast) {
      alert("Chromecast belum tersedia di jaringan ini.");
      return;
    }

    const ctx = window.cast.framework.CastContext.getInstance();
    ctx.setOptions({
      receiverApplicationId:
        window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
      autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
    });

    const session = ctx.getCurrentSession();
    if (!session) {
      alert("Pilih perangkat TV dulu dari ikon Cast di browser.");
      return;
    }

    const mediaInfo = new window.chrome.cast.media.MediaInfo(
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "video/mp4"
    );

    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
    session
      .loadMedia(request)
      .then(() => console.log("🎬 Video dikirim ke TV"))
      .catch((err) => console.error("❌ Gagal kirim ke TV:", err));
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Hubungkan ke TV</h1>
      <p className="text-gray-300 mb-6">
        Tekan tombol di bawah untuk mengirim video ke TV melalui Chromecast
        atau Smart TV yang mendukung Cast.
      </p>

      <button
        onClick={handleCast}
        className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all"
      >
        🎥 Hubungkan & Putar di TV
      </button>
    </div>
  );
}