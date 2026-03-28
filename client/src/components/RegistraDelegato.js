import React, { useState } from 'react';

function RegistraDelegato({ isPublic = false, onSuccess = null }) {
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    nato_a: '',
    data_nascita: '',
    residente_a: '',
    indirizzo: '',
    numero_civico: '',
    doc_numero: '',
    doc_rilasciato_da: '',
    doc_data: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/delegati', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore nella registrazione');
      }

      setMessage('Delegato aggiunto correttamente!');
      setMessageType('success');
      
      setFormData({
        nome: '', cognome: '', nato_a: '', data_nascita: '', residente_a: '',
        indirizzo: '', numero_civico: '', doc_numero: '', doc_rilasciato_da: '', doc_data: ''
      });

      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }

    } catch (error) {
      console.error('Errore:', error);
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {message && (
        <div className={`alert ${messageType}`} style={{ marginBottom: '20px' }}>
          {messageType === 'success' ? '✅ ' : '❌ '}{message}
        </div>
      )}

      <div className="form-group-inline">
        <div className="form-group">
          <label>Nome *</label>
          <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Cognome *</label>
          <input type="text" name="cognome" value={formData.cognome} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-group-inline">
        <div className="form-group">
          <label>Nato a (Comune / Stato) *</label>
          <input type="text" name="nato_a" value={formData.nato_a} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Data di Nascita *</label>
          <input type="date" name="data_nascita" value={formData.data_nascita} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-group-inline">
        <div className="form-group">
          <label>Comune di Residenza *</label>
          <input type="text" name="residente_a" value={formData.residente_a} onChange={handleChange} required />
        </div>
        <div className="form-group" style={{display: 'flex', gap: '8px'}}>
          <div style={{flex: 2}}>
            <label>Via / Piazza *</label>
            <input type="text" name="indirizzo" value={formData.indirizzo} onChange={handleChange} required />
          </div>
          <div style={{flex: 1}}>
            <label>N. Civico *</label>
            <input type="text" name="numero_civico" value={formData.numero_civico} onChange={handleChange} required />
          </div>
        </div>
      </div>

      <h3 style={{fontFamily: 'var(--font-display)', color: 'var(--accent-dark)', marginTop: '24px'}}>Documento d'Identità</h3>
      <div className="form-group-inline">
        <div className="form-group">
          <label>Numero Documento *</label>
          <input type="text" name="doc_numero" value={formData.doc_numero} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Rilasciato da (es. Comune di Palermo) *</label>
          <input type="text" name="doc_rilasciato_da" value={formData.doc_rilasciato_da} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-group" style={{maxWidth: '300px'}}>
        <label>Data di Rilascio *</label>
        <input type="date" name="doc_data" value={formData.doc_data} onChange={handleChange} required />
      </div>

      <div className="button-group">
        <button type="submit" disabled={loading} className="btn-primary btn-lg">
          {loading ? 'Salvataggio in corso...' : 'Salva Delegato'}
        </button>
      </div>

      {isPublic && (
        <p style={{ marginTop: '20px', fontSize: '14px', color: 'var(--text-light)' }}>
          * Campo obbligatorio.
        </p>
      )}
    </form>
  );
}

export default RegistraDelegato;
