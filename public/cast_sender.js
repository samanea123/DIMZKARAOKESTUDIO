window.__onGCastApiAvailable = function(isAvailable) {
  if (isAvailable) {
    try {
      const castContext = cast.framework.CastContext.getInstance();
      castContext.setOptions({
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      });
    } catch (err) {
      console.error('Failed to initialize CastContext:', err);
    }
  }
};
