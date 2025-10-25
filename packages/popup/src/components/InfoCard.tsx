interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

export function InfoCard({ title, children }: InfoCardProps) {
  return (
    <div className="info-card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

