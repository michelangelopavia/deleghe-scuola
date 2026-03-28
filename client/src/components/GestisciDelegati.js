import React, { useState, useEffect } from 'react';
import RegistraDelegato from './RegistraDelegato';

function GestisciDelegati() {
  const [delegati, setDelegati] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchDelegati();
  }, []);

  const fetchDelegati = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/delegati');
      if (!response.ok) throw new Error('Errore nel caricamento delegati');
      const data = await response.json();
      setDelegati(data);
    } catch (error) {
      console.error('Errore:', error);
      setMessage('Errore nel caricamento dei delegati');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDelegato = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo delegato?')) return;

    try {
      const response = await fetch(`/api/delegati/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Errore nella eliminazione');
      
      setDelegati(delegati.filter(d => d.id !== id));
      setMessage('Delegato eliminato con successo');
      setMessageType('success');
    } catch (error) {
      console.error('Errore:', error);
      setMessage('Errore nell\'eliminazione del delegato');
      setMessageType('error');
    }
  };

  const handleDelegatoAggiunto = () => {
    fetchDelegati();
    setShowAddForm(false);
    setMessage('Delegato aggiunto con successo');
    setMessageType('success');
  };

  return (
    <div>
      {message && (
        <div className={`alert ${messageType}`}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Nascondi Modulo' : 'Aggiungi Delegato'}
        </button>
      </div>

      {showAddForm && (
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3>Registra Nuovo Delegato</h3>
          <RegistraDelegato onSuccess={handleDelegatoAggiunto} />
        </div>
      )}

      <h2>Delegati Registrati</h2>
      
      {loading ? (
        <p>Caricamento...</p>
      ) : delegati.length === 0 ? (
        <p style={{ color: '#666' }}>Non ci sono delegati registrati.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cognome</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>Data Registrazione</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {delegati.map(delegato => (
              <tr key={delegato.id}>
                <td>{delegato.nome}</td>
                <td>{delegato.cognome}</td>
                <td>{delegato.email || '-'}</td>
                <td>{delegato.telefono || '-'}</td>
                <td>{new Date(delegato.dataRegistrazione).toLocaleDateString('it-IT')}</td>
                <td>
                  <button
                    onClick={() => handleDeleteDelegato(delegato.id)}
                    style={{ backgroundColor: '#d32f2f', padding: '5px 10px', fontSize: '12px' }}
                  >
                    Elimina
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GestisciDelegati;
