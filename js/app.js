import { StorageManager } from './storage.js';
import { CSVManager } from './csv.js';
import { PDFManager } from './pdf.js';
import { StatisticsManager } from './stats.js';

class ApartmentSalesApp {
    constructor() {
        this.currentEditId = null;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.allSales = [];
        this.filteredSales = [];
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.activeFilters = {
            search: '',
            building: '',
            dateFrom: '',
            dateTo: '',
            prix: ''
        };
        
        this.init();
    }

    init() {
        this.initDarkMode();
        this.setMaxDate();
        this.setupEventListeners();
        this.loadSales();
    }

    setMaxDate() {
        const dateInput = document.getElementById('dateAchat');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('max', today);
        }
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
        const form = document.getElementById('saleForm');
        const searchInput = document.getElementById('searchInput');
        const exportBtn = document.getElementById('exportBtn');
        const exportPdfBtn = document.getElementById('exportPdfBtn');
        const importFile = document.getElementById('importFile');
        const cancelBtn = document.getElementById('cancelBtn');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        const darkModeToggle = document.getElementById('darkModeToggle');
        const filterBuilding = document.getElementById('filterBuilding');
        const filterDateFrom = document.getElementById('filterDateFrom');
        const filterDateTo = document.getElementById('filterDateTo');
        const filterPrix = document.getElementById('filterPrix');
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        searchInput.addEventListener('input', (e) => this.handleAdvancedSearch(e.target.value));
        exportBtn.addEventListener('click', () => this.handleExport());
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => this.handleExportPDF());
        }
        importFile.addEventListener('change', (e) => this.handleImport(e));
        
        // Modal buttons
        const newSaleBtn = document.getElementById('newSaleBtn');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const formModal = document.getElementById('formModal');
        
        if (newSaleBtn) {
            newSaleBtn.addEventListener('click', () => this.openFormModal());
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeFormModal());
        }
        
        // Close modal on background click
        if (formModal) {
            formModal.addEventListener('click', (e) => {
                if (e.target === formModal) {
                    this.closeFormModal();
                }
            });
        }
        
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && formModal && !formModal.classList.contains('hidden')) {
                this.closeFormModal();
            }
        });
        
        cancelBtn.addEventListener('click', () => {
            this.resetForm();
            this.closeFormModal();
        });
        confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        cancelDeleteBtn.addEventListener('click', () => this.closeDeleteModal());
        
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        }
        
        // Mobile menu
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        const darkModeToggleMobile = document.getElementById('darkModeToggleMobile');
        
        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        if (darkModeToggleMobile) {
            darkModeToggleMobile.addEventListener('click', () => {
                this.toggleDarkMode();
                this.toggleMobileMenu(); // Close menu after toggling dark mode
            });
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
        
        if (filterBuilding) {
            filterBuilding.addEventListener('change', (e) => this.handleFilterChange('building', e.target.value));
        }
        if (filterDateFrom) {
            filterDateFrom.addEventListener('change', (e) => this.handleFilterChange('dateFrom', e.target.value));
        }
        if (filterDateTo) {
            filterDateTo.addEventListener('change', (e) => this.handleFilterChange('dateTo', e.target.value));
        }
        if (filterPrix) {
            filterPrix.addEventListener('change', (e) => this.handleFilterChange('prix', e.target.value));
        }
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
        }

        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const pageInput = document.getElementById('pageInput');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        }
        if (pageInput) {
            pageInput.addEventListener('change', (e) => {
                const page = parseInt(e.target.value);
                const totalPages = Math.ceil(this.filteredSales.length / this.itemsPerPage);
                if (page >= 1 && page <= totalPages) {
                    this.goToPage(page);
                } else {
                    e.target.value = this.currentPage;
                }
            });
        }

        document.querySelectorAll('[data-sort]').forEach(header => {
            header.addEventListener('click', () => this.handleSort(header.dataset.sort));
        });

        const inputs = form.querySelectorAll('input[type="text"], input[type="tel"], input[type="date"], select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.clearFieldError(input.id));
            input.addEventListener('change', () => this.clearFieldError(input.id));
        });

        // Mettre à jour le format d'appartement selon le prix sélectionné
        const prixSelect = document.getElementById('prix');
        if (prixSelect) {
            prixSelect.addEventListener('change', () => {
                this.updateAppartementFormat();
                this.clearFieldError('appartement');
            });
        }
    }

    loadSales() {
        // Show skeletons
        this.showSkeletons();
        
        // Simulate loading delay for better UX
        setTimeout(() => {
            this.allSales = StorageManager.getAll();
            this.applyAllFilters();
            this.updateRecordCount();
            this.updateStatistics();
            this.updateBuildingsFilter();
            this.renderTable();
            this.hideSkeletons();
        }, 500);
    }
    
    showSkeletons() {
        const statsSkeleton = document.getElementById('statsSkeleton');
        const statsContent = document.getElementById('statsContent');
        const tableSkeleton = document.getElementById('tableSkeleton');
        const tableContent = document.getElementById('tableContent');
        const navRecordCountSkeleton = document.getElementById('navRecordCountSkeleton');
        const navRecordCount = document.getElementById('navRecordCount');
        const navRecordCountMobileSkeleton = document.getElementById('navRecordCountMobileSkeleton');
        const navRecordCountMobile = document.getElementById('navRecordCountMobile');
        
        if (statsSkeleton) statsSkeleton.classList.remove('hidden');
        if (statsContent) statsContent.classList.add('hidden');
        if (tableSkeleton) tableSkeleton.classList.remove('hidden');
        if (tableContent) tableContent.classList.add('hidden');
        if (navRecordCountSkeleton) navRecordCountSkeleton.classList.remove('hidden');
        if (navRecordCount) navRecordCount.classList.add('hidden');
        if (navRecordCountMobileSkeleton) navRecordCountMobileSkeleton.classList.remove('hidden');
        if (navRecordCountMobile) navRecordCountMobile.classList.add('hidden');
    }
    
    hideSkeletons() {
        const statsSkeleton = document.getElementById('statsSkeleton');
        const statsContent = document.getElementById('statsContent');
        const tableSkeleton = document.getElementById('tableSkeleton');
        const tableContent = document.getElementById('tableContent');
        const navRecordCountSkeleton = document.getElementById('navRecordCountSkeleton');
        const navRecordCount = document.getElementById('navRecordCount');
        const navRecordCountMobileSkeleton = document.getElementById('navRecordCountMobileSkeleton');
        const navRecordCountMobile = document.getElementById('navRecordCountMobile');
        
        if (statsSkeleton) statsSkeleton.classList.add('hidden');
        if (statsContent) statsContent.classList.remove('hidden');
        if (tableSkeleton) tableSkeleton.classList.add('hidden');
        if (tableContent) tableContent.classList.remove('hidden');
        if (navRecordCountSkeleton) navRecordCountSkeleton.classList.add('hidden');
        if (navRecordCount) navRecordCount.classList.remove('hidden');
        if (navRecordCountMobileSkeleton) navRecordCountMobileSkeleton.classList.add('hidden');
        if (navRecordCountMobile) navRecordCountMobile.classList.remove('hidden');
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
    }

    updateStatistics() {
        const stats = StatisticsManager.calculateStats(this.allSales);
        document.getElementById('statTotal').textContent = stats.total;
        document.getElementById('statMonth').textContent = stats.thisMonth;
        document.getElementById('statYear').textContent = stats.thisYear;
        document.getElementById('statBuildings').textContent = stats.uniqueBuildings;
    }

    updateBuildingsFilter() {
        const buildings = StatisticsManager.getBuildingsList(this.allSales);
        const select = document.getElementById('filterBuilding');
        if (!select) return;
        
        const currentValue = select.value;
        select.innerHTML = '<option value="">Tous les immeubles</option>';
        
        buildings.forEach(building => {
            const option = document.createElement('option');
            option.value = building;
            option.textContent = `Immeuble ${building}`;
            select.appendChild(option);
        });
        
        if (currentValue) {
            select.value = currentValue;
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const sale = {
            nom: formData.get('nom').trim(),
            prenom: formData.get('prenom').trim(),
            telephone: formData.get('telephone').trim().replace(/\s/g, ''),
            dateAchat: formData.get('dateAchat'),
            appartement: formData.get('appartement').trim(),
            prix: formData.get('prix').trim()
        };

        if (!this.validateForm(sale)) {
            return;
        }

        // Vérifier l'unicité de l'appartement
        const existingSales = StorageManager.getAll();
        const apartmentKey = sale.appartement.toLowerCase().trim();
        const existingSale = existingSales.find(s => 
            s.appartement.toLowerCase().trim() === apartmentKey
        );

        // Si c'est une modification, vérifier que l'appartement n'existe pas ailleurs
        if (this.currentEditId) {
            if (existingSale && existingSale.id !== this.currentEditId) {
                this.showFieldError('appartement', 'Cet appartement est déjà utilisé par une autre vente');
                return;
            }
        } else {
            // Si c'est un ajout, vérifier que l'appartement n'existe pas
            if (existingSale) {
                this.showFieldError('appartement', 'Cet appartement existe déjà dans la base de données');
                return;
            }
        }

        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enregistrement...';

        try {
            if (this.currentEditId) {
                StorageManager.update(this.currentEditId, sale);
                this.showAlert('Vente modifiée avec succès', 'success');
            } else {
                StorageManager.add(sale);
                this.showAlert('Vente enregistrée avec succès', 'success');
            }

            this.loadSales();
            this.updateStatistics();
            this.updateBuildingsFilter();
            this.renderTable();
            this.closeFormModal();
        } catch (error) {
            this.showAlert(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    validateForm(sale) {
        let isValid = true;

        if (!sale.nom || sale.nom.trim() === '') {
            this.showFieldError('nom', 'Le nom est requis');
            isValid = false;
        }

        if (!sale.prenom || sale.prenom.trim() === '') {
            this.showFieldError('prenom', 'Le prénom est requis');
            isValid = false;
        }

        if (!sale.telephone || !/^\d{10}$/.test(sale.telephone)) {
            this.showFieldError('telephone', 'Le téléphone doit contenir exactement 10 chiffres');
            isValid = false;
        }

        if (!sale.dateAchat) {
            this.showFieldError('dateAchat', 'La date d\'achat est requise');
            isValid = false;
        } else {
            const saleDate = new Date(sale.dateAchat);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            
            if (saleDate > today) {
                this.showFieldError('dateAchat', 'La date d\'achat ne peut pas être dans le futur');
                isValid = false;
            }
        }

        // Validation du format d'appartement selon le prix
        if (!sale.appartement) {
            this.showFieldError('appartement', 'L\'appartement est requis');
            isValid = false;
        } else {
            // Format pour prix 121 800: 999-A-99-99 (Immeuble-Porte-Étage-Numéro)
            // Format pour prix 155 000 - 165 000 et 175 000: 999-99-99 (ancien format)
            if (sale.prix === '121800') {
                if (!/^\d{3}-[A-D]-\d{2}-\d{2}$/.test(sale.appartement)) {
                    this.showFieldError('appartement', 'Le format doit être XXX-A-XX-XX où A est la porte (A, B, C ou D). Ex: 148-A-03-41');
                    isValid = false;
                }
            } else if (sale.prix === '155000-16500' || sale.prix === '175000') {
                if (!/^\d{3}-\d{2}-\d{2}$/.test(sale.appartement)) {
                    this.showFieldError('appartement', 'Le format doit être XXX-XX-XX (ex: 148-03-41)');
                    isValid = false;
                }
            } else {
                // Si le prix n'est pas encore sélectionné, accepter les deux formats
                if (!/^\d{3}-[A-D]-\d{2}-\d{2}$/.test(sale.appartement) && !/^\d{3}-\d{2}-\d{2}$/.test(sale.appartement)) {
                    this.showFieldError('appartement', 'Format invalide. Pour prix 121 800: XXX-A-XX-XX, sinon: XXX-XX-XX');
                    isValid = false;
                }
            }
        }

        if (!sale.prix || sale.prix.trim() === '') {
            this.showFieldError('prix', 'Le prix est requis');
            isValid = false;
        }

        return isValid;
    }

    showFieldError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}Error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
        const input = document.getElementById(fieldId);
        if (input) {
            input.classList.add('border-red-600');
            input.setAttribute('aria-invalid', 'true');
        }
    }

    clearFieldError(fieldId) {
        const errorElement = document.getElementById(`${fieldId}Error`);
        if (errorElement) {
            errorElement.classList.add('hidden');
            errorElement.textContent = '';
        }
        const input = document.getElementById(fieldId);
        if (input) {
            input.classList.remove('border-red-600');
            input.setAttribute('aria-invalid', 'false');
        }
    }

    handleAdvancedSearch(query) {
        this.activeFilters.search = query;
        this.applyAllFilters();
    }

    handleFilterChange(type, value) {
        this.activeFilters[type] = value;
        this.currentPage = 1;
        this.applyAllFilters();
    }

    clearAllFilters() {
        this.activeFilters = {
            search: '',
            building: '',
            dateFrom: '',
            dateTo: '',
            prix: ''
        };
        document.getElementById('searchInput').value = '';
        document.getElementById('filterBuilding').value = '';
        document.getElementById('filterDateFrom').value = '';
        document.getElementById('filterDateTo').value = '';
        document.getElementById('filterPrix').value = '';
        this.currentPage = 1;
        this.applyAllFilters();
    }

    applyAllFilters() {
        let filtered = [...this.allSales];

        if (this.activeFilters.search) {
            const searchTerm = this.activeFilters.search.toLowerCase().trim();
            filtered = filtered.filter(sale => {
                const nom = sale.nom?.toLowerCase() || '';
                const prenom = sale.prenom?.toLowerCase() || '';
                const telephone = sale.telephone?.toLowerCase() || '';
                const appartement = sale.appartement?.toLowerCase() || '';
                const dateAchat = this.formatDateForDisplay(sale.dateAchat)?.toLowerCase() || '';
                const prix = this.formatPrixForDisplay(sale.prix)?.toLowerCase() || '';
                
                return nom.includes(searchTerm) ||
                       prenom.includes(searchTerm) ||
                       telephone.includes(searchTerm) ||
                       appartement.includes(searchTerm) ||
                       dateAchat.includes(searchTerm) ||
                       prix.includes(searchTerm);
            });
        }

        if (this.activeFilters.building) {
            filtered = filtered.filter(sale => {
                if (!sale.appartement) return false;
                const building = sale.appartement.split('-')[0];
                return building === this.activeFilters.building;
            });
        }

        if (this.activeFilters.dateFrom) {
            filtered = filtered.filter(sale => {
                if (!sale.dateAchat) return false;
                return new Date(sale.dateAchat) >= new Date(this.activeFilters.dateFrom);
            });
        }

        if (this.activeFilters.dateTo) {
            filtered = filtered.filter(sale => {
                if (!sale.dateAchat) return false;
                const saleDate = new Date(sale.dateAchat);
                const toDate = new Date(this.activeFilters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                return saleDate <= toDate;
            });
        }

        if (this.activeFilters.prix) {
            filtered = filtered.filter(sale => {
                if (!sale.prix) return false;
                return sale.prix === this.activeFilters.prix;
            });
        }

        this.filteredSales = filtered;
        this.currentPage = 1;
        
        if (this.sortColumn) {
            this.applySort();
        }
        
        this.updateFilterInfo();
        this.renderTable();
    }

    updateFilterInfo() {
        const infoElement = document.getElementById('filterInfo');
        if (!infoElement) return;
        
        const activeCount = Object.values(this.activeFilters).filter(v => v).length;
        if (activeCount === 0) {
            infoElement.textContent = 'Aucun filtre actif';
        } else {
            infoElement.textContent = `${activeCount} filtre(s) actif(s)`;
        }
    }

    handleSort(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.applySort();
        this.renderTable();
    }

    applySort() {
        if (!this.sortColumn) return;

        this.filteredSales.sort((a, b) => {
            let aValue = a[this.sortColumn] || '';
            let bValue = b[this.sortColumn] || '';

            if (this.sortColumn === 'dateAchat') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            } else if (this.sortColumn === 'prix') {
                aValue = this.getPrixValue(aValue);
                bValue = this.getPrixValue(bValue);
            } else {
                aValue = String(aValue).toLowerCase();
                bValue = String(bValue).toLowerCase();
            }

            if (this.sortDirection === 'asc') {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });
    }

    handleEdit(id) {
        const sale = this.allSales.find(s => s.id === id);
        if (!sale) return;

        this.currentEditId = id;
        document.getElementById('editId').value = id;
        document.getElementById('nom').value = sale.nom;
        document.getElementById('prenom').value = sale.prenom;
        document.getElementById('telephone').value = sale.telephone;
        document.getElementById('dateAchat').value = sale.dateAchat;
        document.getElementById('appartement').value = sale.appartement;
        document.getElementById('prix').value = sale.prix || '';
        
        // Mettre à jour le format d'appartement selon le prix
        this.updateAppartementFormat();
        
        document.getElementById('formTitle').textContent = 'Modifier la Vente';
        document.getElementById('submitBtn').textContent = 'Mettre à jour';
        document.getElementById('cancelBtn').classList.remove('hidden');
        
        // Open modal for editing
        this.openFormModal();
    }

    handleDelete(id) {
        this.deleteId = id;
        document.getElementById('deleteModal').classList.remove('hidden');
    }

    confirmDelete() {
        if (this.deleteId) {
            try {
                StorageManager.delete(this.deleteId);
                this.showAlert('Vente supprimée avec succès', 'success');
                this.loadSales();
                this.updateStatistics();
                this.updateBuildingsFilter();
                this.renderTable();
            } catch (error) {
                this.showAlert('Erreur lors de la suppression', 'error');
            }
        }
        this.closeDeleteModal();
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').classList.add('hidden');
        this.deleteId = null;
    }

    openFormModal() {
        const formModal = document.getElementById('formModal');
        if (formModal) {
            // Only reset if not editing
            if (!this.currentEditId) {
                this.resetForm();
            }
            formModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            
            // Focus on first input
            setTimeout(() => {
                const firstInput = document.getElementById('nom');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);
        }
    }

    closeFormModal() {
        const formModal = document.getElementById('formModal');
        if (formModal) {
            formModal.classList.add('hidden');
            document.body.style.overflow = ''; // Restore scrolling
            this.resetForm();
        }
    }

    resetForm() {
        document.getElementById('saleForm').reset();
        document.getElementById('editId').value = '';
        this.currentEditId = null;
        document.getElementById('formTitle').textContent = 'Nouvelle Vente';
        document.getElementById('submitBtn').textContent = 'Enregistrer';
        document.getElementById('cancelBtn').classList.add('hidden');
        
        // Reset format d'appartement
        this.updateAppartementFormat();
        
        // Clear all field errors
        document.querySelectorAll('[id$="Error"]').forEach(error => {
            error.classList.add('hidden');
            error.textContent = '';
        });
        
        // Reset ARIA attributes
        document.querySelectorAll('input, select').forEach(field => {
            field.setAttribute('aria-invalid', 'false');
        });
    }

    updateAppartementFormat() {
        const prixSelect = document.getElementById('prix');
        const appartementInput = document.getElementById('appartement');
        
        if (!prixSelect || !appartementInput) return;
        
        const prix = prixSelect.value;
        if (prix === '121800') {
            appartementInput.placeholder = '148-A-03-41';
            appartementInput.pattern = '\\d{3}-[A-D]-\\d{2}-\\d{2}';
        } else if (prix === '155000-16500' || prix === '175000') {
            appartementInput.placeholder = '148-03-41';
            appartementInput.pattern = '\\d{3}-\\d{2}-\\d{2}';
        } else {
            appartementInput.placeholder = '148-A-03-41 ou 148-03-41';
            appartementInput.removeAttribute('pattern');
        }
    }

    handleExport() {
        try {
            const dataToExport = this.filteredSales.length < this.allSales.length 
                ? this.filteredSales 
                : this.allSales;
            
            if (dataToExport.length === 0) {
                this.showAlert('Aucune donnée à exporter', 'error');
                return;
            }
            
            this.setButtonLoading('exportBtn', true);
            setTimeout(() => {
                CSVManager.exportToCSV(dataToExport);
                this.showAlert('Export Excel (XLS) réussi', 'success');
                this.setButtonLoading('exportBtn', false);
            }, 300);
        } catch (error) {
            this.showAlert(`Erreur lors de l'export: ${error.message}`, 'error');
            this.setButtonLoading('exportBtn', false);
        }
    }

    handleExportPDF() {
        try {
            const dataToExport = this.filteredSales.length < this.allSales.length 
                ? this.filteredSales 
                : this.allSales;
            
            if (dataToExport.length === 0) {
                this.showAlert('Aucune donnée à exporter', 'error');
                return;
            }
            
            this.setButtonLoading('exportPdfBtn', true);
            setTimeout(() => {
                PDFManager.exportToPDF(dataToExport, 'Liste des Ventes d\'Appartements');
                this.showAlert('Export PDF lancé', 'success');
                this.setButtonLoading('exportPdfBtn', false);
            }, 300);
        } catch (error) {
            this.showAlert(`Erreur lors de l'export PDF: ${error.message}`, 'error');
            this.setButtonLoading('exportPdfBtn', false);
        }
    }

    async handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const { sales, errors } = await CSVManager.importFromCSV(file);
            
            if (sales.length === 0) {
                this.showAlert('Aucune donnée valide trouvée dans le fichier', 'error');
                event.target.value = '';
                return;
            }

            const existingSales = StorageManager.getAll();
            const existingApartments = new Set(existingSales.map(s => s.appartement.toLowerCase().trim()));
            
            // Vérifier les doublons dans les données importées
            const seenApartments = new Set();
            const duplicateInFile = [];
            const duplicateWithExisting = [];
            const validSales = [];

            sales.forEach((sale, index) => {
                const apartmentKey = sale.appartement.toLowerCase().trim();
                
                // Vérifier doublon dans le fichier importé
                if (seenApartments.has(apartmentKey)) {
                    duplicateInFile.push(`Ligne ${index + 2}: Appartement "${sale.appartement}" déjà présent dans le fichier`);
                    return;
                }
                
                // Vérifier doublon avec les données existantes
                if (existingApartments.has(apartmentKey)) {
                    duplicateWithExisting.push(`Ligne ${index + 2}: Appartement "${sale.appartement}" existe déjà dans la base de données`);
                    return;
                }
                
                seenApartments.add(apartmentKey);
                validSales.push(sale);
            });

            // Ajouter les erreurs de doublons
            const allErrors = [
                ...errors,
                ...duplicateInFile,
                ...duplicateWithExisting
            ];

            if (validSales.length === 0) {
                let errorMessage = 'Aucune donnée valide à importer. ';
                if (duplicateInFile.length > 0 || duplicateWithExisting.length > 0) {
                    errorMessage += 'Tous les appartements sont en doublon.';
                }
                this.showAlert(errorMessage, 'error');
                event.target.value = '';
                return;
            }

            // Ajouter les ventes valides
            const newSales = validSales.map(sale => ({
                ...sale,
                id: StorageManager.generateId()
            }));

            StorageManager.save([...existingSales, ...newSales]);
            
            // Construire le message de résultat
            let message = `${validSales.length} vente(s) importée(s) avec succès`;
            
            if (duplicateInFile.length > 0) {
                message += `. ${duplicateInFile.length} doublon(s) détecté(s) dans le fichier`;
            }
            
            if (duplicateWithExisting.length > 0) {
                message += `. ${duplicateWithExisting.length} appartement(s) déjà existant(s) ignoré(s)`;
            }
            
            if (errors.length > 0) {
                message += `. ${errors.length} erreur(s) de validation`;
            }
            
            const hasWarnings = duplicateInFile.length > 0 || duplicateWithExisting.length > 0 || errors.length > 0;
            this.showAlert(message, hasWarnings ? 'warning' : 'success');
            
            this.loadSales();
            this.updateStatistics();
            this.updateBuildingsFilter();
            this.renderTable();
        } catch (error) {
            this.showAlert(`Erreur lors de l'import: ${error.message}`, 'error');
        } finally {
            event.target.value = '';
        }
    }

    renderTable() {
        const tbody = document.getElementById('salesTableBody');
        
        if (this.filteredSales.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        ${this.allSales.length === 0 
                            ? 'Aucune vente enregistrée' 
                            : 'Aucun résultat trouvé'}
                    </td>
                </tr>
            `;
            this.updatePagination(0, 0);
            return;
        }

        const totalPages = Math.ceil(this.filteredSales.length / this.itemsPerPage);
        if (this.currentPage > totalPages && totalPages > 0) {
            this.currentPage = totalPages;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredSales.length);
        const pageData = this.filteredSales.slice(startIndex, endIndex);

        tbody.innerHTML = pageData.map(sale => `
            <tr class="odd:bg-gray-50 dark:odd:bg-gray-700 even:bg-white dark:even:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <td class="px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-xs sm:text-sm">
                    <div class="font-medium">${this.escapeHtml(sale.nom)}</div>
                    <div class="sm:hidden text-gray-500 dark:text-gray-400 text-xs mt-0.5">${this.escapeHtml(sale.prenom)}</div>
                </td>
                <td class="hidden sm:table-cell px-4 py-3 border-b border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-sm">${this.escapeHtml(sale.prenom)}</td>
                <td class="hidden md:table-cell px-4 py-3 border-b border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-sm">${this.escapeHtml(sale.telephone)}</td>
                <td class="px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-xs sm:text-sm whitespace-nowrap">${this.formatDateForDisplay(sale.dateAchat)}</td>
                <td class="px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-mono">${this.escapeHtml(sale.appartement)}</td>
                <td class="hidden lg:table-cell px-4 py-3 border-b border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-sm font-semibold">${this.formatPrixForDisplay(sale.prix)}</td>
                <td class="px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-600 text-center no-print">
                    <div class="flex justify-center gap-1 sm:gap-2">
                        <button 
                            onclick="app.handleEdit('${sale.id}')"
                            aria-label="Modifier la vente de ${this.escapeHtml(sale.nom)} ${this.escapeHtml(sale.prenom)}"
                            class="bg-blue-600 text-white p-1.5 sm:p-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            title="Modifier"
                        >
                            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button 
                            onclick="app.handleDelete('${sale.id}')"
                            aria-label="Supprimer la vente de ${this.escapeHtml(sale.nom)} ${this.escapeHtml(sale.prenom)}"
                            class="bg-red-600 text-white p-1.5 sm:p-2 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            title="Supprimer"
                        >
                            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updatePagination(startIndex + 1, endIndex);
        this.updateSortIndicators();
    }

    updatePagination(start, end) {
        const total = this.filteredSales.length;
        const totalPages = Math.ceil(total / this.itemsPerPage);
        
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const pageInput = document.getElementById('pageInput');
        const totalPagesSpan = document.getElementById('totalPages');
        const paginationInfo = document.getElementById('paginationInfo');

        if (paginationInfo) {
            if (total === 0) {
                paginationInfo.textContent = 'Aucun résultat';
            } else {
                paginationInfo.textContent = `Affichage de ${start} à ${end} sur ${total} résultat${total > 1 ? 's' : ''}`;
            }
        }

        if (totalPagesSpan) {
            totalPagesSpan.textContent = `sur ${totalPages}`;
        }

        if (pageInput) {
            pageInput.value = this.currentPage;
            pageInput.max = totalPages;
        }

        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= totalPages || totalPages === 0;
        }
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredSales.length / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderTable();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    updateSortIndicators() {
        document.querySelectorAll('[data-sort]').forEach(header => {
            const column = header.dataset.sort;
            header.innerHTML = header.textContent.trim();
            
            if (this.sortColumn === column) {
                const indicator = this.sortDirection === 'asc' ? ' ↑' : ' ↓';
                header.innerHTML += `<span class="text-red-600">${indicator}</span>`;
            }
        });
    }

    formatDateForDisplay(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('fr-FR');
    }

    formatPrixForDisplay(prix) {
        if (!prix) return '';
        if (prix === '121800') {
            return '121 800 DH';
        } else if (prix === '155000-16500') {
            return '155 000 - 165 000 DH';
        } else if (prix === '175000') {
            return '175 000 DH';
        }
        return prix;
    }

    getPrixValue(prix) {
        if (!prix) return 0;
        if (prix === '121800') {
            return 121800;
        } else if (prix === '155000-16500') {
            return 138500; // Prix final après réduction
        } else if (prix === '175000') {
            return 175000;
        }
        return 0;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateRecordCount() {
        const countElement = document.getElementById('recordCount');
        const navCountElement = document.getElementById('navRecordCount');
        const navCountElementMobile = document.getElementById('navRecordCountMobile');
        const count = this.filteredSales.length;
        const total = this.allSales.length;
        
        if (count === total) {
            countElement.textContent = `(${total} enregistrement${total > 1 ? 's' : ''})`;
            if (navCountElement) {
                navCountElement.textContent = `${total} vente${total > 1 ? 's' : ''}`;
            }
            if (navCountElementMobile) {
                navCountElementMobile.textContent = total;
            }
        } else {
            countElement.textContent = `(${count} sur ${total} enregistrement${total > 1 ? 's' : ''})`;
            if (navCountElement) {
                navCountElement.textContent = `${count}/${total} ventes`;
            }
            if (navCountElementMobile) {
                navCountElementMobile.textContent = `${count}/${total}`;
            }
        }
    }

    showAlert(message, type = 'info') {
        // Utiliser showToast pour tous les messages
        this.showToast(message, type);
    }

    showToast(message, type = 'info', duration = 5000) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const icons = {
            success: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>`,
            error: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>`,
            warning: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>`,
            info: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>`
        };

        const colors = {
            success: {
                bg: 'bg-green-50 dark:bg-green-900/80 dark:border-green-700',
                border: 'border-green-500 dark:border-green-400',
                text: 'text-green-800 dark:text-green-100',
                icon: 'text-green-500 dark:text-green-300'
            },
            error: {
                bg: 'bg-red-50 dark:bg-red-900/80 dark:border-red-700',
                border: 'border-red-500 dark:border-red-400',
                text: 'text-red-800 dark:text-red-100',
                icon: 'text-red-500 dark:text-red-300'
            },
            warning: {
                bg: 'bg-yellow-50 dark:bg-yellow-900/80 dark:border-yellow-700',
                border: 'border-yellow-500 dark:border-yellow-400',
                text: 'text-yellow-800 dark:text-yellow-100',
                icon: 'text-yellow-500 dark:text-yellow-300'
            },
            info: {
                bg: 'bg-blue-50 dark:bg-blue-900/80 dark:border-blue-700',
                border: 'border-blue-500 dark:border-blue-400',
                text: 'text-blue-800 dark:text-blue-100',
                icon: 'text-blue-500 dark:text-blue-300'
            }
        };

        const colorScheme = colors[type] || colors.info;
        const icon = icons[type] || icons.info;
        
        // Shadow colors for dark mode
        const shadowColors = {
            success: 'dark:shadow-green-900/50',
            error: 'dark:shadow-red-900/50',
            warning: 'dark:shadow-yellow-900/50',
            info: 'dark:shadow-blue-900/50'
        };
        const shadowColor = shadowColors[type] || shadowColors.info;

        const toastHTML = `
            <div id="${toastId}" 
                 class="toast toast-enter ${colorScheme.bg} ${colorScheme.border} border-l-4 rounded-lg shadow-2xl ${shadowColor} p-4 flex items-start gap-3 backdrop-blur-sm"
                 role="alert"
                 aria-live="assertive"
                 aria-atomic="true">
                <div class="${colorScheme.icon} flex-shrink-0 mt-0.5">
                    ${icon}
                </div>
                <div class="flex-1 ${colorScheme.text}">
                    <p class="font-medium text-sm">${this.escapeHtml(message)}</p>
                </div>
                <button 
                    onclick="document.getElementById('${toastId}').classList.add('toast-exit'); setTimeout(() => document.getElementById('${toastId}')?.remove(), 300);"
                    class="${colorScheme.text} hover:opacity-70 dark:hover:opacity-90 transition-opacity flex-shrink-0 ml-2"
                    aria-label="Fermer la notification">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        toastContainer.insertAdjacentHTML('beforeend', toastHTML);

        // Auto-remove après la durée spécifiée
        if (duration > 0) {
            setTimeout(() => {
                const toast = document.getElementById(toastId);
                if (toast) {
                    toast.classList.add('toast-exit');
                    setTimeout(() => toast.remove(), 300);
                }
            }, duration);
        }
    }

    setButtonLoading(buttonId, isLoading) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            button.setAttribute('data-original-text', button.innerHTML);
            button.innerHTML = `
                <svg class="animate-spin h-4 w-4 inline-block mr-2" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Chargement...
            `;
        } else {
            button.disabled = false;
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.innerHTML = originalText;
                button.removeAttribute('data-original-text');
            }
        }
    }
}

const app = new ApartmentSalesApp();
window.app = app;

