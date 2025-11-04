/**
 * 🎬 TWEEST WEB API - Scraping CB01 + Proxy per Mobile
 * Funziona nel browser E come backend per app mobile
 */

import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS per app mobile
app.use(cors());
app.use(express.json());

// 📁 SERVE FILE STATICI (config.html, etc.)
app.use(express.static(path.join(__dirname, '..')));

// 🌐 CARICA DOMINIO CB01 DA CONFIGURAZIONE
const CONFIG_FILE = path.join(__dirname, 'cb01-config.json');
const DEFAULT_DOMINIO = 'https://cb01net.online';

function loadDominio() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      console.log(`🌐 [Config] Dominio CB01: ${config.dominio}`);
      return config.dominio;
    }
  } catch (err) {
    console.error(`❌ [Config] Errore lettura: ${err.message}`);
  }
  console.log(`🌐 [Config] Uso dominio default: ${DEFAULT_DOMINIO}`);
  return DEFAULT_DOMINIO;
}

function saveDominio(dominio) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ dominio }, null, 2));
    console.log(`✅ [Config] Dominio salvato: ${dominio}`);
    return true;
  } catch (err) {
    console.error(`❌ [Config] Errore salvataggio: ${err.message}`);
    return false;
  }
}

let CB01_BASE = loadDominio();

/**
 * 🎬 GET /api/movies - Ultimi film CB01
 */
app.get('/api/movies', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 30;
    console.log(`[API] Richiesta ${count} film da CB01...`);

    const { data } = await axios.get(`${CB01_BASE}/film/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const movies = [];

    // CB01 usa h3/a per i titoli + .card per le immagini
    $('h3 a[href]').each((i, el) => {
      if (movies.length >= count) return false;

      const $link = $(el);
      const url = $link.attr('href') || '';
      
      if (!url || !url.includes('cb01')) return;

      const title = $link.text().trim().replace(/\[HD\]|\[4K\]|\[ITA\]/gi, '').trim();
      
      // CB01 usa .card (non article!) - STRUTTURA REALE ANALIZZATA
      const $card = $link.closest('.card, article, .post, .item');
      let thumbnail = '';
      
      if ($card.length) {
        const $img = $card.find('img').first();
        // CB01 usa src diretto (non lazy loading!)
        thumbnail = $img.attr('src') || 
                   $img.attr('data-lazy-src') || 
                   $img.attr('data-src') || '';
      }

      // Pulisci URL immagine
      if (thumbnail) {
        if (thumbnail.includes('?')) {
          thumbnail = thumbnail.split('?')[0];
        }
        // Assicurati che sia URL completo
        if (!thumbnail.startsWith('http')) {
          thumbnail = thumbnail.startsWith('/') ? `${CB01_BASE}${thumbnail}` : `${CB01_BASE}/${thumbnail}`;
        }
      }

      if (title && url) {
        movies.push({
          title,
          url: url.startsWith('http') ? url : `${CB01_BASE}${url}`,
          thumbnail: thumbnail || '',
          description: '',
          source: 'CB01',
          year: extractYear(title),
          quality: extractQuality(title)
        });
        
        // DEBUG: Log se manca thumbnail
        if (!thumbnail) {
          console.log(`[WARN] Film senza thumbnail: ${title}`);
        } else {
          console.log(`[OK] Film con thumbnail: ${title.substring(0, 30)}...`);
        }
      }
    });

    console.log(`[API] ✅ Trovati ${movies.length} film`);
    res.json({ success: true, count: movies.length, data: movies });

  } catch (error) {
    console.error('[API] ❌ Errore scraping film:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 📺 GET /api/series - Ultime serie TV CB01
 */
app.get('/api/series', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 30;
    console.log(`[API] Richiesta ${count} serie TV da CB01...`);

    const { data } = await axios.get(`${CB01_BASE}/serietv/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const series = [];

    // CB01 usa h3/a per i titoli + .card per le immagini
    $('h3 a[href]').each((i, el) => {
      if (series.length >= count) return false;

      const $link = $(el);
      const url = $link.attr('href') || '';
      
      if (!url || !url.includes('cb01')) return;

      const title = $link.text().trim().replace(/\[HD\]|\[4K\]|\[ITA\]/gi, '').trim();
      
      // CB01 usa .card (non article!) - STRUTTURA REALE ANALIZZATA
      const $card = $link.closest('.card, article, .post, .item');
      let thumbnail = '';
      
      if ($card.length) {
        const $img = $card.find('img').first();
        // CB01 usa src diretto (non lazy loading!)
        thumbnail = $img.attr('src') || 
                   $img.attr('data-lazy-src') || 
                   $img.attr('data-src') || '';
      }

      // Pulisci URL immagine
      if (thumbnail) {
        if (thumbnail.includes('?')) {
          thumbnail = thumbnail.split('?')[0];
        }
        // Assicurati che sia URL completo
        if (!thumbnail.startsWith('http')) {
          thumbnail = thumbnail.startsWith('/') ? `${CB01_BASE}${thumbnail}` : `${CB01_BASE}/${thumbnail}`;
        }
      }

      if (title && url) {
        series.push({
          title,
          url,
          thumbnail: thumbnail || '',
          description: '',
          source: 'CB01 Serie',
          year: extractYear(title),
          quality: extractQuality(title)
        });
        
        // DEBUG: Log se manca thumbnail
        if (!thumbnail) {
          console.log(`[WARN] Serie senza thumbnail: ${title}`);
        } else {
          console.log(`[OK] Serie con thumbnail: ${title.substring(0, 30)}...`);
        }
      }
    });

    console.log(`[API] ✅ Trovate ${series.length} serie TV`);
    res.json({ success: true, count: series.length, data: series });

  } catch (error) {
    console.error('[API] ❌ Errore scraping serie:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 📺 GET /api/episodes - Episodi serie TV
 */
app.get('/api/episodes', async (req, res) => {
  try {
    const seriesUrl = req.query.url;
    if (!seriesUrl) {
      return res.status(400).json({ success: false, error: 'URL mancante' });
    }

    console.log(`[API] Caricamento episodi da: ${seriesUrl}`);

    const { data } = await axios.get(seriesUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const seasonsDict = {};

    $('a[href]').each((i, el) => {
      const $link = $(el);
      const linkUrl = $link.attr('href') || '';

      if (!linkUrl.includes('stayonline.pro') && 
          !linkUrl.includes('uprot.net') && 
          !linkUrl.includes('swzz.xyz')) {
        return;
      }

      const parent = $link.parent();
      const fullText = parent.text();
      
      const episodeMatch = fullText.match(/(\d+)[×x](\d+)/);
      if (!episodeMatch) return;

      const seasonNum = parseInt(episodeMatch[1]);
      const epNumber = parseInt(episodeMatch[2]);

      let provider = 'Streaming';
      if (linkUrl.includes('uprot.net')) provider = 'Maxstream';
      else if (linkUrl.includes('stayonline.pro')) provider = 'Mixdrop';
      else if (linkUrl.includes('swzz.xyz')) provider = 'Filestore';

      if (!seasonsDict[seasonNum]) {
        seasonsDict[seasonNum] = {
          seasonNumber: seasonNum,
          episodes: []
        };
      }

      const season = seasonsDict[seasonNum];
      let episode = season.episodes.find(e => e.episodeNumber === epNumber);
      
      if (!episode) {
        episode = {
          seasonNumber: seasonNum,
          episodeNumber: epNumber,
          links: []
        };
        season.episodes.push(episode);
      }

      episode.links.push({
        provider,
        url: linkUrl,
        quality: 'HD'
      });
    });

    const seasons = Object.values(seasonsDict).sort((a, b) => a.seasonNumber - b.seasonNumber);
    
    console.log(`[API] ✅ Trovate ${seasons.length} stagioni`);
    res.json({ success: true, count: seasons.length, data: seasons });

  } catch (error) {
    console.error('[API] ❌ Errore caricamento episodi:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 🔍 GET /api/search - Ricerca contenuti
 */
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query mancante' });
    }

    console.log(`[API] Ricerca: ${query}`);

    const { data } = await axios.get(`${CB01_BASE}/?s=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const results = [];

    // CB01 usa h3/a per i titoli + .card per le immagini
    $('h3 a[href]').each((i, el) => {
      const $link = $(el);
      const url = $link.attr('href') || '';
      
      if (!url || !url.includes('cb01')) return;

      const title = $link.text().trim().replace(/\[HD\]|\[4K\]|\[ITA\]/gi, '').trim();
      
      // CB01 usa .card (non article!) - STRUTTURA REALE ANALIZZATA
      const $card = $link.closest('.card, article, .post, .item');
      let thumbnail = '';
      
      if ($card.length) {
        const $img = $card.find('img').first();
        // CB01 usa src diretto (non lazy loading!)
        thumbnail = $img.attr('src') || 
                   $img.attr('data-lazy-src') || 
                   $img.attr('data-src') || '';
      }

      // Pulisci URL immagine
      if (thumbnail) {
        if (thumbnail.includes('?')) {
          thumbnail = thumbnail.split('?')[0];
        }
        // Assicurati che sia URL completo
        if (!thumbnail.startsWith('http')) {
          thumbnail = thumbnail.startsWith('/') ? `${CB01_BASE}${thumbnail}` : `${CB01_BASE}/${thumbnail}`;
        }
      }

      const isSeries = url.includes('/serietv/') || url.includes('/serie-tv/');

      if (title && url) {
        results.push({
          title,
          url: url.startsWith('http') ? url : `${CB01_BASE}${url}`,
          thumbnail: thumbnail || '',
          description: '',
          source: isSeries ? 'CB01 Serie' : 'CB01',
          year: extractYear(title),
          quality: extractQuality(title)
        });
        
        // DEBUG: Log se manca thumbnail
        if (!thumbnail) {
          console.log(`[WARN] Nessuna thumbnail per serie: ${title}`);
        }
      }
    });

    console.log(`[API] ✅ Trovati ${results.length} risultati`);
    res.json({ success: true, count: results.length, data: results });

  } catch (error) {
    console.error('[API] ❌ Errore ricerca:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 🛡️ GET /api/proxy - Proxy con blocco pubblicità integrato
 */
app.get('/api/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({ success: false, error: 'URL mancante' });
    }

    console.log(`[PROXY] Caricamento con blocco ads: ${targetUrl}`);

    // Carica la pagina
    const { data } = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    // INIETTA SCRIPT BLOCCO PUBBLICITÀ NELLA PAGINA
    const blockScript = `
      <script>
        console.log('🛡️ [TWEEST PROXY] Script blocco pubblicità attivo');
        
        // BLOCCA TUTTI I POPUP
        window.open = function() {
          console.log('🛡️ [TWEEST] Popup bloccato');
          return null;
        };
        
        // BLOCCA REDIRECT
        const originalLocation = window.location;
        Object.defineProperty(window, 'location', {
          get: () => originalLocation,
          set: (value) => {
            const url = value.toString().toLowerCase();
            const blockedDomains = [
              'fragpunk', 'bethall', 'opera.com', 'aliexpress', 'tracking',
              'ads.', 'promo', 'offer', 'clickid=', 'campaign=', 'banner='
            ];
            
            if (blockedDomains.some(d => url.includes(d))) {
              console.log('🛡️ [TWEEST] Redirect bloccato:', url);
              return;
            }
            originalLocation.href = value;
          }
        });
        
        // BLOCCA CLICK SU LINK PUBBLICITARI
        document.addEventListener('click', (e) => {
          const target = e.target.closest('a');
          if (!target) return;
          
          const href = (target.href || '').toLowerCase();
          const blockedDomains = [
            'fragpunk', 'bethall', 'opera.com', 'aliexpress', 'goldveils',
            'playonlinepcgames', 'videosearchpro', 'prmtracking',
            'tracking.', 'ads.', 'promo', 'offer', 'captcha',
            'clickid=', 'campaign=', 'banner=', 'zone=', '/lp/',
            'affiliate', 'aff_', 'download', 'install', 'dating'
          ];
          
          if (blockedDomains.some(d => href.includes(d))) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🛡️ [TWEEST] Click bloccato:', href);
            return false;
          }
        }, true);
        
        // RIMUOVI ELEMENTI PUBBLICITARI DAL DOM
        setInterval(() => {
          const adSelectors = [
            'iframe[src*="ads"]', 'iframe[src*="doubleclick"]',
            'div[id*="ad-"]', 'div[class*="advertisement"]',
            'div[class*="banner"]', 'div[id*="popup"]'
          ];
          
          adSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
              el.remove();
              console.log('🛡️ [TWEEST] Elemento pubblicitario rimosso');
            });
          });
        }, 1000);
      </script>
    `;

    // Inietta lo script prima della chiusura </head> o </body>
    let modifiedHtml = data;
    if (modifiedHtml.includes('</head>')) {
      modifiedHtml = modifiedHtml.replace('</head>', blockScript + '</head>');
    } else if (modifiedHtml.includes('</body>')) {
      modifiedHtml = modifiedHtml.replace('</body>', blockScript + '</body>');
    } else {
      modifiedHtml = blockScript + modifiedHtml;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(modifiedHtml);
    console.log(`[PROXY] ✅ Pagina caricata con protezione ads`);

  } catch (error) {
    console.error('[PROXY] ❌ Errore:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 🎬 GET /api/streaming-link - Estrai link streaming da pagina CB01
 */
app.get('/api/streaming-link', async (req, res) => {
  try {
    const pageUrl = req.query.url;
    if (!pageUrl) {
      return res.status(400).json({ success: false, error: 'URL mancante' });
    }

    console.log(`[API] Estrazione link streaming da: ${pageUrl}`);

    const { data } = await axios.get(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    
    // Cerca link streaming (Mixdrop, Streamtape, etc.)
    let streamingLink = '';
    
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href') || '';
      
      // Provider supportati
      if (href.includes('mixdrop.') || 
          href.includes('streamtape.') || 
          href.includes('supervideo.') ||
          href.includes('streamingcommunity.') ||
          href.includes('stayonline.pro') ||
          href.includes('uprot.net') ||
          href.includes('swzz.xyz')) {
        streamingLink = href;
        return false; // break
      }
    });

    if (streamingLink) {
      console.log(`[API] ✅ Link streaming trovato: ${streamingLink.substring(0, 50)}...`);
      res.json({ success: true, url: streamingLink });
    } else {
      console.log(`[API] ❌ Nessun link streaming trovato`);
      res.json({ success: false, error: 'Nessun link streaming trovato' });
    }

  } catch (error) {
    console.error('[API] ❌ Errore estrazione link:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 🌐 GET /api/config/dominio - Ottieni dominio CB01 corrente
 */
app.get('/api/config/dominio', (req, res) => {
  res.json({ success: true, dominio: CB01_BASE });
});

/**
 * 🌐 POST /api/config/dominio - Imposta nuovo dominio CB01
 */
app.post('/api/config/dominio', (req, res) => {
  const { dominio } = req.body;
  
  if (!dominio || (!dominio.startsWith('http://') && !dominio.startsWith('https://'))) {
    return res.status(400).json({ 
      success: false, 
      error: 'Dominio non valido. Deve iniziare con http:// o https://' 
    });
  }
  
  if (saveDominio(dominio)) {
    CB01_BASE = dominio;
    res.json({ 
      success: true, 
      message: 'Dominio salvato! Riavvia il server per applicare le modifiche.',
      dominio: CB01_BASE,
      requiresRestart: true
    });
  } else {
    res.status(500).json({ success: false, error: 'Errore salvataggio configurazione' });
  }
});

// UTILITY FUNCTIONS
function extractYear(title) {
  const match = title.match(/\((\d{4})\)/);
  return match ? match[1] : '';
}

function extractQuality(title) {
  if (title.includes('[4K]')) return '4K';
  if (title.includes('[HD]')) return 'HD';
  return 'SD';
}

/**
 * 📱 GET /api/mobile/home - Contenuti home per app mobile
 */
app.get('/api/mobile/home', async (req, res) => {
  try {
    console.log('[MOBILE] Richiesta contenuti home');
    
    // Carica film e serie in parallelo
    const [movies, series] = await Promise.all([
      axios.get(`http://localhost:${PORT}/api/movies?count=20`).then(r => r.data.data).catch(() => []),
      axios.get(`http://localhost:${PORT}/api/series?count=20`).then(r => r.data.data).catch(() => [])
    ]);
    
    res.json({
      success: true,
      data: {
        hero: movies[0] || null,
        movies: movies.slice(1, 11),
        series: series.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('[MOBILE] Errore:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 📱 GET /api/mobile/search - Ricerca per app mobile
 */
app.get('/api/mobile/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query mancante' });
    }
    
    console.log(`[MOBILE] Ricerca: ${query}`);
    
    const results = await axios.get(`http://localhost:${PORT}/api/search?q=${encodeURIComponent(query)}`)
      .then(r => r.data.data)
      .catch(() => []);
    
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('[MOBILE] Errore ricerca:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 📱 GET /api/mobile/categories - Categorie per app mobile
 */
app.get('/api/mobile/categories', async (req, res) => {
  try {
    const category = req.query.type || 'movies';
    const count = parseInt(req.query.count) || 30;
    
    console.log(`[MOBILE] Categoria: ${category}`);
    
    let endpoint = category === 'series' ? '/api/series' : '/api/movies';
    const results = await axios.get(`http://localhost:${PORT}${endpoint}?count=${count}`)
      .then(r => r.data.data)
      .catch(() => []);
    
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('[MOBILE] Errore categoria:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// START SERVER
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   🎬 TWEEST WEB API                   ║
║   Port: ${PORT}                          ║
║   Status: ✅ RUNNING                   ║
╚═══════════════════════════════════════╝

API Endpoints:
  GET  /api/movies?count=30
  GET  /api/series?count=30
  GET  /api/episodes?url=...
  GET  /api/search?q=...
  GET  /api/streaming-link?url=...
  GET  /api/proxy?url=...
  GET  /api/config/dominio
  POST /api/config/dominio
  GET  /health

📱 Mobile API:
  GET  /api/mobile/home
  GET  /api/mobile/search?q=...
  GET  /api/mobile/categories?type=movies|series
  
Static Files:
  GET  /config.html - Configurazione CB01
  
🚀 Server pronto per app mobile!
  `);
});
