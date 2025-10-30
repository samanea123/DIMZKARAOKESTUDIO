"use client";

import { useEffect, useState } from "react";

// @ts-nocheck

export default function ConnectPage() {
  const [castReady, setCastReady] = useState(false);

  useEffect(() => {
    // Fungsi untuk memuat Google Cast SDK
    const loadCastSDK = () => {
      if (!window.chrome?.cast || !window.cast) {
        const script = document.createElement("script");
        script.src =
          "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
        script.async = true;
        document.body.appendChild(script);
        
        script.onload = () => {
          // SDK sudah dimuat, sekarang inisialisasi framework
          initializeCastFramework();
        };
      } else {
        initializeCastFramework();
      }
    };
    
    // Fungsi untuk inisialisasi Cast Framework setelah SDK siap
    const initializeCastFramework = () => {
       window['__onGCastApiAvailable'] = function(isAvailable) {
        if (isAvailable) {
          try {
            const context = window.cast.framework.CastContext.getInstance();
            context.setOptions({
              receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
              autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
            });
            console.log("✅ Cast Framework Initialized");
            setCastReady(true);
          } catch (err) {
            console.error("❌ Gagal inisialisasi Cast Framework:", err);
          }
        }
      };
    };

    loadCastSDK();
  }, []);

  const handleCast = () => {
    if (!castReady) {
      alert(
        "⚠️ Fitur Cast belum siap. Mohon tunggu atau pastikan TV Anda mendukung Google Cast."
      );
      return;
    }
    
    const context = window.cast.framework.CastContext.getInstance();

    context.requestSession().then(session => {
        const mediaInfo = new window.chrome.cast.media.MediaInfo(
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          "video/mp4"
        );
        const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
        
        session.loadMedia(request)
          .then(() => console.log("🎬 Video sedang dikirim ke TV..."))
          .catch((err) => console.error("❌ Gagal mengirim media:", err));

    }).catch(err => {
      console.error("❌ Gagal memulai sesi Cast:", err);
      if (err.code === 'cancel') return; // User membatalkan dialog
      alert("Gagal memulai sesi Cast. Pastikan Anda telah memilih perangkat TV.");
    });
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4 font-headline">Hubungkan ke TV</h1>
      <p className="text-gray-300 mb-6">
        Gunakan tombol di bawah untuk mengirim video ke TV melalui Chromecast
        atau Smart TV yang mendukung fitur Google Cast.
      </p>

      <button
        onClick={handleCast}
        disabled={!castReady}
        className="bg-primary hover:bg-primary/90 disabled:bg-gray-500 px-6 py-3 rounded-xl font-semibold text-primary-foreground shadow-lg transition-all"
      >
        🎥 Hubungkan & Putar di TV
      </button>
    </div>
  );
}
