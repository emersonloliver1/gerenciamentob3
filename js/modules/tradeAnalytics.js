/**
 * Calcula o resultado diário e acumulado das operações.
 * @param {Array} trades - Array de operações.
 * @returns {Object} Objeto contendo resultados diários e acumulados.
 */
export function calculateDailyAndAccumulatedResults(trades) {
    if (!trades || trades.length === 0) {
        return { dailyResults: [], accumulatedResults: [] };
    }

    const sortedTrades = trades.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let accumulatedResult = 0;
    const dailyResults = [];
    const accumulatedResults = [];

    sortedTrades.forEach(trade => {
        const date = new Date(trade.date).toISOString().split('T')[0];
        accumulatedResult += trade.result;

        dailyResults.push({ date, result: trade.result });
        accumulatedResults.push({ date, result: accumulatedResult });
    });

    return { dailyResults, accumulatedResults };
}

/**
 * Calcula estatísticas básicas das operações.
 * @param {Array} trades - Array de operações.
 * @returns {Object} Objeto contendo estatísticas básicas.
 */
export function calculateTradeStatistics(trades) {
    const totalTrades = trades.length;
    const winningTrades = trades.filter(trade => trade.result > 0).length;
    const losingTrades = trades.filter(trade => trade.result < 0).length;
    const totalProfit = trades.reduce((sum, trade) => sum + (trade.result > 0 ? trade.result : 0), 0);
    const totalLoss = Math.abs(trades.reduce((sum, trade) => sum + (trade.result < 0 ? trade.result : 0), 0));

    return {
        totalTrades,
        winningTrades,
        losingTrades,
        winRate: (winningTrades / totalTrades) * 100,
        totalProfit,
        totalLoss,
        profitFactor: totalProfit / totalLoss,
        averageWin: totalProfit / winningTrades,
        averageLoss: totalLoss / losingTrades
    };
}

/**
 * Calcula a sequência máxima de ganhos e perdas.
 * @param {Array} trades - Array de operações.
 * @returns {Object} Objeto contendo as sequências máximas.
 */
export function calculateMaxStreaks(trades) {
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;

    trades.forEach(trade => {
        if (trade.result > 0) {
            currentWinStreak++;
            currentLossStreak = 0;
            maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
        } else if (trade.result < 0) {
            currentLossStreak++;
            currentWinStreak = 0;
            maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
        }
    });

    return {
        maxWinStreak,
        maxLossStreak
    };
}