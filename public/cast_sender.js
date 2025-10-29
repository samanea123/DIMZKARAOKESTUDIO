window['__onGCastApiAvailable'] = function(isAvailable) {
  if (isAvailable) {
    try {
      cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
      });
    } catch(err) {
      console.error('Failed to initialize cast context:', err);
    }
  }
};
