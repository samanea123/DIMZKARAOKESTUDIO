
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

    const mediaInfo = new window.chrome.cast.media.MediaInfo(`https://www.youtube.com/watch?v=${videoId}`, 'video/youtube');
    mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.title = nowPlaying.snippet.title;
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
            receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
          });

          const handleSessionStateChange = (event: any) => {
            const currentSession = context.getCurrentSession();
            setSession(currentSession); // Update session state
            castSessionRef.current = currentSession;

            if (event.sessionState === 'SESSION_STARTED' && currentSession && nowPlaying) {
              loadMedia(nowPlaying.id.videoId, currentSession);
            } else if (event.sessionState === 'SESSION_ENDED') {
              castSessionRef.current = null;
            }
          };

          context.addEventListener(
            window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
            handleSessionStateChange
          );
          
          // Set initial session if already connected
          const currentSession = context.getCurrentSession();
          setSession(currentSession);
          castSessionRef.current = currentSession;
          
          setIsCastApiAvailable(true);

        } catch (error) {
          console.error('Failed to initialize Cast framework:', error);
          toast({
            variant: 'destructive',
            title: 'Cast API Gagal',
            description: 'Tidak dapat menginisialisasi Google Cast.',
          });
        }
      }
    };
    
    // The onGCastApiAvailable callback is required to initialize the Cast API
    window['__onGCastApiAvailable'] = (isAvailable) => {
        if (isAvailable) {
            initializeCastApi();
        }
    };
  }, [toast]); // Removed nowPlaying from dependencies to avoid re-registering listeners

  useEffect(() => {
    // This effect runs only when nowPlaying changes or session changes
    if (nowPlaying && session) {
        loadMedia(nowPlaying.id.videoId, session);
    }
  }, [nowPlaying?.id.videoId, session]);


  if (!isCastApiAvailable) {
    return <Cast className="text-muted-foreground/50" />;
  }

  // The google-cast-launcher element is the official button from the SDK
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
