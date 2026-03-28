import React, { useState } from 'react';
import GeneraPDF from './components/GeneraPDF';
import GestisciDelegati from './components/GestisciDelegati';
import RegistraDelegato from './components/RegistraDelegato';

function App() {
  const [activeTab, setActiveTab] = useState('genera');
  const [adminPassword] = useState('MichelangeloPavia15');
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  
  // Utilizziamo un routing basilare nativo sulla barra degli indirizzi
  const pathname = window.location.pathname;
  const isPublicRoute = pathname === '/genitore-delegato';

  const handleAdminAuth = (e) => {
    e.preventDefault();
    const password = e.target.password.value;
    if (password === adminPassword) {
      setAdminAuthenticated(true);
    } else {
      alert('Password non corretta!');
      e.target.password.value = '';
    }
  };

  const handleLogout = () => {
    setAdminAuthenticated(false);
    setActiveTab('genera');
  };

  // VISTA PUBBLICA PER I GENITORI
  if (isPublicRoute) {
    return (
      <>
        <header className="app-header" style={{ justifyContent: 'center' }}>
          <div className="brand">
            <div className="brand-icon">📋</div>
            <span>Istituto Valdese La Noce - Portale Genitori</span>
          </div>
        </header>

        <main className="app-container">
          <div className="card">
            <h1 className="card-title">Registrazione Delegato al Prelievo</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Gentile Genitore, compili il seguente modulo per registrare una persona autorizzata 
              al prelievo di suo figlio/a. I dati saranno poi disponibili per la scuola.
            </p>
            <hr className="card-divider" />
            <RegistraDelegato isPublic={true} />
          </div>
        </main>
      </>
    );
  }

  // VISTA SEGRETERIA / SCUOLA (Generatore e Gestione Delegati)
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
          
          {adminAuthenticated && (
            <button className="tab" onClick={handleLogout} style={{color: '#ffcdd2', borderBottom: 'none'}}>
              Log out (Esci)
            </button>
          )}
        </div>
      </header>

      <main className="app-container">
        <div className="card">
          <h1 className="card-title">
            {activeTab === 'genera' ? 'Generatore Autorizzazioni' : 'Gestione Soggetti Delegati'}
          </h1>
          <hr className="card-divider" />
          
          {activeTab === 'genera' && <GeneraPDF />}
          
          {activeTab === 'registrati' && (
            <div>
              {!adminAuthenticated ? (
                <div style={{
                  backgroundColor: '#faf8f5', 
                  border: '1px solid var(--border-light)',
                  padding: '32px', 
                  borderRadius: '16px',
                  maxWidth: '400px',
                  margin: '40px auto',
                  textAlign: 'center'
                }}>
                  <h3 style={{fontFamily: 'var(--font-display)', color: 'var(--accent-dark)', marginTop: 0}}>Accesso Riservato</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                    Inserisci la password amministrativa per visualizzare, registrare o eliminare i delegati.
                  </p>
                  <form onSubmit={handleAdminAuth}>
                    <div className="form-group" style={{ textAlign: 'left' }}>
                      <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        required 
                        style={{ textAlign: 'center' }}
                      />
                    </div>
                    <button type="submit" className="btn-primary btn-lg">Accedi</button>
                  </form>
                </div>
              ) : (
                <>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                    Benvenuto! Qui puoi gestire l'elenco dei delegati registrati nel sistema.
                  </p>
                  <GestisciDelegati />
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default App;
