import axios from "axios";

// List of Cobalt Instances (Prioritized)
const COBALT_INSTANCES = [
    "https://api.cobalt.tools",
    "https://co.wuk.sh",
    "https://cobalt.kwiatekmiki.pl",
    "https://api.wkr.one"
];

// Fallback APIs
const FALLBACK_APIS = [
    "https://api.davidcyriltech.my.id/youtube",
    "https://api.vreden.web.id/api/ytmp4"
];

async function fetchCobalt(url, instanceUrl) {
    try {
        const res = await axios.post(`${instanceUrl}/api/json`, {
            url: url,
            videoQuality: '1080',
            audioFormat: 'mp3',
            filenamePattern: 'basic'
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 8000
        });

        const data = res.data;
        if (data.status === 'stream' || data.status === 'redirect' || data.url) {
            return {
                title: data.filename || "YouTube Video",
                thumbnail: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png", // Cobalt doesn't always return thumb
                author: "YouTube",
                medias: [
                    {
                        url: data.url,
                        type: 'video',
                        label: 'HD Video',
                        extension: 'mp4'
                    }
                ]
            };
        } else if (data.status === 'picker') {
             // Handle picker (multiple formats)
             const medias = data.picker.map(p => ({
                 url: p.url,
                 type: p.type === 'video' ? 'video' : 'audio',
                 label: p.type === 'video' ? 'Video' : 'Audio',
                 extension: p.type === 'video' ? 'mp4' : 'mp3'
             }));
             return {
                 title: "YouTube Video",
                 thumbnail: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png",
                 author: "YouTube",
                 medias: medias
             };
        }
        throw new Error("Invalid Cobalt response");
    } catch (e) {
        throw new Error(`Cobalt (${instanceUrl}) failed: ${e.message}`);
    }
}

async function fetchFallback(url, apiUrl) {
     try {
        const res = await axios.get(`${apiUrl}?url=${encodeURIComponent(url)}`, { timeout: 10000 });
        const data = res.data;
        
        // Adaptasi response dari berbagai API
        if (data.result) {
            return {
                title: data.result.title || "Video",
                thumbnail: data.result.thumbnail || data.result.image,
                author: "YouTube",
                medias: [
                    {
                         url: data.result.mp4 || data.result.video || data.result.download?.url,
                         type: 'video',
                         label: 'Video',
                         extension: 'mp4'
                    },
                    {
                         url: data.result.mp3 || data.result.audio,
                         type: 'audio',
                         label: 'Audio',
                         extension: 'mp3'
                    }
                ].filter(x => x.url)
            };
        }
        throw new Error("Invalid Fallback Response");
    } catch (e) {
        throw e;
    }
}

async function fetchYouTubeData(url) {
    const errors = [];

    // 1. Try Cobalt Instances
    for (const instance of COBALT_INSTANCES) {
        try {
            console.log(`[YT] Trying Cobalt: ${instance}`);
            return await fetchCobalt(url, instance);
        } catch (e) {
            console.error(e.message);
            errors.push(e.message);
        }
    }

    // 2. Try Fallback APIs
    for (const api of FALLBACK_APIS) {
        try {
            console.log(`[YT] Trying Fallback: ${api}`);
            return await fetchFallback(url, api);
        } catch (e) {
            console.error(`Fallback failed: ${e.message}`);
            errors.push(e.message);
        }
    }

    throw new Error("Semua server sibuk. Silakan coba lagi nanti.");
}

export { fetchYouTubeData };
