import './Badge.css';

export interface BadgeProps {
  score: number;
  className?: string;
}

export function Badge({ score, className = '' }: BadgeProps) {
  const getVariant = (score: number): string => {
    if (score >= 10) return 'red';
    if (score >= 5) return 'purple';
    if (score >= 2) return 'blue';
    return 'gray';
  };

  const variant = getVariant(score);
  const classes = ['ytosc-badge', `ytosc-badge--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {score.toFixed(1)}x
    </span>
  );
}
