
const options = {};
options.receiverApplicationId = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
options.autoJoinPolicy = chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;

cast.framework.CastContext.getInstance().setOptions(options);

    