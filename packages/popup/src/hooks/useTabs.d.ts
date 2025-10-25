export type TabType = 'overview' | 'outliers' | 'settings';
export declare function useTabs(initialTab?: TabType): {
    activeTab: TabType;
    setActiveTab: import("react").Dispatch<import("react").SetStateAction<TabType>>;
};
