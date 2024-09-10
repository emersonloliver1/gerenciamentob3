export function renderMenu() {
    return `
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
    `;
}