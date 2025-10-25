/**
 * Mock Chrome APIs for development
 * This allows you to develop the UI without loading it as an extension
 */

// Mock chrome.storage API
const mockStorage = {
  sync: {
    get: (_keys: string[], callback: (result: any) => void) => {
      // Return mock data
      const mockData: Record<string, any> = {
        filterLevel: null,
        enabled: true,
      };
      callback(mockData);
    },
    set: (items: any, callback?: () => void) => {
      console.log('Mock chrome.storage.sync.set:', items);
      callback?.();
    },
  },
};

// Mock chrome.runtime API
const mockRuntime = {
  sendMessage: (message: any, callback?: (response: any) => void) => {
    console.log('Mock chrome.runtime.sendMessage:', message);
    // Simulate response
    setTimeout(() => {
      callback?.({ success: true });
    }, 100);
  },
  onMessage: {
    addListener: (_callback: any) => {
      console.log('Mock chrome.runtime.onMessage.addListener');
    },
  },
};

// Mock video data with outlier scores
const mockVideoData = {
  videos: [
    { title: 'How I Built My Studio Setup', viewCount: 125000, url: 'https://youtube.com/watch?v=1', outlierScore: 12.4 },
    { title: '100 Days of YouTube Shorts Challenge', viewCount: 89000, url: 'https://youtube.com/watch?v=2', outlierScore: 8.9 },
    { title: 'Ultimate Lighting Tutorial for Creators', viewCount: 61000, url: 'https://youtube.com/watch?v=3', outlierScore: 6.1 },
    { title: 'My Favorite Gear for Content Creation', viewCount: 52000, url: 'https://youtube.com/watch?v=4', outlierScore: 5.2 },
    { title: 'Behind the Scenes of My Viral Video', viewCount: 48000, url: 'https://youtube.com/watch?v=5', outlierScore: 4.8 },
    { title: 'Camera Settings Guide for Beginners', viewCount: 37000, url: 'https://youtube.com/watch?v=6', outlierScore: 3.7 },
    { title: 'My Editing Workflow Revealed', viewCount: 32000, url: 'https://youtube.com/watch?v=7', outlierScore: 3.2 },
    { title: 'Q&A Session - Ask Me Anything', viewCount: 29000, url: 'https://youtube.com/watch?v=8', outlierScore: 2.9 },
    { title: 'Studio Tour 2024', viewCount: 24000, url: 'https://youtube.com/watch?v=9', outlierScore: 2.4 },
    { title: 'Monthly Vlog - October', viewCount: 21000, url: 'https://youtube.com/watch?v=10', outlierScore: 2.1 },
    { title: 'Audio Setup Tips and Tricks', viewCount: 18000, url: 'https://youtube.com/watch?v=11', outlierScore: 1.8 },
    { title: 'Color Grading Tutorial', viewCount: 15000, url: 'https://youtube.com/watch?v=12', outlierScore: 1.5 },
    { title: 'Thumbnail Design Secrets', viewCount: 13000, url: 'https://youtube.com/watch?v=13', outlierScore: 1.3 },
    { title: 'How to Script Your Videos', viewCount: 11000, url: 'https://youtube.com/watch?v=14', outlierScore: 1.1 },
    { title: 'Best Time to Upload on YouTube', viewCount: 10000, url: 'https://youtube.com/watch?v=15', outlierScore: 1.0 },
    { title: 'My Daily Routine as a Creator', viewCount: 9500, url: 'https://youtube.com/watch?v=16', outlierScore: 0.95 },
    { title: 'SEO Tips for YouTube Growth', viewCount: 8800, url: 'https://youtube.com/watch?v=17', outlierScore: 0.88 },
    { title: 'How I Plan My Content', viewCount: 8200, url: 'https://youtube.com/watch?v=18', outlierScore: 0.82 },
    { title: 'Dealing with Burnout', viewCount: 7500, url: 'https://youtube.com/watch?v=19', outlierScore: 0.75 },
    { title: 'YouTube Analytics Explained', viewCount: 7000, url: 'https://youtube.com/watch?v=20', outlierScore: 0.70 },
  ],
  medianViews: 10000,
};

// Mock chrome.tabs API
const mockTabs = {
  query: (query: any, callback: (tabs: any[]) => void) => {
    console.log('Mock chrome.tabs.query:', query);
    callback([
      {
        id: 1,
        url: 'https://www.youtube.com/@mockchannelname/videos',
        active: true,
      },
    ]);
  },
  sendMessage: (tabId: number, message: any, callback?: (response: any) => void) => {
    console.log('Mock chrome.tabs.sendMessage:', tabId, message);
    
    // Return mock data based on message type
    if (message.type === 'GET_CHANNEL_DATA') {
      setTimeout(() => {
        callback?.(mockVideoData);
      }, 500); // Simulate network delay
    } else {
      callback?.({ success: true });
    }
  },
};

// Create global chrome object if it doesn't exist
if (typeof window !== 'undefined' && !(window as any).chrome) {
  (window as any).chrome = {
    storage: mockStorage,
    runtime: mockRuntime,
    tabs: mockTabs,
  };
  console.log('🔧 Chrome APIs mocked for development');
}

export {};
