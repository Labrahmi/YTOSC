interface FeatureItemProps {
  text: string;
}

function FeatureItem({ text }: FeatureItemProps) {
  return <li>{text}</li>;
}

export function FeatureList() {
  const features = [
    'Click any badge for detailed analytics',
    'Automatic score updates on scroll',
    'Works on all YouTube channel pages',
  ];

  return (
    <ul>
      {features.map((feature, index) => (
        <FeatureItem key={index} text={feature} />
      ))}
    </ul>
  );
}

