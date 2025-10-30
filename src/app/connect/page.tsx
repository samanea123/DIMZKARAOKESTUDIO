"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { useFirebase } from "@/firebase";

export default function ConnectPage() {
  const [isCastReady, setIsCastReady] = useState(false);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const { firestore, user } = useFirebase(); // Ganti dengan hook

  // 🔹 Ambil lagu teratas dari antrian Firestore
  const fetchCurrentSong = async () => {
    if (!firestore || !user) return; // Pastikan firestore dan user sudah ada
    try {
      const q = query(
        collection(firestore, "users", user.uid, "songQueueItems"), // Gunakan UID pengguna yang login
        orderBy("order", "asc"), // Urutkan berdasarkan 'order'
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const songData = snapshot.docs[0].data();
        setCurrentSong(songData);
        console.log("🎵 Lagu aktif:", songData);
      } else {
        setCurrentSong(null);
      }
    } catch (err) {
      console.error("❌ Gagal ambil lagu dari antrian:", err);
    }
  };

  useEffect(() => {
    if (firestore && user) {
        fetchCurrentSong();
    }

    // ✅ Muat Google Cast SDK
    const loadCastSDK = () => {
      if (!window.chrome?.cast || !window.cast) {
        const script = document.createElement("script");
        script.src =
          "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";
        script.onload = () => console.log("✅ Cast SDK Loaded");
        document.body.appendChild(script);
      }
    };

    loadCastSDK();

    // Tunggu hingga SDK siap
    const checkCastReady = () => {
      if (window.cast && window.cast.framework) {
        setIsCastReady(true);
        console.log("🚀 Cast siap digunakan");
      } else {
        setTimeout(checkCastReady, 1000);
      }
    };

    checkCastReady();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore, user]);

  const handleCast = async () => {
    if (!isCastReady) {
      alert("⏳ Tunggu sebentar, Chromecast belum siap.");
      return;
    }

    if (!currentSong) {
      await fetchCurrentSong(); // Coba ambil lagu lagi jika belum ada
      if (!currentSong) {
        alert("Tidak ada lagu di antrian!");
        return;
      }
    }

    try {
      const context = window.cast.framework.CastContext.getInstance();
      context.setOptions({
        receiverApplicationId:
          window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      });

      const session = context.getCurrentSession();
      if (!session) {
          // Minta pengguna untuk memilih perangkat jika tidak ada sesi
          await context.requestSession();
          // Coba lagi setelah sesi dimulai
          const newSession = context.getCurrentSession();
          if (!newSession) {
            alert("Pilih perangkat TV dulu dari ikon Cast di browser.");
            return;
          }
          await newSession.loadMedia(new window.chrome.cast.media.LoadRequest(new window.chrome.cast.media.MediaInfo(currentSong.videoUrl, "video/mp4")));

      } else {
         const videoUrl = currentSong.videoUrl;
         const mediaInfo = new window.chrome.cast.media.MediaInfo(videoUrl, "video/mp4");
         const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
         await session.loadMedia(request);
      }
      
      alert(`🎉 Sedang memutar: ${currentSong.title}`);

    } catch (err) {
      console.error("❌ Gagal melakukan cast:", err);
      // @ts-ignore
      if (err && err.code === 'cancel') {
          return; // Jangan tampilkan alert jika pengguna sengaja batal
      }
      alert("Gagal kirim ke TV.");
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Hubungkan ke TV</h1>

      {currentSong ? (
        <p className="text-gray-300 mb-6">
          Lagu Berikutnya: <b>{currentSong.title}</b>
        </p>
      ) : (
        <p className="text-gray-400 mb-6">Tidak ada lagu di antrian.</p>
      )}

      <button
        disabled={!isCastReady}
        onClick={handleCast}
        className={`px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all ${
          isCastReady
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gray-500 cursor-not-allowed"
        }`}
      >
        🎥 {isCastReady ? "Kirim Lagu ke TV" : "Menyiapkan Chromecast..."}
      </button>

      <button onClick={fetchCurrentSong} className="ml-4 px-4 py-2 bg-blue-500 rounded-xl">Refresh Lagu</button>
    </div>
  );
}
