export class StatisticsManager {
    static calculateStats(sales) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const stats = {
            total: sales.length,
            thisMonth: 0,
            thisYear: 0,
            uniqueBuildings: new Set()
        };

        sales.forEach(sale => {
            if (!sale.dateAchat) return;
            
            const saleDate = new Date(sale.dateAchat);
            
            if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
                stats.thisMonth++;
            }
            
            if (saleDate.getFullYear() === currentYear) {
                stats.thisYear++;
            }
            
            if (sale.appartement) {
                const building = sale.appartement.split('-')[0];
                if (building) {
                    stats.uniqueBuildings.add(building);
                }
            }
        });

        return {
            total: stats.total,
            thisMonth: stats.thisMonth,
            thisYear: stats.thisYear,
            uniqueBuildings: stats.uniqueBuildings.size
        };
    }

    static getBuildingsList(sales) {
        const buildings = new Set();
        sales.forEach(sale => {
            if (sale.appartement) {
                const building = sale.appartement.split('-')[0];
                if (building) {
                    buildings.add(building);
                }
            }
        });
        return Array.from(buildings).sort();
    }

    static getSalesByMonth(sales) {
        const monthlyData = {};
        
        sales.forEach(sale => {
            if (!sale.dateAchat) return;
            const date = new Date(sale.dateAchat);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = 0;
            }
            monthlyData[monthKey]++;
        });
        
        return monthlyData;
    }
}

