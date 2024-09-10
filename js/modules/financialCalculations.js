export function calculateVaR(returns, confidenceLevel = 0.95) {
    if (!returns || returns.length === 0) {
        console.warn('Nenhum retorno fornecido para cálculo do VaR');
        return 0;
    }

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

// Mover funções de cálculo para financialCalculations.js
export function calculateDailyReturns(trades) {
    return Object.values(trades.reduce((acc, trade) => {
        const date = trade.date.split('T')[0];
        acc[date] = (acc[date] || 0) + trade.result;
        return acc;
    }, {}));
}

export function calculateRisk(returns) {
    const mean = returns.reduce((sum, return_) => sum + return_, 0) / returns.length;
    const variance = returns.reduce((sum, return_) => sum + Math.pow(return_ - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
}

export function calculateAverageReturn(returns) {
    return returns.reduce((sum, return_) => sum + return_, 0) / returns.length;
}