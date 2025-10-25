import { ReactNode } from 'react';
interface SectionProps {
    icon: 'chart' | 'filter' | 'trending' | 'settings';
    title: string;
    action?: ReactNode;
    children: ReactNode;
}
export declare function Section({ icon, title, action, children }: SectionProps): import("react/jsx-runtime").JSX.Element;
export {};
