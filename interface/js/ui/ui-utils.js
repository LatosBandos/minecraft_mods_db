// Вспомогательные функции
UIManager.prototype.renderTags = function(items) {
    if (!items || items.length === 0) return '<span style="color: #888">—</span>';
    return items.slice(0, 3).map(item => 
        `<span class="tag" title="${this.escapeHtml(item.title || item.name || item.nickname)}">${this.escapeHtml(item.title || item.name || item.nickname)}</span>`
    ).join('') + (items.length > 3 ? `<span class="tag">+${items.length - 3}</span>` : '');
};

UIManager.prototype.formatNumber = function(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'тыс.';
    }
    return num.toString();
};

UIManager.prototype.escapeHtml = function(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

UIManager.prototype.getTypeName = function(type) {
    const names = {
        'version': 'Версия',
        'modloader': 'Модлоадер', 
        'tag': 'Тег',
        'developer': 'Разработчик',
        'difficulty': 'Сложность',
        'focus': 'Фокус'
    };
    return names[type] || type;
};

UIManager.prototype.showMessage = function(message, type) {
    alert(`${type === 'success' ? '✅' : '❌'} ${message}`);
};

UIManager.prototype.updateStats = function() {
    const updateCounter = (id, count) => {
        const element = document.getElementById(id);
        if (element) element.textContent = count;
    };

    updateCounter('mods-count', this.totalMods);
    updateCounter('collections-count', this.totalCollections);
    updateCounter('tags-count', this.availableTags.length);
    updateCounter('developers-count', this.availableDevelopers.length);
};


UIManager.prototype.deleteMod = function(modId) {
    if (confirm('Вы уверены, что хотите удалить этот мод?')) {
        this.showMessage(`Удаление мода ${modId} - в разработке`, 'info');
    }
};

UIManager.prototype.editCollection = function(collectionId) {
    this.showMessage(`Редактирование сборки ${collectionId} - в разработке`, 'info');
};

UIManager.prototype.deleteCollection = function(collectionId) {
    if (confirm('Вы уверены, что хотите удалить эту сборку?')) {
        this.showMessage(`Удаление сборки ${collectionId} - в разработке`, 'info');
    }
};

UIManager.prototype.showAddCollectionModal = function() {
    this.showMessage('Добавление сборки - в разработке', 'info');
};

UIManager.prototype.downloadMod = function(modId) {
    this.showMessage(`Скачивание мода ${modId} - в разработке`, 'info');
};

UIManager.prototype.renderMods = function() {
    if (this.currentView === 'grid') {
        this.renderModsGrid();
    } else {
        this.renderModsTable();
    }
    this.renderModPagination();
};