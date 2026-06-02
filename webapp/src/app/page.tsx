'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, List, Clock, Image as ImageIcon, Briefcase, CheckCircle2, ChevronRight, Scissors, Smartphone } from 'lucide-react';
import './landing.css';

export default function KallosLanding() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="landing-page dark-theme">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <Scissors className="brand-icon" />
            <span>Kallos</span>
          </div>
          <div className="nav-actions">
            <button onClick={() => router.push('/login')} className="btn-login" style={{ marginRight: '0.5rem' }}>Accedi</button>
            <button onClick={() => router.push('/login')} className="btn-primary">Inizia Gratis</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <div className="badge-pill">
            <span className="pulse-dot"></span> Novità 2026: Kallos Salon
          </div>
          <h1 className="hero-title">
            Il Gestionale per il Tuo <br />
            <span className="text-gradient">Salone.</span>
          </h1>
          <p className="hero-subtitle">
            Prenotazioni intelligenti, storico trattamenti, schede clienti e gestione listini per far crescere il tuo salone di bellezza.
          </p>
          <div className="hero-actions flex gap-4 justify-center items-center">
            <button onClick={() => router.push('/login')} className="btn-primary btn-glow flex items-center">
              Crea il tuo Salone <ChevronRight size={18} className="ml-2" />
            </button>
            <button 
              onClick={() => router.push('/guida')}
              className="btn-secondary"
            >
              Esplora Funzioni
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header text-center">
            <h2>Gestisci il tuo salone con stile</h2>
            <p>Dì addio all'agenda di carta. Benvenuto nel futuro della bellezza.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper"><Calendar className="feature-icon" /></div>
              <h3>Agenda Appuntamenti</h3>
              <p>Visualizza e gestisci gli appuntamenti con un'interfaccia semplice e intuitiva.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><Users className="feature-icon" /></div>
              <h3>Schede Clienti</h3>
              <p>Anagrafiche complete, compleanni, preferenze e note personalizzate per ogni cliente.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><List className="feature-icon" /></div>
              <h3>Listino Servizi</h3>
              <p>Crea e aggiorna il tuo listino, imposta durate e prezzi per calcolare automaticamente gli incassi.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><Clock className="feature-icon" /></div>
              <h3>Storico Trattamenti</h3>
              <p>Tieni traccia di tutto ciò che hai fatto per consigliare sempre il servizio giusto.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><ImageIcon className="feature-icon" /></div>
              <h3>Foto Prima/Dopo</h3>
              <p>Una galleria dedicata per ogni cliente per mostrare i tuoi fantastici risultati.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper"><Briefcase className="feature-icon" /></div>
              <h3>Gestione Staff</h3>
              <p>Assegna servizi ai tuoi collaboratori e monitora le loro performance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PWA Section */}
      <section className="l-pwa" style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="l-pwa-banner" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '24px', padding: '3.5rem', color: 'white', position: 'relative', overflow: 'hidden', display: 'flex', gap: '3rem', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'column', textAlign: 'center' }}>
            <div className="l-pwa-content" style={{ zIndex: 1 }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>Ovunque Ti Trovi. Da PC e Smartphone.</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto' }}>
                Kallos è una WebApp moderna. Usala comodamente dal tuo computer a casa o alla reception, oppure installala sul tuo smartphone come una vera e propria App (PWA) per portarla sempre con te in salone, <strong>senza dover passare dagli Store</strong>.
              </p>
              
              <div className="l-pwa-guides" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* iOS Guide */}
                <div className="l-pwa-guide-card" style={{ flex: '1', minWidth: '250px', maxWidth: '350px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.25rem', backdropFilter: 'blur(10px)', textAlign: 'left' }}>
                  <div className="l-pwa-guide-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600, fontSize: '0.95rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="iOS" style={{width: 16, filter: 'invert(1)'}} />
                    <span>Per iPhone (Safari)</span>
                  </div>
                  <ol className="l-pwa-steps" style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                    <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>Apri <strong>kallos.dani-sys.it</strong> su Safari</li>
                    <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>Tocca l'icona Condividi in basso</li>
                    <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>Scorri e tocca <strong>"Aggiungi alla schermata Home"</strong></li>
                  </ol>
                </div>

                {/* Android Guide */}
                <div className="l-pwa-guide-card" style={{ flex: '1', minWidth: '250px', maxWidth: '350px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.25rem', backdropFilter: 'blur(10px)', textAlign: 'left' }}>
                  <div className="l-pwa-guide-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600, fontSize: '0.95rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg" alt="Android" style={{width: 16}} />
                    <span>Per Android (Chrome)</span>
                  </div>
                  <ol className="l-pwa-steps" style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                    <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>Apri <strong>kallos.dani-sys.it</strong> su Chrome</li>
                    <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>Tocca i tre puntini in alto a destra</li>
                    <li style={{ marginBottom: '0.5rem', paddingLeft: '1.5rem', position: 'relative' }}>Tocca <strong>"Aggiungi a schermata Home"</strong> o "Installa app"</li>
                  </ol>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section" id="pricing">
        <div className="container">
          <div className="section-header text-center">
            <h2>Prezzi chiari, nessuna commissione</h2>
            <p>Solo un abbonamento fisso per far crescere il tuo business.</p>
            
            <div className="billing-toggle">
              <span className={!isAnnual ? 'active' : ''}>Mensile</span>
              <label className="switch">
                <input type="checkbox" checked={isAnnual} onChange={() => setIsAnnual(!isAnnual)} />
                <span className="slider round"></span>
              </label>
              <span className={isAnnual ? 'active' : ''}>Annuale <span className="discount-badge">Risparmi</span></span>
            </div>
          </div>

          <div className="pricing-grid">
            {/* Gratis */}
            <div className="pricing-card">
              <h3>Gratis</h3>
              <div className="price">€0<span>/mese</span></div>
              <p className="pricing-desc">Perfetto per iniziare a digitalizzare il salone.</p>
              <button onClick={() => router.push('/login')} className="btn-secondary w-100">Inizia Gratis</button>
              <ul className="plan-features">
                <li><CheckCircle2 size={16} /> Fino a 3 Clienti</li>
                <li><CheckCircle2 size={16} /> Agenda Base</li>
                <li><CheckCircle2 size={16} /> Listino Servizi</li>
              </ul>
            </div>

            {/* Standard */}
            <div className="pricing-card">
              <h3>Standard</h3>
              <div className="price">€{isAnnual ? '500' : '50'}<span>/{isAnnual ? 'anno' : 'mese'}</span></div>
              <p className="pricing-desc">Ideale per freelance e piccoli saloni.</p>
              <button onClick={() => router.push('/register')} className="btn-secondary w-100">Scegli Standard</button>
              <ul className="plan-features">
                <li><CheckCircle2 size={16} /> Fino a 15 Clienti</li>
                <li><CheckCircle2 size={16} /> Storico Trattamenti</li>
                <li><CheckCircle2 size={16} /> Tutto del piano Gratis</li>
              </ul>
            </div>

            {/* Pro */}
            <div className="pricing-card popular">
              <div className="popular-badge">Più Popolare</div>
              <h3>Pro</h3>
              <div className="price">€{isAnnual ? '800' : '80'}<span>/{isAnnual ? 'anno' : 'mese'}</span></div>
              <p className="pricing-desc">Per saloni affermati con collaboratori.</p>
              <button onClick={() => router.push('/register')} className="btn-primary w-100">Scegli Pro</button>
              <ul className="plan-features">
                <li><CheckCircle2 size={16} /> Fino a 30 Clienti</li>
                <li><CheckCircle2 size={16} /> Prenotazioni Online</li>
                <li><CheckCircle2 size={16} /> Tutto del piano Standard</li>
              </ul>
            </div>

            {/* Unlimited */}
            <div className="pricing-card">
              <h3>Unlimited</h3>
              <div className="price">€{isAnnual ? '1200' : '149'}<span>/{isAnnual ? 'anno' : 'mese'}</span></div>
              <p className="pricing-desc">Nessun limite per grandi centri estetici.</p>
              <button onClick={() => router.push('/register')} className="btn-secondary w-100">Scegli Unlimited</button>
              <ul className="plan-features">
                <li><CheckCircle2 size={16} /> Clienti Illimitati</li>
                <li><CheckCircle2 size={16} /> Assistenza Prioritaria</li>
                <li><CheckCircle2 size={16} /> Tutto del piano Pro</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Scissors className="brand-icon" />
              <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>Kallos</span>
            </div>
            <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)' }}>
              <span>&copy; 2026 Dani-Sys</span>
              <span>P.IVA 04042160541</span>
              <a href="mailto:info@dani-sys.it" style={{ color: 'inherit', textDecoration: 'none' }}>info@dani-sys.it</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
