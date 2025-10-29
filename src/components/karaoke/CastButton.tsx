
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
          if (event.sessionState === 'SESSION_ENDED' || event.sessionState === 'SESSION_START_FAILED') {
            lastCastedVideoIdRef.current = null;
          }
        };

        context.addEventListener(
          window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
          handleSessionStateChange
        );
        
        setCastSession(context.getCurrentSession());
        
        setIsCastApiAvailable(true);
        console.log('Google Cast API initialized successfully.');
      } catch (error) {
        console.error('Failed to initialize Cast framework:', error);
        setIsCastApiAvailable(false);
      }
    };
    
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

  const castToTV = (videoId: string, session: any) => {
    if (!session || !nowPlaying) return;

    console.log(`Casting YouTube video ID: ${videoId} to TV...`);

    const mediaInfo = new window.chrome.cast.media.MediaInfo(videoId, 'video/youtube');
    
    mediaInfo.metadata = new window.chrome.cast.media.YouTubeMediaMetadata();
    mediaInfo.metadata.title = nowPlaying.title;
    mediaInfo.metadata.artist = nowPlaying.channelTitle;
    mediaInfo.metadata.images = [{ 'url': nowPlaying.thumbnails.high.url }];
    
    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
    
    session.loadMedia(request).then(
      () => {
        console.log('✅ Media berhasil di-cast ke TV');
        lastCastedVideoIdRef.current = videoId;
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
  
  useEffect(() => {
    const videoId = nowPlaying?.youtubeVideoId;
    if (castSession && videoId && videoId !== lastCastedVideoIdRef.current) {
        castToTV(videoId, castSession);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowPlaying?.youtubeVideoId, castSession]);


  if (!isCastApiAvailable) {
    return <Cast className="text-muted-foreground/50" />;
  }

  return (
    <google-cast-launcher style={{
      display: 'inline-block', 
      width: '24px', 
      height: '24px', 
      cursor: 'pointer', 
      '--cast-button-color': 'hsl(var(--primary))'
    }} />
  );
}

    