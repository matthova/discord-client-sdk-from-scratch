function initializeSdk() {
    // Capture all of the query params, in case we need to reference them
    // We might want to change the url, which would erase the query params
    const urlParams = new URLSearchParams(window.location.search);
    const frameId = urlParams.get('frame_id');
    const instanceId = urlParams.get('instance_id');
    const platform = urlParams.get('platform');
    const guildId = urlParams.get('guild_id');
    const channelId = urlParams.get('channel_id');
}

initializeSdk();
