import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { cors } from 'hono/cors';

// Import Services
import * as tiktokService from '../services/tiktokService.js';
import * as youtubeService from '../services/youtubeService.js';
import * as snapchatService from '../services/snapchatService.js';
import * as twitterService from '../services/twitterService.js';
import * as spotifyService from '../services/spotifyService.js';
import * as instagramService from '../services/instagramService.js';
import * as facebookService from '../services/facebookService.js';
import * as soundcloudService from '../services/soundcloudService.js';
import * as linkedinService from '../services/linkedinService.js';
import * as pinterestService from '../services/pinterestService.js';
import * as tumblrService from '../services/tumblrService.js';
import * as douyinService from '../services/douyinService.js';
import * as kuaishouService from '../services/kuaishouService.js';
import * as capcutService from '../services/capcutService.js';
import * as dailymotionService from '../services/dailymotionService.js';
import * as blueskyService from '../services/blueskyService.js';

const app = new Hono().basePath('/api');

app.use('/*', cors());

const services = {
    tiktok: tiktokService,
    youtube: youtubeService,
    snapchat: snapchatService,
    twitter: twitterService,
    spotify: spotifyService,
    instagram: instagramService,
    facebook: facebookService,
    soundcloud: soundcloudService,
    linkedin: linkedinService,
    pinterest: pinterestService,
    tumblr: tumblrService,
    douyin: douyinService,
    kuaishou: kuaishouService,
    capcut: capcutService,
    dailymotion: dailymotionService,
    bluesky: blueskyService,
};

app.post('/:platform', async (c) => {
    const platform = c.req.param('platform');
    
    // Parse JSON body safely
    let body;
    try {
        body = await c.req.json();
    } catch (e) {
        return c.json({ error: "Invalid JSON body" }, 400);
    }
    
    const { url } = body;

    console.log(`[SERVER] Request masuk ke: ${platform}`);

    const serviceModule = services[platform];
    if (!serviceModule) {
        return c.json({ error: `Service '${platform}' belum tersedia.` }, 404);
    }

    try {
        // Find the exported function
        const functionName = Object.keys(serviceModule).find(key => typeof serviceModule[key] === 'function');

        if (!functionName) {
            throw new Error(`Tidak ada fungsi export di service ${platform}`);
        }

        console.log(`[SERVER] Menjalankan fungsi '${functionName}'...`);
        
        const data = await serviceModule[functionName](url);
        return c.json(data);

    } catch (error) {
        console.error(`[ERROR]`, error.message);
        return c.json({ error: "Gagal memproses.", details: error.message }, 500);
    }
});

app.get('/', (c) => c.text('XIASTORE ENGINE READY 🚀'));

export const onRequest = handle(app);