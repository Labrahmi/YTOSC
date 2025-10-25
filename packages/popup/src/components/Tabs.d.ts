interface TabsProps {
    activeTab: 'overview' | 'outliers';
    onTabChange: (tab: 'overview' | 'outliers') => void;
    outliersCount: number;
}
export declare function Tabs({ activeTab, onTabChange, outliersCount }: TabsProps): import("react/jsx-runtime").JSX.Element;
export {};
