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

    const authorizePromise = new Promise((resolve, reject) => {
        // Creating a unique string to send with our command. We will listen for a reply from Discord with the same "nonce"
        const nonce = new Date().toISOString();

        function handleAuthorizeCommand(event) {
            // Only listening to messages sent into the iframe's window from discord
            if (event.origin !== 'https://discord.com') return;
    
            const [opcode, data] = event.data;
            // We only want to handle "FRAME" messages
            if (opcode !== 1 || data.nonce !== nonce) return;
            resolve(data);
            window.removeEventListener('message', handleAuthorizeCommand, false);
        }

        window.addEventListener('message', handleAuthorizeCommand, false);
        window.parent.postMessage(
            [
                1, // Sending a "FRAME" opcode
                {
                    cmd: 'AUTHORIZE',
                    nonce: nonce,
                    args: {
                        client_id: CLIENT_ID,
                        scope: ['identify'],
                    }
                }
            ],
            "*"
        )
    });

    const authorizeReply = await authorizePromise;
    const oauth2Code = authorizeReply.data.code;

    // ⚠️ DO NOT DO THIS IN YOUR WEBSITE - DO THIS ON YOUR SERVER ⚠️
    // Instead create a server, and make an API request through that server to
    // retrieve your OAuth token. If you store your OAuth2 Client Secret inside
    // client (website) code, a bad actor could scrape it and pretend to be
    // your app
    const DONT_DO_THIS_OAUTH_CLIENT_SECRET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEF';
    const response = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: DONT_DO_THIS_OAUTH_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code: oauth2Code,
        }),
      });
    const { access_token } = await response.json();
}

initializeSdk();
