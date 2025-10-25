interface TabsProps {
  activeTab: 'overview' | 'outliers' | 'settings';
  onTabChange: (tab: 'overview' | 'outliers' | 'settings') => void;
  outliersCount: number;
}

export declare function Tabs({ activeTab, onTabChange, outliersCount }: TabsProps): import("react/jsx-runtime").JSX.Element;
