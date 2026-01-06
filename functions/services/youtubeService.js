import axios from "axios";

async function fetchYouTubeData(url) {
    console.log("[YT] Processing URL:", url);

    // Endpoint API Baru
    const videoEndpoint = `https://yt-manager-dl-cc.vercel.app/api/video?url=${encodeURIComponent(url)}`;
    const audioEndpoint = `https://yt-manager-dl-cc.vercel.app/api/audio?url=${encodeURIComponent(url)}`;

    try {
        // Request Video dan Audio secara paralel biar cepat
        const [videoRes, audioRes] = await Promise.allSettled([
            axios.get(videoEndpoint, { timeout: 15000 }),
            axios.get(audioEndpoint, { timeout: 15000 })
        ]);

        let title = "YouTube Video";
        let thumbnail = "https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png";
        let author = "YouTube";
        const medias = [];

        // 1. Proses Video
        if (videoRes.status === 'fulfilled' && videoRes.value.data) {
            const vData = videoRes.value.data;
            
            // Cek apakah API mengembalikan format { url: '...', title: '...' } 
            // atau langsung redirect/buffer (tergantung behavior API ini).
            // Asumsi: API mengembalikan JSON berisi URL download.
            
            if (vData.url) {
                medias.push({
                    url: vData.url,
                    type: 'video',
                    label: 'DOWNLOAD VIDEO (HD)',
                    extension: 'mp4'
                });
                
                // Update Metadata jika tersedia
                if (vData.title) title = vData.title;
                if (vData.thumbnail) thumbnail = vData.thumbnail;
                if (vData.author) author = vData.author;
            } else if (typeof vData === 'string' && vData.startsWith('http')) {
                 // Jika API return string URL langsung
                 medias.push({
                    url: vData,
                    type: 'video',
                    label: 'DOWNLOAD VIDEO (HD)',
                    extension: 'mp4'
                });
            }
        } else {
            console.error("[YT] Video Fetch Failed:", videoRes.reason?.message);
        }

        // 2. Proses Audio
        if (audioRes.status === 'fulfilled' && audioRes.value.data) {
             const aData = audioRes.value.data;
             if (aData.url) {
                medias.push({
                    url: aData.url,
                    type: 'audio',
                    label: 'DOWNLOAD MP3',
                    extension: 'mp3'
                });
             } else if (typeof aData === 'string' && aData.startsWith('http')) {
                 medias.push({
                    url: aData,
                    type: 'audio',
                    label: 'DOWNLOAD MP3',
                    extension: 'mp3'
                });
            }
        } else {
             console.error("[YT] Audio Fetch Failed:", audioRes.reason?.message);
        }

        if (medias.length === 0) {
            throw new Error("Gagal mendapatkan link download dari server.");
        }

        return {
            title,
            thumbnail,
            author,
            medias
        };

    } catch (error) {
        console.error("[YT Service Error]:", error.message);
        throw new Error("Gagal mengambil data YouTube. Coba lagi nanti.");
    }
}

export { fetchYouTubeData };