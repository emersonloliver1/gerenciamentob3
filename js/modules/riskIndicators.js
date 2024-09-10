export function calculateVaR(trades, confidenceLevel = 0.95) {
    if (!trades || trades.length === 0) {
        console.warn('Nenhum trade fornecido para cálculo do VaR');
        return 0;
    }

    const returns = calculateDailyReturns(trades);
    if (returns.length === 0) {
        console.warn('Nenhum retorno diário calculado para VaR');
        return 0;
    }

    const sortedReturns = returns.sort((a, b) => a - b);
    const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
    return -sortedReturns[index];
}

export function calculateBeta(trades, marketReturns) {
    const assetReturns = calculateDailyReturns(trades);
    const covariance = calculateCovariance(assetReturns, marketReturns);
    const marketVariance = calculateVariance(marketReturns);
    return covariance / marketVariance;
}

export function calculateSharpeRatio(trades, riskFreeRate = 0.02) {
    const returns = calculateDailyReturns(trades);
    const averageReturn = calculateAverageReturn(returns);
    const stdDev = calculateStandardDeviation(returns);
    return (averageReturn - riskFreeRate) / stdDev;
}

function calculateDailyReturns(trades) {
    const dailyTotals = trades.reduce((acc, trade) => {
        if (trade && trade.date && trade.result !== undefined) {
            const date = trade.date.split('T')[0];
            acc[date] = (acc[date] || 0) + trade.result;
        } else {
            console.warn('Trade inválido encontrado:', trade);
        }
        return acc;
    }, {});

    return Object.values(dailyTotals);
}

function calculateAverageReturn(returns) {
    return returns.reduce((sum, return_) => sum + return_, 0) / returns.length;
}

function calculateStandardDeviation(returns) {
    const avg = calculateAverageReturn(returns);
    const squaredDiffs = returns.map(return_ => Math.pow(return_ - avg, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / returns.length;
    return Math.sqrt(avgSquaredDiff);
}

function calculateCovariance(returns1, returns2) {
    const avg1 = calculateAverageReturn(returns1);
    const avg2 = calculateAverageReturn(returns2);
    const products = returns1.map((r, i) => (r - avg1) * (returns2[i] - avg2));
    return products.reduce((sum, product) => sum + product, 0) / returns1.length;
}

function calculateVariance(returns) {
    const avg = calculateAverageReturn(returns);
    const squaredDiffs = returns.map(return_ => Math.pow(return_ - avg, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / returns.length;
}