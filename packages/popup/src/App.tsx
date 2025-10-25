import { useState } from 'react';
import { Button } from '@ui/Button';
import type { FilterMessage } from '@core/types';

type FilterLevel = 2 | 5 | 10 | null;

function App() {
  const [activeFilter, setActiveFilter] = useState<FilterLevel>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessageToContentScript = async (message: FilterMessage) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        console.error('No active tab found');
        return;
      }

      await chrome.tabs.sendMessage(tab.id, message);
    } catch (error) {
      console.error('Error sending message to content script:', error);
    }
  };

  const handleFilterClick = async (level: FilterLevel) => {
    if (level === null) return;
    
    setIsLoading(true);
    setActiveFilter(level);
    
    await sendMessageToContentScript({
      type: 'SET_FILTER',
      threshold: level,
    });
    
    setIsLoading(false);
    console.log(`Filter activated: ${level}x`);
  };

  const handleReset = async () => {
    setIsLoading(true);
    setActiveFilter(null);
    
    await sendMessageToContentScript({
      type: 'RESET_FILTER',
    });
    
    setIsLoading(false);
    console.log('Filter reset');
  };

  return (
    <div className="app">
      <header className="header">
        <h1>YouTube Outlier Score</h1>
        <p className="subtitle">Filter videos by their outlier score</p>
      </header>

      <main className="main">
        <div className="filter-section">
          <h2>Filter by Score</h2>
          <div className="filter-buttons">
            <Button
              variant={activeFilter === 2 ? 'primary' : 'secondary'}
              onClick={() => handleFilterClick(2)}
              disabled={isLoading}
            >
              &gt; 2x
            </Button>
            <Button
              variant={activeFilter === 5 ? 'primary' : 'secondary'}
              onClick={() => handleFilterClick(5)}
              disabled={isLoading}
            >
              &gt; 5x
            </Button>
            <Button
              variant={activeFilter === 10 ? 'primary' : 'secondary'}
              onClick={() => handleFilterClick(10)}
              disabled={isLoading}
            >
              &gt; 10x
            </Button>
          </div>
        </div>

        <div className="reset-section">
          <Button 
            variant="outline" 
            onClick={handleReset} 
            fullWidth
            disabled={isLoading}
          >
            Reset Filter
          </Button>
        </div>
      </main>

      <footer className="footer">
        <p>v1.0.0</p>
      </footer>
    </div>
  );
}

export default App;
