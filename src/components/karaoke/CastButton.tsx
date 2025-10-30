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
  const [castSession, setCastSession] = useState<any>(null);
  
  const lastCastedVideoIdRef = useRef<string | null>(null);
  const castButtonRef = useRef<HTMLDivElement | null>(null);

  // 1. Initialize Google Cast Framework
  useEffect(() => {
    const initializeCastApi = () => {
      console.log('Attempting to initialize Google Cast API...');
      if (window.cast && window.cast.framework) {
        try {
          const context = window.cast.framework.CastContext.getInstance();
          context.setOptions({
            receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
          });
          console.log('Google Cast API options set.');

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

        } catch (error) {
          console.error('Failed to initialize Cast framework:', error);
        }
      } else {
        console.log('window.cast or window.cast.framework not available yet.');
      }
    };
    
    // Set a global callback that the Cast script will call when it's ready.
    window.__onGCastApiAvailable = (isAvailable) => {
      if (isAvailable) {
        console.log('Google Cast API is available via callback.');
        initializeCastApi();
      } else {
        console.error("Google Cast API not available");
      }
    };

    // Fallback if the callback doesn't fire (e.g., script already loaded)
    const checkInterval = setInterval(() => {
        if (window.cast && window.cast.framework) {
            console.log('Google Cast API is available via interval check.');
            initializeCastApi();
            clearInterval(checkInterval);
        }
    }, 500);

    return () => clearInterval(checkInterval);

  }, []); 

  // 2. Function to send video to TV
  const castToTV = (videoId: string, title: string, artist: string, imageUrl: string, session: any) => {
    if (!session) return;

    console.log(`Casting YouTube video ID: ${videoId} to TV...`);

    const mediaInfo = new window.chrome.cast.media.MediaInfo(videoId, 'video/x-youtube');
    // For some reason, the metadata type needs to be generic for YT videos
    mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();
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
          description: error.description || 'Tidak dapat memutar video di perangkat Cast. Pastikan perangkat terhubung.',
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
  }, [nowPlaying, castSession]); // removed `toast` from deps

  // 4. Display the official cast button from Google
  return (
    <div ref={castButtonRef} style={{ display: 'inline-block' }}>
      <google-cast-launcher style={{
        width: '24px', 
        height: '24px', 
        cursor: 'pointer',
        tintColor: 'hsl(var(--primary))',
        '--disabled-color': '#707070',
        '--connected-color': 'hsl(var(--primary))'
      }} />
    </div>
  );
}
