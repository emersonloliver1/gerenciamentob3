let globalRiskValue = parseFloat(localStorage.getItem('globalRiskValue')) || 1800;

export function renderSettings() {
    const settings = getSettings();
    return `
        <div class="settings">
            <h2>Configurações de Risco</h2>
            <form id="settingsForm">
                <div class="settings-grid">
                    <div class="form-group">
                        <label for="globalRiskValue">Valor de Risco Global (R$):</label>
                        <input type="number" id="globalRiskValue" value="${settings.globalRiskValue}" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label for="dailyLossLimit">Limite de Perda Diária (%):</label>
                        <input type="number" id="dailyLossLimit" value="${settings.dailyLossLimit}" step="0.1" required>
                        <span class="calculated-value">R$ ${(settings.globalRiskValue * settings.dailyLossLimit / 100).toFixed(2)}</span>
                    </div>
                    <div class="form-group">
                        <label for="weeklyLossLimit">Limite de Perda Semanal (%):</label>
                        <input type="number" id="weeklyLossLimit" value="${settings.weeklyLossLimit}" step="0.1" required>
                        <span class="calculated-value">R$ ${(settings.globalRiskValue * settings.weeklyLossLimit / 100).toFixed(2)}</span>
                    </div>
                    <div class="form-group">
                        <label for="monthlyLossLimit">Limite de Perda Mensal (%):</label>
                        <input type="number" id="monthlyLossLimit" value="${settings.monthlyLossLimit}" step="0.1" required>
                        <span class="calculated-value">R$ ${(settings.globalRiskValue * settings.monthlyLossLimit / 100).toFixed(2)}</span>
                    </div>
                    <div class="form-group">
                        <label for="dailyProfitTarget">Meta de Lucro Diária (%):</label>
                        <input type="number" id="dailyProfitTarget" value="${settings.dailyProfitTarget}" step="0.1" required>
                        <span class="calculated-value">R$ ${(settings.globalRiskValue * settings.dailyProfitTarget / 100).toFixed(2)}</span>
                    </div>
                    <div class="form-group">
                        <label for="weeklyProfitTarget">Meta de Lucro Semanal (%):</label>
                        <input type="number" id="weeklyProfitTarget" value="${settings.weeklyProfitTarget}" step="0.1" required>
                        <span class="calculated-value">R$ ${(settings.globalRiskValue * settings.weeklyProfitTarget / 100).toFixed(2)}</span>
                    </div>
                    <div class="form-group">
                        <label for="monthlyProfitTarget">Meta de Lucro Mensal (%):</label>
                        <input type="number" id="monthlyProfitTarget" value="${settings.monthlyProfitTarget}" step="0.1" required>
                        <span class="calculated-value">R$ ${(settings.globalRiskValue * settings.monthlyProfitTarget / 100).toFixed(2)}</span>
                    </div>
                    <div class="form-group">
                        <label for="riskRewardRatio">Relação Risco/Retorno:</label>
                        <input type="number" id="riskRewardRatio" value="${settings.riskRewardRatio}" step="0.1" required>
                    </div>
                    <div class="form-group">
                        <label for="maxDailyTrades">Número Máximo de Trades Diários:</label>
                        <input type="number" id="maxDailyTrades" value="${settings.maxDailyTrades}" step="1" required>
                    </div>
                </div>
                <button type="submit">Salvar Configurações</button>
            </form>
        </div>
    `;
}

export function initSettings() {
    const form = document.getElementById('settingsForm');
    form.addEventListener('submit', handleSettingsSubmit);
    form.addEventListener('input', updateCalculatedValues);
}

function updateCalculatedValues(event) {
    if (event.target.id === 'globalRiskValue' || event.target.id.includes('Limit') || event.target.id.includes('Target')) {
        const globalRiskValue = parseFloat(document.getElementById('globalRiskValue').value);
        const fields = ['dailyLossLimit', 'weeklyLossLimit', 'monthlyLossLimit', 'dailyProfitTarget', 'weeklyProfitTarget', 'monthlyProfitTarget'];
        
        fields.forEach(field => {
            const input = document.getElementById(field);
            const calculatedValue = input.nextElementSibling;
            const percentage = parseFloat(input.value);
            calculatedValue.textContent = `R$ ${(globalRiskValue * percentage / 100).toFixed(2)}`;
        });
    }
}

function handleSettingsSubmit(event) {
    event.preventDefault();
    const settings = getSettings();
    Object.keys(settings).forEach(key => {
        const input = document.getElementById(key);
        if (input) {
            settings[key] = key === 'maxDailyTrades' ? parseInt(input.value) : parseFloat(input.value);
        }
    });
    
    Object.entries(settings).forEach(([key, value]) => {
        localStorage.setItem(key, value);
    });

    alert('Configurações salvas com sucesso!');
}

export function getGlobalRiskValue() {
    return parseFloat(localStorage.getItem('globalRiskValue')) || 1800;
}

export function getSettings() {
    return {
        globalRiskValue: getGlobalRiskValue(),
        dailyLossLimit: parseFloat(localStorage.getItem('dailyLossLimit')) || 1,
        weeklyLossLimit: parseFloat(localStorage.getItem('weeklyLossLimit')) || 3,
        monthlyLossLimit: parseFloat(localStorage.getItem('monthlyLossLimit')) || 5,
        dailyProfitTarget: parseFloat(localStorage.getItem('dailyProfitTarget')) || 2,
        weeklyProfitTarget: parseFloat(localStorage.getItem('weeklyProfitTarget')) || 5,
        monthlyProfitTarget: parseFloat(localStorage.getItem('monthlyProfitTarget')) || 10,
        riskRewardRatio: parseFloat(localStorage.getItem('riskRewardRatio')) || 2,
        maxDailyTrades: parseInt(localStorage.getItem('maxDailyTrades')) || 5
    };
}