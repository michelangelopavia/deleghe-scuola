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
          {messageType === 'success' ? '✅ ' : '❌ '}{message}
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Nascondi Modulo' : '+ Aggiungi Delegato'}
        </button>
      </div>

      {showAddForm && (
        <div style={{ 
          backgroundColor: '#faf8f5', 
          border: '1px solid var(--border-light)',
          padding: '24px', 
          borderRadius: '16px',
          marginBottom: '32px'
        }}>
          <h2 style={{fontFamily: 'var(--font-display)', color: 'var(--accent-dark)', marginTop: 0}}>Registra Nuovo Delegato</h2>
          <hr className="card-divider" />
          <RegistraDelegato onSuccess={handleDelegatoAggiunto} />
        </div>
      )}

      {loading ? (
        <p>Caricamento in corso...</p>
      ) : delegati.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Non ci sono delegati registrati. Usa il pulsante "Aggiungi" per inserirne uno.</p>
      ) : (
        <div style={{overflowX: 'auto'}}>
          <table className="table">
            <thead>
              <tr>
                <th>Nominativo</th>
                <th>Nato a (il)</th>
                <th>Documento</th>
                <th>Data Registrazione</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {delegati.map(delegato => (
                <tr key={delegato.id}>
                  <td><strong>{delegato.cognome} {delegato.nome}</strong></td>
                  <td>{delegato.nato_a}<br/><span style={{fontSize: '0.85em', color: 'var(--text-muted)'}}>{new Date(delegato.data_nascita).toLocaleDateString('it-IT')}</span></td>
                  <td>N. {delegato.doc_numero}<br/><span style={{fontSize: '0.85em', color: 'var(--text-muted)'}}>{delegato.doc_rilasciato_da}</span></td>
                  <td>{new Date(delegato.created_at).toLocaleDateString('it-IT')}</td>
                  <td>
                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteDelegato(delegato.id)}
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default GestisciDelegati;
