import { Section } from './ui/Section';
import type { Theme } from '../hooks/useTheme';

interface SettingsProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function Settings({ theme, onThemeChange }: SettingsProps) {
  return (
    <Section icon="settings" title="Settings">
        <div className="settings-group">
          <div className="settings-item">
            <div className="settings-item-info">
              <div className="settings-item-title">Dark Mode</div>
              <div className="settings-item-description">
                Switch between light and dark theme
              </div>
            </div>
            <button
              className={`theme-toggle ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle dark mode"
            >
              <span className="theme-toggle-track">
                <span className="theme-toggle-thumb" />
              </span>
            </button>
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-group-title">About</div>
          <div className="settings-item">
            <div className="settings-item-info">
              <div className="settings-item-title">Version</div>
              <div className="settings-item-description">1.0.0</div>
            </div>
          </div>
          <div className="settings-item">
            <div className="settings-item-info">
              <div className="settings-item-title">Outlier Score Calculator</div>
              <div className="settings-item-description">
                Analyze YouTube video performance and identify outliers
              </div>
            </div>
          </div>
        </div>
    </Section>
  );
}

