import { getAssets } from './assetRegistration.js';
import { getSettings } from './settings.js';
import { renderReturnRiskChart, renderAssetAllocationChart, renderPerformanceChart, renderDrawdownChart } from './reportCharts.js';
import { calculateVaR, calculateBeta, calculateDrawdown } from './financialCalculations.js';

let filteredTrades = [];
let reportPeriod = { startDate: null, endDate: null };

export function renderPerformanceReports() {
    return `
        <div class="performance-reports">
            <h2>Relatórios de Performance</h2>
            <div class="date-filter">
                <label for="startDate">Data Inicial:</label>
                <input type="date" id="startDate">
                <label for="endDate">Data Final:</label>
                <input type="date" id="endDate">
                <button onclick="applyDateFilter()">Aplicar Filtro</button>
            </div>
            <div class="report-options">
                <button onclick="generatePDFReport()">Gerar Relatório PDF</button>
                <button onclick="generateExcelReport()">Gerar Relatório Excel</button>
            </div>
            <div class="report-summary">
                <h3>Resumo de Performance</h3>
                <div id="performanceSummary"></div>
            </div>
            <div class="charts">
                <div id="returnRiskChart"></div>
                <div id="assetAllocationChart"></div>
                <div id="performanceChart"></div>
                <div id="drawdownChart"></div>
            </div>
        </div>
    `;
}

export function initPerformanceReports() {
    setDefaultDates();
    updatePerformanceData();
}

function setDefaultDates() {
    const today = new Date();
    
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    if (startDateInput && endDateInput) {
        const formattedDate = today.toISOString().split('T')[0];
        startDateInput.value = formattedDate;
        endDateInput.value = formattedDate;

        reportPeriod.startDate = today;
        reportPeriod.endDate = today;
    }
}

function updatePerformanceData() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    if (!startDateInput || !endDateInput) {
        console.error('Elementos de data não encontrados');
        return;
    }

    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Datas inválidas');
        return;
    }

    reportPeriod.startDate = startDate;
    reportPeriod.endDate = endDate;

    filteredTrades = getFilteredTrades();
    renderCharts();
    updatePerformanceSummary();
}

function getFilteredTrades() {
    const allTrades = JSON.parse(localStorage.getItem('trades') || '[]');
    return allTrades.filter(trade => {
        const tradeDate = new Date(trade.date);
        return !isNaN(tradeDate.getTime()) && 
               tradeDate >= reportPeriod.startDate && 
               tradeDate <= reportPeriod.endDate;
    });
}

function updatePerformanceSummary() {
    const summary = generateSummary();
    document.getElementById('performanceSummary').innerHTML = Object.entries(summary)
        .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
        .join('');
}

function renderCharts() {
    if (filteredTrades.length === 0) {
        console.warn('Não há trades para o período selecionado.');
        clearCharts();
        return;
    }

    try {
        renderReturnRiskChart('#returnRiskChart', filteredTrades);
        renderAssetAllocationChart('#assetAllocationChart', getAssets());
        renderPerformanceChart('#performanceChart', filteredTrades);
        renderDrawdownChart('#drawdownChart', filteredTrades);
    } catch (error) {
        console.error('Erro ao renderizar gráficos:', error);
        clearCharts();
    }
}

function clearCharts() {
    ['#returnRiskChart', '#assetAllocationChart', '#performanceChart', '#drawdownChart'].forEach(chartId => {
        const chartElement = document.querySelector(chartId);
        if (chartElement) {
            chartElement.innerHTML = 'Dados insuficientes para gerar o gráfico.';
        }
    });
}

function generateSummary() {
    const assets = getAssets();
    const returns = calculateReturns(filteredTrades);
    const totalReturn = filteredTrades.reduce((sum, trade) => sum + trade.result, 0);
    const winTrades = filteredTrades.filter(trade => trade.result > 0).length;
    const lossTrades = filteredTrades.filter(trade => trade.result < 0).length;
    const winRate = (winTrades / filteredTrades.length) * 100 || 0;

    const var95 = calculateVaR(returns, 0.95);
    const beta = calculateBeta(returns, getMarketReturns());
    const maxDrawdown = calculateDrawdown(returns);
    const profitFactor = calculateProfitFactor(filteredTrades);

    return {
        'Retorno Total': `R$ ${totalReturn.toFixed(2)}`,
        'Número de Trades': filteredTrades.length,
        'Taxa de Acerto': `${winRate.toFixed(2)}%`,
        'Exposição Total': `R$ ${calculateTotalExposure(assets).toFixed(2)}`,
        'VaR (95%)': `${(var95 * 100).toFixed(2)}%`,
        'Beta': formatRatio(beta),
        'Máximo Drawdown': `${(maxDrawdown * 100).toFixed(2)}%`,
        'Fator de Lucro': formatRatio(profitFactor)
    };
}

function formatRatio(ratio) {
    if (!isFinite(ratio) || isNaN(ratio)) {
        return 'N/A';
    }
    return ratio.toFixed(2);
}

function calculateReturns(trades) {
    let cumulativeValue = 1;
    return trades.map(trade => {
        const return_ = trade.result / cumulativeValue;
        cumulativeValue += trade.result;
        return return_;
    });
}

function calculateTotalExposure(assets) {
    return assets.reduce((sum, asset) => sum + parseFloat(asset.quantity) * parseFloat(asset.price), 0);
}

function calculateProfitFactor(trades) {
    const grossProfit = trades.filter(trade => trade.result > 0).reduce((sum, trade) => sum + trade.result, 0);
    const grossLoss = Math.abs(trades.filter(trade => trade.result < 0).reduce((sum, trade) => sum + trade.result, 0));
    
    if (grossLoss === 0) {
        return grossProfit > 0 ? 100 : 0; // Retorna um valor alto, mas não infinito, se não houver perdas
    }
    
    const profitFactor = grossProfit / grossLoss;
    return isFinite(profitFactor) ? profitFactor : 0;
}

function getMarketReturns() {
    // Implemente esta função para obter os retornos do mercado
    // Por exemplo, você pode usar uma API para obter dados do índice Ibovespa
    return []; // Retorne um array de retornos diários do mercado
}

async function generatePDFReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Relatório de Performance', 105, 15, null, null, 'center');
    
    doc.setFontSize(12);
    doc.text(`Período: ${reportPeriod.startDate.toLocaleDateString()} a ${reportPeriod.endDate.toLocaleDateString()}`, 20, 25);
    
    const summary = generateSummary();
    doc.autoTable({
        head: [['Métrica', 'Valor']],
        body: Object.entries(summary),
        startY: 35
    });
    
    await addChartsToReport(doc);
    
    doc.addPage();
    addTradeListToReport(doc);
    
    doc.save('relatorio_performance_detalhado.pdf');
}

async function addChartsToReport(doc) {
    const charts = ['#returnRiskChart', '#assetAllocationChart', '#performanceChart', '#drawdownChart'];
    let yPosition = doc.lastAutoTable.finalY + 10;
    
    for (const chartId of charts) {
        const chart = document.querySelector(chartId);
        const canvas = await html2canvas(chart);
        const imgData = canvas.toDataURL('image/png');
        
        if (yPosition + 100 > doc.internal.pageSize.height) {
            doc.addPage();
            yPosition = 20;
        }
        
        doc.addImage(imgData, 'PNG', 20, yPosition, 170, 85);
        yPosition += 95;
    }
}

function addTradeListToReport(doc) {
    doc.text('Lista de Trades', 105, 20, null, null, 'center');
    
    doc.autoTable({
        head: [['Data', 'Ativo', 'Quantidade', 'Resultado']],
        body: filteredTrades.map(trade => [
            trade.date,
            trade.assetType,
            trade.quantity,
            `R$ ${trade.result.toFixed(2)}`
        ]),
        startY: 30
    });
}

function generateExcelReport() {
    const wb = XLSX.utils.book_new();
    
    addSummarySheet(wb);
    addTradesSheet(wb);
    addDailyPerformanceSheet(wb);
    
    XLSX.writeFile(wb, 'relatorio_performance_detalhado.xlsx');
}

function addSummarySheet(wb) {
    const summary = generateSummary();
    const assets = getAssets();
    
    const summaryData = [
        ['Resumo de Performance'],
        ...Object.entries(summary),
        [],
        ['Alocação de Ativos'],
        ['Tipo de Ativo', 'Valor Alocado'],
        ['WIN', calculateAssetAllocation(assets, ['WIN'])[0]],
        ['WDO', calculateAssetAllocation(assets, ['WDO'])[0]]
    ];
    
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    applyStylesToSheet(summaryWs);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Resumo");
}

function applyStylesToSheet(ws) {
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = {c:C, r:R};
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if(!ws[cell_ref]) continue;
            ws[cell_ref].s = {
                font: {bold: true, color: {rgb: "FFFFAA00"}},
                fill: {fgColor: {rgb: "FF303030"}}
            };
        }
    }
}

function addTradesSheet(wb) {
    const tradesWs = XLSX.utils.json_to_sheet(filteredTrades);
    XLSX.utils.book_append_sheet(wb, tradesWs, "Trades");
}

function addDailyPerformanceSheet(wb) {
    const dailyPerformance = calculateDailyPerformance();
    const dailyPerformanceWs = XLSX.utils.json_to_sheet(dailyPerformance);
    XLSX.utils.book_append_sheet(wb, dailyPerformanceWs, "Performance Diária");
}

function calculateAssetAllocation(assets, assetTypes) {
    return assetTypes.map(type => 
        assets.filter(asset => asset.assetType === type)
            .reduce((sum, asset) => sum + parseFloat(asset.quantity) * parseFloat(asset.price), 0)
    );
}

function calculateDailyPerformance() {
    const dailyPerformance = filteredTrades.reduce((acc, trade) => {
        const date = trade.date.split('T')[0];
        if (!acc[date]) {
            acc[date] = { date, result: 0, trades: 0 };
        }
        acc[date].result += trade.result;
        acc[date].trades += 1;
        return acc;
    }, {});

    return Object.values(dailyPerformance).map(day => ({
        Data: day.date,
        'Resultado Diário': day.result.toFixed(2),
        'Número de Trades': day.trades
    }));
}

function applyDateFilter() {
    updatePerformanceData();
}

// Adiciona estas funções ao escopo global para que possam ser chamadas pelo onclick
window.generatePDFReport = generatePDFReport;
window.generateExcelReport = generateExcelReport;
window.applyDateFilter = applyDateFilter;

// Exporta as funções para uso em outros módulos
export { generatePDFReport, generateExcelReport, applyDateFilter };