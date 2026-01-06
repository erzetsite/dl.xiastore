import axios from "axios";

// Helper function to try multiple APIs
async function fetchWithFallback(url) {
    const errors = [];
    
    // 1. Ryzendesu API (Primary)
    try {
        console.log("[YT] Trying Ryzendesu API...");
        const videoRes = await axios.get(`https://api.ryzendesu.com/api/downloader/ytmp4?url=${encodeURIComponent(url)}`, { timeout: 10000 });
        const audioRes = await axios.get(`https://api.ryzendesu.com/api/downloader/ytmp3?url=${encodeURIComponent(url)}`, { timeout: 10000 });
        
        if (videoRes.data && (videoRes.data.url || videoRes.data.data?.url)) {
             const vData = videoRes.data.data || videoRes.data;
             const aData = audioRes.data.data || audioRes.data || {};
             
             return {
                 title: vData.title || "YouTube Video",
                 thumbnail: vData.thumbnail || vData.thumb,
                 author: vData.author || "YouTube",
                 medias: [
                     {
                         url: vData.url,
                         type: 'video',
                         label: 'HD Video',
                         extension: 'mp4'
                     },
                     {
                         url: aData.url || aData.audio,
                         type: 'audio',
                         label: 'Audio MP3',
                         extension: 'mp3'
                     }
                 ].filter(m => m.url) // Filter out empty URLs
             };
        }
    } catch (e) {
        console.error("[YT] Ryzendesu failed:", e.message);
        errors.push(e.message);
    }

    // 2. Siputzx API (Fallback)
    try {
        console.log("[YT] Trying Siputzx API...");
        const res = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(url)}`, { timeout: 10000 });
        
        if (res.data && res.data.data) {
            const data = res.data.data;
            return {
                title: data.title,
                thumbnail: data.thumbnail || data.cover,
                author: "YouTube",
                medias: [
                    {
                        url: data.dl || data.url,
                        type: 'video',
                        label: 'Video',
                        extension: 'mp4'
                    }
                ]
            };
        }
    } catch (e) {
        console.error("[YT] Siputzx failed:", e.message);
        errors.push(e.message);
    }

    // 3. Vreden API (Final Fallback)
    try {
         console.log("[YT] Trying Vreden API...");
         const res = await axios.get(`https://api.vreden.web.id/api/ytmp4?url=${encodeURIComponent(url)}`, { timeout: 10000 });
         if (res.data && res.data.result) {
             const data = res.data.result;
             return {
                 title: data.title,
                 thumbnail: data.thumbnail,
                 author: "YouTube",
                 medias: [
                     {
                         url: data.url || data.download?.url,
                         type: 'video',
                         label: 'Video',
                         extension: 'mp4'
                     }
                 ]
             };
         }
    } catch (e) {
        console.error("[YT] Vreden failed:", e.message);
        errors.push(e.message);
    }

    throw new Error(`All YouTube APIs failed. Last error: ${errors[errors.length - 1]}`);
}

async function fetchYouTubeData(url) {
    return await fetchWithFallback(url);
}

export { fetchYouTubeData };