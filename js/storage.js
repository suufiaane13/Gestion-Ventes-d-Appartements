const STORAGE_KEY = 'apartment_sales';

export class StorageManager {
    static getAll() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erreur lors de la lecture du LocalStorage:', error);
            return [];
        }
    }

    static save(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                throw new Error('L\'espace de stockage est plein. Veuillez exporter vos données et supprimer des enregistrements.');
            }
            console.error('Erreur lors de la sauvegarde dans LocalStorage:', error);
            throw error;
        }
    }

    static add(sale) {
        const sales = this.getAll();
        const newSale = {
            ...sale,
            id: this.generateId()
        };
        sales.push(newSale);
        this.save(sales);
        return newSale;
    }

    static update(id, updatedSale) {
        const sales = this.getAll();
        const index = sales.findIndex(sale => sale.id === id);
        
        if (index === -1) {
            throw new Error('Vente non trouvée');
        }

        sales[index] = { ...updatedSale, id };
        this.save(sales);
        return sales[index];
    }

    static delete(id) {
        const sales = this.getAll();
        const filtered = sales.filter(sale => sale.id !== id);
        this.save(filtered);
        return filtered.length < sales.length;
    }

    static clear() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression du LocalStorage:', error);
            return false;
        }
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static getCount() {
        return this.getAll().length;
    }
}

