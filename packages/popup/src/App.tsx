import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { InfoCard } from './components/InfoCard';
import { ScoreLegend } from './components/ScoreLegend';
import { FeatureList } from './components/FeatureList';

const APP_VERSION = '1.0.0';

function App() {
  return (
    <div className="app">
      <Header 
        title="YouTube Outlier Score" 
        subtitle="Analyze video performance on channel pages" 
      />

      <main className="main">
        <div className="info-section">
          <InfoCard title="🎯 How It Works">
            <p>
              The extension automatically calculates and displays outlier scores 
              for each video on YouTube channel pages.
            </p>
          </InfoCard>

          <InfoCard title="🏆 Score Levels">
            <ScoreLegend />
          </InfoCard>

          <InfoCard title="💡 Features">
            <FeatureList />
          </InfoCard>
        </div>
      </main>

      <Footer version={APP_VERSION} />
    </div>
  );
}

export default App;
