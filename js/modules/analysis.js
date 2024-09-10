import { getAssets } from './assetRegistration.js';
import { getSettings } from './settings.js';
import { calculateVaR, calculateBeta, calculateSharpeRatio } from './riskIndicators.js';
import { calculateDailyAndAccumulatedResults, calculateTradeStatistics, calculateMaxStreaks } from './tradeAnalytics.js';
import { renderCorrelationHeatmap } from './reportCharts.js';

export function renderAnalysis() {
    return `
        <div class="analysis">
            <h2>Análise Detalhada</h2>
            <div class="analysis-content">
                <div class="analysis-filters">
                    <label for="dateRange">Período de Análise:</label>
                    <select id="dateRange">
                        <option value="7">Últimos 7 dias</option>
                        <option value="30" selected>Últimos 30 dias</option>
                        <option value="90">Últimos 90 dias</option>
                        <option value="180">Últimos 180 dias</option>
                        <option value="365">Último ano</option>
                        <option value="all">Todo o período</option>
                    </select>
                    <button onclick="updateAnalysis()">Atualizar Análise</button>
                </div>
                <div class="analysis-grid">
                    <div class="analysis-card" id="performanceSummary"></div>
                    <div class="analysis-card" id="riskMetrics"></div>
                    <div class="analysis-card" id="tradePatterns"></div>
                    <div class="analysis-card" id="assetPerformance"></div>
                    <div class="analysis-card" id="timeAnalysis"></div>
                    <div class="analysis-card" id="drawdownAnalysis"></div>
                    <div class="analysis-card" id="volatilityAnalysis"></div>
                    <div class="analysis-card" id="correlationAnalysis"></div>
                </div>
                <div class="analysis-charts">
                    <div class="chart-container">
                        <canvas id="performanceChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="riskReturnChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="drawdownChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="volatilityChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <div id="correlationHeatmap"></div>
                    </div>
                </div>
                <div id="correlationInterpretation"></div>
                <div class="analysis-recommendations" id="recommendations"></div>
            </div>
        </div>
    `;
}

export function initAnalysis() {
    try {
        updateAnalysis();
        calculateAndDisplayContractCorrelation();
    } catch (error) {
        console.error('Erro ao inicializar análise:', error);
        document.querySelector('.analysis-content').innerHTML = `
            <p>Ocorreu um erro ao carregar a análise. Por favor, tente novamente mais tarde.</p>
        `;
    }
}

function updateAnalysis() {
    const dateRange = document.getElementById('dateRange').value;
    const trades = getFilteredTrades(dateRange);
    
    updatePerformanceSummary(trades);
    updateRiskMetrics(trades);
    updateTradePatterns(trades);
    updateAssetPerformance(trades);
    updateTimeAnalysis(trades);
    updateDrawdownAnalysis(trades);
    updateVolatilityAnalysis(trades);
    updateCorrelationAnalysis(trades);
    renderPerformanceChart(trades);
    renderRiskReturnChart(trades);
    renderDrawdownChart(trades);
    renderVolatilityChart(trades);
    generateRecommendations(trades);
}

function getFilteredTrades(dateRange) {
    const allTrades = JSON.parse(localStorage.getItem('trades') || '[]');
    console.log('Todos os trades:', allTrades); // Log para depuração

    const endDate = new Date();
    const startDate = new Date();
    startDate.getDate() - parseInt(dateRange);

    const filteredTrades = allTrades.filter(trade => {
        const tradeDate = new Date(trade.date);
        return tradeDate >= startDate && tradeDate <= endDate;
    });

    console.log('Trades filtrados:', filteredTrades); // Log para depuração
    return filteredTrades;
}

function updatePerformanceSummary(trades) {
    const { totalTrades, winRate, profitFactor } = calculateTradeStatistics(trades);
    const totalProfit = trades.reduce((sum, trade) => sum + trade.result, 0);
    const avgTradeResult = totalProfit / totalTrades;

    const performanceSummaryElement = document.getElementById('performanceSummary');
    if (!performanceSummaryElement) return; // Verificação adicional

    performanceSummaryElement.innerHTML = `
        <h3>Resumo de Performance</h3>
        <p>Total de Trades: ${totalTrades}</p>
        <p>Taxa de Acerto: ${winRate.toFixed(2)}%</p>
        <p>Fator de Lucro: ${profitFactor.toFixed(2)}</p>
        <p>Resultado Total: R$ ${totalProfit.toFixed(2)}</p>
        <p>Média por Trade: R$ ${avgTradeResult.toFixed(2)}</p>
    `;
}

function updateRiskMetrics(trades) {
    try {
        const var95 = calculateVaR(trades, 0.95);
        const var99 = calculateVaR(trades, 0.99);
        const beta = calculateBeta(trades, getMarketReturns());
        const sharpeRatio = calculateSharpeRatio(trades);

        document.getElementById('riskMetrics').innerHTML = `
            <h3>Métricas de Risco</h3>
            <p>VaR (95%): ${var95.toFixed(2)}</p>
            <p>VaR (99%): ${var99.toFixed(2)}</p>
            <p>Beta: ${beta.toFixed(2)}</p>
            <p>Índice de Sharpe: ${sharpeRatio.toFixed(2)}</p>
        `;
    } catch (error) {
        console.error('Erro ao calcular métricas de risco:', error);
        document.getElementById('riskMetrics').innerHTML = `
            <h3>Métricas de Risco</h3>
            <p>Erro ao calcular métricas de risco. Por favor, verifique seus dados.</p>
        `;
    }
}

function updateTradePatterns(trades) {
    const { maxWinStreak, maxLossStreak } = calculateMaxStreaks(trades);
    const avgWinSize = trades.filter(t => t.result > 0).reduce((sum, t) => sum + t.result, 0) / trades.filter(t => t.result > 0).length;
    const avgLossSize = Math.abs(trades.filter(t => t.result < 0).reduce((sum, t) => sum + t.result, 0) / trades.filter(t => t.result < 0).length);

    document.getElementById('tradePatterns').innerHTML = `
        <h3>Padrões de Trade</h3>
        <p>Sequência Máx. de Ganhos: ${maxWinStreak}</p>
        <p>Sequência Máx. de Perdas: ${maxLossStreak}</p>
        <p>Tamanho Médio de Ganho: R$ ${avgWinSize.toFixed(2)}</p>
        <p>Tamanho Médio de Perda: R$ ${avgLossSize.toFixed(2)}</p>
    `;
}

function updateAssetPerformance(trades) {
    const assetPerformance = trades.reduce((acc, trade) => {
        if (!acc[trade.contractType]) {
            acc[trade.contractType] = { totalProfit: 0, count: 0 };
        }
        acc[trade.contractType].totalProfit += trade.result;
        acc[trade.contractType].count++;
        return acc;
    }, {});

    let assetPerformanceHtml = '<h3>Performance por Ativo</h3>';
    for (const [asset, data] of Object.entries(assetPerformance)) {
        assetPerformanceHtml += `
            <p>${asset}: R$ ${data.totalProfit.toFixed(2)} (${data.count} trades)</p>
        `;
    }

    document.getElementById('assetPerformance').innerHTML = assetPerformanceHtml;
}

function updateTimeAnalysis(trades) {
    const timePerformance = trades.reduce((acc, trade) => {
        const hour = new Date(trade.date).getHours();
        if (!acc[hour]) {
            acc[hour] = { totalProfit: 0, count: 0 };
        }
        acc[hour].totalProfit += trade.result;
        acc[hour].count++;
        return acc;
    }, {});

    let bestHour = 0;
    let bestPerformance = -Infinity;
    for (const [hour, data] of Object.entries(timePerformance)) {
        if (data.totalProfit > bestPerformance) {
            bestHour = hour;
            bestPerformance = data.totalProfit;
        }
    }

    document.getElementById('timeAnalysis').innerHTML = `
        <h3>Análise Temporal</h3>
        <p>Melhor Hora para Operar: ${bestHour}:00</p>
        <p>Performance na Melhor Hora: R$ ${bestPerformance.toFixed(2)}</p>
    `;
}

function updateDrawdownAnalysis(trades) {
    const drawdownData = calculateDrawdown(trades);
    const maxDrawdown = Math.max(...drawdownData.map(d => d.drawdown));
    const avgDrawdown = drawdownData.reduce((sum, d) => sum + d.drawdown, 0) / drawdownData.length;

    document.getElementById('drawdownAnalysis').innerHTML = `
        <h3>Análise de Drawdown</h3>
        <p>Drawdown Máximo: ${maxDrawdown.toFixed(2)}%</p>
        <p>Drawdown Médio: ${avgDrawdown.toFixed(2)}%</p>
    `;
}

function updateVolatilityAnalysis(trades) {
    const returns = calculateDailyReturns(trades);
    const volatility = calculateVolatility(returns);

    document.getElementById('volatilityAnalysis').innerHTML = `
        <h3>Análise de Volatilidade</h3>
        <p>Volatilidade Diária: ${(volatility * 100).toFixed(2)}%</p>
        <p>Volatilidade Anualizada: ${(volatility * Math.sqrt(252) * 100).toFixed(2)}%</p>
    `;
}

function updateCorrelationAnalysis(trades) {
    const assetTypes = ['WIN', 'WDO'];
    const correlationMatrix = calculateCorrelationMatrix(trades, assetTypes);

    let correlationHtml = '<h3>Análise de Correlação</h3>';
    for (let i = 0; i < assetTypes.length; i++) {
        for (let j = i + 1; j < assetTypes.length; j++) {
            correlationHtml += `<p>Correlação ${assetTypes[i]} - ${assetTypes[j]}: ${correlationMatrix[i][j].toFixed(2)}</p>`;
        }
    }

    document.getElementById('correlationAnalysis').innerHTML = correlationHtml;
}

function calculateDrawdown(trades) {
    let peak = 0;
    let cumulativeReturn = 0;
    return trades.map(trade => {
        cumulativeReturn += trade.result;
        if (cumulativeReturn > peak) {
            peak = cumulativeReturn;
        }
        const drawdown = peak > 0 ? ((peak - cumulativeReturn) / peak) * 100 : 0;
        return { date: trade.date, drawdown };
    });
}

function calculateVolatility(returns) {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / returns.length;
    return Math.sqrt(variance);
}

function calculateCorrelationMatrix(trades, assetTypes) {
    const returns = assetTypes.map(type => 
        calculateDailyReturns(trades.filter(t => t.contractType === type))
    );

    const matrix = [];
    for (let i = 0; i < assetTypes.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < assetTypes.length; j++) {
            if (i === j) {
                matrix[i][j] = 1;
            } else {
                matrix[i][j] = calculateCorrelation(returns[i], returns[j]);
            }
        }
    }
    return matrix;
}

function calculateCorrelation(returns1, returns2) {
    const n = Math.min(returns1.length, returns2.length);
    const mean1 = returns1.reduce((sum, r) => sum + r, 0) / n;
    const mean2 = returns2.reduce((sum, r) => sum + r, 0) / n;
    const variance1 = returns1.reduce((sum, r) => sum + Math.pow(r - mean1, 2), 0) / n;
    const variance2 = returns2.reduce((sum, r) => sum + Math.pow(r - mean2, 2), 0) / n;
    const covariance = returns1.reduce((sum, r, i) => sum + (r - mean1) * (returns2[i] - mean2), 0) / n;
    return covariance / (Math.sqrt(variance1) * Math.sqrt(variance2));
}

function renderPerformanceChart(trades) {
    // Implement chart rendering using your preferred charting library
    console.log('Rendering performance chart');
}

function renderRiskReturnChart(trades) {
    // Implement chart rendering using your preferred charting library
    console.log('Rendering risk-return chart');
}

function renderDrawdownChart(trades) {
    // Implement drawdown chart rendering
    console.log('Rendering drawdown chart');
}

function renderVolatilityChart(trades) {
    // Implement volatility chart rendering
    console.log('Rendering volatility chart');
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

function getMarketReturns() {
    // Implement this function to get market returns data
    // For now, we'll return a dummy array
    return Array(30).fill(0.001);
}

function generateRecommendations(trades) {
    // Implement recommendations generation
    console.log('Generating recommendations');
}

function addSampleTrades() {
    const sampleTrades = [
        { date: '2023-05-01', result: 100 },
        { date: '2023-05-02', result: -50 },
        { date: '2023-05-03', result: 200 },
        { date: '2023-05-04', result: -30 },
        { date: '2023-05-05', result: 150 }
    ];
    localStorage.setItem('trades', JSON.stringify(sampleTrades));
}

// Descomente a linha abaixo para adicionar trades de exemplo
// addSampleTrades();

// Add this function to the global scope so it can be called from the HTML
window.updateAnalysis = updateAnalysis;

function calculateAndDisplayContractCorrelation() {
    const trades = JSON.parse(localStorage.getItem('trades') || '[]');
    const contractTypes = ['WIN', 'WDO'];
    
    // Agrupa os resultados por data e tipo de contrato
    const groupedResults = trades.reduce((acc, trade) => {
        const date = trade.date.split('T')[0];
        if (!acc[date]) acc[date] = {};
        if (!acc[date][trade.contractType]) acc[date][trade.contractType] = 0;
        acc[date][trade.contractType] += trade.result;
        return acc;
    }, {});

    // Prepara os dados para cálculo de correlação
    const data = contractTypes.map(type => 
        Object.values(groupedResults)
            .map(day => day[type] || 0)
    );

    // Calcula a matriz de correlação
    const correlationMatrix = calculateCorrelationMatrixForContracts(data);

    // Renderiza o heatmap de correlação
    renderCorrelationHeatmap('correlationHeatmap', correlationMatrix, contractTypes);

    // Exibe a interpretação da correlação
    displayCorrelationInterpretation(correlationMatrix, contractTypes);
}

function calculateCorrelationMatrixForContracts(data) {
    const matrix = [];
    for (let i = 0; i < data.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < data.length; j++) {
            matrix[i][j] = calculatePearsonCorrelation(data[i], data[j]);
        }
    }
    return matrix;
}

function calculatePearsonCorrelation(x, y) {
    const n = x.length;
    let sum_x = 0, sum_y = 0, sum_xy = 0, sum_x2 = 0, sum_y2 = 0;
    
    for (let i = 0; i < n; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += x[i] * y[i];
        sum_x2 += x[i] * x[i];
        sum_y2 += y[i] * y[i];
    }
    
    const numerator = n * sum_xy - sum_x * sum_y;
    const denominator = Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y));
    
    return denominator === 0 ? 0 : numerator / denominator;
}

function displayCorrelationInterpretation(correlationMatrix, contractTypes) {
    const interpretationElement = document.getElementById('correlationInterpretation');
    if (!interpretationElement) return;

    let interpretation = '<h4>Interpretação da Correlação:</h4>';
    for (let i = 0; i < contractTypes.length; i++) {
        for (let j = i + 1; j < contractTypes.length; j++) {
            const correlation = correlationMatrix[i][j];
            interpretation += `<p>A correlação entre ${contractTypes[i]} e ${contractTypes[j]} é ${correlation.toFixed(2)}. `;
            if (correlation > 0.7) {
                interpretation += 'Isso indica uma forte correlação positiva.</p>';
            } else if (correlation < -0.7) {
                interpretation += 'Isso indica uma forte correlação negativa.</p>';
            } else if (correlation > 0.3) {
                interpretation += 'Isso indica uma correlação positiva moderada.</p>';
            } else if (correlation < -0.3) {
                interpretation += 'Isso indica uma correlação negativa moderada.</p>';
            } else {
                interpretation += 'Isso indica uma correlação fraca ou inexistente.</p>';
            }
        }
    }
    interpretationElement.innerHTML = interpretation;
}