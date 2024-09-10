import { calculateVaR, calculateBeta, calculateSharpeRatio } from './riskIndicators.js';
import { getSettings } from './settings.js';
import { calculateDailyAndAccumulatedResults, calculateTradeStatistics, calculateMaxStreaks } from './tradeAnalytics.js';
import { handleError } from './errorHandling.js';
import { setCache, getCache } from './cache.js';

const RISK_LIMIT = getSettings().globalRiskValue;
const INITIAL_CAPITAL = 1800; // Saldo inicial parametrizado

// Inicialize accumulatedResults como um array vazio
let accumulatedResults = [];

export function renderDashboard() {
    const trades = JSON.parse(localStorage.getItem('trades') || '[]');
    const monthlyBalance = calculateMonthlyBalance(trades);
    const totalBalance = INITIAL_CAPITAL + monthlyBalance;
    
    // Calcular indicadores de risco
    const percentagePL = calculatePercentagePL(trades);
    const beta = calculateBeta(trades, getMarketReturns());

    // Calcular estatísticas de trades
    const { totalTrades, winRate, profitFactor } = calculateTradeStatistics(trades);
    const { maxWinStreak, maxLossStreak } = calculateMaxStreaks(trades);

    // Calcule os resultados acumulados aqui
    const { dailyResults, accumulatedResults: newAccumulatedResults } = calculateDailyAndAccumulatedResults(trades);
    accumulatedResults = newAccumulatedResults; // Atualize a variável global

    return `
        <div class="dashboard">
            <header class="dashboard-header fixed-header">
                <h2>Dashboard de Riscos - Contratos Futuros</h2>
                <div class="exchange-rate" id="exchangeRate">
                    <span class="exchange-icon">📊</span>
                    <span class="flag">🇧🇷</span>
                    <span id="exchangeRateValue">Carregando...</span>
                    <span class="flag">🇺🇸</span>
                </div>
                <nav class="main-nav">
                    <ul>
                        <li><a href="#dashboard" class="active">Dashboard</a></li>
                        <li><a href="#posicoes">Posições</a></li>
                        <li><a href="#analise">Análise</a></li>
                        <li><a href="#relatorios">Relatórios</a></li>
                        <li><a href="#configuracoes">Configurações</a></li>
                        <li><a href="#" id="logoutBtn">Sair</a></li>
                    </ul>
                </nav>
            </header>
            <div class="dashboard-content">
                <div class="risk-summary">
                    <div class="risk-card">
                        <h3>Saldo Acumulado no Mês</h3>
                        <p>R$ ${monthlyBalance.toFixed(2)}</p>
                    </div>
                    <div class="risk-card">
                        <h3>Limite de Risco</h3>
                        <p>R$ ${RISK_LIMIT.toFixed(2)}</p>
                    </div>
                    <div class="risk-card">
                        <h3>Saldo Total</h3>
                        <p>R$ ${totalBalance.toFixed(2)}</p>
                    </div>
                    <div class="risk-card">
                        <h3>% L/P sobre capital</h3>
                        <p id="percentagePL">Calculando...</p>
                    </div>
                    <div class="risk-card">
                        <h3>Beta</h3>
                        <p id="beta">Calculando...</p>
                    </div>
                    <div class="risk-card">
                        <h3>Total de Trades</h3>
                        <p>${totalTrades}</p>
                    </div>
                    <div class="risk-card">
                        <h3>Taxa de Acerto</h3>
                        <p>${winRate.toFixed(2)}%</p>
                    </div>
                    <div class="risk-card">
                        <h3>Fator de Lucro</h3>
                        <p id="profitFactor">Calculando...</p>
                    </div>
                    <div class="risk-card">
                        <h3>Sequência Máx. de Ganhos</h3>
                        <p>${maxWinStreak}</p>
                    </div>
                    <div class="risk-card">
                        <h3>Sequência Máx. de Perdas</h3>
                        <p>${maxLossStreak}</p>
                    </div>
                </div>
                <div class="risk-alert" style="display: ${monthlyBalance <= -RISK_LIMIT ? 'block' : 'none'};">
                    Atenção: Limite de risco atingido ou ultrapassado!
                </div>
                <div class="quick-trade-form">
                    <h3>Lançar Posição Rápida</h3>
                    <form id="quickTradeForm">
                        <select id="contractType" required>
                            <option value="">Selecione o contrato</option>
                            <option value="WIN">Mini Índice (WIN)</option>
                            <option value="WDO">Mini Dólar (WDO)</option>
                        </select>
                        <input type="number" id="quantity" placeholder="Quantidade" required>
                        <input type="number" id="result" placeholder="Resultado (R$)" step="0.01" required>
                        <button type="submit">Lançar Posição</button>
                    </form>
                </div>
                <div class="charts">
                    <div class="chart-container">
                        <canvas id="portfolioEvolutionChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function initDashboard() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                const dashboardElement = document.querySelector('.dashboard');
                if (dashboardElement) {
                    updateDashboard();
                    initQuickTradeForm();
                    initExchangeRateUpdate();
                    updateDashboardMetrics();
                    initFixedHeader();
                    observer.disconnect();
                }
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function initFixedHeader() {
    const header = document.querySelector('.fixed-header');
    const content = document.querySelector('.dashboard-content');
    if (header && content) {
        const headerHeight = header.offsetHeight;
        content.style.marginTop = `${headerHeight}px`;
    }
}

function initQuickTradeForm() {
    const form = document.getElementById('quickTradeForm');
    form.addEventListener('submit', handleQuickTrade);
}

function handleQuickTrade(event) {
    event.preventDefault();
    const contractType = document.getElementById('contractType').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const result = parseFloat(document.getElementById('result').value);

    const resultType = result >= 0 ? 'Lucro' : 'Perda';

    const trade = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        contractType,
        quantity,
        result
    };

    let trades = JSON.parse(localStorage.getItem('trades') || '[]');
    trades.push(trade);
    localStorage.setItem('trades', JSON.stringify(trades));

    alert(`Posição lançada com sucesso!\n${resultType}: R$ ${Math.abs(result).toFixed(2)}`);
    event.target.reset();
    updateDashboard();
}

function renderCharts() {
    if (accumulatedResults.length === 0) {
        console.warn('accumulatedResults está vazio. Não é possível renderizar o gráfico.');
        return;
    }

    if (document.getElementById('portfolioEvolutionChart')) {
        renderPortfolioEvolutionChart();
    }
    // ... outros gráficos ...
}

let portfolioChart; // Variável global para armazenar a instância do gráfico

function renderPortfolioEvolutionChart() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js não está carregado. Verifique se o script foi incluído corretamente.');
        return;
    }

    const ctx = document.getElementById('portfolioEvolutionChart');
    if (!ctx) {
        console.error('Elemento canvas não encontrado');
        return;
    }

    // Destruir o gráfico existente, se houver
    if (portfolioChart) {
        portfolioChart.destroy();
    }

    // Criar novo gráfico
    portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: accumulatedResults.map(result => result.date),
            datasets: [
                {
                    label: 'Valor Total do Portfólio',
                    data: accumulatedResults.map(result => result.totalValue),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function calculateMonthlyBalance(trades) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return trades.reduce((balance, trade) => {
        const tradeDate = new Date(trade.date);
        if (tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear) {
            return balance + trade.result;
        }
        return balance;
    }, 0);
}

function initExchangeRateUpdate() {
    fetchExchangeRate();
    // Atualiza a cada 60 segundos (1 minuto)
    setInterval(fetchExchangeRate, 60000);
}

async function fetchExchangeRate() {
    const exchangeRateElement = document.getElementById('exchangeRateValue');
    if (!exchangeRateElement) return;

    exchangeRateElement.textContent = 'Atualizando...';

    try {
        const cachedRate = getCache('exchangeRate');
        if (cachedRate) {
            exchangeRateElement.textContent = `R$ ${cachedRate}`;
            return;
        }

        const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
        if (!response.ok) {
            throw new Error('Falha na resposta da rede');
        }
        const data = await response.json();
        if (data && data.USDBRL && data.USDBRL.bid) {
            const rate = parseFloat(data.USDBRL.bid).toFixed(2);
            exchangeRateElement.textContent = `R$ ${rate}`;
            setCache('exchangeRate', rate, 5); // Cache por 5 minutos
        } else {
            throw new Error('Dados inválidos recebidos da API');
        }
    } catch (error) {
        handleError(error, 'Busca de taxa de câmbio');
        exchangeRateElement.textContent = 'Erro ao atualizar';
    }
}

function getMarketReturns() {
    // Simular retornos do mercado para fins de demonstração
    return Array.from({length: 30}, () => Math.random() * 0.02 - 0.01);
}

export function updateDashboard() {
    const trades = JSON.parse(localStorage.getItem('trades') || '[]');
    console.log('Trades carregados:', trades);
    
    const { dailyResults, accumulatedResults: newAccumulatedResults } = calculateDailyAndAccumulatedResults(trades);
    
    if (newAccumulatedResults.length === 0) {
        console.warn('Não há dados de trades para exibir no gráfico.');
        return;
    }
    
    accumulatedResults = newAccumulatedResults;
    
    renderCharts();
    updateDashboardMetrics();
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

// Chame esta função uma vez para adicionar dados de exemplo
// addSampleTrades();

function updateDashboardMetrics() {
    const trades = JSON.parse(localStorage.getItem('trades') || '[]');
    
    const percentagePL = calculatePercentagePL(trades);
    const beta = calculateBeta(trades, getMarketReturns());
    const { profitFactor } = calculateTradeStatistics(trades);

    updateElementText('percentagePL', `${percentagePL.toFixed(2)}%`);
    updateElementText('beta', beta.toFixed(2));
    updateElementText('profitFactor', profitFactor.toFixed(2));

    // ... (atualizar outros elementos se necessário)
}

function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    } else {
        console.warn(`Elemento com id '${id}' não encontrado.`);
    }
}

function calculatePercentagePL(trades) {
    const currentBalance = INITIAL_CAPITAL + trades.reduce((sum, trade) => sum + trade.result, 0);
    return ((currentBalance - INITIAL_CAPITAL) / INITIAL_CAPITAL) * 100;
}