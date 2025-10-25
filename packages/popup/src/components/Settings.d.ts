import type { Theme } from '../hooks/useTheme';
interface SettingsProps {
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
}
export declare function Settings({ theme, onThemeChange }: SettingsProps): import("react/jsx-runtime").JSX.Element;
export {};
