import { Icon } from './Icon';

interface SettingsProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function Settings({ theme, onThemeChange }: SettingsProps) {
  return (
    <section className="section">
      <div className="section-header section-header-static">
        <Icon name="settings" className="section-icon" />
        <h2 className="section-title">Settings</h2>
      </div>

      <div className="section-content expanded">
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
      </div>
    </section>
  );
}

