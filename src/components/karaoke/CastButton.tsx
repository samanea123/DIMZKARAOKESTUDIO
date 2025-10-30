
'use client';

import { useEffect, useRef } from 'react';
import { useKaraoke } from '@/context/KaraokeContext';
import { useToast } from '@/hooks/use-toast';

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

        castContext.addEventListener(
          window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
          handleSessionStateChange
        );
      } catch (error) {
        console.error('Error initializing Cast framework:', error);
      }
    };

    const handleSessionStateChange = (event: any) => {
      const session = window.cast.framework.CastContext.getInstance().getCurrentSession();
      if (event.sessionState === 'SESSION_ENDED' || event.sessionState === 'SESSION_START_FAILED') {
        lastCastedVideoIdRef.current = null;
      }
      // Trigger a cast when a session is started or resumed
      if ((event.sessionState === 'SESSION_STARTED' || event.sessionState === 'SESSION_RESUMED') && nowPlaying) {
        castVideo(nowPlaying.youtubeVideoId, nowPlaying.title, nowPlaying.channelTitle, nowPlaying.thumbnails.high.url, session);
      }
    };

    // The Cast SDK will call this global function when it's ready.
    window.__onGCastApiAvailable = (isAvailable) => {
      if (isAvailable) {
        initializeCastApi();
      } else {
        console.error('Google Cast API not available.');
      }
    };
    
    // In case the script is already loaded and the callback has fired
    if (window.cast && window.cast.framework) {
        console.log('Cast API was already available.');
        initializeCastApi();
    }

  }, [nowPlaying]); // Include nowPlaying to have access to the latest value in the event listener

  const castVideo = (videoId: string, title: string, artist: string, imageUrl: string, session: any) => {
    if (!session) {
      console.warn('Cannot cast video, no active session.');
      return;
    }
    
    // Check if we are already casting this exact video
    if(lastCastedVideoIdRef.current === videoId) {
        console.log(`Video ${videoId} is already being cast or was the last one cast. Skipping.`);
        return;
    }

    console.log(`Casting video: ${title} (ID: ${videoId})`);
    
    const mediaInfo = new window.chrome.cast.media.MediaInfo(videoId, 'video/x-youtube');
    mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.title = title;
    mediaInfo.metadata.artist = artist;
    mediaInfo.metadata.images = [{ 'url': imageUrl }];
    
    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
    
    session.loadMedia(request).then(
      () => {
        console.log('✅ Media successfully loaded on the receiver.');
        lastCastedVideoIdRef.current = videoId; // Mark this video as casted
      },
      (error: any) => {
        console.error('❌ Casting failed:', error);
        toast({
          variant: 'destructive',
          title: 'Cast Gagal',
          description: error.description || 'Tidak dapat memutar video di perangkat Cast.',
        });
        lastCastedVideoIdRef.current = null; // Reset on failure
      }
    );
  };

  useEffect(() => {
    const castSession = window.cast?.framework?.CastContext.getInstance().getCurrentSession();
    if (castSession && nowPlaying) {
      castVideo(
        nowPlaying.youtubeVideoId,
        nowPlaying.title,
        nowPlaying.channelTitle,
        nowPlaying.thumbnails.high.url,
        castSession
      );
    }
  }, [nowPlaying]); // This effect specifically handles changes to nowPlaying

  return (
    // The google-cast-launcher component is provided by the Cast SDK.
    // It automatically becomes visible and clickable when cast devices are found.
    <google-cast-launcher style={{
        width: '24px', 
        height: '24px', 
        cursor: 'pointer',
        tintColor: 'hsl(var(--primary))',
        '--disconnected-color': 'hsl(var(--foreground))',
        '--connected-color': 'hsl(var(--primary))'
      }} />
  );
}
