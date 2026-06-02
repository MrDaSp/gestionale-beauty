'use client'

import { useRouter } from 'next/navigation'
import { Sparkles, ArrowLeft, CalendarDays, Users, PackageSearch } from 'lucide-react'
import '../landing.css'

export default function GuidePage() {
  const router = useRouter()

  return (
    <div className="landing-body" style={{ overflowY: 'auto', height: '100vh', padding: 0 }}>
      {/* Navbar Minimalista */}
      <nav style={{ padding: '1.5rem 5%', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-dark)', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ background: 'var(--primary-color)', padding: '0.5rem', borderRadius: '8px' }}>
            <Sparkles color="white" size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800, color: 'var(--text-light)' }}>Kallos</h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => router.push('/')} className="l-btn l-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', borderColor: 'var(--border-color)' }}>
            <ArrowLeft size={18} /> Torna alla Home
          </button>
          <button onClick={() => router.push('/login')} className="l-btn l-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Accedi
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        {/* Intestazione Guida */}
        <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', letterSpacing: '-0.02em', color: 'var(--text-light)' }}>
            Esplora <span style={{ color: 'var(--primary-color)' }}>Kallos</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
            Scopri come trasformare il tuo salone di bellezza. Dagli appuntamenti al magazzino, un'esperienza premium per te e i tuoi clienti.
          </p>
        </div>

        {/* Step 1: Dashboard */}
        <section className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '4rem', padding: '3rem', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', background: 'var(--primary-color-glow)', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
              <CalendarDays color="var(--primary-color)" size={32} />
            </div>
            <h2 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', color: 'var(--text-light)' }}>Agenda Intelligente</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: '1.7' }}>
              Un calendario fluido e moderno. Gestisci gli appuntamenti del tuo staff con colori personalizzati, invia promemoria automatici e riduci le disdette.
            </p>
          </div>
          <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}>
            <img src="/agenda_real.png" alt="Agenda Kallos" style={{ width: '100%', display: 'block' }} />
          </div>
        </section>

        {/* Step 2: Clienti */}
        <section className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '4rem', padding: '3rem', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
              <Users color="#10b981" size={32} />
            </div>
            <h2 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', color: 'var(--text-light)' }}>Schede Clienti</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: '1.7' }}>
              Mantieni uno storico perfetto per ogni cliente. Note sui trattamenti, preferenze colore, storico appuntamenti e spese totali, tutto a portata di clic.
            </p>
          </div>
          <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}>
            <img src="/clienti_real.png" alt="Clienti Kallos" style={{ width: '100%', display: 'block' }} />
          </div>
        </section>



        {/* Call to Action Finale */}
        <div className="animate-fade-in" style={{ textAlign: 'center', marginTop: '6rem', padding: '4rem', background: 'linear-gradient(to right, rgba(212, 175, 55, 0.05), rgba(0,0,0,0))', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-light)' }}>Dai al tuo salone il gestionale che merita.</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>Passa al livello successivo con Kallos.</p>
          <button onClick={() => router.push('/login')} className="l-btn l-btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>
            Inizia Subito
          </button>
        </div>

      </main>
    </div>
  )
}
