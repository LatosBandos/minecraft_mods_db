class AuthManager {
    constructor() {
        this.isAuthenticated = !!localStorage.getItem('jwtToken');
        this.isRegistering = false;
        this.initEventListeners();
        this.checkAuthStatus();
    }

    initEventListeners() {
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => this.handleLogin(e));
        }

        // Кнопки переключения между регистрацией и входом
        const switchToRegister = document.getElementById('switch-to-register');
        if (switchToRegister) {
            switchToRegister.addEventListener('click', () => this.showRegisterForm());
        }

        const switchToLogin = document.getElementById('switch-to-login');
        if (switchToLogin) {
            switchToLogin.addEventListener('click', () => this.showLoginForm());
        }

        // Кнопка регистрации
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', (e) => this.handleRegister(e));
        }

        // Обработка Enter
        document.getElementById('username')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAuth(e);
        });
        
        document.getElementById('password')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAuth(e);
        });

        document.getElementById('email')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAuth(e);
        });

        document.getElementById('confirm-password')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAuth(e);
        });

        // Live-валидация пароля
        document.getElementById('password')?.addEventListener('input', (e) => {
            this.validatePasswordLive(e.target.value);
        });
    }

    handleAuth(e) {
        if (this.isRegistering) {
            this.handleRegister(e);
        } else {
            this.handleLogin(e);
        }
    }

    showRegisterForm() {
        this.isRegistering = true;
        
        document.getElementById('login-title').textContent = '📝 Регистрация';
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('register-btn').style.display = 'block';
        document.getElementById('switch-to-register').style.display = 'none';
        document.getElementById('switch-to-login').style.display = 'block';
        
        document.getElementById('email-field').style.display = 'block';
        document.getElementById('confirm-password-field').style.display = 'block';
        
        // Показываем подсказки для пароля
        const passwordHints = document.getElementById('password-hints');
        if (passwordHints) {
            passwordHints.style.display = 'block';
        }
        
        this.hideMessage();
        this.clearFieldErrors();
    }

    showLoginForm() {
        this.isRegistering = false;
        
        document.getElementById('login-title').textContent = '🔐 Вход в систему';
        document.getElementById('login-btn').style.display = 'block';
        document.getElementById('register-btn').style.display = 'none';
        document.getElementById('switch-to-register').style.display = 'block';
        document.getElementById('switch-to-login').style.display = 'none';
        
        document.getElementById('email-field').style.display = 'none';
        document.getElementById('confirm-password-field').style.display = 'none';
        
        // Скрываем подсказки для пароля
        const passwordHints = document.getElementById('password-hints');
        if (passwordHints) {
            passwordHints.style.display = 'none';
        }
        
        this.hideMessage();
        this.clearFieldErrors();
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        this.clearFieldErrors();

        if (!username || !password) {
            this.showMessage('❌ Заполните все поля', 'error');
            return;
        }

        const loginBtn = document.getElementById('login-btn');
        const originalText = loginBtn.textContent;
        loginBtn.textContent = 'Вход...';
        loginBtn.disabled = true;

        try {
            const result = await api.login({
                nickname: username,
                password: password
            });

            api.setToken(result.token);
            this.isAuthenticated = true;
            this.showContent();
            this.showMessage('✅ Успешный вход!', 'success');
            
        } catch (error) {
            console.error('Login error:', error);
            
            let userMessage = 'Ошибка входа';
            
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                userMessage = 'Неверное имя пользователя или пароль';
                this.showFieldError('username', 'Проверьте логин');
                this.showFieldError('password', 'Проверьте пароль');
            } else if (error.message.includes('400')) {
                userMessage = 'Проверьте правильность введенных данных';
            } else if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
                userMessage = 'Проблемы с соединением. Проверьте интернет';
            }
            
            this.showMessage('❌ ' + userMessage, 'error');
        } finally {
            loginBtn.textContent = originalText;
            loginBtn.disabled = false;
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        this.clearFieldErrors();

        if (!username || !email || !password || !confirmPassword) {
            this.showMessage('❌ Заполните все поля', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showFieldError('confirm-password', 'Пароли не совпадают');
            return;
        }

        const passwordValid = this.validatePasswordWithMessages(password);
        if (!passwordValid) {
            return;
        }

        const registerBtn = document.getElementById('register-btn');
        const originalText = registerBtn.textContent;
        registerBtn.textContent = 'Регистрация...';
        registerBtn.disabled = true;

        try {
            console.log('🔧 Sending registration:', { username, email });
            
            const result = await api.register({
                username: username,
                email: email,
                password: password
            });

            console.log('🔧 Registration success:', result);
            
            if (result.token) {
                api.setToken(result.token);
                this.isAuthenticated = true;
                this.showContent();
                this.showMessage('✅ Регистрация и вход успешны!', 'success');
            } else {
                this.showMessage('✅ Регистрация успешна! Теперь войдите в систему', 'success');
                this.showLoginForm();
                document.getElementById('password').value = '';
                document.getElementById('confirm-password').value = '';
            }
            
        } catch (error) {
            console.error('🔧 Register error:', error);
            
            let userMessage = 'Ошибка регистрации';
            let fieldErrors = {};
            
            if (error.message.includes('Passwords must have')) {
                userMessage = '🔐 Пароль не соответствует требованиям безопасности';
                fieldErrors.password = 'Исправьте ошибки выше';
            } 
            else if (error.message.includes('User already exists')) {
                userMessage = '👤 Пользователь с таким именем уже существует';
                fieldErrors.username = 'Имя занято';
            }
            else if (error.message.includes('Email already exists')) {
                userMessage = '📧 Пользователь с такой почтой уже существует';
                fieldErrors.email = 'Почта уже используется';
            }
            else if (error.message.includes('400')) {
                userMessage = '📝 Проверьте правильность введенных данных';
            }
            else if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
                userMessage = '🌐 Проблемы с соединением. Проверьте интернет';
            }
            
            // Показываем ошибки для конкретных полей
            Object.keys(fieldErrors).forEach(fieldId => {
                this.showFieldError(fieldId, fieldErrors[fieldId]);
            });
            
            this.showMessage('❌ ' + userMessage, 'error');
        } finally {
            registerBtn.textContent = originalText;
            registerBtn.disabled = false;
        }
    }

    validatePasswordWithMessages(password) {
        let isValid = true;

        if (password.length < 6) {
            this.showFieldError('password', 'Минимум 6 символов');
            isValid = false;
        }

        if (!/[a-z]/.test(password)) {
            this.showFieldError('password', 'Добавьте строчные буквы (a-z)');
            isValid = false;
        }

        if (!/[A-Z]/.test(password)) {
            this.showFieldError('password', 'Добавьте заглавные буквы (A-Z)');
            isValid = false;
        }

        if (!/\d/.test(password)) {
            this.showFieldError('password', 'Добавьте цифры (0-9)');
            isValid = false;
        }

        if (!/[^a-zA-Z0-9]/.test(password)) {
            this.showFieldError('password', 'Добавьте спецсимволы (!@#$% и т.д.)');
            isValid = false;
        }

        return isValid;
    }

    validatePasswordLive(password) {
        const hints = document.getElementById('password-hints');
        if (!hints) return;

        if (password.length > 0) {
            hints.style.display = 'block';
        } else {
            hints.style.display = 'none';
            return;
        }

        this.updateHint('hint-length', password.length >= 6, '✅', '⭕');
        this.updateHint('hint-lowercase', /[a-z]/.test(password), '✅', '⭕');
        this.updateHint('hint-uppercase', /[A-Z]/.test(password), '✅', '⭕');
        this.updateHint('hint-numbers', /\d/.test(password), '✅', '⭕');
        this.updateHint('hint-special', /[^a-zA-Z0-9]/.test(password), '✅', '⭕');
    }

    updateHint(hintId, isValid, validIcon, invalidIcon) {
        const hint = document.getElementById(hintId);
        if (!hint) return;

        const icon = hint.querySelector('.hint-icon');
        if (icon) {
            icon.textContent = isValid ? validIcon : invalidIcon;
        }

        if (isValid) {
            hint.classList.add('valid');
            hint.classList.remove('invalid');
        } else {
            hint.classList.add('invalid');
            hint.classList.remove('valid');
        }
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }

        errorElement.textContent = message;
        errorElement.style.display = 'block';
        field.classList.add('error');
    }

    clearFieldErrors() {
        document.querySelectorAll('.field-error').forEach(el => {
            el.style.display = 'none';
        });
        
        document.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });
    }

    showContent() {
    const authSection = document.getElementById('auth-section');
    const contentSection = document.getElementById('content-section');
    
    if (authSection) authSection.style.display = 'none';
    if (contentSection) {
        contentSection.style.display = 'block';
        this.addLogoutButton();
        
        // 🔧 ВАЖНО: Инициализируем события динамического контента после показа
        if (window.uiManager && window.uiManager.initDynamicEventListeners) {
            window.uiManager.initDynamicEventListeners();
        }
    }
    
    // Загружаем данные после успешного входа
    if (window.uiManager) {
        window.uiManager.loadAllData();
    }
}

    addLogoutButton() {
        const oldBtn = document.getElementById('logout-btn');
        if (oldBtn) oldBtn.remove();

        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.className = 'btn btn-danger';
        logoutBtn.textContent = '🚪 Выйти';
        logoutBtn.style.marginLeft = '10px';
        logoutBtn.addEventListener('click', () => this.logout());

        const headerContent = document.querySelector('.header-content');
        if (headerContent) {
            headerContent.appendChild(logoutBtn);
        }
    }

    showMessage(message, type) {
        let messageDiv = document.getElementById('auth-message');
        
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'auth-message';
            messageDiv.style.marginTop = '10px';
            messageDiv.style.padding = '10px';
            messageDiv.style.borderRadius = '4px';
            messageDiv.style.textAlign = 'center';
            
            const authSection = document.getElementById('auth-section');
            if (authSection) {
                authSection.appendChild(messageDiv);
            }
        }

        if (type === 'success') {
            messageDiv.style.background = 'rgba(76, 175, 80, 0.2)';
            messageDiv.style.color = '#4caf50';
            messageDiv.style.border = '1px solid #4caf50';
        } else {
            messageDiv.style.background = 'rgba(244, 67, 54, 0.2)';
            messageDiv.style.color = '#f44336';
            messageDiv.style.border = '1px solid #f44336';
        }

        messageDiv.textContent = message;
        messageDiv.style.display = 'block';

        if (type === 'success') {
            setTimeout(() => {
                if (messageDiv) messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    hideMessage() {
        const messageDiv = document.getElementById('auth-message');
        if (messageDiv) {
            messageDiv.style.display = 'none';
        }
    }

    logout() {
        localStorage.removeItem('jwtToken');
        this.isAuthenticated = false;
        
        this.showMessage('👋 Вы вышли из системы', 'success');
        
        setTimeout(() => {
            location.reload();
        }, 1000);
    }

    checkAuthStatus() {
        if (this.isAuthenticated) {
            this.showContent();
        }
    }
}

const authManager = new AuthManager();