
'use client';

import { Cast } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useKaraoke } from '@/context/KaraokeContext';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    // @ts-ignore
    chrome: any;
    // @ts-ignore
    cast: any;
  }
}

export default function CastButton() {
  const { nowPlaying } = useKaraoke();
  const { toast } = useToast();
  const castButtonRef = useRef<HTMLButtonElement>(null);
  const castSessionRef = useRef<any>(null);
  const mediaSessionRef = useRef<any>(null);

  useEffect(() => {
    const initializeCastApi = () => {
      if (!window.cast || !window.cast.framework) {
        return;
      }
      try {
        const context = window.cast.framework.CastContext.getInstance();
        context.setOptions({
          receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
          autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        });

        const handleCastStateChange = (event: any) => {
          if (event.castState === 'CONNECTED') {
             castSessionRef.current = context.getCurrentSession();
             if (nowPlaying) {
                loadMedia(nowPlaying.id.videoId);
             }
          } else if (event.castState === 'NOT_CONNECTED') {
             castSessionRef.current = null;
             mediaSessionRef.current = null;
          }
        };

        context.addEventListener(
            window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
            handleCastStateChange
        );

      } catch (e) {
        console.error('Failed to initialize cast framework:', e);
      }
    };
    
    if (window.chrome && window.chrome.cast && window.chrome.cast.isAvailable) {
        initializeCastApi();
    } else {
        window['__onGCastApiAvailable'] = (isAvailable) => {
            if (isAvailable) {
                initializeCastApi();
            }
        };
    }
  }, [nowPlaying]);

  useEffect(() => {
    if (nowPlaying && castSessionRef.current) {
        loadMedia(nowPlaying.id.videoId);
    }
  }, [nowPlaying?.id?.videoId]);


  const loadMedia = (videoId: string) => {
    if (!castSessionRef.current) return;

    const mediaInfo = new window.chrome.cast.media.MediaInfo(`https://www.youtube.com/watch?v=${videoId}`, 'video/youtube');
    mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();
    if(nowPlaying) {
        mediaInfo.metadata.title = nowPlaying.snippet.title;
        mediaInfo.metadata.artist = nowPlaying.snippet.channelTitle;
        mediaInfo.metadata.images = [{ 'url': nowPlaying.snippet.thumbnails.high.url }];
    }
    
    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
    
    castSessionRef.current.loadMedia(request).then(
      (mediaSession: any) => {
        mediaSessionRef.current = mediaSession;
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

  return (
    <>
      {/* This is the native button */}
      <google-cast-launcher style={{display: 'block', width: '24px', height: '24px', cursor: 'pointer', color: 'hsl(var(--primary))'}} />

      {/* Fallback button if the native one fails to render */}
      <button ref={castButtonRef} className="cast-button-fallback" style={{display: 'none'}}>
        <Cast className="text-primary hover:text-primary/80 transition-colors" />
      </button>
    </>
  );
}
