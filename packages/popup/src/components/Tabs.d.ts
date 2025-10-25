import type { TabType } from '../hooks/useTabs';
interface TabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    outliersCount: number;
}
export declare function Tabs({ activeTab, onTabChange, outliersCount }: TabsProps): import("react/jsx-runtime").JSX.Element;
export {};
