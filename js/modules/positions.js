import { updateDashboard } from './dashboard.js';

export function renderPositions() {
    const trades = JSON.parse(localStorage.getItem('trades') || '[]');
    
    return `
        <div class="positions">
            <h2>Posições</h2>
            <table id="positionsTable">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Contrato</th>
                        <th>Quantidade</th>
                        <th>Resultado (R$)</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${trades.map(trade => `
                        <tr data-id="${trade.id}">
                            <td>${trade.date}</td>
                            <td>${trade.contractType}</td>
                            <td>${trade.quantity}</td>
                            <td>${trade.result.toFixed(2)}</td>
                            <td>
                                <button onclick="editTrade(${trade.id})">Editar</button>
                                <button onclick="deleteTrade(${trade.id})">Excluir</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

export function initPositions() {
    // Adicionar listeners ou lógica de inicialização, se necessário
}

function editTrade(tradeId) {
    const trades = JSON.parse(localStorage.getItem('trades') || '[]');
    const trade = trades.find(t => t.id === tradeId);
    
    if (!trade) {
        alert('Trade não encontrado');
        return;
    }

    const newResult = prompt('Digite o novo resultado:', trade.result);
    if (newResult === null) return; // Usuário cancelou

    trade.result = parseFloat(newResult);
    localStorage.setItem('trades', JSON.stringify(trades));
    updatePositionsTable();
    updateDashboard();
}

function deleteTrade(tradeId) {
    if (!confirm('Tem certeza que deseja excluir este trade?')) return;

    let trades = JSON.parse(localStorage.getItem('trades') || '[]');
    trades = trades.filter(t => t.id !== tradeId);
    localStorage.setItem('trades', JSON.stringify(trades));
    updatePositionsTable();
    updateDashboard();
}

function updatePositionsTable() {
    const tableBody = document.querySelector('#positionsTable tbody');
    const trades = JSON.parse(localStorage.getItem('trades') || '[]');
    
    tableBody.innerHTML = trades.map(trade => `
        <tr data-id="${trade.id}">
            <td>${trade.date}</td>
            <td>${trade.contractType}</td>
            <td>${trade.quantity}</td>
            <td>${trade.result.toFixed(2)}</td>
            <td>
                <button onclick="editTrade(${trade.id})">Editar</button>
                <button onclick="deleteTrade(${trade.id})">Excluir</button>
            </td>
        </tr>
    `).join('');
}

// Adicionar funções ao escopo global para que possam ser chamadas pelo onclick
window.editTrade = editTrade;
window.deleteTrade = deleteTrade;

// Exportar funções para uso em outros módulos
export { editTrade, deleteTrade, updatePositionsTable };