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
  
  const lastCastedVideoIdRef = useRef<string | null>(null);

  // 1. Inisialisasi Google Cast Framework
  useEffect(() => {
    const initializeCastApi = () => {
      try {
        const context = window.cast.framework.CastContext.getInstance();
        context.setOptions({
          receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
          autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        });

        // 2. Lacak perubahan sesi (terhubung/terputus)
        const handleSessionStateChange = (event: any) => {
          console.log('Cast Session State Changed:', event.sessionState);
          const currentSession = context.getCurrentSession();
          setCastSession(currentSession);
          if (event.sessionState === 'SESSION_ENDED' || event.sessionState === 'SESSION_START_FAILED') {
            lastCastedVideoIdRef.current = null; // Reset saat sesi berakhir
          }
        };

        context.addEventListener(
          window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
          handleSessionStateChange
        );
        
        // Set sesi awal saat komponen dimuat
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
    };
    
    // Gunakan listener resmi untuk memastikan API siap
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

  // 3. Fungsi untuk mengirim video ke TV
  const castToTV = (videoId: string, title: string, artist: string, imageUrl: string, session: any) => {
    if (!session) return;

    console.log(`Casting YouTube video ID: ${videoId} to TV...`);

    const mediaInfo = new window.chrome.cast.media.MediaInfo(videoId, 'video/x-youtube');
    mediaInfo.metadata = new window.chrome.cast.media.YouTubeMediaMetadata();
    mediaInfo.metadata.title = title;
    mediaInfo.metadata.artist = artist;
    mediaInfo.metadata.images = [{ 'url': imageUrl }];
    
    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
    
    session.loadMedia(request).then(
      () => {
        console.log('✅ Media berhasil di-cast ke TV');
        lastCastedVideoIdRef.current = videoId; // Tandai video ini sudah di-cast
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
  
  // 4. Otomatis Cast saat lagu baru dimulai (`nowPlaying` berubah) atau saat sesi Cast terhubung kembali
  useEffect(() => {
    const videoId = nowPlaying?.youtubeVideoId;
    // Cek jika ada sesi, ada video, dan video tersebut belum pernah di-cast di sesi ini
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
  }, [nowPlaying?.youtubeVideoId, castSession]);


  if (!isCastApiAvailable) {
    // Tampilkan ikon disabled jika API belum siap
    return <Cast className="text-muted-foreground/50" />;
  }

  // 5. Tampilkan tombol Cast resmi dari Google
  return (
    <google-cast-launcher style={{
      display: 'inline-block', 
      width: '24px', 
      height: '24px', 
      cursor: 'pointer', 
      // Tombol akan otomatis berubah warna saat terhubung
      '--cast-button-color': 'hsl(var(--primary))' 
    }} />
  );
}
