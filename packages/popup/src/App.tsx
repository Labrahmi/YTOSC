function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>YouTube Outlier Score</h1>
        <p className="subtitle">Analyze video performance on channel pages</p>
      </header>

      <main className="main">
        <div className="info-section">
          <div className="info-card">
            <h2>🎯 How It Works</h2>
            <p>
              The extension automatically calculates and displays outlier scores 
              for each video on YouTube channel pages.
            </p>
          </div>

          <div className="info-card">
            <h2>🏆 Score Levels</h2>
            <ul>
              <li><strong style={{color: '#F44336'}}>Red (≥10x)</strong> - Exceptional</li>
              <li><strong style={{color: '#FF9800'}}>Orange (≥5x)</strong> - Excellent</li>
              <li><strong style={{color: '#FFEB3B'}}>Yellow (≥2x)</strong> - Good</li>
              <li><strong style={{color: '#9E9E9E'}}>Gray (&lt;2x)</strong> - Average</li>
            </ul>
          </div>

          <div className="info-card">
            <h2>💡 Features</h2>
            <ul>
              <li>Click any badge for detailed analytics</li>
              <li>Automatic score updates on scroll</li>
              <li>Works on all YouTube channel pages</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>YouTube Outlier Score Calculator v1.0.0</p>
      </footer>
    </div>
  );
}

export default App;
