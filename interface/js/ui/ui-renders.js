// Рендеринг модов в grid
UIManager.prototype.renderModsGrid = function(modsToRender = null) {
    const mods = modsToRender || this.mods; // Используем переданные моды или все моды
    const container = document.getElementById('mods-grid-container');
    if (!container) return;

    if (mods.length === 0) {
        container.innerHTML = `
            <div class="mods-loading">
                <div class="loading-spinner">📦</div>
                <p>Модов пока нет</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Добавьте первый мод используя кнопку выше!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = mods.map(mod => {
        const mainDeveloper = mod.developers && mod.developers.length > 0 ? mod.developers[0] : null;
        const modJson = JSON.stringify(mod).replace(/"/g, '&quot;');
        
        // 🔥 ДОБАВЛЯЕМ класс для карточек с изображением
        const cardClass = mod.imageUrl ? 'mod-card with-image' : 'mod-card';
        const cardStyle = mod.imageUrl ? `--card-image: url('${mod.imageUrl}')` : '';
        
        return `
            <div class="${cardClass}" style="${cardStyle}">
                <div class="mod-header">
                    <button class="mod-title" onclick="uiManager.showModDetails(${modJson})">
                        ${this.escapeHtml(mod.title || 'Без названия')}
                    </button>
                    ${mainDeveloper ? `
                        <div class="mod-developer">от ${this.escapeHtml(mainDeveloper.nickname)}</div>
                    ` : ''}
                </div>
                
                <div class="mod-content">
                    <div class="mod-meta">
                        <div class="mod-type">
                            <span class="mod-type-icon">${mod.isClientside ? '🎮' : '🖥️'}</span>
                            <span>${mod.isClientside ? 'Клиент' : 'Сервер'}</span>
                        </div>
                        <div class="mod-stats">
                            <div class="mod-stat-item stat-downloads">
                                <span class="mod-stat-icon">⬇️</span>
                                <span class="mod-downloads">${this.formatNumber(mod.downloads || 0)}</span>
                            </div>
                            <div class="mod-stat-item stat-size">
                                <span class="mod-stat-icon">💾</span>
                                <span class="mod-size">${mod.size || 0} MB</span>
                            </div>
                        </div>
                    </div>
                    
                    ${mod.tags && mod.tags.length > 0 ? `
                        <div class="mod-tags">
                            ${mod.tags.slice(0, 2).map(tag => 
                                `<span class="mod-tag">${this.escapeHtml(tag.title)}</span>`
                            ).join('')}
                            ${mod.tags.length > 2 ? `<span class="mod-tag">+${mod.tags.length - 2}</span>` : ''}
                        </div>
                    ` : ''}
                    
                    ${mod.modLoaders && mod.modLoaders.length > 0 ? `
                        <div class="mod-loaders">
                            ${mod.modLoaders.slice(0, 2).map(loader => 
                                `<span class="mod-loader">${this.escapeHtml(loader.title)}</span>`
                            ).join('')}
                            ${mod.modLoaders.length > 2 ? `<span class="mod-loader">+${mod.modLoaders.length - 2}</span>` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
};

// Рендеринг модов в таблице
UIManager.prototype.renderModsTable = function(modsToRender = null) {
    const mods = modsToRender || this.mods; // Используем переданные моды или все моды
    const tbody = document.getElementById('mods-tbody');
    if (!tbody) return;

    if (mods.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 3rem; color: #888;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
                    <p>Модов пока нет</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">Добавьте первый мод используя кнопку выше!</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = mods.map(mod => {
        const description = mod.description || '—';
        const isLongDescription = description.length > 100;
        const shortDescription = isLongDescription ? description.substring(0, 100) + '...' : description;
        
        return `
            <tr>
                <td>
                    <strong>${this.escapeHtml(mod.title || 'Без названия')}</strong>
                    ${mod.isClientside ? '<br><small>🎮 Клиентский</small>' : ''}
                </td>
                <td>
                    <div class="mod-description-cell" title="${this.escapeHtml(description)}">
                        ${this.escapeHtml(shortDescription)}
                        ${isLongDescription ? '<br><small style="color: #666; cursor: pointer;" onclick="uiManager.showFullDescription(this)">показать полностью</small>' : ''}
                    </div>
                </td>
                <td>${this.renderTags(mod.versions)}</td>
                <td>${this.renderTags(mod.modLoaders)}</td>
                <td>${this.renderTags(mod.tags)}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="opacity: 0.7;">💾</span>
                        <strong>${mod.size || 0} MB</strong>
                    </div>
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="opacity: 0.7;">⬇️</span>
                        <span class="downloads-count">${this.formatNumber(mod.downloads || 0)}</span>
                    </div>
                </td>
                <td>
                    <span class="badge ${mod.isClientside ? 'badge-info' : 'badge-warning'}">
                        ${mod.isClientside ? '🎮 Клиент' : '🖥️ Сервер'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="uiManager.editMod('${mod.id}')" title="Редактировать">
                            ✏️
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="uiManager.deleteMod('${mod.id}')" title="Удалить">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    this.renderModPagination();
};

// Рендеринг коллекций
UIManager.prototype.renderCollections = function(collectionsToRender = null) {
    const collections = collectionsToRender || this.collections; // Используем переданные сборки или все сборки
    const tbody = document.getElementById('collections-tbody');
    if (!tbody) return;

    if (collections.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 3rem; color: #888;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📚</div>
                    <p>Сборок пока нет</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">Создайте первую сборку!</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = collections.map(collection => `
        <tr>
            <td><strong>${this.escapeHtml(collection.name || 'Без названия')}</strong></td>
            <td>${collection.timeToComplete || 0} ч</td>
            <td>${collection.version ? `<span class="tag">${this.escapeHtml(collection.version.title)}</span>` : '—'}</td>
            <td>${collection.modLoader ? `<span class="badge">${this.escapeHtml(collection.modLoader.title)}</span>` : '—'}</td>
            <td>${collection.difficulty ? `<span class="badge">${this.escapeHtml(collection.difficulty.title)}</span>` : '—'}</td>
            <td>${this.renderTags(collection.focuses)}</td>
            <td><strong>${collection.mods?.length || 0}</strong></td>
            <td>${new Date(collection.updatedAt).toLocaleDateString('ru-RU')}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="uiManager.editCollection('${collection.id}')" title="Редактировать">
                        ✏️
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="uiManager.deleteCollection('${collection.id}')" title="Удалить">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
};

// Основные функции рендера
UIManager.prototype.renderMods = function() {
    if (this.currentView === 'grid') {
        this.renderModsGrid();
    } else {
        this.renderModsTable();
    }
};