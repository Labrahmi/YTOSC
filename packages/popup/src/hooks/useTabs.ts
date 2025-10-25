import { useState } from 'react';

export type TabType = 'overview' | 'outliers' | 'settings';

export function useTabs(initialTab: TabType = 'overview') {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  return { activeTab, setActiveTab };
}

