export type Theme = 'light' | 'dark';
export declare function useTheme(): {
    theme: Theme;
    toggleTheme: (newTheme: Theme) => void;
};
