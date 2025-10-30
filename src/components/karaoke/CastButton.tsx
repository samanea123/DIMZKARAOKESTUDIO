'use client';

import { Cast } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useKaraoke } from '@/context/KaraokeContext';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    chrome: any;
    cast: any;
    __onGCastApiAvailable: (isAvailable: boolean) => void;
  }
}

export default function CastButton() {
  const { nowPlaying } = useKaraoke();
  const { toast } = useToast();
  const [isCastApiAvailable, setIsCastApiAvailable] = useState(false);
  const [castSession, setCastSession] = useState<any>(null);
  
  // Ref untuk melacak ID video terakhir yang berhasil di-cast
  const lastCastedVideoIdRef = useRef<string | null>(null);

  // 1. Inisialisasi Google Cast Framework
  useEffect(() => {
    // Fungsi ini akan dipanggil ketika script Cast dari Google sudah siap
    window.__onGCastApiAvailable = (isAvailable) => {
        if (isAvailable) {
            console.log('Google Cast API is available.');
            try {
              // Dapatkan instance CastContext
              const context = window.cast.framework.CastContext.getInstance();
              // Konfigurasi receiver (menggunakan receiver default YouTube dari Google)
              context.setOptions({
                receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
              });

              // 2. Tambahkan listener untuk memantau status sesi (terhubung/terputus)
              const handleSessionStateChange = (event: any) => {
                console.log('Cast Session State Changed:', event.sessionState);
                const currentSession = context.getCurrentSession();
                setCastSession(currentSession); // Update state dengan sesi saat ini
                
                // Jika sesi berakhir, reset video yang terakhir di-cast
                if (event.sessionState === 'SESSION_ENDED' || event.sessionState === 'SESSION_START_FAILED') {
                  lastCastedVideoIdRef.current = null; 
                }
              };

              context.addEventListener(
                window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
                handleSessionStateChange
              );
              
              // Cek apakah sudah ada sesi yang aktif saat komponen dimuat
              const currentSession = context.getCurrentSession();
              if (currentSession) {
                  setCastSession(currentSession);
                  console.log("Reconnected to existing cast session");
              }
              
              setIsCastApiAvailable(true);
              console.log('Google Cast API initialized successfully.');

            } catch (error) {
              console.error('Failed to initialize Cast framework:', error);
              setIsCastApiAvailable(false);
            }
        } else {
            console.error("Google Cast API not available");
            setIsCastApiAvailable(false);
        }
    };
  }, []); 

  // 3. Fungsi untuk mengirim video ke TV
  const castToTV = (videoId: string, title: string, artist: string, imageUrl: string, session: any) => {
    if (!session) return;

    console.log(`Casting YouTube video ID: ${videoId} to TV...`);

    // Buat objek MediaInfo khusus untuk YouTube
    const mediaInfo = new window.chrome.cast.media.MediaInfo(videoId, 'video/x-youtube');
    mediaInfo.metadata = new window.chrome.cast.media.YouTubeMediaMetadata();
    mediaInfo.metadata.title = title;
    mediaInfo.metadata.artist = artist;
    mediaInfo.metadata.images = [{ 'url': imageUrl }];
    
    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
    
    // Kirim permintaan untuk memuat media di receiver (TV)
    session.loadMedia(request).then(
      () => {
        console.log('✅ Media berhasil di-cast ke TV');
        // Tandai video ini sudah berhasil di-cast untuk menghindari pengiriman ulang
        lastCastedVideoIdRef.current = videoId; 
      },
      (error: any) => {
        console.error('❌ Gagal cast:', error);
        toast({
          variant: 'destructive',
          title: 'Cast Gagal',
          description: 'Tidak dapat memutar video di perangkat Cast. Pastikan perangkat terhubung.',
        });
      }
    );
  };
  
  // 4. Efek ini berjalan setiap kali `nowPlaying` atau `castSession` berubah
  useEffect(() => {
    // Ambil videoId dari lagu yang sedang diputar
    const videoId = nowPlaying?.youtubeVideoId;
    
    // Kondisi untuk melakukan cast:
    // - Ada sesi cast yang aktif
    // - Ada lagu yang sedang diputar (videoId tidak kosong)
    // - Lagu yang sedang diputar adalah lagu baru (belum pernah di-cast di sesi ini)
    if (castSession && videoId && nowPlaying && videoId !== lastCastedVideoIdRef.current) {
        castToTV(
          videoId, 
          nowPlaying.title, 
          nowPlaying.channelTitle, 
          nowPlaying.thumbnails.high.url, 
          castSession
        );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowPlaying?.youtubeVideoId, castSession]); // Dependensi: hanya video ID dan sesi cast


  if (!isCastApiAvailable) {
    // Tombol Cast akan tampak non-aktif jika API belum siap
    return <Cast className="text-muted-foreground/50" />;
  }

  // 5. Tampilkan tombol cast resmi dari Google (<google-cast-launcher>)
  // Tombol ini secara otomatis akan menampilkan ikon Cast dan membuka dialog pemilihan perangkat.
  return (
    <google-cast-launcher style={{
      display: 'inline-block', 
      width: '24px', 
      height: '24px', 
      cursor: 'pointer', 
      // Tombol ini akan otomatis berubah warna saat terhubung
      '--cast-button-color': 'hsl(var(--primary))' 
    }} />
  );
}
