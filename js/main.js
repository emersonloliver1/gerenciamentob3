import { initRouter } from './modules/router.js';
import { initAuth } from './modules/auth.js';
import { initDashboard } from './modules/dashboard.js';
// Remova a importação de initPositions daqui, se existir
// ... outras importações ...

document.addEventListener('DOMContentLoaded', () => {
    initRouter();
    initAuth();
    initDashboard();
    // Remova a chamada para initPositions daqui, se existir
    // ... outras inicializações ...
});

console.log('main.js loaded');