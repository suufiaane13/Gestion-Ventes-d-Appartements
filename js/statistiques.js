import { StorageManager } from './storage.js';
import { StatisticsManager } from './stats.js';
import { ChartsManager } from './charts.js';

class StatistiquesApp {
    constructor() {
        this.allSales = [];
        this.chartsManager = new ChartsManager();
        this.init();
    }

    init() {
        this.initDarkMode();
        this.loadSales();
        this.setupEventListeners();
        this.updateStatistics();
        this.initCharts();
    }

    initDarkMode() {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.documentElement.classList.add('dark');
        }
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) {
            toggle.setAttribute('aria-pressed', darkMode.toString());
        }
        
        // Initialize mobile menu text
        const darkModeTextMobile = document.getElementById('darkModeTextMobile');
        if (darkModeTextMobile) {
            darkModeTextMobile.textContent = darkMode ? 'Mode clair' : 'Mode sombre';
        }
    }

    setupEventListeners() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        const darkModeToggleMobile = document.getElementById('darkModeToggleMobile');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        }
        
        if (darkModeToggleMobile) {
            darkModeToggleMobile.addEventListener('click', () => {
                this.toggleDarkMode();
                this.toggleMobileMenu(); // Close menu after toggling dark mode
            });
        }
        
        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        // Close mobile menu when clicking on links inside
        if (mobileMenu) {
            const menuLinks = mobileMenu.querySelectorAll('a');
            menuLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (!mobileMenu.classList.contains('hidden')) {
                        this.toggleMobileMenu();
                    }
                });
            });
        }
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileMenu && mobileMenuToggle) {
                if (!mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    if (!mobileMenu.classList.contains('hidden')) {
                        this.toggleMobileMenu();
                    }
                }
            }
        });
    }
    
    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const menuIcon = document.getElementById('menuIcon');
        const closeIcon = document.getElementById('closeIcon');
        
        if (mobileMenu && mobileMenuToggle) {
            const isHidden = mobileMenu.classList.contains('hidden');
            
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                mobileMenuToggle.setAttribute('aria-expanded', 'true');
                if (menuIcon) menuIcon.classList.add('hidden');
                if (closeIcon) closeIcon.classList.remove('hidden');
            } else {
                mobileMenu.classList.add('hidden');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                if (menuIcon) menuIcon.classList.remove('hidden');
                if (closeIcon) closeIcon.classList.add('hidden');
            }
        }
    }

    loadSales() {
        // Show skeletons
        this.showSkeletons();
        
        // Simulate loading delay for better UX
        setTimeout(() => {
            this.allSales = StorageManager.getAll();
            this.updateRecordCount();
            this.hideSkeletons();
        }, 500);
    }
    
    showSkeletons() {
        const statsSkeleton = document.getElementById('statsSkeleton');
        const statsContent = document.getElementById('statsContent');
        const chartsSkeleton = document.getElementById('chartsSkeleton');
        const chartsContent = document.getElementById('chartsContent');
        const navRecordCountSkeleton = document.getElementById('navRecordCountSkeleton');
        const navRecordCount = document.getElementById('navRecordCount');
        const navRecordCountMobileSkeleton = document.getElementById('navRecordCountMobileSkeleton');
        const navRecordCountMobile = document.getElementById('navRecordCountMobile');
        
        if (statsSkeleton) statsSkeleton.classList.remove('hidden');
        if (statsContent) statsContent.classList.add('hidden');
        if (chartsSkeleton) chartsSkeleton.classList.remove('hidden');
        if (chartsContent) chartsContent.classList.add('hidden');
        if (navRecordCountSkeleton) navRecordCountSkeleton.classList.remove('hidden');
        if (navRecordCount) navRecordCount.classList.add('hidden');
        if (navRecordCountMobileSkeleton) navRecordCountMobileSkeleton.classList.remove('hidden');
        if (navRecordCountMobile) navRecordCountMobile.classList.add('hidden');
    }
    
    hideSkeletons() {
        const statsSkeleton = document.getElementById('statsSkeleton');
        const statsContent = document.getElementById('statsContent');
        const chartsSkeleton = document.getElementById('chartsSkeleton');
        const chartsContent = document.getElementById('chartsContent');
        const navRecordCountSkeleton = document.getElementById('navRecordCountSkeleton');
        const navRecordCount = document.getElementById('navRecordCount');
        const navRecordCountMobileSkeleton = document.getElementById('navRecordCountMobileSkeleton');
        const navRecordCountMobile = document.getElementById('navRecordCountMobile');
        
        if (statsSkeleton) statsSkeleton.classList.add('hidden');
        if (statsContent) statsContent.classList.remove('hidden');
        if (chartsSkeleton) chartsSkeleton.classList.add('hidden');
        if (chartsContent) chartsContent.classList.remove('hidden');
        if (navRecordCountSkeleton) navRecordCountSkeleton.classList.add('hidden');
        if (navRecordCount) navRecordCount.classList.remove('hidden');
        if (navRecordCountMobileSkeleton) navRecordCountMobileSkeleton.classList.add('hidden');
        if (navRecordCountMobile) navRecordCountMobile.classList.remove('hidden');
    }

    updateRecordCount() {
        const navCountElement = document.getElementById('navRecordCount');
        const navCountElementMobile = document.getElementById('navRecordCountMobile');
        const total = this.allSales.length;
        
        if (navCountElement) {
            navCountElement.textContent = `${total} vente${total > 1 ? 's' : ''}`;
        }
        
        if (navCountElementMobile) {
            navCountElementMobile.textContent = total;
        }
    }

    updateStatistics() {
        const stats = StatisticsManager.calculateStats(this.allSales);
        document.getElementById('statTotal').textContent = stats.total;
        document.getElementById('statMonth').textContent = stats.thisMonth;
        document.getElementById('statYear').textContent = stats.thisYear;
        document.getElementById('statBuildings').textContent = stats.uniqueBuildings;
    }

    initCharts() {
        if (this.allSales.length > 0) {
            this.chartsManager.init(this.allSales);
        }
    }

    toggleDarkMode() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', isDark.toString());
        
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) {
            toggle.setAttribute('aria-pressed', isDark.toString());
        }
        
        // Update mobile menu icons and text
        const sunIconMobile = document.getElementById('sunIconMobile');
        const moonIconMobile = document.getElementById('moonIconMobile');
        const darkModeTextMobile = document.getElementById('darkModeTextMobile');
        
        if (sunIconMobile && moonIconMobile) {
            if (isDark) {
                sunIconMobile.classList.remove('hidden');
                moonIconMobile.classList.add('hidden');
            } else {
                sunIconMobile.classList.add('hidden');
                moonIconMobile.classList.remove('hidden');
            }
        }
        
        // Update text based on current mode
        if (darkModeTextMobile) {
            darkModeTextMobile.textContent = isDark ? 'Mode clair' : 'Mode sombre';
        }

        // Mettre à jour les graphiques pour le mode sombre
        if (this.chartsManager && this.allSales.length > 0) {
            setTimeout(() => {
                this.chartsManager.update(this.allSales);
            }, 100);
        }
    }
}

const app = new StatistiquesApp();
window.app = app;

