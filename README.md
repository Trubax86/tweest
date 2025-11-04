# 🎬 TWEEST WEB - Streaming Netflix-Style

Versione web di TWEEST con scraping CB01 + API per app mobile.

## ✨ Features

- ✅ **UI Netflix-Style** moderna e responsive
- ✅ **Scraping CB01** funzionante nel browser
- ✅ **API REST** per app mobile
- ✅ **Deploy facile** su Vercel/Netlify
- ✅ **CORS abilitato** per app mobile

---

## 🚀 Installazione

```bash
cd TweestWeb
npm install
```

---

## ▶️ Avvio Sviluppo

### Opzione 1: Solo Frontend (usa proxy Vite)
```bash
npm run dev
```
Apri: `http://localhost:3000`

### Opzione 2: Frontend + API Backend
**Terminal 1 (API):**
```bash
npm run api
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

---

## 📡 API Endpoints

### GET /api/movies?count=30
Restituisce ultimi film da CB01

**Response:**
```json
{
  "success": true,
  "count": 30,
  "data": [
    {
      "title": "Film Title",
      "url": "https://cb01.gallery/...",
      "thumbnail": "https://...",
      "source": "CB01",
      "year": "2024",
      "quality": "HD"
    }
  ]
}
```

### GET /api/series?count=30
Restituisce ultime serie TV da CB01

### GET /api/episodes?url=...
Restituisce episodi di una serie TV

### GET /api/search?q=query
Cerca contenuti su CB01

### GET /health
Health check API

---

## 🌐 Deploy su Vercel (GRATIS)

### 1. Installa Vercel CLI
```bash
npm install -g vercel
```

### 2. Deploy
```bash
vercel
```

### 3. Configura API
Vercel rileva automaticamente `/api` come serverless functions!

### 4. Ottieni URL pubblico
```
https://tweest-web.vercel.app
```

---

## 📱 Integrazione App Mobile

### Aggiorna CB01Scraper.ts nell'app mobile:

```typescript
// src/services/CB01Scraper.ts
const API_URL = 'https://tweest-web.vercel.app/api';

async getLatestMovies(count: number) {
  const response = await fetch(`${API_URL}/movies?count=${count}`);
  return response.json();
}
```

**RISULTATO:** App mobile usa TWEEST Web come backend! 🎬

---

## 🔧 Configurazione

### vite.config.ts
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
```

### api/server.js
```javascript
// CORS per app mobile
app.use(cors());

// Endpoints
app.get('/api/movies', async (req, res) => { ... });
app.get('/api/series', async (req, res) => { ... });
```

---

## 🎯 Vantaggi

### ✅ Per Web:
- Interfaccia Netflix-style moderna
- Scraping CB01 funzionante
- Deploy facile su Vercel/Netlify
- Nessun backend necessario (proxy Vite)

### ✅ Per App Mobile:
- API REST pubbliche
- Nessun backend locale necessario
- App funziona ovunque
- Deploy gratuito su Vercel

---

## 📊 Architettura

```
TweestWeb/
├── src/
│   ├── App.tsx          → UI React Netflix-style
│   ├── App.css          → Stili Netflix
│   └── main.tsx         → Entry point
├── api/
│   └── server.js        → Backend Express + Scraping
├── vite.config.ts       → Config Vite + Proxy
└── package.json         → Dependencies
```

---

## 🔒 Note Legali

⚠️ Questo progetto è solo per scopi educativi.
Lo scraping di contenuti protetti da copyright può violare le leggi locali.
Usa a tuo rischio e pericolo.

---

## 🚀 Deploy Alternatives

### Netlify (CON SERVER INTEGRATO) ⭐ CONSIGLIATO
```bash
# Metodo 1: GitHub (automatico)
git init
git add .
git commit -m "Initial commit"
git push

# Poi connetti repo su netlify.com

# Metodo 2: CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

**✅ Netlify Functions incluse!** API serverless automatiche.

📖 **Guida completa:** Vedi `DEPLOY_NETLIFY.md`

### Vercel
```bash
npm install -g vercel
vercel
```

### Railway
```bash
railway up
```

### Render
Connetti GitHub repo e deploy automatico!

---

## ✅ Checklist Deploy

- [ ] `npm install` completato
- [ ] `npm run dev` funziona localmente
- [ ] API testata con `curl http://localhost:3001/health`
- [ ] Deploy su Vercel/Netlify
- [ ] URL pubblico ottenuto
- [ ] App mobile aggiornata con nuovo URL
- [ ] Test completo funzionante

---

## 🎬 TWEEST Web è pronto!

**Frontend:** UI Netflix-style moderna
**Backend:** API REST con scraping CB01
**Deploy:** Vercel/Netlify gratuito
**Mobile:** Integrazione completa

**L'app mobile ora funziona OVUNQUE! 🚀✨**
