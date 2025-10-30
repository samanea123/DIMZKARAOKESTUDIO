
'use client';

import { useEffect, useRef, useState } from 'react';
import { useKaraoke } from '@/context/KaraokeContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { Cast } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define types for the Google Cast API to avoid using 'any'
declare global {
  interface Window {
    cast: any;
    chrome: any;
    __onGCastApiAvailable: (isAvailable: boolean) => void;
  }
}

export default function CastButton() {
  const { nowPlaying } = useKaraoke();
  const { toast } = useToast();
  const lastCastedVideoIdRef = useRef<string | null>(null);
  const [isCastAvailable, setIsCastAvailable] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const initializeCastApi = () => {
      console.log('Google Cast API is available. Initializing...');
      try {
        const castContext = window.cast.framework.CastContext.getInstance();
        castContext.setOptions({
          receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
          autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        });
        console.log('Cast options set.');
        setIsCastAvailable(true);

        const handleSessionStateChange = (event: any) => {
            const currentSession = castContext.getCurrentSession();
            setSession(currentSession);

            if (event.sessionState === 'SESSION_ENDED' || event.sessionState === 'SESSION_START_FAILED') {
                lastCastedVideoIdRef.current = null;
            }
             if ((event.sessionState === 'SESSION_STARTED' || event.sessionState === 'SESSION_RESUMED') && nowPlaying) {
                castVideo(nowPlaying.youtubeVideoId, nowPlaying.title, nowPlaying.channelTitle, nowPlaying.thumbnails.high.url, currentSession);
            }
        };

        castContext.addEventListener(
            window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
            handleSessionStateChange
        );

      } catch (error) {
        console.error('Error initializing Cast framework:', error);
      }
    };

    window.__onGCastApiAvailable = (isAvailable) => {
      if (isAvailable) {
        initializeCastApi();
      } else {
        console.error('Google Cast API not available.');
      }
    };

    if (window.cast && window.cast.framework) {
        console.log('Cast API was already available.');
        initializeCastApi();
    }
  }, [nowPlaying]);

  const castVideo = (videoId: string, title: string, artist: string, imageUrl: string, activeSession: any) => {
    if (!activeSession) {
      console.warn('Cannot cast video, no active session.');
      return;
    }
    
    if(lastCastedVideoIdRef.current === videoId) {
        console.log(`Video ${videoId} is already being cast. Skipping.`);
        return;
    }

    console.log(`Casting video: ${title} (ID: ${videoId})`);
    
    const mediaInfo = new window.chrome.cast.media.MediaInfo(`https://www.youtube.com/watch?v=${videoId}`, 'video/youtube');
    mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.title = title;
    mediaInfo.metadata.artist = artist;
    mediaInfo.metadata.images = [{ 'url': imageUrl }];
    
    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
    
    activeSession.loadMedia(request).then(
      () => {
        console.log('✅ Media successfully loaded on the receiver.');
        lastCastedVideoIdRef.current = videoId;
      },
      (error: any) => {
        console.error('❌ Casting failed:', error);
        toast({
          variant: 'destructive',
          title: 'Cast Gagal',
          description: error.description || 'Tidak dapat memutar video di perangkat Cast.',
        });
        lastCastedVideoIdRef.current = null;
      }
    );
  };

  useEffect(() => {
    if (session && nowPlaying) {
      castVideo(
        nowPlaying.youtubeVideoId,
        nowPlaying.title,
        nowPlaying.channelTitle,
        nowPlaying.thumbnails.high.url,
        session
      );
    }
  }, [nowPlaying, session]);


  const handleCastButtonClick = () => {
    if (!isCastAvailable) {
      toast({
        variant: 'destructive',
        title: 'Cast Tidak Tersedia',
        description: 'Pastikan Anda menggunakan browser Chrome dan berada di jaringan yang sama dengan perangkat TV.',
      });
      return;
    }

    window.cast.framework.CastContext.getInstance().requestSession().catch((error: any) => {
        console.error("Session request failed", error);
        toast({
            variant: 'destructive',
            title: 'Gagal Terhubung',
            description: 'Tidak dapat memulai sesi Cast. Pastikan TV Anda siap.',
        });
    });
  };


  return (
    <Button 
        variant="ghost" 
        size="icon"
        onClick={handleCastButtonClick}
        disabled={!isCastAvailable}
        className={cn(
            "text-foreground/60 hover:text-primary disabled:opacity-50",
            {"text-primary animate-pulse": !!session}
        )}
        title="Cast ke TV"
    >
        <Cast />
    </Button>
  );
}
