import { Icon } from './Icon';

interface FooterProps {
  version: string;
}

export function Footer({ version }: FooterProps) {
  return (
    <footer className="footer">
      <p className="footer-content">
        <Icon name="info" className="footer-icon" />
        <span>Data updates automatically from current tab · v{version}</span>
      </p>
    </footer>
  );
}

