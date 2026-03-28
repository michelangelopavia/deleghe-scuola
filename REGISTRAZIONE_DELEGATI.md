# Registrazione Delegati - Self-Registration

## 🎯 Obiettivo

I genitori possono **auto-registrarsi come delegati** tramite un link semplice, senza accedere al menù dell'app principale. È perfetto per condividere via chat di classe!

---

## 📍 Come Accedere

### **Opzione 1: Dal menù dell'app** (per insegnanti/segreteria)
1. Vai a http://localhost:3000
2. Clicca su **"👤 Registrati delegato"**
3. Compila il form

### **Opzione 2: Link diretto** (per genitori)
Condividi semplicemente: **http://localhost:3000/?public=1**
- Niente menu confusionante
- Link semplice da copiare e condividere su WhatsApp, Telegram, email
- Mostra SOLO il form di registrazione, niente tab o menu

---

## 📋 Processo di Registrazione

### **Step 1: Compila i dati**
```
Nome                    → mario
Cognome                 → rossi
Nato/a a                → Palermo (OBBLIGATORIO)
Data di nascita         → 15/01/1980 (OBBLIGATORIO)
Residente a             → Palermo (OBBLIGATORIO)
Indirizzo               → Via Roma (OBBLIGATORIO)
Numero civico           → 123
Documento ID (opzionale)→ AB12345678
```

### **Step 2: Submit**
Clicca **"✅ Registra i miei dati"**

### **Step 3: Conferma**
- ✅ Messaggio di successo
- Opzione: "➕ Registra un'altra persona" (fratello, cugino, ecc.)

---

## 💾 Cosa Succede Dopo

I dati registrati:
1. Vengono salvati nel **database** (ovunque sia l'app)
2. Diventano **disponibili** nella schermata "Genera modulo"
3. I genitori possono **selezionare il delegato** dal dropdown

---

## 📱 Caso d'uso: Chat di Classe

**Chat WhatsApp della classe:**
```
Maestra: "Gentitori, per compilare le autorizzazioni al prelievo,
registratevi come delegati a questo link:

🔗 http://localhost:3000/?public=1

Inserite i vostri dati (nome, cognome, indirizzo, documento).
Dopo la registrazione potrete compilare i moduli per i vostri figli.

Grazie! 📋"
```

---

## 🔧 Implementazione Tecnica

### **File Nuovo**
- `client/src/components/RegistraDelegato.js` - Componente form
- `client/src/pages/PublicRegister.js` - Pagina pubblica semplificata
- `client/src/App.js` - Aggiunto scheda menù + routing

### **Endpoint API Usato**
```
POST /api/delegati
Body: {
  nome, cognome, nato_a, data_nascita,
  residente_a, indirizzo, numero_civico,
  doc_numero, doc_rilasciato_da, doc_data
}
```

### **Validazione**
- **Obbligatori**: nome, cognome, nato_a, data_nascita, residente_a, indirizzo
- **Opzionali**: numero_civico, doc_numero, doc_rilasciato_da, doc_data

---

## 🎨 UX Features

✅ **Salvataggio immediato** - Form semplice, niente liste complesse
✅ **Successo visualizzato** - Schermata di conferma con il nome registrato
✅ **Multi-registrazione** - "Registra un'altra persona" senza ricaricare
✅ **Responsive** - Funziona su mobile (smartphone dei genitori)
✅ **Niente confusione** - Pagina pubblica senza menù sovrabbondante

---

## 📲 URL da Condividere

```
🔗 Link Locale (dev):       http://localhost:3000/?public=1
🔗 Link Produzione:         https://autorizzazioni-scuola.railway.app/?public=1
```

Copy-paste facile per l'insegnante da mandare alla chat della classe!

---

## 🔐 Note di Sicurezza

- **Non autenticato**: Chiunque con il link può registrarsi
  - ✅ È OK per registrazione delegati (genitori della scuola)
  - Se necessario, aggiungere PIN/codice segreto
  
- **Dati sensibili**: Contengono documento d'identità
  - ✅ Salvati nel database locale
  - Raccomandazione: Usare HTTPS in produzione (Railway lo fa)

---

## 💡 Miglioramenti Futuri

- [ ] Aggiungere PIN/codice per limitare a genitori della classe
- [ ] Conferma email per il genitore (notifica avvenuta registrazione)
- [ ] Possibilità di modificare dati personali dopo registrazione
- [ ] Esportare lista delegati (PDF/CSV) per segreteria

