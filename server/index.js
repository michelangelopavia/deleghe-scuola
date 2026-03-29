const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const Database = require('./db-wrapper');

const app = express();
const PORT = process.env.PORT || 3001;

// Database setup
// Su Railway useremo un volume montato in /app/data per rendere il DB persistente
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/app/data/database.db' 
  : path.join(__dirname, 'database.db');
const db = new Database(dbPath);

// Initialize tables
(async () => {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS delegati (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        cognome TEXT NOT NULL,
        nato_a TEXT NOT NULL,
        data_nascita TEXT NOT NULL,
        residente_a TEXT NOT NULL,
        indirizzo TEXT NOT NULL,
        numero_civico TEXT NOT NULL,
        doc_numero TEXT NOT NULL,
        doc_rilasciato_da TEXT NOT NULL,
        doc_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS classi (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.error('Errore inizializzazione database:', err);
  }
})();

// Middleware
app.use(cors());
app.use(express.json());

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// ── API ROUTES ──────────────────────────────────────────────────

// GET all delegati
app.get('/api/delegati', async (req, res) => {
  try {
    const delegati = await db.prepare('SELECT * FROM delegati ORDER BY cognome, nome').all();
    res.json(delegati);
  } catch (error) {
    console.error('Errore:', error);
    res.status(500).json({ error: 'Errore nel recupero dei delegati' });
  }
});

// GET single delegato
app.get('/api/delegati/:id', async (req, res) => {
  try {
    const delegato = await db.prepare('SELECT * FROM delegati WHERE id = ?').get(req.params.id);
    if (!delegato) return res.status(404).json({ error: 'Delegato non trovato' });
    res.json(delegato);
  } catch (error) {
    console.error('Errore:', error);
    res.status(500).json({ error: 'Errore nel recupero del delegato' });
  }
});

// POST create delegato
app.post('/api/delegati', async (req, res) => {
  try {
    const {
      nome, cognome, nato_a, data_nascita,
      residente_a, indirizzo, numero_civico,
      doc_numero, doc_rilasciato_da, doc_data
    } = req.body;

    if (!nome || !cognome || !nato_a || !data_nascita || !residente_a || !indirizzo) {
      return res.status(400).json({ error: 'Campi obbligatori mancanti' });
    }

    // Controllo duplicati (documento o nome/cognome)
    const docEsistente = await db.prepare('SELECT id FROM delegati WHERE doc_numero = ?').get(doc_numero);
    if (docEsistente) {
      return res.status(400).json({ error: 'Un delegato con questo Numero di Documento è già presente a sistema.' });
    }

    const nomeEsistente = await db.prepare('SELECT id FROM delegati WHERE LOWER(nome) = ? AND LOWER(cognome) = ?').get(nome.toLowerCase().trim(), cognome.toLowerCase().trim());
    if (nomeEsistente) {
      return res.status(400).json({ error: 'Un delegato con questo identico Nome e Cognome è già stato registrato.' });
    }

    const id = uuidv4();
    await db.prepare(`
      INSERT INTO delegati (id, nome, cognome, nato_a, data_nascita, residente_a, indirizzo, numero_civico, doc_numero, doc_rilasciato_da, doc_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, nome, cognome, nato_a, data_nascita, residente_a, indirizzo, numero_civico, doc_numero, doc_rilasciato_da, doc_data);

    res.status(201).json({ id, message: 'Delegato aggiunto con successo' });
  } catch (error) {
    console.error('Errore:', error);
    res.status(500).json({ error: 'Errore nella creazione del delegato' });
  }
});

// PUT update delegato
app.put('/api/delegati/:id', async (req, res) => {
  try {
    const {
      nome, cognome, nato_a, data_nascita,
      residente_a, indirizzo, numero_civico,
      doc_numero, doc_rilasciato_da, doc_data
    } = req.body;

    const result = await db.prepare(`
      UPDATE delegati SET nome=?, cognome=?, nato_a=?, data_nascita=?, residente_a=?, indirizzo=?, numero_civico=?, doc_numero=?, doc_rilasciato_da=?, doc_data=?
      WHERE id=?
    `).run(nome, cognome, nato_a, data_nascita, residente_a, indirizzo, numero_civico, doc_numero, doc_rilasciato_da, doc_data, req.params.id);

    if (result.changes === 0) return res.status(404).json({ error: 'Delegato non trovato' });
    res.json({ message: 'Delegato aggiornato' });
  } catch (error) {
    console.error('Errore:', error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento del delegato' });
  }
});

// DELETE delegato
app.delete('/api/delegati/:id', async (req, res) => {
  try {
    const result = await db.prepare('DELETE FROM delegati WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Delegato non trovato' });
    res.json({ message: 'Delegato eliminato' });
  } catch (error) {
    console.error('Errore:', error);
    res.status(500).json({ error: 'Errore nell\'eliminazione del delegato' });
  }
});

// POST generate PDF
app.post('/api/genera-pdf', async (req, res) => {
  try {
    const {
      // Genitori richiedenti (fino a 5)
      genitore_nome, genitore_cognome,
      genitore_nome_2, genitore_cognome_2,
      genitore_nome_3, genitore_cognome_3,
      genitore_nome_4, genitore_cognome_4,
      genitore_nome_5, genitore_cognome_5,
      // Alunno
      alunno_nome, alunno_cognome, alunno_nato_a, alunno_data_nascita, alunno_classe,
      alunno_scuola, // 'infanzia' o 'primaria'
      // Delegati (array di IDs)
      delegato_ids,
      // Opzioni
      autorizza_recapiti, data_modulo
    } = req.body;

    if (!delegato_ids || !Array.isArray(delegato_ids) || delegato_ids.length === 0) {
      return res.status(400).json({ error: 'Nessun delegato selezionato' });
    }

    // Recuperiamo tutti i delegati selezionati
    const delegati = [];
    for (const id of delegato_ids) {
      if (id) {
        const d = await db.prepare('SELECT * FROM delegati WHERE id = ?').get(id);
        if (d) delegati.push(d);
      }
    }

    if (delegati.length === 0) return res.status(404).json({ error: 'Delegati non trovati' });

    // Format dates
    const fmtDate = (d) => {
      if (!d) return '___________';
      const dt = new Date(d);
      return dt.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const capitalize = (str) => {
      if (!str) return '';
      return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    const dataOggi = data_modulo ? fmtDate(data_modulo) : fmtDate(new Date().toISOString());

    // ── LOGICA NOMI GENITORI ────────────────────────────────────
    const listaGenitori = [
      { n: genitore_nome, c: genitore_cognome },
      { n: genitore_nome_2, c: genitore_cognome_2 },
      { n: genitore_nome_3, c: genitore_cognome_3 },
      { n: genitore_nome_4, c: genitore_cognome_4 },
      { n: genitore_nome_5, c: genitore_cognome_5 }
    ].filter(g => g.n && g.n.trim() !== '');

    const isPlurale = listaGenitori.length > 1;
    let genitoreNomeCompleto = "";
    
    if (listaGenitori.length === 1) {
      genitoreNomeCompleto = `${capitalize(listaGenitori[0].n)} ${capitalize(listaGenitori[0].c)}`;
    } else {
      const allButLast = listaGenitori.slice(0, -1).map(g => `${capitalize(g.n)} ${capitalize(g.c)}`).join(", ");
      const last = listaGenitori[listaGenitori.length - 1];
      genitoreNomeCompleto = `${allButLast} e ${capitalize(last.n)} ${capitalize(last.c)}`;
    }

  // Build PDF
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 40, left: 60, right: 60 }
  });

  const displayAlunnoNome = capitalize(alunno_nome);
  const displayAlunnoCognome = capitalize(alunno_cognome);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="autorizzazione_${displayAlunnoCognome}_${displayAlunnoNome}.pdf"`);
  doc.pipe(res);

  const W = 495; // usable width
  const L = 60;  // left margin

  // ── HEADER ──────────────────────────────────────────────────
  const logoPath = path.join(__dirname, '..', 'logo_generico_istituto-valdese_01-01.jpg');
  try {
    const logoWidth = 141.75; 
    doc.image(logoPath, (doc.page.width - logoWidth) / 2, 40, { width: logoWidth });
    doc.y = 40 + (logoWidth * 0.4) + 10; 
  } catch (e) {
    doc.fontSize(10).font('Helvetica-Bold')
       .text('CENTRO DIACONALE', { align: 'center' })
       .text('ISTITUTO VALDESE - LA NOCE', { align: 'center' });
  }

  doc.moveDown(0.5);
  doc.moveTo(L, doc.y).lineTo(L + W, doc.y).stroke();
  doc.moveDown(0.5);

  // Destinatario
  doc.fontSize(10).font('Helvetica')
     .text('Al Dirigente Scolastico della', { align: 'right' })
     .text('Scuola dell\'Infanzia e Primaria Paritaria', { align: 'right' })
     .text('Istituto Valdese', { align: 'right' })
     .text('Palermo', { align: 'right' });

  doc.moveDown(0.5);

  // Oggetto
  doc.fontSize(11).font('Helvetica-Bold')
     .text('Oggetto: ', { continued: true })
     .text('Autorizzazione integrativa al prelievo dei minori.');

  doc.moveDown(0.5);

  // ── CORPO ──────────────────────────────────────────────────
  const alunnoNomeCompletoFormatted = `${displayAlunnoNome} ${displayAlunnoCognome}`;
  const scuolaTipo = alunno_scuola === 'infanzia' ? '[X] infanzia  [ ] primaria' : '[ ] infanzia  [X] primaria';

  // Riga 1: Il/la sottoscritto/a o I sottoscritti
  doc.fontSize(10).font('Helvetica')
     .text(isPlurale ? `I sottoscritti ` : `Il/la sottoscritto/a `, { continued: true })
     .font('Helvetica-Bold').text(`${genitoreNomeCompleto}`, { continued: true })
     .font('Helvetica').text(isPlurale ? ` (padre e madre/tutori)` : `  (padre e madre/tutore)`);

  doc.moveDown(0.4);

  // Riga 2: esercente la potestà
  doc.fontSize(10).font('Helvetica')
     .text(`esercente la potestà sull'alunno/a `, { continued: true })
     .font('Helvetica-Bold').text(`${alunnoNomeCompletoFormatted}`, { continued: true })
     .font('Helvetica').text(`, nato/a a `, { continued: true })
     .font('Helvetica-Bold').text(`${capitalize(alunno_nato_a)}`);

  doc.moveDown(0.4);

  // Riga 3: il (data) frequentante
  doc.fontSize(10).font('Helvetica')
     .text(`il `, { continued: true })
     .font('Helvetica-Bold').text(`${fmtDate(alunno_data_nascita)}`, { continued: true })
     .font('Helvetica').text(`, frequentante la classe `, { continued: true })
     .font('Helvetica-Bold').text(`${alunno_classe}`, { continued: true })
     .font('Helvetica').text(`  della scuola paritaria  `, { continued: true })
     .font('Helvetica-Bold').text(`${scuolaTipo}`);

  doc.moveDown(0.8);

  // Testo autorizzazione (centrato + grassetto)
  doc.fontSize(10).font('Helvetica-Bold')
     .text('autorizza al prelievo, al termine delle lezioni', { align: 'center' })
     .text('o anticipatamente in caso di malessere del/della minore,', { align: 'center' })
     .text(delegati.length > 1 ? 'le seguenti persone:' : 'la seguente persona:', { align: 'center' });

  doc.moveDown(0.5);

  // ── BOX DELEGATI ──────────────────────────────────────────
  for (const delegato of delegati) {
    const boxH = 65; // Ridotta da 75 a 65
    if (doc.y + boxH > 770) doc.addPage();
    
    const boxTop = doc.y;
    doc.rect(L, boxTop, W, boxH).stroke();
    const bL = L + 10;
    doc.y = boxTop + 8;

    doc.x = bL;
    doc.fontSize(9).font('Helvetica')
       .text(`Nome e cognome: `, { continued: true })
       .font('Helvetica-Bold').text(`${capitalize(delegato.nome)} ${capitalize(delegato.cognome)}`, { continued: true })
       .font('Helvetica').text(`   nato a: `, { continued: true })
       .font('Helvetica-Bold').text(`${capitalize(delegato.nato_a)}`, { continued: true })
       .font('Helvetica').text(`   il: `, { continued: true })
       .font('Helvetica-Bold').text(`${fmtDate(delegato.data_nascita)}`);

    doc.moveDown(0.2); // Ridotto
    doc.x = bL;
    doc.fontSize(9).font('Helvetica')
       .text(`residente a: `, { continued: true })
       .font('Helvetica-Bold').text(`${capitalize(delegato.residente_a)}`, { continued: true })
       .font('Helvetica').text(`  in via/piazza: `, { continued: true })
       .font('Helvetica-Bold').text(`${capitalize(delegato.indirizzo)}`, { continued: true })
       .font('Helvetica').text(`  n: `, { continued: true })
       .font('Helvetica-Bold').text(`${delegato.numero_civico}`);

    doc.moveDown(0.2); // Ridotto
    doc.x = bL;
    doc.fontSize(9).font('Helvetica')
       .text(`documento di identità n: `, { continued: true })
       .font('Helvetica-Bold').text(`${delegato.doc_numero}`, { continued: true })
       .font('Helvetica').text(`,  rilasciato dal: `, { continued: true })
       .font('Helvetica-Bold').text(`${capitalize(delegato.doc_rilasciato_da)}`, { continued: true })
       .font('Helvetica').text(`  in data: `, { continued: true })
       .font('Helvetica-Bold').text(`${fmtDate(delegato.doc_data)}`);

    doc.y = boxTop + boxH + 5; // Ridotto margine tra box
  }

  doc.moveDown(0.3);
  doc.fontSize(8).font('Helvetica-Oblique')
     .text('(allegare fotostatica documento di identità fronte e retro, non occorre se già in possesso dell\'Istituto).', { align: 'center' });

  doc.moveDown(0.8);

  // ── SEZIONE RECAPITI ──────────────────────────────────────
  doc.fontSize(9).font('Helvetica').text('I sottoscritti, inoltre,');
  doc.moveDown(0.3);

  const checkSi = autorizza_recapiti ? '[X]' : '[ ]';
  const checkNo = autorizza_recapiti ? '[ ]' : '[X]';

  doc.fontSize(9).font('Helvetica')
     .text(`  •  ${checkSi} autorizzano  ${checkNo} non autorizzano, l'Istituto Valdese, a fornire i recapiti telefonici mobili ai genitori dei compagni di classe del proprio figlio.`, {
       indent: 20,
       width: W - 20
     });

  doc.moveDown(1.5);

  // ── FIRMA E DATA (SULLA STESSA RIGA) ──────────────────────
  const rowY = doc.y;

  doc.fontSize(10).font('Helvetica-Bold')
     .text(`Palermo, lì  ${dataOggi}`, L, rowY);

  // Linea firma spruzzata a destra sulla stessa riga
  const firmaX = L + W - 180;
  doc.moveTo(firmaX, rowY + 15).lineTo(firmaX + 170, rowY + 15).stroke();
  doc.fontSize(8).font('Helvetica')
     .text('(Firma)', firmaX, rowY + 18, { width: 170, align: 'center' });

  doc.moveDown(2);

  // ── FOOTER ──────────────────────────────────────────────────
  // Posiziona il footer a fondo pagina
  const pageHeight = doc.page.height;
  const pageBottomMargin = 40;
  const footerLineY = pageHeight - pageBottomMargin - 30;
  
  doc.moveTo(L, footerLineY).lineTo(L + W, footerLineY).stroke();
  
  doc.fontSize(8).font('Helvetica')
     .text('Via Giovanni Evangelista Di Blasi, 12 - 90135 Palermo - Tel. 091-681.79.41 / 43', 
       L, footerLineY + 3, { width: W, align: 'center' })
     .text('centrodiaconale@lanoce.org – www.lanoce.org', 
       L, footerLineY + 13, { width: W, align: 'center', link: 'http://www.lanoce.org' });

  doc.end();
  } catch (error) {
    console.error('Errore nella generazione PDF:', error);
    res.status(500).json({ error: 'Errore nella generazione del PDF' });
  }
});

// Fallback to React app
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});
