import axios from "axios";

async function fetchInstagram(url) {
  // 1. Validasi URL Basic
  if (!url.includes("instagram.com")) {
    throw new Error("URL tidak valid. Harap masukkan link Instagram yang benar.");
  }

  try {
    console.log("[IG] Menggunakan Gimita API untuk:", url);

    // 2. Request ke API Gimita
    const apiUrl = `https://api.gimita.id/api/downloader/instagram?url=${encodeURIComponent(url)}`;
    
    const response = await axios.get(apiUrl, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        timeout: 15000 // Batas waktu 15 detik
    });

    const result = response.data;

    // 3. Cek Error dari API
    if (!result.success || !result.data || result.data.length === 0) {
        throw new Error("API tidak menemukan media (Mungkin akun Private).");
    }

    // 4. Parsing Data
    const mediaItem = result.data[0];
    const isVideo = mediaItem.type === 'mp4' || mediaItem.ext === 'mp4';
    
    // --- UPDATE THUMBNAIL ---
    // Gunakan Logo Instagram Official yang HD
    const defaultThumbnail = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png";

    // 5. Return Format XiaStore
    return {
        title: "Instagram Content",
        author: "Instagram User", 
        thumbnail: defaultThumbnail, 
        medias: [
            {
                url: mediaItem.url,
                type: isVideo ? 'video' : 'image',
                label: isVideo ? 'DOWNLOAD VIDEO' : 'DOWNLOAD IMAGE',
                extension: mediaItem.ext || (isVideo ? 'mp4' : 'jpg')
            }
        ]
    };

  } catch (error) {
    console.error("[IG Service Error]:", error.message);
    throw new Error(error.response?.data?.message || "Gagal mengambil data dari API.");
  }
}

export { fetchInstagram  };