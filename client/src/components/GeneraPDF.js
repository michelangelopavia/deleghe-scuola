import React, { useState, useEffect, useRef } from 'react';

function GeneraPDF() {
  const [formData, setFormData] = useState({
    alunnoNome: '',
    alunnoCognome: '',
    alunnoData: '',
    alunnoClasse: '',
    genitoreNome: '',
    genitoreCognome: '',
    genitoreEmail: '',
    genitoreTelefono: '',
    delegatoNome: '',
    delegatoCognome: '',
    delegatoRelazione: 'nonno',
    autorizzazione: 'SI',
    note: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      const saved = localStorage.getItem('autorizzazioniFormData');
      if (saved) {
        try {
          setFormData(JSON.parse(saved));
        } catch (err) {
          console.error('Errore nel caricamento dati salvati:', err);
        }
      }
      hasLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (hasLoadedRef.current) {
      localStorage.setItem('autorizzazioniFormData', JSON.stringify(formData));
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGeneraPDF = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/genera-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Errore: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autorizzazione_${formData.alunnoCognome}_${formData.alunnoNome}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage('PDF generato con successo!');
      setMessageType('success');
    } catch (error) {
      console.error('Errore nella generazione PDF:', error);
      setMessage(`Errore: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      alunnoNome: '',
      alunnoCognome: '',
      alunnoData: '',
      alunnoClasse: '',
      genitoreNome: '',
      genitoreCognome: '',
      genitoreEmail: '',
      genitoreTelefono: '',
      delegatoNome: '',
      delegatoCognome: '',
      delegatoRelazione: 'nonno',
      autorizzazione: 'SI',
      note: ''
    });
    localStorage.removeItem('autorizzazioniFormData');
    setMessage('');
  };

  return (
    <form onSubmit={handleGeneraPDF}>
      {message && (
        <div className={`alert ${messageType}`}>
          {message}
        </div>
      )}

      <h2>Dati Alunno</h2>
      <div className="form-group-inline">
        <div className="form-group">
          <label>Nome Alunno *</label>
          <input
            type="text"
            name="alunnoNome"
            value={formData.alunnoNome}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Cognome Alunno *</label>
          <input
            type="text"
            name="alunnoCognome"
            value={formData.alunnoCognome}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group-inline">
        <div className="form-group">
          <label>Data di Nascita *</label>
          <input
            type="date"
            name="alunnoData"
            value={formData.alunnoData}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Classe *</label>
          <input
            type="text"
            name="alunnoClasse"
            value={formData.alunnoClasse}
            onChange={handleChange}
            placeholder="es. 3A"
            required
          />
        </div>
      </div>

      <h2>Dati Genitore/Tutore</h2>
      <div className="form-group-inline">
        <div className="form-group">
          <label>Nome Genitore *</label>
          <input
            type="text"
            name="genitoreNome"
            value={formData.genitoreNome}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Cognome Genitore *</label>
          <input
            type="text"
            name="genitoreCognome"
            value={formData.genitoreCognome}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group-inline">
        <div className="form-group">
          <label>Email Genitore</label>
          <input
            type="email"
            name="genitoreEmail"
            value={formData.genitoreEmail}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Telefono Genitore</label>
          <input
            type="tel"
            name="genitoreTelefono"
            value={formData.genitoreTelefono}
            onChange={handleChange}
          />
        </div>
      </div>

      <h2>Dati Delegato</h2>
      <div className="form-group-inline">
        <div className="form-group">
          <label>Nome Delegato *</label>
          <input
            type="text"
            name="delegatoNome"
            value={formData.delegatoNome}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Cognome Delegato *</label>
          <input
            type="text"
            name="delegatoCognome"
            value={formData.delegatoCognome}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group-inline">
        <div className="form-group">
          <label>Relazione con l'alunno *</label>
          <select
            name="delegatoRelazione"
            value={formData.delegatoRelazione}
            onChange={handleChange}
            required
          >
            <option value="nonno">Nonno/Nonna</option>
            <option value="zio">Zio/Zia</option>
            <option value="fratello">Fratello/Sorella</option>
            <option value="altro">Altro</option>
          </select>
        </div>
        <div className="form-group">
          <label>Autorizzazione *</label>
          <select
            name="autorizzazione"
            value={formData.autorizzazione}
            onChange={handleChange}
            required
          >
            <option value="SI">Sì, autorizo</option>
            <option value="NO">No, non autorizo</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Note Aggiuntive</label>
        <textarea
          name="note"
          value={formData.note}
          onChange={handleChange}
          placeholder="Inserisci eventuali note aggiuntive..."
        />
      </div>

      <div className="button-group">
        <button type="submit" disabled={loading}>
          {loading ? 'Generazione in corso...' : 'Genera PDF'}
        </button>
        <button type="button" onClick={handleClear} style={{ backgroundColor: '#757575' }}>
          Pulisci
        </button>
      </div>
    </form>
  );
}

export default GeneraPDF;
