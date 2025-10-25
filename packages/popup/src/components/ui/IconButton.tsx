import { Icon } from '../Icon';

interface IconButtonProps {
  icon: 'download';
  onClick: () => void;
  title: string;
  ariaLabel: string;
  className?: string;
}

export function IconButton({ icon, onClick, title, ariaLabel, className = '' }: IconButtonProps) {
  return (
    <button 
      className={`icon-btn ${className}`}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
    >
      <Icon name={icon} className="icon-btn-icon" />
    </button>
  );
}

