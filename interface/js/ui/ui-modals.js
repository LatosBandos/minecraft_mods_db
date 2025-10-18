// Модальные окна
UIManager.prototype.showAddModModal = function() {
    console.log('🎯 Открытие модального окна добавления мода');
    
    if (this.availableVersions.length === 0) {
        this.showMessage('❌ Нет доступных версий. Сначала создайте версию через "Быстрое добавление".', 'error');
        return;
    }

    if (this.availableModLoaders.length === 0) {
        this.showMessage('❌ Нет доступных модлоадеров. Сначала создайте модлоадер через "Быстрое добавление".', 'error');
        return;
    }

    this.createModal({
        title: '📦 Добавить новый мод',
        fields: [
            { type: 'text', id: 'mod-title', label: 'Название мода', required: true, placeholder: 'Введите название мода' },
            { type: 'textarea', id: 'mod-description', label: 'Описание', required: false, placeholder: 'Описание мода', rows: 3 },
            { type: 'number', id: 'mod-size', label: 'Размер (MB)', required: true, placeholder: '0.0', step: '0.1' },
            { type: 'number', id: 'mod-downloads', label: 'Количество загрузок', required: true, placeholder: '0', value: 0 },
            { type: 'checkbox', id: 'mod-clientside', label: '🎮 Клиентский мод', checked: false },
            { type: 'multi-select', id: 'mod-versions', label: '🔢 Версии *', required: true, options: this.availableVersions, optionField: 'title' },
            { type: 'multi-select', id: 'mod-loaders', label: '🛠️ Модлоадеры *', required: true, options: this.availableModLoaders, optionField: 'title' },
            { type: 'multi-select', id: 'mod-tags', label: '🏷️ Теги', required: false, options: this.availableTags, optionField: 'title' },
            { type: 'multi-select', id: 'mod-developers', label: '👨‍💻 Разработчики', required: false, options: this.availableDevelopers, optionField: 'nickname' },
            { type: 'file', id: 'mod-image', label: '🖼️ Аватарка мода', accept: 'image/*' }
        ],
        onSubmit: (data) => this.createMod(data)
    });
};

// Редактирование мода
UIManager.prototype.editMod = function(modId) {
    console.log('🎯 Редактирование мода:', modId);
    
    // Находим мод по ID
    const mod = this.mods.find(m => m.id === modId);
    if (!mod) {
        this.showMessage('❌ Мод не найден', 'error');
        return;
    }

    this.createModal({
        title: '✏️ Редактировать мод',
        fields: [
            { type: 'text', id: 'edit-mod-title', label: 'Название мода', required: true, placeholder: 'Введите название мода', value: mod.title },
            { type: 'textarea', id: 'edit-mod-description', label: 'Описание', required: false, placeholder: 'Описание мода', rows: 3, value: mod.description || '' },
            { type: 'number', id: 'edit-mod-size', label: 'Размер (MB)', required: true, placeholder: '0.0', step: '0.1', value: mod.size },
            { type: 'number', id: 'edit-mod-downloads', label: 'Количество загрузок', required: true, placeholder: '0', value: mod.downloads },
            { type: 'checkbox', id: 'edit-mod-clientside', label: '🎮 Клиентский мод', checked: mod.isClientside },
            { type: 'multi-select', id: 'edit-mod-versions', label: '🔢 Версии *', required: true, options: this.availableVersions, optionField: 'title', selected: mod.versions },
            { type: 'multi-select', id: 'edit-mod-loaders', label: '🛠️ Модлоадеры *', required: true, options: this.availableModLoaders, optionField: 'title', selected: mod.modLoaders },
            { type: 'multi-select', id: 'edit-mod-tags', label: '🏷️ Теги', required: false, options: this.availableTags, optionField: 'title', selected: mod.tags },
            { type: 'multi-select', id: 'edit-mod-developers', label: '👨‍💻 Разработчики', required: false, options: this.availableDevelopers, optionField: 'nickname', selected: mod.developers },
            { type: 'file', id: 'edit-mod-image', label: '🖼️ Аватарка мода', accept: 'image/*' }
        ],
        onSubmit: (data) => this.updateMod(modId, data)
    });

    // Предзаполняем выбранные значения для multi-select
    setTimeout(() => {
        this.prefillMultiSelect('edit-mod-versions', mod.versions);
        this.prefillMultiSelect('edit-mod-loaders', mod.modLoaders);
        this.prefillMultiSelect('edit-mod-tags', mod.tags);
        this.prefillMultiSelect('edit-mod-developers', mod.developers);
        
        // Показываем текущее изображение если есть
        if (mod.imageUrl) {
            this.showCurrentImage('edit-mod-image', mod.imageUrl);
        }
    }, 100);
};

// Предзаполнение multi-select полей
UIManager.prototype.prefillMultiSelect = function(fieldId, selectedItems) {
    if (!selectedItems || selectedItems.length === 0) return;
    
    selectedItems.forEach(item => {
        const checkbox = document.querySelector(`input[name="${fieldId}"][value="${item.id}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
};

// Показ текущего изображения
UIManager.prototype.showCurrentImage = function(inputId, imageUrl) {
    const previewContainer = document.getElementById(`${inputId}-preview`);
    const previewImage = previewContainer.querySelector('.file-preview-image');
    const fileInput = document.getElementById(inputId);
    
    if (previewContainer && previewImage) {
        previewImage.src = imageUrl;
        previewContainer.style.display = 'flex';
        if (fileInput) {
            fileInput.style.display = 'none';
        }
    }
};


// Обновление мода

UIManager.prototype.updateMod = async function(modId, modData) {
    try {
        if (!api.token) {
            this.showMessage('❌ Ошибка авторизации. Попробуйте войти снова.', 'error');
            return;
        }

        if (!modData['edit-mod-versions'] || modData['edit-mod-versions'].length === 0) {
            this.showMessage('❌ Выберите хотя бы одну версию!', 'error');
            return;
        }

        if (!modData['edit-mod-loaders'] || modData['edit-mod-loaders'].length === 0) {
            this.showMessage('❌ Выберите хотя бы один модлоадер!', 'error');
            return;
        }

        // 🔥 ИСПРАВЛЕНИЕ: Сохраняем существующее изображение если новое не выбрано
        let imageUrl = null;
        const imageFile = modData['edit-mod-image'];
        const currentMod = this.mods.find(m => m.id === modId);
        
        if (imageFile) {
            console.log('📸 Загружаем новое изображение...', imageFile.name);
            imageUrl = await this.uploadImageToServer(imageFile);
            console.log('✅ Новое изображение загружено:', imageUrl);
        } else if (currentMod && currentMod.imageUrl) {
            // 🔥 СОХРАНЯЕМ существующее изображение если файл не выбран
            imageUrl = currentMod.imageUrl;
            console.log('🖼️ Сохраняем существующее изображение:', imageUrl);
        }

        const apiData = {
            title: modData['edit-mod-title'],
            description: modData['edit-mod-description'] || '',
            size: modData['edit-mod-size'],
            downloads: modData['edit-mod-downloads'],
            isClientside: modData['edit-mod-clientside'],
            versionIds: modData['edit-mod-versions'],
            modLoaderIds: modData['edit-mod-loaders'],
            tagIds: modData['edit-mod-tags'] || [],
            developerIds: modData['edit-mod-developers'] || [],
            updatedAt: new Date().toISOString()
        };

        // 🔥 ВСЕГДА добавляем imageUrl (новый или существующий)
        if (imageUrl) {
            apiData.imageUrl = imageUrl;
            console.log('🖼️ ImageUrl в данных:', imageUrl);
        }

        console.log('📤 Отправка данных для обновления мода:', modId, apiData);

        const result = await api.updateMod(modId, apiData);
        
        this.closeModal();
        this.showMessage('✅ Мод успешно обновлен!', 'success');
        
        await this.loadAllData();

    } catch (error) {
        console.error('❌ Ошибка обновления мода:', error);
        
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            this.showMessage('❌ Ошибка авторизации. Попробуйте войти снова.', 'error');
            authManager.logout();
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
            this.showMessage('❌ Метод обновления мода не найден на сервере', 'error');
        } else {
            this.showMessage('❌ Ошибка при обновлении мода: ' + error.message, 'error');
        }
    }
};

// 🔥 ЗАМЕНЯЕМ метод загрузки изображения - теперь загружаем на сервер
UIManager.prototype.uploadImageToServer = async function(file) {
    const formData = new FormData();
    formData.append('file', file);

    const uploadUrl = `${api.baseURL}/Upload/image`;
    console.log('🔼 Отправка файла на:', uploadUrl);

    const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${api.token}`
        },
        body: formData
    });

    console.log('📥 Статус ответа:', response.status, response.statusText);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Текст ошибки:', errorText);
        throw new Error(`Ошибка загрузки изображения: ${response.status} ${response.statusText}`);
    }

    const relativeUrl = await response.text();
    // 🔥 ВОЗВРАЩАЕМ ПОЛНЫЙ URL
    const fullImageUrl = `${api.baseURL}${relativeUrl}`;
    console.log('✅ Полный URL изображения:', fullImageUrl);
    return fullImageUrl;
};

UIManager.prototype.showModDetails = function(mod) {
    const mainDeveloper = mod.developers && mod.developers.length > 0 ? mod.developers[0] : null;
    const versions = mod.versions || [];
    const tags = mod.tags || [];
    const modLoaders = mod.modLoaders || [];
    const allDevelopers = mod.developers || [];
    
    // Создаем секции динамически
    const sections = [];
    
    // Секция версий
    if (versions.length > 0) {
        sections.push(`
            <div class="mod-details-section">
                <h3 class="mod-details-section-title">🔢 Совместимые версии</h3>
                <div class="mod-details-versions-container">
                    ${versions.map(version => 
                        `<span class="mod-details-version">${this.escapeHtml(version.title)}</span>`
                    ).join('')}
                </div>
            </div>
        `);
    }
    
    // Секция модлоадеров
    if (modLoaders.length > 0) {
        sections.push(`
            <div class="mod-details-section">
                <h3 class="mod-details-section-title">🛠️ Модлоадеры</h3>
                <div class="mod-details-loaders-container">
                    ${modLoaders.map(loader => 
                        `<span class="mod-details-loader">${this.escapeHtml(loader.title)}</span>`
                    ).join('')}
                </div>
            </div>
        `);
    }
    
    // Секция тегов
    if (tags.length > 0) {
        sections.push(`
            <div class="mod-details-section">
                <h3 class="mod-details-section-title">🏷️ Теги</h3>
                <div class="mod-details-tags-container">
                    ${tags.map(tag => 
                        `<span class="mod-details-tag">${this.escapeHtml(tag.title)}</span>`
                    ).join('')}
                </div>
            </div>
        `);
    }
    
    // Секция разработчиков (если больше одного)
    if (allDevelopers.length > 1) {
        sections.push(`
            <div class="mod-details-section">
                <h3 class="mod-details-section-title">👨‍💻 Разработчики</h3>
                <div class="mod-details-tags-container">
                    ${allDevelopers.map(dev => 
                        `<span class="mod-details-tag">${this.escapeHtml(dev.nickname)}</span>`
                    ).join('')}
                </div>
            </div>
        `);
    }
    
    this.createModal({
        title: '📦 Детали мода',
        customContent: `
            <div class="mod-details-content">
                <div class="mod-details-image">
                    ${mod.imageUrl ? `
                        <img src="${mod.imageUrl}" alt="${this.escapeHtml(mod.title)}" />
                    ` : '📦'}
                </div>
                <div class="mod-details-info">
                    <h2 class="mod-details-title">${this.escapeHtml(mod.title || 'Без названия')}</h2>
                    
                    ${mainDeveloper ? `
                        <div class="mod-details-developer">от ${this.escapeHtml(mainDeveloper.nickname)}</div>
                    ` : ''}
                    
                    ${mod.description ? `
                        <div class="mod-details-description">
                            ${this.escapeHtml(mod.description)}
                        </div>
                    ` : '<div class="mod-details-description" style="color: #888; font-style: italic; background: rgba(255,255,255,0.02);">Описание отсутствует</div>'}
                    
                    <div class="mod-details-grid">
                        <div class="mod-details-stat">
                            <div class="mod-details-stat-value">${this.formatNumber(mod.downloads || 0)}</div>
                            <div class="mod-details-stat-label">Скачивания</div>
                        </div>
                        <div class="mod-details-stat">
                            <div class="mod-details-stat-value">${mod.size || 0} MB</div>
                            <div class="mod-details-stat-label">Размер</div>
                        </div>
                        <div class="mod-details-stat">
                            <div class="mod-details-stat-value">${mod.isClientside ? '🎮' : '🖥️'}</div>
                            <div class="mod-details-stat-label">Тип</div>
                        </div>
                        <div class="mod-details-stat">
                            <div class="mod-details-stat-value">${new Date(mod.updatedAt).toLocaleDateString('ru-RU')}</div>
                            <div class="mod-details-stat-label">Обновлено</div>
                        </div>
                    </div>
                    
                    ${sections.length > 0 ? `
                        <div class="mod-details-sections">
                            ${sections.join('')}
                        </div>
                    ` : ''}
                    
                    <div class="mod-details-actions">
                        <button class="btn btn-secondary" onclick="uiManager.closeModal()">Закрыть</button>
                        <button class="btn btn-warning" onclick="uiManager.editMod('${mod.id}')">
                            ✏️ Редактировать
                        </button>
                        <button class="btn btn-danger" onclick="uiManager.deleteMod('${mod.id}')">
                            🗑️ Удалить мод
                        </button>
                        <button class="btn btn-download" onclick="uiManager.downloadMod('${mod.id}')">
                            ⬇️ Скачать мод
                        </button>
                    </div>
                </div>
            </div>
        `,
        customClass: 'modal-mod-details',
        showDefaultActions: false
    });
};

UIManager.prototype.showFullDescription = function(element) {
    const row = element.closest('tr');
    const descriptionCell = row.querySelector('.mod-description-cell');
    const fullDescription = descriptionCell.getAttribute('title');
    
    this.createModal({
        title: '📝 Полное описание мода',
        customContent: `
            <div class="full-description-modal">
                <div class="description-content">
                    ${this.escapeHtml(fullDescription)}
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="uiManager.closeModal()">Закрыть</button>
                </div>
            </div>
        `,
        customClass: 'modal-description'
    });
};

UIManager.prototype.createModal = function(config) {
    this.closeModal();

    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) {
        console.error('❌ Контейнер для модальных окон не найден');
        this.showMessage('Ошибка: контейнер модальных окон не найден', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    let modalBody = '';
    if (config.customContent) {
        modalBody = config.customContent;
    } else {
        modalBody = `
            <form class="modal-form" id="modal-form">
                ${config.fields.map(field => this.renderFormField(field)).join('')}
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="uiManager.closeModal()">Отмена</button>
                    <button type="submit" class="btn btn-primary">Сохранить</button>
                </div>
            </form>
        `;
    }

    modal.innerHTML = `
        <div class="modal-content ${config.customClass || ''}">
            <div class="modal-header">
                <h3>${config.title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            ${modalBody}
        </div>
    `;

    modalContainer.appendChild(modal);

    const closeBtn = modal.querySelector('.modal-close');
    const modalForm = modal.querySelector('#modal-form');

    // Закрытие по клику на крестик
    if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeModal());
    }

    // Закрытие по клику вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            this.closeModal();
        }
    });

    // Закрытие по Escape
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            this.closeModal();
        }
    };
    document.addEventListener('keydown', handleEscape);

    // Сохраняем обработчик для удаления
    this.currentEscapeHandler = handleEscape;

    if (modalForm && !config.customContent) {
        modalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                const formData = this.getFormData(config.fields);
                config.onSubmit(formData);
            } catch (error) {
                console.log('Валидация формы:', error.message);
            }
        });
    }

    setTimeout(() => modal.classList.add('active'), 10);
    
    console.log('✅ Модальное окно создано');
};

UIManager.prototype.renderFormField = function(field) {
    switch (field.type) {
        case 'textarea':
            return `
                <div class="form-group">
                    <label for="${field.id}">${field.label}</label>
                    <textarea id="${field.id}" placeholder="${field.placeholder}" 
                              ${field.required ? 'required' : ''} rows="${field.rows || 3}">${field.value || ''}</textarea>
                </div>
            `;
        case 'checkbox':
            return `
                <div class="form-group checkbox-group">
                    <input type="checkbox" id="${field.id}" ${field.checked ? 'checked' : ''}>
                    <label for="${field.id}">${field.label}</label>
                </div>
            `;
        case 'multi-select':
            const selectedIds = field.selected ? field.selected.map(item => item.id) : [];
            return `
                <div class="form-group">
                    <label for="${field.id}">${field.label}</label>
                    <div class="multi-select-container">
                        ${field.options.map(option => `
                            <label class="multi-select-item">
                                <input type="checkbox" name="${field.id}" value="${option.id}" 
                                       ${selectedIds.includes(option.id) ? 'checked' : ''}>
                                <span class="multi-select-label">${this.escapeHtml(option[field.optionField] || option.title || option.name || option.nickname)}</span>
                            </label>
                        `).join('')}
                    </div>
                    ${field.required ? `<div class="field-error" id="${field.id}-error" style="display: none;">Выберите хотя бы один вариант</div>` : ''}
                </div>
            `;
        case 'file':
            return `
                <div class="form-group">
                    <label for="${field.id}">${field.label}</label>
                    <div class="file-upload-container">
                        <input type="file" id="${field.id}" 
                               ${field.accept ? `accept="${field.accept}"` : ''}
                               class="file-input">
                        <label for="${field.id}" class="file-upload-label">
                            <span class="file-upload-text">📁 Выберите файл</span>
                            <span class="file-upload-hint">PNG, JPG, GIF до 5MB</span>
                        </label>
                        <div class="file-preview" id="${field.id}-preview" style="display: none;">
                            <img src="" alt="Preview" class="file-preview-image">
                            <button type="button" class="btn-remove-file" onclick="uiManager.removeFilePreview('${field.id}')">🗑️</button>
                        </div>
                    </div>
                </div>
            `;
        default:
            return `
                <div class="form-group">
                    <label for="${field.id}">${field.label}</label>
                    <input type="${field.type}" id="${field.id}" 
                           placeholder="${field.placeholder}" 
                           ${field.value ? `value="${field.value}"` : ''}
                           ${field.step ? `step="${field.step}"` : ''}
                           ${field.required ? 'required' : ''}>
                </div>
            `;
    }
};

UIManager.prototype.getFormData = function(fields) {
    document.querySelectorAll('.field-error').forEach(error => {
        error.style.display = 'none';
    });

    const data = {};
    
    const processField = (field) => {
        if (field.type === 'multi-select') {
            const selectedOptions = Array.from(document.querySelectorAll(`input[name="${field.id}"]:checked`))
                .map(checkbox => checkbox.value);
            data[field.id] = selectedOptions;
            
            if (field.required && selectedOptions.length === 0) {
                const errorElement = document.getElementById(`${field.id}-error`);
                if (errorElement) {
                    errorElement.style.display = 'block';
                }
                throw new Error(`Поле "${field.label}" обязательно для заполнения`);
            }
        } else if (field.type === 'file') {
            // Обработка файла
            const fileInput = document.getElementById(field.id);
            if (fileInput && fileInput.files.length > 0) {
                data[field.id] = fileInput.files[0];
            }
        } else {
            const element = document.getElementById(field.id);
            if (!element) {
                console.error(`❌ Элемент с ID "${field.id}" не найден`);
                return;
            }
            
            if (field.type === 'checkbox') {
                data[field.id] = element.checked;
            } else if (field.type === 'number') {
                data[field.id] = parseFloat(element.value) || 0;
            } else {
                data[field.id] = element.value;
            }
        }
    };

    try {
        fields.forEach(processField);
        return data;
    } catch (error) {
        console.error('❌ Ошибка валидации формы:', error);
        throw error;
    }
};

UIManager.prototype.closeModal = function() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    
    // Удаляем обработчик Escape
    if (this.currentEscapeHandler) {
        document.removeEventListener('keydown', this.currentEscapeHandler);
        this.currentEscapeHandler = null;
    }
    
    // Очищаем временные данные
    this.currentFullDescription = null;
};