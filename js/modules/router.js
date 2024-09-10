import { renderLoginForm, renderSignupForm, checkAuth, logout } from './auth.js';
import { renderDashboard, initDashboard } from './dashboard.js';
import { renderAssetRegistration } from './assetRegistration.js';
import { renderRiskManagementConfig } from './riskManagementConfig.js';
import { renderRiskAnalysis, initRiskAnalysis } from './riskAnalysis.js';
import { renderSettings, initSettings } from './settings.js';
import { renderPositions, initPositions } from './positions.js';
import { renderPerformanceReports, initPerformanceReports } from './performanceReports.js';
import { renderAnalysis, initAnalysis } from './analysis.js';

const routes = {
    '#login': renderLoginForm,
    '#cadastro': renderSignupForm,
    '#dashboard': () => {
        if (checkAuth()) {
            const dashboardContent = renderDashboard();
            setTimeout(initDashboard, 0);
            return dashboardContent;
        } else {
            window.location.hash = '#login';
        }
    },
    '#cadastro-ativos': () => checkAuth() ? renderAssetRegistration() : window.location.hash = '#login',
    '#analise': () => {
        if (checkAuth()) {
            const content = renderAnalysis();
            setTimeout(initAnalysis, 0);
            return content;
        } else {
            window.location.hash = '#login';
        }
    },
    '#relatorios': () => {
        if (checkAuth()) {
            const content = renderPerformanceReports();
            setTimeout(initPerformanceReports, 0);
            return content;
        } else {
            window.location.hash = '#login';
        }
    },
    '#configuracoes': () => {
        if (checkAuth()) {
            const content = renderSettings();
            setTimeout(initSettings, 0);
            return content;
        } else {
            window.location.hash = '#login';
        }
    },
    '#risk-config': () => checkAuth() ? renderRiskManagementConfig() : window.location.hash = '#login',
    '#posicoes': () => {
        if (checkAuth()) {
            const content = renderPositions();
            setTimeout(initPositions, 0);
            return content;
        } else {
            window.location.hash = '#login';
        }
    }
};

let isRouterInitialized = false;

export function initRouter() {
    if (isRouterInitialized) return;
    
    function routeHandler() {
        console.log('Router function called');
        const hash = window.location.hash || '#dashboard';
        console.log('Current hash:', hash);
        const content = document.getElementById('app');
        if (!content) {
            console.error('Element with id "app" not found');
            return;
        }
        const route = routes[hash];
        if (route) {
            console.log('Rendering route:', hash);
            content.innerHTML = route();
        } else {
            console.log('Route not found, rendering dashboard');
            content.innerHTML = routes['#dashboard']();
        }

        updateActiveMenu(hash);
    }

    window.addEventListener('hashchange', routeHandler);
    routeHandler(); // Chamar uma vez para lidar com a rota inicial

    isRouterInitialized = true;
}

function updateActiveMenu(hash) {
    const menuItems = document.querySelectorAll('.dashboard-header nav ul li a');
    menuItems.forEach(item => {
        if (item.getAttribute('href') === hash) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}