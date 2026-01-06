import axios from "axios";

async function fetchFacebook(url) {
  // 1. Validasi URL Basic
  if (!url.includes("facebook.com") && !url.includes("fb.watch")) {
    throw new Error("URL tidak valid. Harap masukkan link Facebook yang benar.");
  }

  try {
    console.log("[FB] Menggunakan Gimita API untuk:", url);

    // 2. Request ke API Gimita
    const apiUrl = `https://api.gimita.id/api/downloader/facebook?url=${encodeURIComponent(url)}`;
    
    const response = await axios.get(apiUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        timeout: 20000
    });

    const result = response.data;

    // 3. Cek Error/Validasi Data
    if (!result.success || !result.data) {
        throw new Error("Gagal mengambil data. Pastikan video bersifat Publik.");
    }

    const data = result.data;
    const downloadLinks = [];

    // 4. Parsing Kualitas (HD & SD)
    if (data.all_qualities && Array.isArray(data.all_qualities)) {
        data.all_qualities.forEach(item => {
            downloadLinks.push({
                url: item.url,
                type: 'video',
                label: `Download ${item.resolution}` 
            });
        });
    } else if (data.best_url) {
        downloadLinks.push({
            url: data.best_url,
            type: 'video',
            label: `Download Video (${data.best_quality || 'HD'})`
        });
    }

    if (downloadLinks.length === 0) {
        throw new Error("Link download tidak ditemukan.");
    }

    // --- UPDATE THUMBNAIL ---
    // Gunakan Logo Facebook Official yang HD
    const defaultThumbnail = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png";

    return {
        title: "Facebook Video Content",
        author: "Facebook User",
        thumbnail: defaultThumbnail,
        medias: downloadLinks
    };

  } catch (error) {
    console.error("[FB Service Error]:", error.message);
    throw new Error(error.response?.data?.message || "Gagal mengambil data dari API Facebook.");
  }
}

export { fetchFacebook  };