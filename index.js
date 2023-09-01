const CLIENT_ID = '1097563945851695264';

function initializeSdk() {
    // Capture all of the query params, in case we need to reference them
    // We might want to change the url, which would erase the query params
    const urlParams = new URLSearchParams(window.location.search);
    const frameId = urlParams.get('frame_id');
    const instanceId = urlParams.get('instance_id');
    const platform = urlParams.get('platform');
    const guildId = urlParams.get('guild_id');
    const channelId = urlParams.get('channel_id');

    window.addEventListener('message', (event) => {
        // Only listening to messages sent into the iframe's window from discord
        if (event.origin !== 'https://discord.com') return;

        const [opcode, data] = event.data;
        console.log("We've got a message from Discord.");
        console.log("opcode", opcode);
        console.log("data", data);
        // Discord's reply to our "HANDSHAKE" message will be a "READY" message with this shape:
        // opcode: "1"
        // data: {
        //   cmd: "DISPATCH",
        //   data: {
        //     v: 1,
        //     config: {
        //       cdn_host: "cdn.discordapp.com",
        //       api_endpoint: "//discord.com/api",
        //       environment: "production"
        //     }
        //   },
        //   evt: "READY",
        //   nonce: null
        // }
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
}

initializeSdk();
