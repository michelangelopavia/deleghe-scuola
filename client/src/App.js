import React, { useState } from 'react';
import GeneraPDF from './components/GeneraPDF';
import GestisciDelegati from './components/GestisciDelegati';
import RegistraDelegato from './components/RegistraDelegato';

function App() {
  const [activeTab, setActiveTab] = useState('genera');
  const [adminPassword] = useState('MichelangeloPavia15');
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showPublicRegistration, setShowPublicRegistration] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const isAdminMode = params.get('admin') === '1';
  const isPublicMode = params.get('public') === '1';

  const handleAdminLogin = () => {
    const password = prompt('Inserisci password amministratore:');
    if (password === adminPassword) {
      setAdminAuthenticated(true);
      setShowAdminLogin(false);
      setActiveTab('gestisci');
    } else if (password !== null) {
      alert('Password non corretta');
    }
  };

  const handleLogout = () => {
    setAdminAuthenticated(false);
    setActiveTab('genera');
  };

  if (isPublicMode && !showPublicRegistration) {
    return (
      <div className="app-container">
        <h1>Registrazione Delegati</h1>
        <RegistraDelegato isPublic={true} />
      </div>
    );
  }

  if (isAdminMode && !adminAuthenticated) {
    return (
      <div className="app-container">
        <h1>Amministrazione - Accesso Riservato</h1>
        {!showAdminLogin ? (
          <button onClick={handleAdminLogin}>Accedi come Amministratore</button>
        ) : null}
      </div>
    );
  }

  if (isAdminMode && adminAuthenticated) {
    return (
      <div className="app-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Amministrazione</h1>
          <button onClick={handleLogout} style={{ backgroundColor: '#d32f2f' }}>
            Esci
          </button>
        </div>
        <GestisciDelegati />
      </div>
    );
  }

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">📋</div>
          <span>Istituto Valdese La Noce</span>
        </div>
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'genera' ? 'active' : ''}`}
            onClick={() => setActiveTab('genera')}
          >
            Genera
          </button>
          <button
            className={`tab ${activeTab === 'registrati' ? 'active' : ''}`}
            onClick={() => setActiveTab('registrati')}
          >
            Soggetti Delegati
          </button>
        </div>
      </header>

      <main className="app-container">
        <div className="card">
          <h1 className="card-title">Generatore Autorizzazioni</h1>
          <hr className="card-divider" />
          
          {activeTab === 'genera' && <GeneraPDF />}
          {activeTab === 'registrati' && (
            <div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                Gestione dell'elenco dei delegati registrati nel sistema.
              </p>
              {/* Qui dovrebbe esserci un componente lista, ma per ora lo lasciamo come da originale o usiamo GestisciDelegati se appropriato */}
              <GestisciDelegati />
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default App;
