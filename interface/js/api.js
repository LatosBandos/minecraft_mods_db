class ModsAPI {
    constructor() {
        this.baseURL = 'http://localhost:5126';
        this.token = localStorage.getItem('jwtToken');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('jwtToken', token);
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        // 🔧 ДЕБАГ: Проверяем токен
        console.log('🔐 Токен в API:', {
            hasToken: !!this.token,
            token: this.token ? this.token.substring(0, 20) + '...' : 'нет'
        });

        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
            console.log('🔐 Добавляем заголовок Authorization');
        }

        try {
            console.log('🚀 Отправка запроса:', {
                method: config.method || 'GET',
                url: url,
                headers: config.headers
            });

            const response = await fetch(url, config);

            console.log('📨 Ответ сервера:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorText = await response.text();
                    console.log('❌ Тело ошибки:', errorText);
                    errorMessage = errorText || errorMessage;
                } catch {
                    // ignore
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('✅ Успешный ответ:', data);
            return data;

        } catch (error) {
            console.error('💥 Ошибка запроса:', error);
            throw error;
        }
    }

    // ===== АУТЕНТИФИКАЦИЯ =====
    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async register(userData) {
        console.log('📝 Register attempt with data:', userData);
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // ===== МОДЫ =====
    async getMods(page = 1, pageSize = 50, search = '') {
    const params = new URLSearchParams({
        pageNumber: page.toString(),
        pageSize: pageSize.toString()
    });

    if (search) {
        params.append('search', search);
    }

    const response = await this.request(`/mods?${params}`);
    
    // ДОБАВЬТЕ ЭТОТ ЛОГ
    console.log('🔍 API MODS RESPONSE:', {
        url: `/mods?${params}`,
        itemsCount: response.items?.length || 0,
        totalCount: response.totalCount,
        fullResponse: response
    });
    
    return response;
}

async createMod(modData) {
    console.log('📤 Создание мода:', modData);
    
    return this.request('/mods', {
        method: 'POST',
        body: JSON.stringify(modData)
    });
}

    async updateMod(modId, modData) {
        try {
            console.log('🔄 Обновление мода:', modId, modData);

            const response = await fetch(`${this.baseURL}/mods/${modId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(modData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();
            console.log('✅ Мод обновлен:', result);
            return result;

        } catch (error) {
            console.error('❌ Ошибка обновления мода:', error);
            throw error;
        }
    }

    // ===== КОЛЛЕКЦИИ =====
    async getCollections(page = 1, pageSize = 50, search = '') {
        const params = new URLSearchParams({
            pageNumber: page.toString(),
            pageSize: pageSize.toString()
        });

        if (search) {
            params.append('search', search);
        }

        const response = await this.request(`/collections?${params}`);

        // ДОБАВЬТЕ ЭТОТ ЛОГ
        console.log('🔍 API COLLECTIONS RESPONSE:', {
            url: `/collections?${params}`,
            itemsCount: response.items?.length || 0,
            totalCount: response.totalCount,
            fullResponse: response
        });

        return response;
    }
    async createCollection(collectionData) {
        return this.request('/collections', {
            method: 'POST',
            body: JSON.stringify(collectionData)
        });
    }

    // ===== СПРАВОЧНИКИ - ПОЛУЧЕНИЕ =====
    async getVersions() {
        return this.request('/versions?pageNumber=1&pageSize=100');
    }

    async getModLoaders() {
        return this.request('/modloaders?pageNumber=1&pageSize=100');
    }

    async getTags() {
        return this.request('/tags?pageNumber=1&pageSize=100');
    }

    async getDevelopers() {
        return this.request('/developers?pageNumber=1&pageSize=100');
    }

    async getDifficulties() {
        return this.request('/difficulties?pageNumber=1&pageSize=100');
    }

    async getFocuses() {
        return this.request('/focuses?pageNumber=1&pageSize=100');
    }

    // ===== СПРАВОЧНИКИ - СОЗДАНИЕ =====
    async createVersion(versionData) {
        return this.request('/versions', {
            method: 'POST',
            body: JSON.stringify(versionData)
        });
    }

    async createModLoader(modLoaderData) {
        return this.request('/modloaders', {
            method: 'POST',
            body: JSON.stringify(modLoaderData)
        });
    }

    async createTag(tagData) {
        return this.request('/tags', {
            method: 'POST',
            body: JSON.stringify(tagData)
        });
    }

    async createDeveloper(developerData) {
        return this.request('/developers', {
            method: 'POST',
            body: JSON.stringify(developerData)
        });
    }

    async createDifficulty(difficultyData) {
        return this.request('/difficulties', {
            method: 'POST',
            body: JSON.stringify(difficultyData)
        });
    }

    async createFocus(focusData) {
        return this.request('/focuses', {
            method: 'POST',
            body: JSON.stringify(focusData)
        });
    }
}

const api = new ModsAPI();