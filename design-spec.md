# Design Spec — Autorizzazioni Scuola
## Istituto Valdese La Noce · Palermo

---

## Concept estetico

Il progetto punta a un'estetica **cálida e istituzionale**, ispirata alla carta da lettere e ai documenti cartacei della tradizione scolastica italiana. Niente UI generica da SaaS: l'interfaccia deve sentirsi familiare a un genitore, non a uno sviluppatore.

**Parole chiave:** organico, caldo, leggibile, affidabile, non-digitale.

---

## Palette colori

| Nome | Valore | Uso |
|---|---|---|
| `--bg` | `#f5f0e8` | Sfondo principale (avorio caldo) |
| `--bg2` | `#ede7d9` | Sfondo secondario, pulsanti neutri |
| `--surface` | `#ffffff` | Card e modali |
| `--border` | `#c8b89a` | Bordi input e card |
| `--border-light` | `#e2d8c8` | Separatori leggeri |
| `--text` | `#1c1a16` | Testo principale (quasi nero caldo) |
| `--text-muted` | `#6b5f4e` | Testo secondario |
| `--text-light` | `#9e8e78` | Placeholder, note |
| `--accent` | `#2d6a4f` | Verde foresta — azione principale |
| `--accent-dark` | `#1b4332` | Verde scuro — header, hover |
| `--accent-light` | `#52b788` | Verde chiaro — highlights |
| `--accent-bg` | `#d8f3dc` | Sfondo verde pallido — preview delegato |
| `--danger` | `#c0392b` | Rosso — azioni distruttive |
| `--warning` | `#e67e22` | Arancione — messaggi informativi |

---

## Tipografia

| Ruolo | Font | Carattere |
|---|---|---|
| Display / Titoli | **DM Serif Display** | Serif elegante, con variante italic |
| Corpo / UI | **DM Sans** | Sans-serif moderno, pesi 300–600 |

I titoli di pagina e delle card usano DM Serif Display per evocare la dignità dei documenti ufficiali. Le label dei form usano DM Sans in uppercase con letter-spacing per chiarezza gerarchica.

---

## Layout

- **Header sticky** verde scuro (`--accent-dark`) con brand a sinistra e tab di navigazione a destra
- **Contenuto** centrato, max-width 860px, padding generoso
- **Card** con bordo leggero, border-radius 16px, ombra sottile
- **Form** a griglia 2 colonne (1 colonna su mobile)

---

## Componenti chiave

### Header
- Sfondo `#1b4332`, testo bianco
- Brand icon: quadrato verde con emoji 📋
- Tab attiva: sfondo `--accent` (`#2d6a4f`)

### Card
- Sfondo bianco, bordo `--border-light`
- Titolo in DM Serif Display, colore `--accent-dark`
- Separatore orizzontale sotto il titolo

### Input / Select
- Sfondo `--bg` (avorio), bordo `--border`
- Focus: bordo verde + glow `rgba(45,106,79,0.15)`
- Label: uppercase, 0.8rem, `--text-muted`

### Pulsante primario
- Sfondo `--accent`, testo bianco
- Hover: sfondo `--accent-dark` + `translateY(-1px)` + ombra verde
- Variante `btn-lg` per l'azione principale "Scarica PDF"

### Pulsante danger
- Sfondo `--danger-bg`, testo `--danger`
- Hover: sfondo pieno rosso con testo bianco

### Radio e Checkbox custom
- Border 1.5px, border-radius 8px
- Stato checked: bordo verde + sfondo `--accent-bg`
- Usati per tipo scuola (infanzia/primaria) e autorizzazione recapiti

### Preview delegato selezionato
- Box verde pallido (`--accent-bg`) con bordo `--accent-light`
- Nome in DM Serif Display, dati anagrafici in lista compatta

### Modal
- Overlay con `backdrop-filter: blur(2px)`
- Animazione ingresso: `scale(0.95) → scale(1)` + fade
- Bottone chiusura circolare

---

## PDF generato

Il PDF replica fedelmente il modulo ufficiale dell'Istituto Valdese:
- Header con nome istituto
- Destinatario in alto a destra
- Oggetto in grassetto
- Dati genitore, alunno e delegato con campi in **grassetto**
- Box tratteggiato intorno ai dati del delegato
- Checkbox testuali `[X]` / `[ ]` per l'autorizzazione recapiti
- Linea firma con data a sinistra
- Footer con indirizzo e contatti della scuola

---

## Responsive

Su mobile (< 640px):
- Form a colonna singola
- Label tab ridotte (solo icona emoji)
- Padding ridotto
- Titoli più piccoli (1.5rem)

---

## Tono

L'app si rivolge a genitori italiani di scuola primaria. Il linguaggio è:
- **Italiano formale ma accessibile**
- Niente gergo tecnico
- Messaggi di errore chiari e diretti
- Conferme positive con ✅, errori con ❌
