export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>🏪</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(90deg, #FF6B35, #F7931E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              BlackRoad OS
            </h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>App Store</p>
          </div>
        </div>
        <button style={{ background: '#FF6B35', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem' }}>
          Publish App
        </button>
      </header>

      {/* Hero */}
      <main style={{ flex: 1, padding: '4rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem', lineHeight: 1.2 }}>
          The App Store
          <br />
          <span style={{ background: 'linear-gradient(90deg, #FF6B35, #F7931E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Without Gatekeepers
          </span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#999', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Publish instantly. Zero fees. Total control.<br />
          No Apple. No Google. Just freedom.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
          <button style={{ background: '#FF6B35', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1.125rem', fontWeight: 600 }}>
            📱 Browse Apps
          </button>
          <button style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '1rem 2rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1.125rem', fontWeight: 600 }}>
            🚀 Publish Your App
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '4rem auto' }}>
          {[
            { label: 'Platform Fee', value: '0%', desc: 'vs 30% Apple/Google' },
            { label: 'Review Time', value: 'Instant', desc: 'vs 1-7 days' },
            { label: 'Total Apps', value: '100+', desc: 'Growing daily' },
            { label: 'Revenue Kept', value: '100%', desc: 'All yours' },
          ].map((stat, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#FF6B35', marginBottom: '0.5rem' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                {stat.desc}
              </div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div style={{ maxWidth: '1200px', margin: '4rem auto', textAlign: 'left' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {[
              { icon: '🌐', title: 'PWAs', desc: 'Install from browser. No app store approval needed.' },
              { icon: '🤖', title: 'Android APKs', desc: 'Direct download + sideload. Completely legal.' },
              { icon: '💻', title: 'Desktop Apps', desc: 'Mac, Windows, Linux. Always been free.' },
              { icon: '📱', title: 'iOS', desc: 'TestFlight or sideload. 100K beta users allowed.' },
            ].map((method, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{method.icon}</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{method.title}</h3>
                <p style={{ color: '#999', lineHeight: 1.6 }}>{method.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg, #FF6B35, #F7931E)', borderRadius: '1.5rem', padding: '3rem', maxWidth: '800px', margin: '4rem auto' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#000' }}>Ready to Break Free?</h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: 'rgba(0,0,0,0.8)' }}>
            No Apple. No Google. No gatekeepers.
          </p>
          <button style={{ background: '#000', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1.125rem', fontWeight: 600 }}>
            Start Publishing Now →
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '2rem', textAlign: 'center', color: '#666' }}>
        <p>© 2026 BlackRoad OS. Built for freedom. 🏪</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          CLI: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>blackroad-store publish ./my-app</code>
        </p>
      </footer>
    </div>
  )
}
