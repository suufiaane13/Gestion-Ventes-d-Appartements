export class CSVManager {
    static exportToCSV(data) {
        // Utiliser le format XLS (Excel) au lieu du CSV
        return this.exportToXLS(data);
    }

    static exportToXLS(data) {
        if (!data || data.length === 0) {
            throw new Error('Aucune donnée à exporter');
        }

        const headers = ['Nom', 'Prénom', 'Téléphone', 'Date d\'achat', 'Appartement', 'Prix'];
        const currentDate = new Date().toLocaleDateString('fr-FR');
        
        // Créer un fichier HTML table optimisé pour Excel avec colonnes auto-ajustées
        const htmlContent = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="UTF-8">
    <meta name="ProgId" content="Excel.Sheet">
    <meta name="Generator" content="Microsoft Excel">
    <!--[if gte mso 9]>
    <xml>
        <x:ExcelWorkbook>
            <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                    <x:Name>Ventes</x:Name>
                    <x:WorksheetOptions>
                        <x:DefaultRowHeight>375</x:DefaultRowHeight>
                        <x:FitToPage/>
                        <x:Print>
                            <x:FitHeight>0</x:FitHeight>
                            <x:ValidPrinterInfo/>
                            <x:Scale>90</x:Scale>
                            <x:HorizontalResolution>600</x:HorizontalResolution>
                            <x:VerticalResolution>600</x:VerticalResolution>
                        </x:Print>
                        <x:Selected/>
                        <x:Panes>
                            <x:Pane>
                                <x:Number>3</x:Number>
                                <x:ActiveRow>1</x:ActiveRow>
                                <x:ActiveCol>1</x:ActiveCol>
                            </x:Pane>
                        </x:Panes>
                        <x:ProtectContents>False</x:ProtectContents>
                        <x:ProtectObjects>False</x:ProtectObjects>
                        <x:ProtectScenarios>False</x:ProtectScenarios>
                    </x:WorksheetOptions>
                </x:ExcelWorksheet>
            </x:ExcelWorksheets>
        </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
        table {
            border-collapse: collapse;
            width: 100%;
            mso-displayed-decimal-separator: ",";
            mso-displayed-thousand-separator: " ";
        }
        th {
            background-color: #DC2626;
            color: white;
            font-weight: bold;
            padding: 10px;
            text-align: left;
            border: 1px solid #000;
            mso-pattern: #DC2626 solid;
        }
        td {
            padding: 8px;
            border: 1px solid #ccc;
            mso-number-format: "\\@";
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .header-info {
            margin-bottom: 15px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header-info">
        <h2>Ventes d'Appartements - Lotissement AL BASSATINE</h2>
        <p><strong>Date d'export :</strong> ${currentDate}</p>
        <p><strong>Total :</strong> ${data.length} vente(s)</p>
    </div>
    <table>
        <thead>
            <tr>
                ${headers.map(h => `<th>${this.escapeHtml(h)}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${data.map(sale => `
                <tr>
                    <td>${this.escapeHtml(sale.nom || '')}</td>
                    <td>${this.escapeHtml(sale.prenom || '')}</td>
                    <td>${this.escapeHtml(sale.telephone || '')}</td>
                    <td>${this.formatDate(sale.dateAchat)}</td>
                    <td>${this.escapeHtml(sale.appartement || '')}</td>
                    <td>${this.formatPrix(sale.prix)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;

        const blob = new Blob([htmlContent], { 
            type: 'application/vnd.ms-excel' 
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ventes_appartements_${new Date().toISOString().split('T')[0]}.xls`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    static async importFromCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    const fileName = file.name.toLowerCase();
                    
                    // Détecter le type de fichier
                    if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx') || content.includes('<table') || content.includes('<TABLE')) {
                        // Fichier Excel (HTML table)
                        return this.parseXLSFile(content, resolve, reject);
                    } else {
                        // Fichier CSV
                        return this.parseCSVFile(content, resolve, reject);
                    }
                } catch (error) {
                    reject(new Error(`Erreur lors de la lecture du fichier: ${error.message}`));
                }
            };

            reader.onerror = () => {
                reject(new Error('Erreur lors de la lecture du fichier'));
            };

            reader.readAsText(file, 'UTF-8');
        });
    }

    static parseXLSFile(content, resolve, reject) {
        try {
            // Parser le HTML table (format XLS)
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');
            const table = doc.querySelector('table');
            
            if (!table) {
                reject(new Error('Aucun tableau trouvé dans le fichier Excel'));
                return;
            }

            const rows = table.querySelectorAll('tr');
            if (rows.length < 2) {
                reject(new Error('Le fichier Excel est vide ou ne contient pas de données'));
                return;
            }

            // Parser les en-têtes
            const headerRow = rows[0];
            const headerCells = headerRow.querySelectorAll('th, td');
            const headers = Array.from(headerCells).map(cell => cell.textContent.trim());
            
            const expectedHeaders = ['Nom', 'Prénom', 'Téléphone', 'Date d\'achat', 'Appartement', 'Prix'];
            
            if (!this.validateHeaders(headers, expectedHeaders)) {
                reject(new Error('Format de fichier invalide. Les colonnes attendues sont: Nom, Prénom, Téléphone, Date d\'achat, Appartement, Prix'));
                return;
            }

            const sales = [];
            const errors = [];

            // Parser les lignes de données
            for (let i = 1; i < rows.length; i++) {
                try {
                    const cells = rows[i].querySelectorAll('td');
                    if (cells.length === 0) continue;
                    
                    if (cells.length !== expectedHeaders.length) {
                        errors.push(`Ligne ${i + 1}: Nombre de colonnes incorrect`);
                        continue;
                    }

                    const sale = {
                        nom: cells[0]?.textContent.trim() || '',
                        prenom: cells[1]?.textContent.trim() || '',
                        telephone: cells[2]?.textContent.trim() || '',
                        dateAchat: this.parseDate(cells[3]?.textContent.trim() || ''),
                        appartement: cells[4]?.textContent.trim() || '',
                        prix: this.parsePrix(cells[5]?.textContent.trim() || '')
                    };

                    const validationError = this.validateSale(sale, i + 1);
                    if (validationError) {
                        errors.push(validationError);
                        continue;
                    }

                    sales.push(sale);
                } catch (error) {
                    errors.push(`Ligne ${i + 1}: ${error.message}`);
                }
            }

            if (sales.length === 0 && errors.length > 0) {
                reject(new Error(`Aucune donnée valide trouvée. Erreurs:\n${errors.join('\n')}`));
                return;
            }

            resolve({ sales, errors });
        } catch (error) {
            reject(new Error(`Erreur lors du parsing Excel: ${error.message}`));
        }
    }

    static parseCSVFile(content, resolve, reject) {
        try {
            const lines = content.split('\n').filter(line => line.trim());
            
            if (lines.length === 0) {
                reject(new Error('Le fichier CSV est vide'));
                return;
            }

            const headers = this.parseCSVLine(lines[0]);
            const expectedHeaders = ['Nom', 'Prénom', 'Téléphone', 'Date d\'achat', 'Appartement', 'Prix'];
            
            if (!this.validateHeaders(headers, expectedHeaders)) {
                reject(new Error('Format de fichier CSV invalide. Les colonnes attendues sont: Nom, Prénom, Téléphone, Date d\'achat, Appartement, Prix'));
                return;
            }

            const sales = [];
            const errors = [];

            for (let i = 1; i < lines.length; i++) {
                try {
                    const values = this.parseCSVLine(lines[i]);
                    
                    if (values.length !== expectedHeaders.length) {
                        errors.push(`Ligne ${i + 1}: Nombre de colonnes incorrect`);
                        continue;
                    }

                    const sale = {
                        nom: values[0]?.trim() || '',
                        prenom: values[1]?.trim() || '',
                        telephone: values[2]?.trim() || '',
                        dateAchat: this.parseDate(values[3]?.trim() || ''),
                        appartement: values[4]?.trim() || '',
                        prix: this.parsePrix(values[5]?.trim() || '')
                    };

                    const validationError = this.validateSale(sale, i + 1);
                    if (validationError) {
                        errors.push(validationError);
                        continue;
                    }

                    sales.push(sale);
                } catch (error) {
                    errors.push(`Ligne ${i + 1}: ${error.message}`);
                }
            }

            if (sales.length === 0 && errors.length > 0) {
                reject(new Error(`Aucune donnée valide trouvée. Erreurs:\n${errors.join('\n')}`));
                return;
            }

            resolve({ sales, errors });
        } catch (error) {
            reject(new Error(`Erreur lors du parsing CSV: ${error.message}`));
        }
    }

    static parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        // Détecter le séparateur (virgule ou point-virgule)
        const hasSemicolon = line.includes(';');
        const separator = hasSemicolon ? ';' : ',';

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === separator && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    static escapeCSV(value) {
        if (value === null || value === undefined) {
            return '';
        }
        
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    }

    static escapeHtml(text) {
        if (text === null || text === undefined) {
            return '';
        }
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toISOString().split('T')[0];
    }

    static parseDate(dateString) {
        if (!dateString) return '';
        
        const formats = [
            /^\d{4}-\d{2}-\d{2}$/,
            /^\d{2}\/\d{2}\/\d{4}$/,
            /^\d{2}-\d{2}-\d{4}$/
        ];

        let date;
        if (formats[0].test(dateString)) {
            date = new Date(dateString);
        } else if (formats[1].test(dateString) || formats[2].test(dateString)) {
            const parts = dateString.split(/[-\/]/);
            date = new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
            date = new Date(dateString);
        }

        if (isNaN(date.getTime())) {
            throw new Error(`Date invalide: ${dateString}`);
        }

        return date.toISOString().split('T')[0];
    }

    static validateHeaders(headers, expectedHeaders) {
        if (headers.length !== expectedHeaders.length) {
            return false;
        }
        
        return expectedHeaders.every((expected, index) => {
            return headers[index]?.trim().toLowerCase() === expected.toLowerCase();
        });
    }

    static validateSale(sale, lineNumber) {
        if (!sale.nom || sale.nom.trim() === '') {
            return `Ligne ${lineNumber}: Le nom est requis`;
        }
        if (!sale.prenom || sale.prenom.trim() === '') {
            return `Ligne ${lineNumber}: Le prénom est requis`;
        }
        if (!sale.telephone || !/^\d{10}$/.test(sale.telephone.replace(/\s/g, ''))) {
            return `Ligne ${lineNumber}: Le téléphone doit contenir 10 chiffres`;
        }
        if (!sale.dateAchat || !/^\d{4}-\d{2}-\d{2}$/.test(sale.dateAchat)) {
            return `Ligne ${lineNumber}: La date d'achat est invalide`;
        }
        // Validation du format d'appartement selon le prix
        if (!sale.appartement) {
            return `Ligne ${lineNumber}: L'appartement est requis`;
        }
        
        // Format pour prix 121 800: 999-A-99-99 (Immeuble-Porte-Étage-Numéro)
        // Format pour prix 155 000 - 165 000 et 175 000: 999-99-99 (ancien format)
        if (sale.prix === '121800') {
            if (!/^\d{3}-[A-D]-\d{2}-\d{2}$/.test(sale.appartement)) {
                return `Ligne ${lineNumber}: Le format de l'appartement est invalide pour prix 121 800 (attendu: XXX-A-XX-XX où A est A, B, C ou D)`;
            }
        } else if (sale.prix === '155000-16500' || sale.prix === '175000') {
            if (!/^\d{3}-\d{2}-\d{2}$/.test(sale.appartement)) {
                return `Ligne ${lineNumber}: Le format de l'appartement est invalide (attendu: XXX-XX-XX)`;
            }
        } else {
            // Si le prix n'est pas spécifié, accepter les deux formats
            if (!/^\d{3}-[A-D]-\d{2}-\d{2}$/.test(sale.appartement) && !/^\d{3}-\d{2}-\d{2}$/.test(sale.appartement)) {
                return `Ligne ${lineNumber}: Le format de l'appartement est invalide (attendu: XXX-A-XX-XX pour prix 121 800 ou XXX-XX-XX pour autre prix)`;
            }
        }
        if (!sale.prix || (sale.prix !== '121800' && sale.prix !== '155000-16500' && sale.prix !== '175000')) {
            return `Ligne ${lineNumber}: Le prix est invalide (attendu: 121800, 155000-16500 ou 175000)`;
        }
        return null;
    }

    static formatPrix(prix) {
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

    static parsePrix(prixString) {
        if (!prixString) return '';
        // Convertir les formats d'affichage vers les valeurs internes
        if (prixString.includes('121 800') || prixString === '121800' || prixString.includes('121800')) {
            return '121800';
        } else if (prixString.includes('155 000') || prixString.includes('155000-16500') || prixString === '155000-16500' || prixString.includes('138 500')) {
            return '155000-16500';
        } else if (prixString.includes('175 000') || prixString === '175000' || prixString.includes('175000')) {
            return '175000';
        }
        return prixString.trim();
    }
}

