interface FooterProps {
  version: string;
}

export function Footer({ version }: FooterProps) {
  return (
    <footer className="footer">
      <p>ℹ️  Data updates automatically from current tab · v{version}</p>
    </footer>
  );
}

