
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
  const sessionRef = useRef(castSession); // Use ref to avoid stale state in callbacks

  useEffect(() => {
    sessionRef.current = castSession;
  }, [castSession]);

  const loadMedia = (videoId: string, activeSession: any) => {
    if (!activeSession || !nowPlaying) return;

    // The YouTube video ID is the only thing needed for the receiver
    const mediaInfo = new window.chrome.cast.media.MediaInfo(videoId, 'video/youtube');
    
    // Add metadata for the Cast UI on the TV
    mediaInfo.metadata = new window.chrome.cast.media.YouTubeMediaMetadata();
    mediaInfo.metadata.title = nowPlaying.snippet.title;
    mediaInfo.metadata.artist = nowPlaying.snippet.channelTitle;
    mediaInfo.metadata.images = [{ 'url': nowPlaying.snippet.thumbnails.high.url }];
    
    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
    
    activeSession.loadMedia(request).then(
      () => {
        console.log('Media is loading on Cast device...');
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
          const castContext = window.cast.framework.CastContext.getInstance();
          castContext.setOptions({
            // Use the Default Media Receiver for YouTube videos
            receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
          });

          const handleSessionStateChange = (event: any) => {
            const currentSession = castContext.getCurrentSession();
            setCastSession(currentSession);
          };

          castContext.addEventListener(
            window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
            handleSessionStateChange
          );
          
          // Set initial session if one already exists
          setCastSession(castContext.getCurrentSession());
          
          setIsCastApiAvailable(true);

        } catch (error) {
          console.error('Failed to initialize Cast framework:', error);
          setIsCastApiAvailable(false);
        }
      }
    };
    
    // The onGCastApiAvailable callback is the guaranteed way to know the API is ready.
    window['__onGCastApiAvailable'] = (isAvailable) => {
        if (isAvailable) {
            initializeCastApi();
        } else {
            console.error("Google Cast API not available");
            setIsCastApiAvailable(false);
        }
    };
  }, []); 

  useEffect(() => {
    // This effect handles loading media whenever the playing song changes while a session is active.
    if (nowPlaying && castSession) {
        // We only need the video ID, not the full URL.
        loadMedia(nowPlaying.id.videoId, castSession);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowPlaying?.id.videoId, castSession]);


  if (!isCastApiAvailable) {
    // Show a disabled icon while the Cast API is loading or if it fails
    return <Cast className="text-muted-foreground/50" />;
  }

  // The google-cast-launcher element is the official button from the SDK.
  // It handles its own state (connected, disconnected, etc.).
  return (
    <google-cast-launcher style={{
      display: 'inline-block', 
      width: '24px', 
      height: '24px', 
      cursor: 'pointer', 
      // The --cast-button-color variable is provided by the SDK to style the icon.
      '--cast-button-color': 'hsl(var(--primary))'
    }} />
  );
}
