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

// Mock chrome.tabs API
const mockTabs = {
  query: (query: any, callback: (tabs: any[]) => void) => {
    console.log('Mock chrome.tabs.query:', query);
    callback([
      {
        id: 1,
        url: 'https://www.youtube.com/@channelname',
        active: true,
      },
    ]);
  },
  sendMessage: (tabId: number, message: any, callback?: (response: any) => void) => {
    console.log('Mock chrome.tabs.sendMessage:', tabId, message);
    callback?.({ success: true });
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
