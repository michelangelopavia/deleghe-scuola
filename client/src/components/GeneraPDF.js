import React, { useState, useEffect, useRef } from 'react';

function GeneraPDF() {
  const [delegatiList, setDelegatiList] = useState([]);
  
  const [formData, setFormData] = useState({
    genitore_nome: '',
    genitore_cognome: '',
    genitore_nome_2: '',
    genitore_cognome_2: '',
    genitore_nome_3: '',
    genitore_cognome_3: '',
    genitore_nome_4: '',
    genitore_cognome_4: '',
    genitore_nome_5: '',
    genitore_cognome_5: '',
    alunno_nome: '',
    alunno_cognome: '',
    alunno_nato_a: '',
    alunno_data_nascita: '',
    alunno_classe: '',
    alunno_scuola: 'primaria',
    delegato_ids: [], // Array di ID per multiselezione
    autorizza_recapiti: true,
    data_modulo: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    fetch('/api/delegati')
      .then(res => res.json())
      .then(data => setDelegatiList(data))
      .catch(err => console.error("Errore caricamento delegati:", err));
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      const saved = localStorage.getItem('autorizzazioniFormDataV3');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(prev => ({ ...prev, ...parsed, delegato_ids: [] }));
        } catch (err) {
          console.error('Errore caricamento salvati:', err);
        }
      }
      hasLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (hasLoadedRef.current) {
      localStorage.setItem('autorizzazioniFormDataV3', JSON.stringify(formData));
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleDelegato = (id) => {
    setFormData(prev => {
      const ids = prev.delegato_ids.includes(id)
        ? prev.delegato_ids.filter(i => i !== id)
        : [...prev.delegato_ids, id];
      return { ...prev, delegato_ids: ids };
    });
  };

  const handleGeneraPDF = async (e) => {
    e.preventDefault();
    if (formData.delegato_ids.length === 0) {
      alert("Seleziona almeno un delegato!");
      return;
    }
    
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/genera-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error(`Errore Server: ${response.status}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autorizzazione_${formData.alunno_cognome}_${formData.alunno_nome}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage('PDF generato correttamente!');
      setMessageType('success');
    } catch (error) {
      setMessage(`Errore: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleGeneraPDF}>
      {message && <div className={`alert ${messageType}`}>{messageType === 'success' ? '✅ ' : '❌ '}{message}</div>}

      <h2>Dati Genitori o Tutori</h2>
      <div className="form-group-inline">
        <div className="form-group">
          <label>Nome (Genitore 1) *</label>
          <input type="text" name="genitore_nome" value={formData.genitore_nome} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Cognome (Genitore 1) *</label>
          <input type="text" name="genitore_cognome" value={formData.genitore_cognome} onChange={handleChange} required />
        </div>
      </div>

      {[2, 3, 4, 5].map(num => {
        const nomeKey = `genitore_nome_${num}`;
        const cognomeKey = `genitore_cognome_${num}`;
        const previousNome = num === 2 ? formData.genitore_nome : formData[`genitore_nome_${num-1}`];
        if (!previousNome && !formData[nomeKey]) return null;

        return (
          <div key={num} className="form-group-inline" style={{marginTop: '12px', padding: '12px', backgroundColor: '#fcfaf8', borderRadius: '8px', border: '1px dashed var(--border-light)'}}>
            <div className="form-group">
              <label>Nome (Genitore {num})</label>
              <input type="text" name={nomeKey} value={formData[nomeKey]} onChange={handleChange} placeholder="Opzionale" />
            </div>
            <div className="form-group">
              <label>Cognome (Genitore {num})</label>
              <input type="text" name={cognomeKey} value={formData[cognomeKey]} onChange={handleChange} placeholder="Opzionale" />
            </div>
          </div>
        );
      })}

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
              <input type="radio" name="alunno_scuola" value="infanzia" checked={formData.alunno_scuola === 'infanzia'} onChange={handleChange} /> Infanzia
            </label>
            <label className={`custom-radio ${formData.alunno_scuola === 'primaria' ? 'checked' : ''}`}>
              <input type="radio" name="alunno_scuola" value="primaria" checked={formData.alunno_scuola === 'primaria'} onChange={handleChange} /> Primaria
            </label>
          </div>
        </div>
      </div>

      <h2 style={{marginTop: '32px'}}>Selezione Delegati</h2>
      <p style={{color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '12px'}}>Puoi selezionare più persone contemporaneamente:</p>
      <div style={{display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto', padding: '4px'}}>
        {delegatiList.length > 0 ? delegatiList.map(d => (
          <label key={d.id} className={`custom-radio ${formData.delegato_ids.includes(d.id) ? 'checked' : ''}`} style={{display: 'flex', padding: '12px', cursor: 'pointer', justifyContent: 'flex-start'}}>
            <input type="checkbox" checked={formData.delegato_ids.includes(d.id)} onChange={() => toggleDelegato(d.id)} style={{marginRight: '12px'}} />
            {d.cognome} {d.nome}
          </label>
        )) : <p style={{color: 'var(--danger)'}}>Nessun delegato registrato.</p>}
      </div>

      <h2 style={{marginTop: '32px'}}>Opzioni Aggiuntive</h2>
      <div className="form-group">
        <label className={`custom-radio ${formData.autorizza_recapiti ? 'checked' : ''}`} style={{display: 'inline-flex', padding: '16px'}}>
          <input type="checkbox" name="autorizza_recapiti" checked={formData.autorizza_recapiti} onChange={handleChange} />
          <span>Autorizzo l'Istituto Valdese a fornire il recapito telefonico ai genitori dei compagni di classe del minore.</span>
        </label>
      </div>

      <div className="form-group" style={{maxWidth: '300px'}}>
        <label>Data di compilazione</label>
        <input type="date" name="data_modulo" value={formData.data_modulo} onChange={handleChange} required />
      </div>

      <div className="button-group" style={{marginTop: '40px'}}>
        <button type="submit" disabled={loading || formData.delegato_ids.length === 0} className="btn-primary btn-lg">
          {loading ? 'Generazione...' : '📥 Scarica Autorizzazione (PDF)'}
        </button>
      </div>
    </form>
  );
}

export default GeneraPDF;
