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

  // 1. Initialize Google Cast Framework
  useEffect(() => {
    const initializeCastApi = () => {
      if (window.cast && window.cast.framework) {
        console.log('Google Cast API is available.');
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
            
            if (event.sessionState === 'SESSION_ENDED' || event.sessionState === 'SESSION_START_FAILED') {
              lastCastedVideoIdRef.current = null; 
            }
          };

          context.addEventListener(
            window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
            handleSessionStateChange
          );
          
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
        console.log('Waiting for Google Cast API...');
      }
    };
    
    // Set a global callback that the Cast script will call when it's ready.
    window.__onGCastApiAvailable = (isAvailable) => {
      if (isAvailable) {
        initializeCastApi();
      } else {
        console.error("Google Cast API not available");
        setIsCastApiAvailable(false);
      }
    };
  }, []); 

  // 2. Function to send video to TV
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
        console.log('✅ Media successfully cast to TV');
        lastCastedVideoIdRef.current = videoId; 
      },
      (error: any) => {
        console.error('❌ Cast failed:', error);
        toast({
          variant: 'destructive',
          title: 'Cast Gagal',
          description: 'Tidak dapat memutar video di perangkat Cast. Pastikan perangkat terhubung.',
        });
      }
    );
  };
  
  // 3. Effect to cast when nowPlaying or session changes
  useEffect(() => {
    const videoId = nowPlaying?.youtubeVideoId;
    
    if (castSession && videoId && nowPlaying && videoId !== lastCastedVideoIdRef.current) {
        castToTV(
          videoId, 
          nowPlaying.title, 
          nowPlaying.channelTitle, 
          nowPlaying.thumbnails.high.url, 
          castSession
        );
    }
  }, [nowPlaying, castSession, toast]); 


  if (!isCastApiAvailable) {
    return <Cast className="text-muted-foreground/50" />;
  }

  // 4. Display the official cast button from Google
  return (
    <google-cast-launcher style={{
      display: 'inline-block', 
      width: '24px', 
      height: '24px', 
      cursor: 'pointer',
      tintColor: 'hsl(var(--primary))'
    }} />
  );
}
