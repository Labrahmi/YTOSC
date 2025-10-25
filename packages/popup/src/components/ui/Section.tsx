import { ReactNode } from 'react';
import { Icon } from '../Icon';

interface SectionProps {
  icon: 'chart' | 'filter' | 'trending' | 'settings';
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Section({ icon, title, action, children }: SectionProps) {
  return (
    <section className="section">
      <div className="section-header section-header-static">
        <Icon name={icon} className="section-icon" />
        <h2 className="section-title">{title}</h2>
        {action}
      </div>

      <div className="section-content expanded">
        {children}
      </div>
    </section>
  );
}

