const CLIENT_ID = '1097563945851695264';

async function initializeSdk() {
    // Capture all of the query params, in case we need to reference them
    // We might want to change the url, which would erase the query params
    const urlParams = new URLSearchParams(window.location.search);
    const frameId = urlParams.get('frame_id');
    const instanceId = urlParams.get('instance_id');
    const platform = urlParams.get('platform');
    const guildId = urlParams.get('guild_id');
    const channelId = urlParams.get('channel_id');

    const readyPromise = new Promise((resolve, reject) => {
        function handleReadyMessage(event) {
            // Only listening to messages sent into the iframe's window from discord
            if (event.origin !== 'https://discord.com') return;

            const [opcode, data] = event.data;
            if (opcode === 1) {
                window.removeEventListener('message', handleReadyMessage, false);
                resolve();
            }
        }
        window.addEventListener('message', handleReadyMessage, false);
    });

    window.parent.postMessage(
        [
            // 0 is the RPC server "opcode" for HANDSHAKE.
            // Posting this message to the parent tells Discord's RPC server
            // "Hi! I want to talk to you"
            0, 
            {
                v: 1,
                encoding: 'json',
                client_id: CLIENT_ID,
                frame_id: frameId,
            }
        ],
        '*'
    );

    await readyPromise;
    console.log('Discord is now ready to recieve commands from us');
}

initializeSdk();
