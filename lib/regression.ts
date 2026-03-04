export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  predict: (x: number) => number;
}

export function linearRegression(data: { x: number; y: number }[]): RegressionResult {
  const n = data.length;
  const sumX = data.reduce((s, p) => s + p.x, 0);
  const sumY = data.reduce((s, p) => s + p.y, 0);
  const sumXY = data.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = data.reduce((s, p) => s + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const meanY = sumY / n;
  const ssTot = data.reduce((s, p) => s + Math.pow(p.y - meanY, 2), 0);
  const ssRes = data.reduce((s, p) => s + Math.pow(p.y - (slope * p.x + intercept), 2), 0);
  const rSquared = 1 - ssRes / ssTot;

  return {
    slope,
    intercept,
    rSquared,
    predict: (x: number) => slope * x + intercept,
  };
}
