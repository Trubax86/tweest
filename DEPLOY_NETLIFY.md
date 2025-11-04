# 🚀 Deploy TWEEST Web su Netlify

## 📋 Prerequisiti

1. Account Netlify (gratuito): https://netlify.com
2. Git installato
3. Netlify CLI (opzionale): `npm install -g netlify-cli`

---

## 🎯 Metodo 1: Deploy da GitHub (CONSIGLIATO)

### 1. Crea Repository GitHub

```bash
cd TweestWeb
git init
git add .
git commit -m "Initial commit - TWEEST Web"
git branch -M main
git remote add origin https://github.com/TUO_USERNAME/tweest-web.git
git push -u origin main
```

### 2. Connetti a Netlify

1. Vai su https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Scegli **GitHub** e autorizza
4. Seleziona il repository `tweest-web`
5. Configurazione build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`
6. Click **"Deploy site"**

### 3. Configura Variabili Ambiente (Opzionale)

1. Site settings → Environment variables
2. Aggiungi:
   - `CB01_BASE` = `https://cb01.makeup` (o dominio CB01 corrente)

---

## 🎯 Metodo 2: Deploy con Netlify CLI

### 1. Installa Netlify CLI

```bash
npm install -g netlify-cli
```

### 2. Login

```bash
netlify login
```

### 3. Build del progetto

```bash
npm run build
```

### 4. Deploy

**Deploy di test:**
```bash
netlify deploy
```

**Deploy in produzione:**
```bash
netlify deploy --prod
```

---

## 🎯 Metodo 3: Deploy Drag & Drop

### 1. Build locale

```bash
npm run build
```

### 2. Deploy manuale

1. Vai su https://app.netlify.com/drop
2. Trascina la cartella `dist` nella pagina
3. Attendi il deploy

**⚠️ NOTA:** Con questo metodo le Functions NON funzioneranno! Usa Metodo 1 o 2.

---

## 🔧 Configurazione Netlify

Il file `netlify.toml` è già configurato:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

---

## 📱 Netlify Functions (Serverless API)

Le API sono implementate come Netlify Functions:

```
netlify/functions/
├── movies.js          → GET /api/movies
├── series.js          → GET /api/series
├── search.js          → GET /api/search
├── streaming-link.js  → GET /api/streaming-link
└── package.json       → Dipendenze functions
```

### Come funzionano:

```
https://tweest.netlify.app/api/movies
         ↓
/.netlify/functions/movies
         ↓
Netlify Function esegue scraping CB01
         ↓
Ritorna JSON
```

---

## 🌐 URL Produzione

Dopo il deploy, il tuo sito sarà disponibile su:

```
https://NOME-SITO.netlify.app
```

Puoi personalizzare il dominio:
1. Site settings → Domain management
2. Add custom domain

---

## 📱 Configurazione App Mobile

Dopo il deploy, aggiorna l'app mobile con l'URL Netlify:

```javascript
// Prima (locale)
const API_BASE_URL = 'http://192.168.1.100:3001';

// Dopo (produzione)
const API_BASE_URL = 'https://tweest.netlify.app';
```

---

## 🔍 Test API Produzione

```bash
# Movies
curl https://tweest.netlify.app/api/movies?count=10

# Series
curl https://tweest.netlify.app/api/series?count=10

# Search
curl https://tweest.netlify.app/api/search?q=batman

# Streaming link
curl "https://tweest.netlify.app/api/streaming-link?url=https://cb01.../film/..."
```

---

## 🛠️ Troubleshooting

### ❌ "Build failed"

**Problema:** Errori durante build
**Soluzione:**
```bash
# Test build locale
npm run build

# Verifica errori
npm run lint
```

### ❌ "Function invocation failed"

**Problema:** Netlify Function non funziona
**Soluzione:**
1. Verifica `netlify.toml` presente
2. Verifica `netlify/functions/package.json` presente
3. Check logs: Site → Functions → View logs

### ❌ "CORS error"

**Problema:** Errori CORS dall'app mobile
**Soluzione:** Headers CORS già configurati in `netlify.toml` e nelle functions

### ❌ "CB01 scraping failed"

**Problema:** CB01 ha cambiato dominio
**Soluzione:**
1. Site settings → Environment variables
2. Aggiorna `CB01_BASE` con nuovo dominio
3. Redeploy

---

## 📊 Limiti Netlify Free Tier

- ✅ 100 GB bandwidth/mese
- ✅ 125,000 function requests/mese
- ✅ 300 build minutes/mese
- ✅ Deploy illimitati
- ✅ HTTPS automatico
- ✅ CDN globale

**Più che sufficiente per uso personale!**

---

## 🔄 Aggiornamenti Automatici

Con GitHub + Netlify:

1. Fai modifiche al codice
2. Commit e push:
   ```bash
   git add .
   git commit -m "Update"
   git push
   ```
3. Netlify **rebuilda automaticamente**! 🎉

---

## 🎨 Custom Domain (Opzionale)

### Con dominio proprio:

1. Acquista dominio (es: namecheap.com)
2. Netlify → Domain settings → Add custom domain
3. Configura DNS:
   ```
   Type: A
   Name: @
   Value: 75.2.60.5
   
   Type: CNAME
   Name: www
   Value: NOME-SITO.netlify.app
   ```
4. Attendi propagazione DNS (24-48h)

---

## 📈 Monitoraggio

### Analytics Netlify:

1. Site → Analytics
2. Vedi:
   - Visite
   - Bandwidth
   - Function calls
   - Build time

### Logs Functions:

1. Site → Functions
2. Click su function
3. View logs in tempo reale

---

## 🔐 Sicurezza

### Environment Variables:

Per API keys o secrets:

1. Site settings → Environment variables
2. Add variable
3. Usa in function:
   ```javascript
   const API_KEY = process.env.API_KEY;
   ```

### Rate Limiting:

Netlify ha rate limiting automatico per proteggere le functions.

---

## ✅ Checklist Deploy

- [ ] `netlify.toml` presente
- [ ] `netlify/functions/` creata
- [ ] `package.json` functions presente
- [ ] Build locale funziona (`npm run build`)
- [ ] Repository GitHub creato
- [ ] Sito connesso a Netlify
- [ ] Deploy completato
- [ ] API testate in produzione
- [ ] App mobile aggiornata con URL produzione

---

## 🚀 Deploy Completato!

Il tuo sito TWEEST Web è ora:
- ✅ **Online 24/7**
- ✅ **HTTPS automatico**
- ✅ **CDN globale**
- ✅ **API serverless**
- ✅ **Deploy automatici**
- ✅ **Gratis!**

**URL:** `https://NOME-SITO.netlify.app`

---

**🎬 TWEEST Web deployato con successo! ✨**
