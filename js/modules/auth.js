import { validateEmail, validatePassword } from './validation.js';

export function renderLoginForm() {
    return `
        <div class="auth-container">
            <h2>Login</h2>
            <form id="loginForm">
                <input type="email" id="email" placeholder="E-mail" required>
                <input type="password" id="password" placeholder="Senha" required>
                <div class="remember-me">
                    <input type="checkbox" id="rememberMe">
                    <label for="rememberMe">Lembrar-me</label>
                </div>
                <button type="submit">Entrar</button>
            </form>
            <p>Não tem uma conta? <a href="#cadastro">Cadastre-se</a></p>
        </div>
    `;
}

export function renderSignupForm() {
    return `
        <div class="auth-container">
            <h2>Cadastro</h2>
            <form id="signupForm">
                <input type="text" id="name" placeholder="Nome completo" required>
                <input type="email" id="email" placeholder="E-mail" required>
                <input type="password" id="password" placeholder="Senha" required>
                <input type="password" id="confirmPassword" placeholder="Confirme a senha" required>
                <button type="submit">Cadastrar</button>
            </form>
            <p>Já tem uma conta? <a href="#login">Faça login</a></p>
        </div>
    `;
}

// Função de hash segura usando PBKDF2
function secureHash(password, salt) {
    return new Promise((resolve, reject) => {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        const saltBuffer = encoder.encode(salt);

        crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, ['deriveBits'])
            .then(key => {
                return crypto.subtle.deriveBits(
                    {
                        name: 'PBKDF2',
                        salt: saltBuffer,
                        iterations: 100000,
                        hash: 'SHA-256'
                    },
                    key,
                    256
                );
            })
            .then(derivedBits => {
                const hashArray = Array.from(new Uint8Array(derivedBits));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                resolve(hashHex);
            })
            .catch(reject);
    });
}

export function initAuth() {
    document.addEventListener('submit', (e) => {
        if (e.target.id === 'signupForm') {
            e.preventDefault();
            handleSignup();
        } else if (e.target.id === 'loginForm') {
            e.preventDefault();
            handleLogin();
        }
    });

    // Verificar se há um usuário salvo e fazer login automático
    const savedUser = localStorage.getItem('savedUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        autoLogin(user);
    }
}

// Atualizar a função handleSignup para usar async/await
async function handleSignup() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!validateEmail(email)) {
        alert('Por favor, insira um e-mail válido.');
        return;
    }

    if (!validatePassword(password)) {
        alert('A senha deve ter pelo menos 8 caracteres.');
        return;
    }

    if (password !== confirmPassword) {
        alert('As senhas não coincidem');
        return;
    }

    const salt = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
    try {
        const hashedPassword = await secureHash(password, salt);
        const user = { name, email, password: hashedPassword, salt };

        // Armazenar apenas o hash da senha
        localStorage.setItem(email, JSON.stringify(user));
        alert('Cadastro realizado com sucesso!');
        window.location.hash = '#login';
    } catch (error) {
        console.error('Erro ao criar hash da senha:', error);
        alert('Ocorreu um erro durante o cadastro. Por favor, tente novamente.');
    }
}

// Atualizar a função handleLogin para usar async/await
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    const storedUser = localStorage.getItem(email);
    if (storedUser) {
        const user = JSON.parse(storedUser);
        try {
            const hashedPassword = await secureHash(password, user.salt);
            if (user.password === hashedPassword) {
                loginSuccess(user, rememberMe);
            } else {
                alert('Senha incorreta');
            }
        } catch (error) {
            console.error('Erro ao verificar senha:', error);
            alert('Ocorreu um erro durante o login. Por favor, tente novamente.');
        }
    } else {
        alert('Usuário não encontrado');
    }
}

function loginSuccess(user, rememberMe) {
    const sessionToken = CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex);
    sessionStorage.setItem('sessionToken', sessionToken);
    sessionStorage.setItem('userEmail', user.email);
    
    if (rememberMe) {
        localStorage.setItem('savedUser', JSON.stringify({
            email: user.email,
            name: user.name,
            sessionToken: sessionToken
        }));
    }

    alert('Login bem-sucedido!');
    window.location.hash = '#dashboard';
}

function autoLogin(savedUser) {
    sessionStorage.setItem('sessionToken', savedUser.sessionToken);
    sessionStorage.setItem('userEmail', savedUser.email);
    window.location.hash = '#dashboard';
}

export function checkAuth() {
    const sessionToken = sessionStorage.getItem('sessionToken');
    const userEmail = sessionStorage.getItem('userEmail');
    return sessionToken && userEmail;
}

export function logout() {
    sessionStorage.removeItem('sessionToken');
    sessionStorage.removeItem('userEmail');
    localStorage.removeItem('savedUser');
    window.location.hash = '#login';
}