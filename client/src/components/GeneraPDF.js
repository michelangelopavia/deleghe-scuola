import React, { useState, useEffect, useRef } from 'react';

function GeneraPDF() {
  const [delegatiList, setDelegatiList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  
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
    delegato_ids: [], 
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

  const addDelegato = (delegato) => {
    if (!formData.delegato_ids.includes(delegato.id)) {
      setFormData(prev => ({
        ...prev,
        delegato_ids: [...prev.delegato_ids, delegato.id]
      }));
    }
    setSearchTerm('');
    setShowResults(false);
  };

  const removeDelegato = (id) => {
    setFormData(prev => ({
      ...prev,
      delegato_ids: prev.delegato_ids.filter(i => i !== id)
    }));
  };

  const filteredDelegati = searchTerm.length > 0 
    ? delegatiList.filter(d => 
        (d.nome + " " + d.cognome).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.cognome + " " + d.nome).toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleGeneraPDF = async (e) => {
    e.preventDefault();
    if (formData.delegato_ids.length === 0) {
      alert("Seleziona almeno una persona da delegare!");
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
      if (!response.ok) {
         const errData = await response.json();
         throw new Error(errData.error || `Errore Server: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autorizzazione_${formData.alunno_cognome}.pdf`;
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
          <label>Nome *</label>
          <input type="text" name="genitore_nome" value={formData.genitore_nome} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Cognome *</label>
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
              <label>{num === 2 ? 'Secondo Genitore (Opzionale)' : `Genitore ${num} (Opzionale)`}</label>
              <div style={{display: 'flex', gap: '8px'}}>
                 <input type="text" name={nomeKey} value={formData[nomeKey]} onChange={handleChange} placeholder="Nome" style={{flex: 1}} />
                 <input type="text" name={cognomeKey} value={formData[cognomeKey]} onChange={handleChange} placeholder="Cognome" style={{flex: 1}} />
              </div>
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

      <h2 style={{marginTop: '32px'}}>Selezione Persone Delegate</h2>
      <div className="form-group" style={{position: 'relative'}}>
        <label>Cerca ed aggiungi delegato (per nome o cognome) *</label>
        <input 
          type="text" 
          placeholder="Inizia a scrivere per cercare..." 
          value={searchTerm}
          onChange={(e) => {setSearchTerm(e.target.value); setShowResults(true);}}
          onFocus={() => setShowResults(true)}
        />
        
        {showResults && filteredDelegati.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, 
            backgroundColor: 'white', border: '1px solid var(--border-light)', 
            borderRadius: '8px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            marginTop: '4px', overflow: 'hidden'
          }}>
            {filteredDelegati.map(d => (
              <div 
                key={d.id} 
                onClick={() => addDelegato(d)}
                style={{padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #eee'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f5f2'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <strong>{d.cognome} {d.nome}</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      {formData.delegato_ids.length > 0 && (
        <div style={{marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <p style={{fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '4px'}}><strong>Persone selezionate per la delega:</strong></p>
          {formData.delegato_ids.map(id => {
            const del = delegatiList.find(d => d.id === id);
            if (!del) return null;
            return (
              <div key={id} className="alert success" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', margin: 0}}>
                <span>{del.cognome} {del.nome}</span>
                <button type="button" onClick={() => removeDelegato(id)} style={{background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontSize: '1.2rem', padding: '0 8px'}} title="Rimuovi">×</button>
              </div>
            );
          })}
        </div>
      )}

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
