import { validateAssetInput } from './validation.js';
import { handleError } from './errorHandling.js';

export function renderAssetRegistration() {
    return `
        <div class="asset-registration">
            <h2>Cadastro de Contratos Futuros</h2>
            <div class="asset-grid">
                <div class="asset-form-container">
                    <form id="assetForm" class="asset-form">
                        <div class="form-group">
                            <label for="assetType">Tipo de Contrato</label>
                            <select id="assetType" required>
                                <option value="">Selecione o contrato</option>
                                <option value="WIN">Mini Índice (WIN)</option>
                                <option value="WDO">Mini Dólar (WDO)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="expirationDate">Data de Vencimento</label>
                            <input type="text" id="expirationDate" placeholder="MM/AAAA" required>
                        </div>
                        <div class="form-group">
                            <label for="quantity">Quantidade de Contratos</label>
                            <input type="number" id="quantity" required>
                        </div>
                        <div class="form-group">
                            <label for="price">Preço de Entrada</label>
                            <input type="number" id="price" step="0.5" required>
                        </div>
                        <button type="submit" class="btn-primary">Cadastrar Contrato</button>
                    </form>
                </div>
                <div class="asset-list-container">
                    <h3>Contratos Cadastrados</h3>
                    <div id="assetList" class="asset-list"></div>
                </div>
            </div>
            <button id="importButton" class="btn-secondary">Importar Posições</button>
        </div>
    `;
}

export function initAssetRegistration() {
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('assetForm');
        const importButton = document.getElementById('importButton');

        if (form) {
            form.addEventListener('submit', handleAssetSubmit);
        }

        if (importButton) {
            importButton.addEventListener('click', handleImport);
        }

        updateAssetList();
    });
}

function handleAssetSubmit(event) {
    event.preventDefault();
    const assetType = document.getElementById('assetType').value;
    const expirationDate = document.getElementById('expirationDate').value;
    const quantity = document.getElementById('quantity').value;
    const price = document.getElementById('price').value;

    const asset = { assetType, expirationDate, quantity, price };

    if (!validateAssetInput(asset)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    try {
        let assets = JSON.parse(localStorage.getItem('assets') || '[]');
        assets.push(asset);
        localStorage.setItem('assets', JSON.stringify(assets));

        updateAssetList();
        event.target.reset();
        alert('Contrato cadastrado com sucesso!');
    } catch (error) {
        handleError(error, 'Cadastro de contrato');
    }
}

function handleImport() {
    alert('Funcionalidade de importação ainda não implementada');
}

function updateAssetList() {
    const assetList = document.getElementById('assetList');
    const assets = JSON.parse(localStorage.getItem('assets') || '[]');

    if (assets.length === 0) {
        assetList.innerHTML = '<p>Nenhum contrato cadastrado.</p>';
    } else {
        assetList.innerHTML = `
            <ul>
                ${assets.map(asset => `
                    <li>
                        <strong>${asset.assetType}</strong> - 
                        Vencimento: ${asset.expirationDate} | 
                        Qtd: ${asset.quantity} | 
                        Preço: R$ ${parseFloat(asset.price).toFixed(2)}
                    </li>
                `).join('')}
            </ul>
        `;
    }
}

export function getAssets() {
    return JSON.parse(localStorage.getItem('assets') || '[]');
}