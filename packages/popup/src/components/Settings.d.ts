interface SettingsProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export declare function Settings({ theme, onThemeChange }: SettingsProps): import("react/jsx-runtime").JSX.Element;

