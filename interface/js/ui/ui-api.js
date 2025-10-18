// Работа с API
UIManager.prototype.createMod = async function(modData) {
    try {
        if (!api.token) {
            this.showMessage('❌ Ошибка авторизации. Попробуйте войти снова.', 'error');
            return;
        }

        if (!modData['mod-versions'] || modData['mod-versions'].length === 0) {
            this.showMessage('❌ Выберите хотя бы одну версию!', 'error');
            return;
        }

        if (!modData['mod-loaders'] || modData['mod-loaders'].length === 0) {
            this.showMessage('❌ Выберите хотя бы один модлоадер!', 'error');
            return;
        }

        let imageUrl = null;
        const imageFile = modData['mod-image'];
        if (imageFile) {
            console.log('📸 Загружаем изображение при создании мода...', imageFile.name);
            imageUrl = await this.uploadImageToServer(imageFile);
            console.log('✅ Изображение загружено:', imageUrl);
        } else {
            console.log('❌ Файл изображения не выбран при создании мода');
        }

        const apiData = {
            title: modData['mod-title'],
            description: modData['mod-description'] || '',
            size: modData['mod-size'],
            downloads: modData['mod-downloads'],
            isClientside: modData['mod-clientside'],
            versionIds: modData['mod-versions'],
            modLoaderIds: modData['mod-loaders'],
            tagIds: modData['mod-tags'] || [],
            developerIds: modData['mod-developers'] || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // 🔥 ДОБАВЛЯЕМ ImageUrl В ДАННЫЕ
        if (imageUrl) {
            apiData.imageUrl = imageUrl;
            console.log('🖼️ ImageUrl добавлен в данные:', imageUrl);
        }

        console.log('📤 Отправка данных мода:', apiData);

        const result = await api.createMod(apiData);
        console.log('✅ Мод создан:', result);

        this.closeModal();
        this.showMessage('✅ Мод успешно добавлен!', 'success');
        
        await this.loadAllData();

    } catch (error) {
        console.error('❌ Ошибка создания мода:', error);
        this.showMessage('❌ Ошибка при добавлении мода: ' + error.message, 'error');
    }
};

UIManager.prototype.loadAllData = async function() {
    try {
        console.log('🔄 Загрузка данных...');

        if (!api.token) {
            console.error('❌ Нет токена для загрузки данных');
            this.showMessage('❌ Ошибка авторизации', 'error');
            return;
        }

        await this.loadReferenceData();

        const [modsResponse, collectionsResponse] = await Promise.all([
            api.getMods(this.currentModPage, this.pageSize).catch(e => { 
                console.error('Ошибка загрузки модов:', e); 
                return { items: [], totalCount: 0 };
            }),
            api.getCollections(this.currentCollectionPage, this.pageSize).catch(e => { 
                console.error('Ошибка загрузки коллекций:', e); 
                return { items: [], totalCount: 0 };
            })
        ]);

        this.mods = modsResponse.items || modsResponse || [];
        this.totalMods = modsResponse.totalCount || 0;

        this.collections = collectionsResponse.items || collectionsResponse || [];
        this.totalCollections = collectionsResponse.totalCount || 0;

        this.renderMods();
        this.renderCollections();
        this.updateStats();

        console.log('✅ Все данные загружены');

    } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
        this.showMessage('❌ Ошибка загрузки данных', 'error');
    }
};

UIManager.prototype.loadReferenceData = async function() {
    try {
        console.log('📚 Загрузка справочных данных...');

        const [versions, modLoaders, tags, developers, difficulties, focuses] = await Promise.all([
            api.getVersions().catch(e => { 
                console.error('Ошибка загрузки версий:', e); 
                return { items: [] }; 
            }),
            api.getModLoaders().catch(e => { 
                console.error('Ошибка загрузки модлоадеров:', e); 
                return { items: [] }; 
            }),
            api.getTags().catch(e => { 
                console.error('Ошибка загрузки тегов:', e); 
                return { items: [] }; 
            }),
            api.getDevelopers().catch(e => { 
                console.error('Ошибка загрузки разработчиков:', e); 
                return { items: [] }; 
            }),
            api.getDifficulties().catch(e => { 
                console.error('Ошибка загрузки сложностей:', e); 
                return { items: [] }; 
            }),
            api.getFocuses().catch(e => { 
                console.error('Ошибка загрузки фокусов:', e); 
                return { items: [] }; 
            })
        ]);

        this.availableVersions = versions.items || versions || [];
        this.availableModLoaders = modLoaders.items || modLoaders || [];
        this.availableTags = tags.items || tags || [];
        this.availableDevelopers = developers.items || developers || [];
        this.availableDifficulties = difficulties.items || difficulties || [];
        this.availableFocuses = focuses.items || focuses || [];

        console.log('📊 Справочные данные загружены:', {
            versions: this.availableVersions.length,
            modLoaders: this.availableModLoaders.length,
            tags: this.availableTags.length,
            developers: this.availableDevelopers.length,
            difficulties: this.availableDifficulties.length,
            focuses: this.availableFocuses.length
        });

    } catch (error) {
        console.error('❌ Ошибка загрузки справочных данных:', error);
        this.availableVersions = [];
        this.availableModLoaders = [];
        this.availableTags = [];
        this.availableDevelopers = [];
        this.availableDifficulties = [];
        this.availableFocuses = [];
    }
};

UIManager.prototype.handleQuickAdd = async function(type) {
    console.log(`⚡ Быстрое добавление: ${type}`);
    
    const inputId = `quick-${type}`;
    const input = document.getElementById(inputId);
    
    if (!input) {
        console.error(`❌ Поле ввода ${inputId} не найдено`);
        return;
    }

    const value = input.value.trim();
    if (!value) {
        this.showMessage('❌ Введите значение', 'error');
        return;
    }

    try {
        const button = document.querySelector(`[data-type="${type}"]`);
        const originalText = button.textContent;
        button.textContent = '...';
        button.disabled = true;

        let data = {};
        
        switch (type) {
            case 'version':
            case 'modloader':
            case 'tag':
            case 'difficulty':
                data = {
                    title: value,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                break;
            case 'developer':
                data = {
                    nickname: value,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                break;
            case 'focus':
                data = {
                    name: value,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                break;
            default:
                throw new Error(`Неизвестный тип: ${type}`);
        }

        let result;
        switch (type) {
            case 'version':
                result = await api.createVersion(data);
                break;
            case 'modloader':
                result = await api.createModLoader(data);
                break;
            case 'tag':
                result = await api.createTag(data);
                break;
            case 'developer':
                result = await api.createDeveloper(data);
                break;
            case 'difficulty':
                result = await api.createDifficulty(data);
                break;
            case 'focus':
                result = await api.createFocus(data);
                break;
            default:
                throw new Error(`Неизвестный тип: ${type}`);
        }

        console.log(`✅ ${type} создан:`, result);
        input.value = '';
        
        this.showMessage(`✅ ${this.getTypeName(type)} "${value}" успешно создан!`, 'success');

        await this.loadReferenceData();

    } catch (error) {
        console.error(`❌ Ошибка создания ${type}:`, error);
        
        let userMessage = `Ошибка создания ${this.getTypeName(type)}`;
        
        if (error.message.includes('Nickname cannot be empty')) {
            userMessage = '❌ Имя разработчика не может быть пустым';
        } else if (error.message.includes('Name') && error.message.includes('required')) {
            userMessage = '❌ Поле "Название" обязательно для заполнения';
        } else if (error.message.includes('400')) {
            userMessage = '❌ Проверьте правильность введенных данных';
        } else if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
            userMessage = '❌ Проблемы с соединением. Проверьте интернет';
        }
        
        this.showMessage(userMessage, 'error');
    } finally {
        const button = document.querySelector(`[data-type="${type}"]`);
        if (button) {
            button.textContent = `+ ${this.getTypeName(type)}`;
            button.disabled = false;
        }
    }
};

// Пагинация
UIManager.prototype.renderModPagination = function() {
    const tableContainer = document.querySelector('.table-container');
    if (!tableContainer) return;

    const oldPagination = tableContainer.querySelector('.pagination');
    if (oldPagination) oldPagination.remove();

    if (this.totalMods <= this.pageSize) return;

    const totalPages = Math.ceil(this.totalMods / this.pageSize);
    
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    pagination.innerHTML = `
        <div class="pagination-info">
            Показано ${this.mods.length} из ${this.totalMods} модов
        </div>
        <div class="pagination-controls">
            <button class="btn btn-sm ${this.currentModPage <= 1 ? 'btn-disabled' : 'btn-primary'}" 
                    ${this.currentModPage <= 1 ? 'disabled' : ''}
                    onclick="uiManager.prevModPage()">
                ← Назад
            </button>
            <span class="pagination-page">Страница ${this.currentModPage} из ${totalPages}</span>
            <button class="btn btn-sm ${this.currentModPage >= totalPages ? 'btn-disabled' : 'btn-primary'}" 
                    ${this.currentModPage >= totalPages ? 'disabled' : ''}
                    onclick="uiManager.nextModPage()">
                Вперед →
            </button>
        </div>
    `;

    tableContainer.appendChild(pagination);
};

UIManager.prototype.nextModPage = async function() {
    const totalPages = Math.ceil(this.totalMods / this.pageSize);
    if (this.currentModPage < totalPages) {
        this.currentModPage++;
        await this.loadModsPage();
    }
};

UIManager.prototype.prevModPage = async function() {
    if (this.currentModPage > 1) {
        this.currentModPage--;
        await this.loadModsPage();
    }
};

UIManager.prototype.loadModsPage = async function() {
    try {
        const response = await api.getMods(this.currentModPage, this.pageSize);
        this.mods = response.items || response || [];
        this.totalMods = response.totalCount || 0;
        this.renderMods();
    } catch (error) {
        console.error('❌ Ошибка загрузки страницы модов:', error);
        this.showMessage('❌ Ошибка загрузки страницы', 'error');
    }
};