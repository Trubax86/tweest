# 🌐 TWEEST WEB - Configurazione Dominio CB01

## 📋 Panoramica

Sistema di configurazione per gestire il dominio CB01 senza dover aggiornare il codice.

---

## 🎯 Funzionalità

- ✅ **Dominio personalizzabile** via interfaccia web
- ✅ **Configurazione persistente** salvata in `cb01-config.json`
- ✅ **Dominio default** `https://cb01net.online`
- ✅ **Riavvio server** automatico su Windows con script batch

---

## 🚀 Come Usare

### **1. Accedi alla Configurazione**

Apri nel browser:
```
http://localhost:3001/config.html
```

Oppure clicca sul pulsante **⚙️** nell'header di TWEEST Web.

---

### **2. Modifica il Dominio**

1. Inserisci il nuovo dominio CB01 (es: `https://cb01net.online`)
2. Click su **"💾 Salva Dominio"**
3. Vedrai conferma di salvataggio

---

### **3. Riavvia il Server**

#### **Su Windows:**

**Opzione A - Script Auto-Restart (CONSIGLIATO):**
```bash
cd TweestWeb
restart-server.bat
```
✅ **Vantaggi:**
- Killa automaticamente Node.js
- Riavvia con auto-restart
- Nessun errore porta occupata

**Opzione B - Server con Auto-Restart:**
```bash
cd TweestWeb
start-server-watch.bat
```
✅ **Vantaggi:**
- Riavvio automatico su crash
- Monitoraggio continuo
- Ctrl+C per fermare

**Opzione C - Manuale:**
1. Chiudi il terminale Node.js (o premi `Ctrl+C`)
2. Riavvia con: `node api/server.js`

#### **Su Linux/Mac:**
```bash
# Nel terminale del server
Ctrl+C  # Ferma il server

# Riavvia
node api/server.js
```

---

## 📁 File Coinvolti

### **Backend (Node.js):**
- `api/server.js` - Server con gestione configurazione
- `api/cb01-config.json` - File configurazione dominio
- `restart-server.bat` - Script riavvio Windows

### **Frontend (React):**
- `config.html` - Pagina configurazione standalone
- `src/App.tsx` - Pulsante ⚙️ nell'header
- `src/App.css` - Stile pulsante opzioni

---

## 🔧 API Endpoints

### **GET /api/config/dominio**
Ottieni dominio CB01 corrente.

**Response:**
```json
{
  "success": true,
  "dominio": "https://cb01net.online"
}
```

---

### **POST /api/config/dominio**
Imposta nuovo dominio CB01.

**Request:**
```json
{
  "dominio": "https://cb01net.online"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dominio salvato! Riavvia il server per applicare le modifiche.",
  "dominio": "https://cb01net.online",
  "requiresRestart": true
}
```

---

## ⚠️ Note Importanti

1. **Il server DEVE essere riavviato** dopo aver cambiato il dominio
2. **Su Windows**, usa `restart-server.bat` per evitare errori di porta occupata
3. **Il dominio deve iniziare** con `http://` o `https://`
4. **Configurazione persistente** - sopravvive ai riavvii

---

## 🎬 Workflow Tipico

```
1. CB01 cambia dominio
   ↓
2. Apri http://localhost:3001/config.html
   ↓
3. Inserisci nuovo dominio
   ↓
4. Salva
   ↓
5. Esegui restart-server.bat (Windows)
   ↓
6. TWEEST funziona con nuovo dominio! ✅
```

---

## 🐛 Troubleshooting

### **Errore 500 dopo cambio dominio**
→ **Soluzione:** Riavvia il server! Il dominio viene caricato solo all'avvio.

### **Script restart-server.bat non funziona**
→ **Soluzione:** Esegui come amministratore o chiudi manualmente Node.js.

### **Configurazione non salvata**
→ **Soluzione:** Verifica permessi scrittura nella cartella `TweestWeb/api/`.

---

## 📞 Supporto

Per problemi o domande, controlla i log del server:
```bash
node api/server.js
```

I log mostreranno:
- `🌐 [Config] Dominio CB01: ...` - Dominio caricato
- `✅ [Config] Dominio salvato: ...` - Salvataggio riuscito
- `❌ [Config] Errore: ...` - Errori di configurazione
