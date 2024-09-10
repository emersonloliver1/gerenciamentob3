import { getAssets } from './assetRegistration.js';

export function renderSettings() {
    return `
        <div class="settings">
            <h2>Configurações</h2>
            <div class="settings-content">
                <h3>Configurações Gerais</h3>
                <div class="settings-form">
                    <label for="initialCapital">Capital Inicial (R$):</label>
                    <input type="number" id="initialCapital" min="0" step="0.01">
                    
                    <label for="globalRiskValue">Limite de Risco Global (R$):</label>
                    <input type="number" id="globalRiskValue" min="0" step="0.01">
                    
                    <label for="gainPercentage">Meta de Ganho (%):</label>
                    <input type="number" id="gainPercentage" min="0" max="100" step="0.1">
                    
                    <label for="lossPercentage">Limite de Perda (%):</label>
                    <input type="number" id="lossPercentage" min="0" max="100" step="0.1">
                    
                    <button onclick="calculateTargets()">Calcular Metas</button>
                </div>
                <div id="targetResults"></div>
            </div>
        </div>
    `;
}

export function initSettings() {
    loadSavedSettings();
    window.calculateTargets = calculateTargets;
}

export function getSettings() {
    return JSON.parse(localStorage.getItem('settings') || '{}');
}

function loadSavedSettings() {
    const settings = getSettings();
    document.getElementById('initialCapital').value = settings.initialCapital || '';
    document.getElementById('globalRiskValue').value = settings.globalRiskValue || '';
    document.getElementById('gainPercentage').value = settings.gainPercentage || '';
    document.getElementById('lossPercentage').value = settings.lossPercentage || '';
}

function calculateTargets() {
    const initialCapital = parseFloat(document.getElementById('initialCapital').value);
    const globalRiskValue = parseFloat(document.getElementById('globalRiskValue').value);
    const gainPercentage = parseFloat(document.getElementById('gainPercentage').value);
    const lossPercentage = parseFloat(document.getElementById('lossPercentage').value);

    if (isNaN(initialCapital) || isNaN(globalRiskValue) || isNaN(gainPercentage) || isNaN(lossPercentage)) {
        alert('Por favor, preencha todos os campos com valores numéricos válidos.');
        return;
    }

    const gainTarget = initialCapital * (1 + gainPercentage / 100);
    const lossLimit = initialCapital * (1 - lossPercentage / 100);

    const resultsHtml = `
        <h4>Resultados:</h4>
        <p>Capital Inicial: R$ ${initialCapital.toFixed(2)}</p>
        <p>Limite de Risco Global: R$ ${globalRiskValue.toFixed(2)}</p>
        <p>Meta de Ganho: R$ ${gainTarget.toFixed(2)} (${gainPercentage}%)</p>
        <p>Limite de Perda: R$ ${lossLimit.toFixed(2)} (${lossPercentage}%)</p>
    `;

    document.getElementById('targetResults').innerHTML = resultsHtml;

    // Salvar configurações
    const settings = {
        initialCapital,
        globalRiskValue,
        gainPercentage,
        lossPercentage
    };
    localStorage.setItem('settings', JSON.stringify(settings));
}

// Outras funções de configuração podem ser adicionadas aqui