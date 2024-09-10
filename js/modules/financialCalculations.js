export function calculateVaR(returns, confidenceLevel = 0.95) {
    const sortedReturns = returns.sort((a, b) => a - b);
    const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
    return -sortedReturns[index];
}

export function calculateSharpeRatio(returns, riskFreeRate = 0.02) {
    const averageReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - averageReturn, 2), 0) / returns.length);
    return (averageReturn - riskFreeRate) / stdDev;
}

export function calculateBeta(assetReturns, marketReturns) {
    const assetAvg = assetReturns.reduce((sum, r) => sum + r, 0) / assetReturns.length;
    const marketAvg = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length;
    
    const covariance = assetReturns.reduce((sum, r, i) => sum + (r - assetAvg) * (marketReturns[i] - marketAvg), 0) / assetReturns.length;
    const marketVariance = marketReturns.reduce((sum, r) => sum + Math.pow(r - marketAvg, 2), 0) / marketReturns.length;
    
    return covariance / marketVariance;
}

export function calculateDrawdown(returns) {
    let peak = 0;
    let drawdown = 0;
    let cumulativeReturn = 0;

    returns.forEach(r => {
        cumulativeReturn += r;
        if (cumulativeReturn > peak) {
            peak = cumulativeReturn;
        }
        const currentDrawdown = peak - cumulativeReturn;
        if (currentDrawdown > drawdown) {
            drawdown = currentDrawdown;
        }
    });

    return drawdown;
}