import './Button.css';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    fullWidth?: boolean;
    children: React.ReactNode;
}
export declare function Button({ variant, fullWidth, children, className, ...props }: ButtonProps): import("react/jsx-runtime").JSX.Element;
