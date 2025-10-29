
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
  const castSessionRef = useRef<any>(null);
  const [isCastApiAvailable, setIsCastApiAvailable] = useState(false);
  const [session, setSession] = useState<any>(null);

  const loadMedia = (videoId: string, activeSession: any) => {
    if (!activeSession || !nowPlaying) return;

    // The YouTube video ID is the only thing needed for the receiver
    const mediaInfo = new window.chrome.cast.media.MediaInfo(videoId, 'video/youtube');
    
    // Add metadata for the Cast UI on the TV
    mediaInfo.metadata = new window.chrome.cast.media.YouTubeMediaMetadata();
    mediaInfo.metadata.title = nowPlaying.snippet.title;
    // The default media receiver doesn't show artist, but we set it anyway.
    // A custom receiver could display this.
    mediaInfo.metadata.artist = nowPlaying.snippet.channelTitle;
    mediaInfo.metadata.images = [{ 'url': nowPlaying.snippet.thumbnails.high.url }];
    
    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
    
    activeSession.loadMedia(request).then(
      () => {
        // Media is loading.
      },
      (error: any) => {
        console.error('Error casting media:', error);
        toast({
          variant: 'destructive',
          title: 'Cast Gagal',
          description: 'Tidak dapat memutar video di perangkat Cast.',
        });
      }
    );
  };
  
  useEffect(() => {
    const initializeCastApi = () => {
      if (window.cast && window.cast.framework) {
        try {
          const context = window.cast.framework.CastContext.getInstance();
          context.setOptions({
            // Use the Default Media Receiver for YouTube videos
            receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
          });

          const handleSessionStateChange = (event: any) => {
            const currentSession = context.getCurrentSession();
            setSession(currentSession);
            castSessionRef.current = currentSession;

            if (event.sessionState === 'SESSION_ENDED') {
              castSessionRef.current = null;
            }
          };

          context.addEventListener(
            window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
            handleSessionStateChange
          );
          
          // Set initial session if already connected
          const currentSession = context.getCurrentSession();
          if (currentSession) {
            setSession(currentSession);
            castSessionRef.current = currentSession;
          }
          
          setIsCastApiAvailable(true);

        } catch (error) {
          console.error('Failed to initialize Cast framework:', error);
        }
      }
    };
    
    // The onGCastApiAvailable callback is required to initialize the Cast API
    window['__onGCastApiAvailable'] = (isAvailable) => {
        if (isAvailable) {
            initializeCastApi();
        } else {
            console.error("Google Cast API not available");
        }
    };
  }, []); 

  useEffect(() => {
    // This effect runs only when nowPlaying changes or session changes
    if (nowPlaying && session) {
        // We only need the video ID, not the full URL
        loadMedia(nowPlaying.id.videoId, session);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowPlaying?.id.videoId, session]);


  if (!isCastApiAvailable) {
    // Show a disabled icon while the Cast API is loading
    return <Cast className="text-muted-foreground/50" />;
  }

  // The google-cast-launcher element is the official button from the SDK
  // It handles its own state (connected, disconnected, etc.)
  return (
    <google-cast-launcher style={{
      display: 'inline-block', 
      width: '24px', 
      height: '24px', 
      cursor: 'pointer', 
      color: 'hsl(var(--primary))',
      '--cast-button-color': 'hsl(var(--primary))'
    }} />
  );
}
