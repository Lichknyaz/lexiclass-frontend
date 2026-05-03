type AnswerStats = {
  correctAnswers: number;
  wrongAnswers: number;
};

export function getPercentage(value: number, total: number) {
  return total === 0 ? 0 : Math.round((value / total) * 100);
}

export function getAverage(values: number[]) {
  return values.length === 0
    ? 0
    : Math.round(
        values.reduce((total, value) => total + value, 0) / values.length,
      );
}

export function getMistakeRate({ correctAnswers, wrongAnswers }: AnswerStats) {
  return getPercentage(wrongAnswers, correctAnswers + wrongAnswers);
}
