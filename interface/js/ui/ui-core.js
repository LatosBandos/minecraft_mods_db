console.log('🔧 UI Core загружается...');

class UIManager {
    constructor() {
        console.log('🔧 Создание UIManager...');
        this.mods = [];
        this.collections = [];
        
        // Справочники
        this.availableVersions = [];
        this.availableModLoaders = [];
        this.availableTags = [];
        this.availableDevelopers = [];
        this.availableDifficulties = [];
        this.availableFocuses = [];

        this.currentModPage = 1;
        this.currentCollectionPage = 1;
        this.pageSize = 50;
        this.totalMods = 0;
        this.totalCollections = 0;
        this.currentView = 'grid';
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.delayedInit());
        } else {
            this.delayedInit();
        }
    }

    delayedInit() {
        console.log('🔧 Отложенная инициализация UI...');
        this.initStaticEventListeners();
        this.initSearchToggle();
        this.initSearchAndFilters();
    }

}

window.uiManager = new UIManager();