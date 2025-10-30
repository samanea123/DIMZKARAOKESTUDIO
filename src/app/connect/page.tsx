"use client";

import { useEffect, useState } from "react";

export default function ConnectPage() {
  const [isCastReady, setIsCastReady] = useState(false);

  useEffect(() => {
    // 🔹 Muat Google Cast SDK
    const loadCastSDK = () => {
      if (!window.chrome?.cast || !window.cast) {
        const script = document.createElement("script");
        script.src =
          "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
        script.onload = () => {
          console.log("✅ Cast SDK Loaded, menunggu inisialisasi...");
        };
        document.body.appendChild(script);
      } else {
        console.log("✅ Cast SDK sudah ada");
      }
    };

    loadCastSDK();

    // 🔹 Tunggu event 'cast.framework.ready'
    const checkCastReady = () => {
      if (window.cast && window.cast.framework) {
        setIsCastReady(true);
        console.log("🚀 Cast SDK siap digunakan");
      } else {
        setTimeout(checkCastReady, 1000);
      }
    };

    checkCastReady();
  }, []);

  const handleCast = async () => {
    if (!isCastReady) {
      alert("⏳ Fitur Cast belum siap. Tunggu sebentar lalu coba lagi.");
      return;
    }

    try {
      const context = window.cast.framework.CastContext.getInstance();
      context.setOptions({
        receiverApplicationId:
          window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      });

      // 🔹 Mulai sesi Cast
      const session = context.getCurrentSession();
      if (!session) {
        // Jika tidak ada sesi, minta pengguna untuk memilih perangkat.
        // `requestSession` akan menampilkan dialog pemilihan perangkat Cast.
        await context.requestSession();
        // Setelah sesi diminta, kita bisa coba lagi di lain waktu atau biarkan pengguna menekan tombol lagi.
        // Untuk kesederhanaan, kita akan beri tahu pengguna dan keluar dari fungsi.
        alert(
          "📺 Silakan pilih TV dari dialog Cast. Setelah terhubung, tekan tombol ini lagi."
        );
        return;
      }

      // 🔹 Kirim video ke TV
      const mediaInfo = new window.chrome.cast.media.MediaInfo(
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "video/mp4"
      );
      const request = new window.chrome.cast.media.LoadRequest(mediaInfo);

      await session.loadMedia(request);
      alert("🎉 Video sedang diputar di TV!");
    } catch (err) {
      console.error("❌ Gagal melakukan cast:", err);
      // Tangani error jika pengguna menutup dialog pemilihan tanpa memilih
      // @ts-ignore
      if (err && err.code === "cancel") {
        return; // Jangan tampilkan alert jika pengguna sengaja membatalkan
      }
      alert("Gagal mengirim ke TV. Pastikan Chromecast aktif & terhubung.");
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Hubungkan ke TV</h1>
      <p className="text-gray-300 mb-6">
        Gunakan tombol di bawah untuk mengirim video ke TV melalui Chromecast
        atau Smart TV yang mendukung Google Cast.
      </p>

      <button
        disabled={!isCastReady}
        onClick={handleCast}
        className={`px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all ${
          isCastReady
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gray-500 cursor-not-allowed"
        }`}
      >
        🎥 {isCastReady ? "Hubungkan & Putar di TV" : "Menyiapkan Chromecast..."}
      </button>
    </div>
  );
}
