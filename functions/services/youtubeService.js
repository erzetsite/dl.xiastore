import axios from "axios";

async function fetchYouTubeData(url) {
    console.log("[YT] Processing URL via Gimita Multi-Res:", url);

    const BASE_URL = "https://api.gimita.id/api/downloader";
    const HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };

    try {
        // Request Semua Resolusi & Audio secara Paralel
        const [res360, res720, res1080, resMp3] = await Promise.allSettled([
            axios.get(`${BASE_URL}/ytmp4`, { params: { url, resolution: 360 }, headers: HEADERS, timeout: 15000 }),
            axios.get(`${BASE_URL}/ytmp4`, { params: { url, resolution: 720 }, headers: HEADERS, timeout: 15000 }),
            axios.get(`${BASE_URL}/ytmp4`, { params: { url, resolution: 1080 }, headers: HEADERS, timeout: 15000 }),
            axios.get(`${BASE_URL}/ytmp3`, { params: { url, quality: 4 }, headers: HEADERS, timeout: 15000 })
        ]);

        let title = "YouTube Video";
        let thumbnail = "https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png";
        let author = "YouTube";
        const medias = [];

        // Helper untuk parse response video
        const processVideo = (res) => {
            if (res.status === 'fulfilled' && res.value.data && res.value.data.success) {
                const data = res.value.data.data;
                if (data.title && title === "YouTube Video") title = data.title;
                if (data.thumbnail && thumbnail.includes("Youtube_logo")) thumbnail = data.thumbnail;
                
                if (data.download_url) {
                    medias.push({
                        url: data.download_url,
                        type: 'video',
                        label: `VIDEO ${data.quality || 'HD'}`,
                        extension: 'mp4',
                        quality: data.quality // e.g. "720p"
                    });
                }
            }
        };

        processVideo(res1080);
        processVideo(res720);
        processVideo(res360);

        // Process MP3
        if (resMp3.status === 'fulfilled' && resMp3.value.data && resMp3.value.data.success) {
            const data = resMp3.value.data.data;
            if (data.download_url) {
                medias.push({
                    url: data.download_url,
                    type: 'audio',
                    label: 'AUDIO MP3',
                    extension: 'mp3',
                    quality: '192kbps'
                });
            }
        }

        if (medias.length === 0) {
            throw new Error("Gagal mendapatkan link download. Server sibuk.");
        }

        // Hapus duplikat URL (kadang API kasih link sama untuk resolusi beda jika source terbatas)
        const uniqueMedias = medias.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);

        return {
            title,
            thumbnail,
            author,
            medias: uniqueMedias
        };

    } catch (error) {
        console.error("[YT Service Error]:", error.message);
        throw new Error("Gagal mengambil data YouTube.");
    }
}

export { fetchYouTubeData };
