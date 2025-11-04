# 📱 TWEEST Mobile App - Guida Connessione

## 🚀 Setup Server

### 1. Avvia il server TWEEST Web
```bash
cd TweestWeb
npm start
```

Il server sarà disponibile su: `http://localhost:3001`

---

## 📱 Configurazione App Mobile

### 2. Trova l'IP del tuo PC

**Windows:**
```bash
ipconfig
```
Cerca "Indirizzo IPv4" (es: `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
```
Cerca "inet" (es: `192.168.1.100`)

### 3. Configura l'app mobile

Nell'app React Native, modifica il file di configurazione con il tuo IP:

```javascript
// config.js o simile
const API_BASE_URL = 'http://192.168.1.100:3001';
```

---

## 🔌 API Endpoints Disponibili

### **Home Page**
```
GET /api/mobile/home
```
**Response:**
```json
{
  "success": true,
  "data": {
    "hero": { "title": "...", "thumbnail": "...", "url": "..." },
    "movies": [...],
    "series": [...]
  }
}
```

### **Ricerca**
```
GET /api/mobile/search?q=breaking+bad
```
**Response:**
```json
{
  "success": true,
  "data": [
    { "title": "...", "thumbnail": "...", "url": "..." }
  ]
}
```

### **Categorie**
```
GET /api/mobile/categories?type=movies&count=30
GET /api/mobile/categories?type=series&count=30
```
**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

### **Episodi Serie TV**
```
GET /api/episodes?url=https://cb01.../serie-tv/...
```
**Response:**
```json
{
  "success": true,
  "data": {
    "seasons": [
      {
        "seasonNumber": 1,
        "episodes": [
          {
            "episodeNumber": 1,
            "title": "...",
            "links": [
              { "quality": "HD", "url": "..." }
            ]
          }
        ]
      }
    ]
  }
}
```

### **Link Streaming**
```
GET /api/streaming-link?url=https://cb01.../film/...
```
**Response:**
```json
{
  "success": true,
  "url": "https://maxstream.video/..."
}
```

---

## 🛡️ Sicurezza

### Firewall Windows
Se l'app mobile non si connette, aggiungi eccezione firewall:

1. Pannello di controllo → Windows Defender Firewall
2. Impostazioni avanzate
3. Regole connessioni in entrata → Nuova regola
4. Porta → TCP → 3001
5. Consenti connessione

### Stessa Rete WiFi
Assicurati che PC e smartphone siano sulla **stessa rete WiFi**!

---

## 🎬 Esempio Utilizzo App Mobile

```javascript
// Carica home
const loadHome = async () => {
  const response = await fetch('http://192.168.1.100:3001/api/mobile/home');
  const data = await response.json();
  
  setHero(data.data.hero);
  setMovies(data.data.movies);
  setSeries(data.data.series);
};

// Ricerca
const search = async (query) => {
  const response = await fetch(`http://192.168.1.100:3001/api/mobile/search?q=${query}`);
  const data = await response.json();
  
  setResults(data.data);
};

// Play video
const playVideo = async (cb01Url) => {
  const response = await fetch(`http://192.168.1.100:3001/api/streaming-link?url=${cb01Url}`);
  const data = await response.json();
  
  if (data.success) {
    // Apri player con data.url
    navigation.navigate('Player', { url: data.url });
  }
};
```

---

## 🔧 Troubleshooting

### ❌ "Network request failed"
- Verifica che server sia avviato
- Controlla IP corretto
- Verifica firewall
- Stessa rete WiFi

### ❌ "CORS error"
Il server ha già CORS abilitato per tutte le origini

### ❌ "Timeout"
- Aumenta timeout nella richiesta
- Verifica connessione internet

---

## 📊 Struttura Dati

### Content Object
```typescript
interface Content {
  title: string;
  url: string;
  thumbnail: string;
  description?: string;
  year?: string;
  quality?: string;
  source: string; // "CB01" | "CB01 Serie"
}
```

### Episode Object
```typescript
interface Episode {
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  links: Array<{
    quality: string;
    url: string;
  }>;
}
```

---

## 🚀 Deploy Produzione

Per usare l'app mobile fuori dalla rete locale:

1. **Deploy su Vercel/Netlify:**
   ```bash
   cd TweestWeb
   vercel deploy
   ```

2. **Usa URL pubblico nell'app:**
   ```javascript
   const API_BASE_URL = 'https://tweest.vercel.app';
   ```

---

## ✅ Checklist Connessione

- [ ] Server avviato (`npm start`)
- [ ] IP PC trovato (`ipconfig`)
- [ ] App configurata con IP corretto
- [ ] Firewall configurato (porta 3001)
- [ ] Stessa rete WiFi
- [ ] Test endpoint: `http://IP:3001/health`

---

**🎬 TWEEST Mobile pronto per lo streaming! ✨**
