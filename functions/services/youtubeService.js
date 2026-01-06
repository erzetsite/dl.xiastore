import axios from "axios";

async function fetchYouTubeData(url) {
    console.log("[YT] Processing URL via Gimita:", url);

    const BASE_URL = "https://api.gimita.id/api/downloader";
    const HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };

    try {
        // Request Video (720p) & Audio (192kbps) Paralel
        const [videoRes, audioRes] = await Promise.allSettled([
            axios.get(`${BASE_URL}/ytmp4`, { 
                params: { url: url, resolution: 720 },
                headers: HEADERS,
                timeout: 20000 
            }),
            axios.get(`${BASE_URL}/ytmp3`, { 
                params: { url: url, quality: 4 },
                headers: HEADERS,
                timeout: 20000 
            })
        ]);

        let title = "YouTube Video";
        let thumbnail = "https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png";
        let author = "YouTube";
        const medias = [];

        // --- 1. PROSES VIDEO ---
        if (videoRes.status === 'fulfilled' && videoRes.value.data) {
            const res = videoRes.value.data;
            if (res.success && res.data) {
                const vData = res.data;
                
                if (vData.title) title = vData.title;
                if (vData.thumbnail) thumbnail = vData.thumbnail;
                
                if (vData.download_url) {
                    medias.push({
                        url: vData.download_url,
                        type: 'video',
                        label: `DOWNLOAD VIDEO (${vData.quality || '720p'})`,
                        extension: 'mp4'
                    });
                }
            }
        }

        // --- 2. PROSES AUDIO ---
        if (audioRes.status === 'fulfilled' && audioRes.value.data) {
            const res = audioRes.value.data;
            if (res.success && res.data) {
                const aData = res.data;
                
                if (title === "YouTube Video" && aData.title) title = aData.title;
                if (thumbnail.includes("Youtube_logo") && aData.thumbnail) thumbnail = aData.thumbnail;

                if (aData.download_url) {
                    medias.push({
                        url: aData.download_url,
                        type: 'audio',
                        label: 'DOWNLOAD MP3',
                        extension: 'mp3'
                    });
                }
            }
        }

        if (medias.length === 0) {
            // Jika Gimita gagal, kita bisa kasih pesan yang lebih informatif atau lempar error
            throw new Error("Gagal mendapatkan link download. API Gimita mungkin sedang limit.");
        }

        return {
            title,
            thumbnail,
            author,
            medias
        };

    } catch (error) {
        console.error("[YT Service Error]:", error.message);
        throw new Error(error.message || "Gagal mengambil data YouTube.");
    }
}

export { fetchYouTubeData };