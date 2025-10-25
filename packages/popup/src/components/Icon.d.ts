interface IconProps {
  name: 'chart' | 'filter' | 'trending' | 'info' | 'alert';
  className?: string;
}

export function Icon({ name, className }: IconProps): JSX.Element;

