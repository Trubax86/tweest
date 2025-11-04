# 🎬 TWEEST WEB - AVVIO RAPIDO

## ✅ CORREZIONI APPLICATE

- ✅ **URL CB01 corretto**: `https://cb01net.website` (non .gallery)
- ✅ **Scraping h3/a**: Logica identica a SKYEmulator
- ✅ **Immagini lazy loading**: `data-lazy-src`, `data-src`, `src`, `data-original`
- ✅ **TMDb integrato**: Immagini HD automatiche
- ✅ **Hero section**: Rotazione automatica ogni 5s
- ✅ **Frecce scroll**: Scroll orizzontale con frecce laterali
- ✅ **Content Dialog**: Dialog dettagli Netflix-style
- ✅ **API per mobile**: Backend pronto

---

## 🚀 AVVIO IN 3 PASSI

### 1️⃣ Installa dipendenze (SOLO PRIMA VOLTA)
```bash
npm install
```

### 2️⃣ Avvia BACKEND (Terminal 1)
```bash
node api/server.js
```
**Oppure doppio click su:** `START_BACKEND.bat`

**Output atteso:**
```
╔═══════════════════════════════════════╗
║   🎬 TWEEST WEB API                   ║
║   Port: 3001                          ║
║   Status: ✅ RUNNING                   ║
╚═══════════════════════════════════════╝
```

### 3️⃣ Avvia FRONTEND (Terminal 2)
```bash
npm run dev
```
**Oppure doppio click su:** `START_FRONTEND.bat`

**Output atteso:**
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### 4️⃣ Apri browser
```
http://localhost:3000
```

---

## 🎯 COSA ASPETTARSI

### ✅ FUNZIONA:
- Hero section con backdrop HD e rotazione automatica
- Film e Serie TV con poster TMDb HD
- Frecce scroll laterali per navigazione
- Click card → Dialog dettagli completo
- Pulsante "Riproduci" → Apre CB01 in nuova tab
- Ricerca funzionante
- API pronte per app mobile

### ⚠️ NOTE:
- **Backend DEVE essere avviato** prima del frontend
- **Porta 3001** per backend API
- **Porta 3000** per frontend Vite
- Scraping CB01 può essere lento (10-15 secondi primo caricamento)

---

## 🔧 TROUBLESHOOTING

### ❌ Errore: "ECONNREFUSED localhost:3001"
**Problema:** Backend non avviato
**Soluzione:** Avvia `node api/server.js` in un terminal separato

### ❌ Errore: "500 Internal Server Error"
**Problema:** Scraping CB01 fallito
**Soluzione:** 
1. Verifica connessione internet
2. CB01 potrebbe aver cambiato struttura HTML
3. Controlla console backend per errori

### ❌ Nessuna immagine nelle card
**Problema:** TMDb non trova corrispondenze
**Soluzione:** Normale, TMDb cerca per titolo pulito. CB01 fornisce thumbnail fallback.

### ❌ "npm install" fallisce
**Problema:** Node.js non installato o versione vecchia
**Soluzione:** Installa Node.js 18+ da https://nodejs.org

---

## 📡 API DISPONIBILI

### Per App Mobile:

```bash
# Film
GET http://localhost:3001/api/movies?count=30

# Serie TV
GET http://localhost:3001/api/series?count=30

# Ricerca
GET http://localhost:3001/api/search?q=breaking+bad

# Episodi serie
GET http://localhost:3001/api/episodes?url=https://...

# Health check
GET http://localhost:3001/health
```

---

## 🌐 DEPLOY PRODUZIONE

### Vercel (GRATIS):
```bash
npm install -g vercel
vercel
```

### Netlify (GRATIS):
```bash
npm run build
netlify deploy --prod
```

**Dopo deploy, aggiorna app mobile con URL pubblico!**

---

## ✅ CHECKLIST

- [ ] `npm install` completato
- [ ] Backend avviato su porta 3001
- [ ] Frontend avviato su porta 3000
- [ ] Browser aperto su http://localhost:3000
- [ ] Hero section visibile con backdrop
- [ ] Cards con immagini TMDb
- [ ] Frecce scroll funzionanti
- [ ] Dialog dettagli funzionante
- [ ] Ricerca funzionante

---

## 🎬 TWEEST WEB PRONTO!

**Frontend:** UI Netflix-style completa ✅
**Backend:** API CB01 + TMDb funzionanti ✅
**Mobile:** API pronte per integrazione ✅

**Buon streaming! 🍿**
