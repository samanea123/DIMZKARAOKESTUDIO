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
  
  // Ref to track the last successfully cast video ID
  const lastCastedVideoIdRef = useRef<string | null>(null);

  // 1. Initialize Google Cast Framework
  useEffect(() => {
    // This function will be called when the Cast script from Google is ready
    window.__onGCastApiAvailable = (isAvailable) => {
        if (isAvailable) {
            console.log('Google Cast API is available.');
            try {
              // Get CastContext instance
              const context = window.cast.framework.CastContext.getInstance();
              // Configure the receiver (using Google's default YouTube receiver)
              context.setOptions({
                receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
              });

              // 2. Add listener to monitor session status (connected/disconnected)
              const handleSessionStateChange = (event: any) => {
                console.log('Cast Session State Changed:', event.sessionState);
                const currentSession = context.getCurrentSession();
                setCastSession(currentSession); // Update state with the current session
                
                // If the session ends, reset the last cast video
                if (event.sessionState === 'SESSION_ENDED' || event.sessionState === 'SESSION_START_FAILED') {
                  lastCastedVideoIdRef.current = null; 
                }
              };

              context.addEventListener(
                window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
                handleSessionStateChange
              );
              
              // Check if a session is already active when the component loads
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
            console.error("Google Cast API not available");
            setIsCastApiAvailable(false);
        }
    };
  }, []); 

  // 3. Function to send video to TV
  const castToTV = (videoId: string, title: string, artist: string, imageUrl: string, session: any) => {
    if (!session) return;

    console.log(`Casting YouTube video ID: ${videoId} to TV...`);

    // Create a MediaInfo object specifically for YouTube
    const mediaInfo = new window.chrome.cast.media.MediaInfo(videoId, 'video/x-youtube');
    mediaInfo.metadata = new window.chrome.cast.media.YouTubeMediaMetadata();
    mediaInfo.metadata.title = title;
    mediaInfo.metadata.artist = artist;
    mediaInfo.metadata.images = [{ 'url': imageUrl }];
    
    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
    
    // Send the request to load the media on the receiver (TV)
    session.loadMedia(request).then(
      () => {
        console.log('✅ Media successfully cast to TV');
        // Mark this video as successfully cast to avoid resending
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
  
  // 4. This effect runs whenever `nowPlaying` or `castSession` changes
  useEffect(() => {
    // Get the videoId from the currently playing song
    const videoId = nowPlaying?.youtubeVideoId;
    
    // Conditions to perform cast:
    // - There is an active cast session
    // - There is a song playing (videoId is not empty)
    // - The playing song is a new song (not cast in this session yet)
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
  }, [nowPlaying?.youtubeVideoId, castSession]); // Dependencies: only video ID and cast session


  if (!isCastApiAvailable) {
    // The Cast button will appear inactive if the API is not ready
    return <Cast className="text-muted-foreground/50" />;
  }

  // 5. Display the official cast button from Google (<google-cast-launcher>)
  // This button will automatically display the Cast icon and open the device selection dialog.
  return (
    <google-cast-launcher style={{
      display: 'inline-block', 
      width: '24px', 
      height: '24px', 
      cursor: 'pointer', 
      // This button will automatically change color when connected
      '--cast-button-color': 'hsl(var(--primary))' 
    }} />
  );
}
