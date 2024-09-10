export function renderReturnRiskChart(selector, trades) {
    if (trades.length === 0) {
        console.warn('Sem dados para renderizar o gráfico de retorno vs risco');
        return;
    }

    const dailyReturns = calculateDailyReturns(trades);
    const risk = calculateRisk(dailyReturns);
    const averageReturn = calculateAverageReturn(dailyReturns);

    const options = {
        series: [{
            name: 'Retorno x Risco',
            data: [{ x: risk, y: averageReturn }]
        }],
        chart: {
            type: 'scatter',
            height: 350,
            zoom: { enabled: true, type: 'xy' }
        },
        xaxis: { title: { text: 'Risco (Desvio Padrão)' } },
        yaxis: { title: { text: 'Retorno Médio Diário (%)' } },
        title: { text: 'Retorno x Risco', align: 'center' },
        colors: ['#008FFB']
    };

    const chart = new ApexCharts(document.querySelector(selector), options);
    chart.render();
}

export function renderAssetAllocationChart(elementId, assets) {
    const assetTypes = ['WIN', 'WDO'];
    const allocation = calculateAssetAllocation(assets, assetTypes);

    const options = {
        series: allocation,
        chart: { type: 'pie', height: 350 },
        labels: assetTypes,
        title: { text: 'Alocação por Classe de Ativos', align: 'center' },
        colors: ['#00E396', '#FEB019'],
        responsive: [{
            breakpoint: 480,
            options: {
                chart: { width: 200 },
                legend: { position: 'bottom' }
            }
        }]
    };

    const chart = new ApexCharts(document.querySelector(elementId), options);
    chart.render();
}

export function renderPerformanceChart(elementId, trades) {
    const performanceData = calculateCumulativePerformance(trades);

    const options = {
        series: [{
            name: 'Performance Acumulada',
            data: performanceData.map(data => [new Date(data.date).getTime(), data.cumulativeReturn])
        }],
        chart: {
            type: 'area',
            height: 350,
            zoom: { enabled: false }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth' },
        title: { text: 'Performance Acumulada', align: 'center' },
        xaxis: { type: 'datetime', title: { text: 'Data' } },
        yaxis: { title: { text: 'Retorno Acumulado (%)' } },
        colors: ['#00E396']
    };

    const chart = new ApexCharts(document.querySelector(elementId), options);
    chart.render();
}

export function renderDrawdownChart(elementId, trades) {
    const drawdownData = calculateDrawdown(trades);

    const options = {
        series: [{
            name: 'Drawdown',
            data: drawdownData.map(data => [new Date(data.date).getTime(), data.drawdown])
        }],
        chart: {
            type: 'area',
            height: 350,
            zoom: { enabled: false }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth' },
        title: { text: 'Drawdown', align: 'center' },
        xaxis: { type: 'datetime', title: { text: 'Data' } },
        yaxis: {
            title: { text: 'Drawdown (%)' },
            labels: {
                formatter: function (value) {
                    return value.toFixed(2) + '%';
                }
            },
            reversed: true
        },
        colors: ['#FF4560'],
        tooltip: {
            y: {
                formatter: function (value) {
                    return value.toFixed(2) + '%';
                }
            }
        }
    };

    const chart = new ApexCharts(document.querySelector(elementId), options);
    chart.render();
}

function calculateDailyReturns(trades) {
    return Object.values(trades.reduce((acc, trade) => {
        const date = trade.date.split('T')[0];
        acc[date] = (acc[date] || 0) + trade.result;
        return acc;
    }, {}));
}

function calculateRisk(returns) {
    const mean = returns.reduce((sum, return_) => sum + return_, 0) / returns.length;
    const variance = returns.reduce((sum, return_) => sum + Math.pow(return_ - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
}

function calculateAverageReturn(returns) {
    return returns.reduce((sum, return_) => sum + return_, 0) / returns.length;
}

function calculateAssetAllocation(assets, assetTypes) {
    return assetTypes.map(type => 
        assets.filter(asset => asset.assetType === type)
            .reduce((sum, asset) => sum + parseFloat(asset.quantity) * parseFloat(asset.price), 0)
    );
}

function calculateCumulativePerformance(trades) {
    let cumulativeReturn = 0;
    return trades
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(trade => ({
            date: trade.date,
            cumulativeReturn: (cumulativeReturn += trade.result)
        }));
}

function calculateDrawdown(trades) {
    let peak = 0;
    let cumulativeReturn = 0;
    return trades
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(trade => {
            cumulativeReturn += trade.result;
            if (cumulativeReturn > peak) {
                peak = cumulativeReturn;
            }
            const drawdown = peak > 0 ? ((peak - cumulativeReturn) / peak) * 100 : 0;
            return {
                date: trade.date,
                drawdown: drawdown
            };
        });
}