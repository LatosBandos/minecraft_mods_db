// Инициализация событий UI
UIManager.prototype.initStaticEventListeners = function() {
    console.log('🔧 Инициализация статических событий...');
    
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            authManager.showRegisterForm();
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            authManager.showLoginForm();
        });
    }
    
    console.log('✅ Статические события инициализированы');
};

UIManager.prototype.initDynamicEventListeners = function() {
    console.log('🔧 Инициализация динамических событий...');

    // Переключение вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Переключение вида (grid/table)
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            this.switchView(e.target.dataset.view);
        });
    });

    // Кнопки добавления
    const addModBtn = document.getElementById('add-mod-btn');
    if (addModBtn) {
        console.log('✅ Кнопка "Добавить мод" найдена');
        addModBtn.addEventListener('click', () => this.showAddModModal());
    }

    const addCollectionBtn = document.getElementById('add-collection-btn');
    if (addCollectionBtn) {
        addCollectionBtn.addEventListener('click', () => this.showAddCollectionModal());
    }

    // Кнопка обновления
    const refreshBtn = document.getElementById('refresh-mods');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => this.loadAllData());
    }

    // Быстрое добавление
    document.querySelectorAll('.quick-form button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const type = btn.dataset.type;
            this.handleQuickAdd(type);
        });
    });

    this.initFileUpload();

    console.log('✅ Динамические события инициализированы');
};

// Переключение вкладок и видов
UIManager.prototype.switchView = function(viewType) {
    this.currentView = viewType;
    
    const gridContainer = document.getElementById('mods-grid');
    const tableContainer = document.getElementById('mods-table-container');
    const viewBtns = document.querySelectorAll('.view-btn');
    
    viewBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-view="${viewType}"]`).classList.add('active');
    
    if (viewType === 'grid') {
        gridContainer.style.display = 'block';
        tableContainer.style.display = 'none';
        this.renderModsGrid();
    } else {
        gridContainer.style.display = 'none';
        tableContainer.style.display = 'block';
        this.renderModsTable();
    }
};

UIManager.prototype.switchTab = function(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
};

// 🔥 ДОБАВЛЕНО: Инициализация загрузки файлов
UIManager.prototype.initFileUpload = function() {
    document.addEventListener('change', (e) => {
        if (e.target.type === 'file') {
            this.handleFileSelect(e.target);
        }
    });
};

// 🔥 ДОБАВЛЕНО: Обработка выбора файла
UIManager.prototype.handleFileSelect = function(input) {
    const file = input.files[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
        this.showMessage('❌ Выберите изображение (PNG, JPG, GIF)', 'error');
        input.value = '';
        return;
    }

    // Проверка размера файла (5MB)
    if (file.size > 5 * 1024 * 1024) {
        this.showMessage('❌ Файл слишком большой (макс. 5MB)', 'error');
        input.value = '';
        return;
    }

    // Показ превью
    this.showFilePreview(input.id, file);
};

// 🔥 ДОБАВЛЕНО: Показ превью файла
UIManager.prototype.showFilePreview = function(inputId, file) {
    const previewContainer = document.getElementById(`${inputId}-preview`);
    if (!previewContainer) return;
    
    const previewImage = previewContainer.querySelector('.file-preview-image');
    const fileInput = document.getElementById(inputId);
    
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewContainer.style.display = 'flex';
        if (fileInput) {
            fileInput.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
};

// 🔥 ДОБАВЛЕНО: Удаление превью файла
UIManager.prototype.removeFilePreview = function(inputId) {
    const previewContainer = document.getElementById(`${inputId}-preview`);
    const fileInput = document.getElementById(inputId);
    
    if (previewContainer) {
        previewContainer.style.display = 'none';
    }
    if (fileInput) {
        fileInput.style.display = 'block';
        fileInput.value = '';
    }
};
