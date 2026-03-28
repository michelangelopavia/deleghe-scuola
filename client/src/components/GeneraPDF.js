import React, { useState, useEffect, useRef } from 'react';

function GeneraPDF() {
  const [delegatiList, setDelegatiList] = useState([]);
  
  const [formData, setFormData] = useState({
    genitore_nome: '',
    genitore_cognome: '',
    genitore_nome_2: '',
    genitore_cognome_2: '',
    alunno_nome: '',
    alunno_cognome: '',
    alunno_nato_a: '',
    alunno_data_nascita: '',
    alunno_classe: '',
    alunno_scuola: 'primaria', // 'infanzia' o 'primaria'
    delegato_id: '',
    autorizza_recapiti: true,
    data_modulo: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const hasLoadedRef = useRef(false);

  // Fetch delegati per la dropdown
  useEffect(() => {
    fetch('/api/delegati')
      .then(res => res.json())
      .then(data => {
        setDelegatiList(data);
      })
      .catch(err => console.error("Errore caricamento delegati:", err));
  }, []);

  // Ripristino dati salvati
  useEffect(() => {
    if (!hasLoadedRef.current) {
      const saved = localStorage.getItem('autorizzazioniFormDataV2');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Forziamo il delegato_id a vuoto per obbligare la scelta manuale ogni volta
          setFormData(prev => ({ ...prev, ...parsed, delegato_id: '' }));
        } catch (err) {
          console.error('Errore nel caricamento dati salvati:', err);
        }
      }
      hasLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (hasLoadedRef.current) {
      localStorage.setItem('autorizzazioniFormDataV2', JSON.stringify(formData));
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGeneraPDF = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!formData.delegato_id) {
        throw new Error('Devi selezionare un delegato!');
      }

      const response = await fetch('/api/genera-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Errore Server: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autorizzazione_${formData.alunno_cognome}_${formData.alunno_nome}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage('PDF autorizzazione generato con successo!');
      setMessageType('success');
    } catch (error) {
      console.error('Errore nella generazione PDF:', error);
      setMessage(`Errore: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const selectedDelegatoObj = delegatiList.find(d => d.id === formData.delegato_id);

  return (
    <form onSubmit={handleGeneraPDF}>
      {message && (
        <div className={`alert ${messageType}`}>
          {messageType === 'success' ? '✅ ' : '❌ '}{message}
        </div>
      )}

      <h2>Dati Genitore o Tutore</h2>
      <div className="form-group-inline">
        <div className="form-group">
          <label>Nome *</label>
          <input type="text" name="genitore_nome" value={formData.genitore_nome} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Cognome *</label>
          <input type="text" name="genitore_cognome" value={formData.genitore_cognome} onChange={handleChange} required />
        </div>
      </div>

      <h2 style={{marginTop: '24px', fontSize: '1.2rem', color: 'var(--text-light)'}}>Secondo Genitore / Tutore (Opzionale)</h2>
      <div className="form-group-inline">
        <div className="form-group">
          <label>Nome</label>
          <input type="text" name="genitore_nome_2" value={formData.genitore_nome_2} onChange={handleChange} placeholder="Opzionale" />
        </div>
        <div className="form-group">
          <label>Cognome</label>
          <input type="text" name="genitore_cognome_2" value={formData.genitore_cognome_2} onChange={handleChange} placeholder="Opzionale" />
        </div>
      </div>

      <h2 style={{marginTop: '32px'}}>Dati Alunno/a</h2>
      <div className="form-group-inline">
        <div className="form-group">
          <label>Nome Alunno/a *</label>
          <input type="text" name="alunno_nome" value={formData.alunno_nome} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Cognome Alunno/a *</label>
          <input type="text" name="alunno_cognome" value={formData.alunno_cognome} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-group-inline">
        <div className="form-group">
          <label>Comune di Nascita *</label>
          <input type="text" name="alunno_nato_a" value={formData.alunno_nato_a} placeholder="es. Palermo" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Data di Nascita *</label>
          <input type="date" name="alunno_data_nascita" value={formData.alunno_data_nascita} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-group-inline">
        <div className="form-group">
          <label>Classe Frequentata *</label>
          <input type="text" name="alunno_classe" value={formData.alunno_classe} placeholder="es. 3A" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Tipo Scuola</label>
          <div className="radio-group" style={{marginTop: '8px'}}>
            <label className={`custom-radio ${formData.alunno_scuola === 'infanzia' ? 'checked' : ''}`}>
              <input type="radio" name="alunno_scuola" value="infanzia" checked={formData.alunno_scuola === 'infanzia'} onChange={handleChange} />
              Infanzia
            </label>
            <label className={`custom-radio ${formData.alunno_scuola === 'primaria' ? 'checked' : ''}`}>
              <input type="radio" name="alunno_scuola" value="primaria" checked={formData.alunno_scuola === 'primaria'} onChange={handleChange} />
              Primaria
            </label>
          </div>
        </div>
      </div>

      <h2 style={{marginTop: '32px'}}>Selezione Delegato</h2>
      <div className="form-group">
        <label>Persona autorizzata al prelievo *</label>
        {delegatiList.length > 0 ? (
          <select name="delegato_id" value={formData.delegato_id} onChange={handleChange} required>
            <option value="">-- Seleziona un delegato --</option>
            {delegatiList.map(d => (
              <option key={d.id} value={d.id}>{d.cognome} {d.nome}</option>
            ))}
          </select>
        ) : (
          <p style={{color: 'var(--danger)', fontSize: '0.9rem'}}>Nessun delegato registrato. Vai nella tab "Soggetti Delegati" per aggiungerne uno.</p>
        )}
      </div>

      {/* Rimossa la preview dei dati sensibili per motivi di privacy richiesti */}


      <h2 style={{marginTop: '32px'}}>Opzioni Aggiuntive</h2>
      <div className="form-group">
        <label className={`custom-radio ${formData.autorizza_recapiti ? 'checked' : ''}`} style={{display: 'inline-flex', padding: '16px'}}>
          <input type="checkbox" name="autorizza_recapiti" checked={formData.autorizza_recapiti} onChange={handleChange} />
          <span>Autorizzo l'Istituto Valdese a fornire il recapito telefonico ai genitori dei compagni di classe del minore.</span>
        </label>
      </div>

      <div className="form-group" style={{maxWidth: '300px'}}>
        <label>Data di compilazione del modulo</label>
        <input type="date" name="data_modulo" value={formData.data_modulo} onChange={handleChange} required />
      </div>

      <div className="button-group" style={{marginTop: '40px'}}>
        <button type="submit" disabled={loading || !formData.delegato_id} className="btn-primary btn-lg">
          {loading ? 'Generazione in corso...' : '📥 Scarica Autorizzazione (PDF)'}
        </button>
      </div>
    </form>
  );
}

export default GeneraPDF;
