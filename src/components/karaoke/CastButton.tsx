
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
  
  // Ref untuk melacak videoId yang terakhir kali di-cast
  // untuk mencegah pengiriman ulang yang tidak perlu
  const lastCastedVideoIdRef = useRef<string | null>(null);

  // Inisialisasi Google Cast API
  useEffect(() => {
    const initializeCastApi = () => {
      try {
        const context = window.cast.framework.CastContext.getInstance();
        context.setOptions({
          receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
          autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        });

        const handleSessionStateChange = (event: any) => {
          console.log('Cast Session State Changed:', event.sessionState);
          const currentSession = context.getCurrentSession();
          setCastSession(currentSession);
          // Reset ID video terakhir saat koneksi berubah
          if (event.sessionState === 'SESSION_ENDED' || event.sessionState === 'SESSION_START_FAILED') {
            lastCastedVideoIdRef.current = null;
          }
        };

        context.addEventListener(
          window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
          handleSessionStateChange
        );
        
        // Atur sesi awal jika sudah ada
        setCastSession(context.getCurrentSession());
        
        setIsCastApiAvailable(true);
        console.log('Google Cast API initialized successfully.');
      } catch (error) {
        console.error('Failed to initialize Cast framework:', error);
        setIsCastApiAvailable(false);
      }
    };
    
    // Metode resmi untuk memeriksa ketersediaan Cast API
    window.__onGCastApiAvailable = (isAvailable) => {
        if (isAvailable) {
            console.log('Google Cast API is available.');
            initializeCastApi();
        } else {
            console.error("Google Cast API not available");
            setIsCastApiAvailable(false);
        }
    };
  }, []); 

  // Fungsi untuk memuat dan mengirim media ke TV
  const castToTV = (videoId: string, session: any) => {
    if (!session || !nowPlaying) return;

    console.log(`Casting YouTube video ID: ${videoId} to TV...`);

    // DefaultMediaReceiver hanya memerlukan videoId sebagai contentId
    const mediaInfo = new window.chrome.cast.media.MediaInfo(videoId, 'video/youtube');
    
    // Tambahkan metadata untuk ditampilkan di UI TV
    mediaInfo.metadata = new window.chrome.cast.media.YouTubeMediaMetadata();
    mediaInfo.metadata.title = nowPlaying.snippet.title;
    mediaInfo.metadata.artist = nowPlaying.snippet.channelTitle;
    mediaInfo.metadata.images = [{ 'url': nowPlaying.snippet.thumbnails.high.url }];
    
    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
    
    session.loadMedia(request).then(
      () => {
        console.log('✅ Media berhasil di-cast ke TV');
        lastCastedVideoIdRef.current = videoId; // Simpan ID video yang berhasil di-cast
      },
      (error: any) => {
        console.error('❌ Gagal cast:', error);
        toast({
          variant: 'destructive',
          title: 'Cast Gagal',
          description: 'Tidak dapat memutar video di perangkat Cast.',
        });
      }
    );
  };
  
  // OTOMATIS CAST SAAT LAGU BERGANTI (seperti yang Anda instruksikan)
  useEffect(() => {
    const videoId = nowPlaying?.id?.videoId;
    // Hanya cast jika:
    // 1. Ada sesi Cast yang aktif
    // 2. Ada lagu yang sedang diputar
    // 3. Lagu tersebut belum pernah di-cast sebelumnya (mencegah loop)
    if (castSession && videoId && videoId !== lastCastedVideoIdRef.current) {
        castToTV(videoId, castSession);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowPlaying?.id?.videoId, castSession]); // Dependensi pada videoId dan sesi


  if (!isCastApiAvailable) {
    // Tampilkan ikon yang dinonaktifkan saat API belum siap
    return <Cast className="text-muted-foreground/50" />;
  }

  // Tombol resmi dari SDK Google Cast.
  // Tombol ini menangani UI-nya sendiri (terhubung, tidak terhubung) dan membuka pemilih perangkat.
  return (
    <google-cast-launcher style={{
      display: 'inline-block', 
      width: '24px', 
      height: '24px', 
      cursor: 'pointer', 
      // Variabel ini disediakan oleh SDK untuk mengubah warna ikon
      '--cast-button-color': 'hsl(var(--primary))'
    }} />
  );
}
