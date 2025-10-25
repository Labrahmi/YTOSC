interface FooterProps {
  version: string;
}

export function Footer({ version }: FooterProps) {
  return (
    <footer className="footer">
      <p>YouTube Outlier Score Calculator v{version}</p>
    </footer>
  );
}

