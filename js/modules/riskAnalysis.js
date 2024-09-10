import { getAssets } from './assetRegistration.js';

export function renderRiskAnalysis() {
    return `
        <div class="risk-analysis">
            <h2>Análise de Risco por Ativo</h2>
            <div class="charts">
                <div class="chart-container">
                    <canvas id="scatterChart"></canvas>
                </div>
                <div class="chart-container">
                    <canvas id="volatilityChart"></canvas>
                </div>
                <div class="chart-container">
                    <canvas id="correlationChart"></canvas>
                </div>
            </div>
        </div>
    `;
}

export function initRiskAnalysis() {
    renderScatterChart();
    renderVolatilityChart();
    renderCorrelationChart();
}

function renderScatterChart() {
    const ctx = document.getElementById('scatterChart').getContext('2d');
    const assets = getAssets();
    const data = assets.map(asset => ({
        x: Math.random() * 100, // Simulando retorno
        y: Math.random() * 50,  // Simulando risco
        r: asset.quantity * 2,  // Tamanho do ponto baseado na quantidade
        label: asset.assetType
    }));

    new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: [{
                label: 'Risco x Retorno',
                data: data,
                backgroundColor: data.map(d => d.label === 'WIN' ? 'rgba(255, 99, 132, 0.5)' : 'rgba(54, 162, 235, 0.5)')
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Dispersão de Risco x Retorno'
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Retorno (%)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Risco (%)'
                    }
                }
            }
        }
    });
}

function renderVolatilityChart() {
    const ctx = document.getElementById('volatilityChart').getContext('2d');
    const assets = getAssets();
    const volatility = assets.map(asset => Math.random() * 20); // Simulando volatilidade

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: assets.map(asset => asset.assetType),
            datasets: [{
                label: 'Volatilidade',
                data: volatility,
                backgroundColor: assets.map(asset => asset.assetType === 'WIN' ? 'rgba(255, 99, 132, 0.5)' : 'rgba(54, 162, 235, 0.5)')
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Volatilidade por Ativo'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Volatilidade (%)'
                    }
                }
            }
        }
    });
}

function renderCorrelationChart() {
    const ctx = document.getElementById('correlationChart').getContext('2d');
    const assets = getAssets();
    const correlation = Math.random() * 2 - 1; // Simulando correlação entre -1 e 1

    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Correlação WIN x WDO',
                data: [{ x: 0, y: 0 }, { x: correlation, y: correlation }],
                backgroundColor: 'rgba(75, 192, 192, 0.5)'
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Correlação entre Ativos'
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'WIN'
                    },
                    min: -1,
                    max: 1
                },
                y: {
                    title: {
                        display: true,
                        text: 'WDO'
                    },
                    min: -1,
                    max: 1
                }
            }
        }
    });
}