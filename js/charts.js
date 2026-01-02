export class ChartsManager {
    constructor() {
        this.charts = {
            monthly: null,
            buildings: null,
            distribution: null
        };
        this.currentTab = 'monthly';
    }

    init(sales) {
        this.destroyAll();
        this.updateAllCharts(sales);
        this.setupTabs();
    }

    setupTabs() {
        const tabs = {
            tabMonthly: 'monthly',
            tabBuildings: 'buildings',
            tabDistribution: 'distribution'
        };

        Object.keys(tabs).forEach(tabId => {
            const tab = document.getElementById(tabId);
            if (tab) {
                tab.addEventListener('click', () => {
                    this.switchTab(tabs[tabId]);
                });
            }
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.chart-tab').forEach(btn => {
            btn.classList.remove('active', 'text-red-600', 'border-red-600', 'dark:text-red-400', 'dark:border-red-400');
            btn.classList.add('text-gray-500', 'border-transparent', 'dark:text-gray-400');
            btn.setAttribute('aria-selected', 'false');
        });

        const activeTab = document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
        if (activeTab) {
            activeTab.classList.add('active', 'text-red-600', 'border-red-600', 'dark:text-red-400', 'dark:border-red-400');
            activeTab.classList.remove('text-gray-500', 'border-transparent', 'dark:text-gray-400');
            activeTab.setAttribute('aria-selected', 'true');
        }

        // Show/hide chart containers
        document.getElementById('chartMonthlyContainer').classList.toggle('hidden', tabName !== 'monthly');
        document.getElementById('chartBuildingsContainer').classList.toggle('hidden', tabName !== 'buildings');
        document.getElementById('chartDistributionContainer').classList.toggle('hidden', tabName !== 'distribution');
    }

    updateAllCharts(sales) {
        this.updateMonthlyChart(sales);
        this.updateBuildingsChart(sales);
        this.updateDistributionChart(sales);
    }

    updateMonthlyChart(sales) {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;

        // Calculer les ventes par mois
        const monthlyData = this.getMonthlyData(sales);
        const labels = Object.keys(monthlyData).sort();
        const data = labels.map(label => monthlyData[label]);

        // Formater les labels (YYYY-MM -> Mois YYYY)
        const formattedLabels = labels.map(label => {
            const [year, month] = label.split('-');
            const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
            return `${monthNames[parseInt(month) - 1]} ${year}`;
        });

        if (this.charts.monthly) {
            this.charts.monthly.destroy();
        }

        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#e5e7eb' : '#374151';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        this.charts.monthly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: formattedLabels,
                datasets: [{
                    label: 'Nombre de ventes',
                    data: data,
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#dc2626',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: textColor,
                            font: {
                                size: 14
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#1f2937' : '#fff',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: '#dc2626',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: textColor,
                            stepSize: 1
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    x: {
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        }
                    }
                }
            }
        });
    }

    updateBuildingsChart(sales) {
        const ctx = document.getElementById('buildingsChart');
        if (!ctx) return;

        // Calculer les ventes par immeuble
        const buildingsData = this.getBuildingsData(sales);
        const labels = Object.keys(buildingsData).sort((a, b) => buildingsData[b] - buildingsData[a]);
        const data = labels.map(label => buildingsData[label]);

        if (this.charts.buildings) {
            this.charts.buildings.destroy();
        }

        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#e5e7eb' : '#374151';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        // Générer des couleurs pour chaque barre
        const colors = this.generateColors(labels.length);

        this.charts.buildings = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.map(b => `Immeuble ${b}`),
                datasets: [{
                    label: 'Nombre de ventes',
                    data: data,
                    backgroundColor: colors.map(c => c.background),
                    borderColor: colors.map(c => c.border),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#1f2937' : '#fff',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: '#dc2626',
                        borderWidth: 1,
                        padding: 12
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: textColor,
                            stepSize: 1
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    x: {
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor,
                            display: false
                        }
                    }
                }
            }
        });
    }

    updateDistributionChart(sales) {
        const ctx = document.getElementById('distributionChart');
        if (!ctx) return;

        // Calculer les ventes par immeuble
        const buildingsData = this.getBuildingsData(sales);
        const labels = Object.keys(buildingsData).sort((a, b) => buildingsData[b] - buildingsData[a]);
        const data = labels.map(label => buildingsData[label]);

        if (this.charts.distribution) {
            this.charts.distribution.destroy();
        }

        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#e5e7eb' : '#374151';

        // Générer des couleurs pour le camembert
        const colors = this.generateColors(labels.length);

        this.charts.distribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.map(b => `Immeuble ${b}`),
                datasets: [{
                    data: data,
                    backgroundColor: colors.map(c => c.background),
                    borderColor: colors.map(c => c.border),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            color: textColor,
                            font: {
                                size: 12
                            },
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#1f2937' : '#fff',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: '#dc2626',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    getMonthlyData(sales) {
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

    getBuildingsData(sales) {
        const buildingsData = {};
        
        sales.forEach(sale => {
            if (!sale.appartement) return;
            const building = sale.appartement.split('-')[0];
            if (building) {
                if (!buildingsData[building]) {
                    buildingsData[building] = 0;
                }
                buildingsData[building]++;
            }
        });
        
        return buildingsData;
    }

    generateColors(count) {
        const colors = [
            { background: 'rgba(220, 38, 38, 0.8)', border: '#dc2626' }, // red
            { background: 'rgba(34, 197, 94, 0.8)', border: '#22c55e' }, // green
            { background: 'rgba(59, 130, 246, 0.8)', border: '#3b82f6' }, // blue
            { background: 'rgba(234, 179, 8, 0.8)', border: '#eab308' }, // yellow
            { background: 'rgba(168, 85, 247, 0.8)', border: '#a855f7' }, // purple
            { background: 'rgba(236, 72, 153, 0.8)', border: '#ec4899' }, // pink
            { background: 'rgba(249, 115, 22, 0.8)', border: '#f97316' }, // orange
            { background: 'rgba(20, 184, 166, 0.8)', border: '#14b8a6' }, // teal
            { background: 'rgba(139, 92, 246, 0.8)', border: '#8b5cf6' }, // violet
            { background: 'rgba(239, 68, 68, 0.8)', border: '#ef4444' }  // red-500
        ];

        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(colors[i % colors.length]);
        }
        return result;
    }

    destroyAll() {
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key]) {
                this.charts[key].destroy();
                this.charts[key] = null;
            }
        });
    }

    update(sales) {
        this.updateAllCharts(sales);
    }
}

