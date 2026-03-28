import React, { useState } from 'react';

function RegistraDelegato({ isPublic = false, onSuccess = null }) {
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: ''
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore nella registrazione');
      }

      setMessage('Registrazione avvenuta con successo!');
      setMessageType('success');
      
      setFormData({
        nome: '',
        cognome: '',
        email: '',
        telefono: ''
      });

      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }

      if (isPublic) {
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
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
          {message}
        </div>
      )}

      <div className="form-group-inline">
        <div className="form-group">
          <label>Nome *</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Cognome *</label>
          <input
            type="text"
            name="cognome"
            value={formData.cognome}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group-inline">
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Telefono</label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="button-group">
        <button type="submit" disabled={loading}>
          {loading ? 'Registrazione in corso...' : 'Registra Delegato'}
        </button>
      </div>

      {isPublic && (
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          * Campi obbligatori. La tua registrazione sarà verificata dagli amministratori.
        </p>
      )}
    </form>
  );
}

export default RegistraDelegato;
