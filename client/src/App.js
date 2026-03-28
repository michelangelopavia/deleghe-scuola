import React, { useState } from 'react';
import GeneraPDF from './components/GeneraPDF';
import GestisciDelegati from './components/GestisciDelegati';
import RegistraDelegato from './components/RegistraDelegato';

function App() {
  const [activeAdmin, setActiveAdmin] = useState(false);
  const [adminPassword] = useState('MichelangeloPavia15');
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  
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
    setActiveAdmin(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">📋</div>
          <span>Deleghe</span>
        </div>
        <div className="tabs">
          <a href="/" className={`tab ${pathname === '/' && !activeAdmin ? 'active' : ''}`} style={{display: 'flex', alignItems:'center', textDecoration: 'none'}}>
            Genera
          </a>
          <a href="/genitore-delegato" className={`tab ${isPublicRoute ? 'active' : ''}`} style={{display: 'flex', alignItems:'center', textDecoration: 'none', whiteSpace: 'nowrap'}}>
            Nuova Delega
          </a>
          {adminAuthenticated && activeAdmin && (
            <button className="tab" onClick={handleLogout} style={{color: '#ffcdd2', borderBottom: 'none'}}>
              Esci
            </button>
          )}
        </div>
      </header>

      <main className="app-container" style={{ flex: 1, width: '100%' }}>
        {isPublicRoute ? (
          <div className="card">
            <h1 className="card-title">Registrazione Delegato al Prelievo</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Gentile Genitore, compili il seguente modulo per registrare una persona autorizzata 
              al prelievo di suo/a figlio/a. I dati saranno poi disponibili per la scuola per la delega.
            </p>
            <hr className="card-divider" />
            <RegistraDelegato isPublic={true} />
          </div>
        ) : activeAdmin ? (
          <div className="card">
            <h1 className="card-title">Gestione Soggetti Delegati</h1>
            <hr className="card-divider" />
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
                <h3 style={{fontFamily: 'var(--font-display)', color: 'var(--accent-dark)', marginTop: 0}}>Accesso Segreteria</h3>
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
                  Benvenuto nell'area Segreteria. Qui puoi gestire l'elenco dei delegati registrati nel sistema.
                </p>
                <GestisciDelegati />
              </>
            )}
          </div>
        ) : (
          <div className="card">
            <h1 className="card-title">Generatore Autorizzazioni</h1>
            <hr className="card-divider" />
            <GeneraPDF />
          </div>
        )}
      </main>

      <footer style={{ 
        textAlign: 'center', 
        padding: '32px 20px', 
        borderTop: '1px solid var(--border-light)',
        marginTop: 'auto',
        color: 'var(--text-light)',
        backgroundColor: 'var(--surface)',
        fontSize: '0.9rem'
      }}>
        <div style={{fontFamily: 'var(--font-display)', color: 'var(--accent-dark)', marginBottom: '8px'}}>Istituto Valdese La Noce - Palermo</div>
        {!isPublicRoute && !activeAdmin ? (
          <button 
            onClick={() => setActiveAdmin(true)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-light)', 
              textDecoration: 'underline', 
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Accesso Segreteria (Gestione Delegati)
          </button>
        ) : activeAdmin && (
          <button 
            onClick={() => setActiveAdmin(false)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent)', 
              textDecoration: 'underline', 
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            ← Torna al Generatore PDF
          </button>
        )}
      </footer>
    </div>
  );
}

export default App;
