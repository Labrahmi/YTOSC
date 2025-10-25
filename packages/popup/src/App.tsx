import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StatsCard } from './components/StatsCard';
import { FilterBar } from './components/FilterBar';
import { VideoList } from './components/VideoList';
import { Icon } from './components/Icon';
import { useLiveData } from './hooks/useLiveData';
import { useFilters } from './hooks/useFilters';
import { useFadeIn } from './hooks/useAnimations';

const APP_VERSION = '1.0.0';

function App() {
  const { data, refresh } = useLiveData();
  const { activeFilter, setFilter, resetFilter, filteredVideos } = useFilters(data.videos);
  const fadeIn = useFadeIn(100);

  // Loading state
  if (data.isLoading) {
    return (
      <div className="app">
        <Header 
          title="YouTube Outlier Score" 
          subtitle="Analyze your video performance" 
        />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading channel data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (data.error) {
    return (
      <div className="app">
        <Header 
          title="YouTube Outlier Score" 
          subtitle="Analyze your video performance" 
        />
        <div className="error-container">
          <Icon name="alert" className="error-icon" />
          <p className="error-message">{data.error}</p>
          <p className="error-hint">
            Visit a YouTube channel's Videos tab to see analytics.
          </p>
          <button className="retry-button" onClick={refresh}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className={`app ${fadeIn ? 'fade-in' : ''}`}>
      <Header 
        title="YouTube Outlier Score" 
        subtitle="Analyze your video performance" 
      />

      <main className="main">
        <StatsCard
          totalVideos={data.totalVideos}
          medianViews={data.medianViews}
          topScore={data.topScore}
          avgScore={data.avgScore}
          goodCount={data.goodCount}
          excellentCount={data.excellentCount}
          exceptionalCount={data.exceptionalCount}
        />

        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setFilter}
          onReset={resetFilter}
          counts={{
            good: data.videos.filter(v => v.outlierScore && v.outlierScore >= 2).length,
            excellent: data.videos.filter(v => v.outlierScore && v.outlierScore >= 5).length,
            exceptional: data.videos.filter(v => v.outlierScore && v.outlierScore >= 10).length,
          }}
        />

        <VideoList videos={filteredVideos} maxItems={10} />
      </main>

      <Footer version={APP_VERSION} />
    </div>
  );
}

export default App;
