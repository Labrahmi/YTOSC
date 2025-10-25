interface TabsProps {
  activeTab: 'overview' | 'outliers';
  onTabChange: (tab: 'overview' | 'outliers') => void;
  outliersCount: number;
}

export function Tabs({ activeTab, onTabChange, outliersCount }: TabsProps) {
  return (
    <div className="tabs">
      <button
        className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
        onClick={() => onTabChange('overview')}
      >
        Overview
      </button>
      <button
        className={`tab ${activeTab === 'outliers' ? 'active' : ''}`}
        onClick={() => onTabChange('outliers')}
      >
        Top Outliers
        {outliersCount > 0 && (
          <span className="tab-badge">{outliersCount}</span>
        )}
      </button>
    </div>
  );
}

