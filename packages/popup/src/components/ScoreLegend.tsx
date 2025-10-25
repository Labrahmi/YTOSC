interface ScoreLevelProps {
  color: string;
  threshold: string;
  label: string;
}

function ScoreLevel({ color, threshold, label }: ScoreLevelProps) {
  return (
    <li>
      <strong style={{ color }}>{threshold}</strong> - {label}
    </li>
  );
}

export function ScoreLegend() {
  return (
    <ul>
      <ScoreLevel color="#F44336" threshold="Red (≥10x)" label="Exceptional" />
      <ScoreLevel color="#FF9800" threshold="Orange (≥5x)" label="Excellent" />
      <ScoreLevel color="#FFEB3B" threshold="Yellow (≥2x)" label="Good" />
      <ScoreLevel color="#9E9E9E" threshold="Gray (<2x)" label="Average" />
    </ul>
  );
}

