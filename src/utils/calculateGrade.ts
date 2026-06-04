// Russian 5-point grading scale based on the share of correct answers.
export function calculateGrade(correct: number, total: number): number {
  if (total <= 0) return 2;

  const ratio = correct / total;

  if (ratio >= 0.9) return 5;
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.5) return 3;
  return 2;
}

export default calculateGrade;
