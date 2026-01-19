export class PDFManager {
    static exportToPDF(sales, title = 'Liste des Ventes') {
        if (!sales || sales.length === 0) {
            throw new Error('Aucune donnée à exporter');
        }

        const printWindow = window.open('', '_blank');
        const htmlContent = this.generatePDFHTML(sales, title);
        
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
        }, 250);
    }

    static generatePDFHTML(sales, title) {
        const currentDate = new Date().toLocaleDateString('fr-FR');
        
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        @page {
            margin: 2cm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #000;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #DC2626;
            padding-bottom: 15px;
        }
        .header h1 {
            margin: 0;
            color: #DC2626;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background-color: #DC2626;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #DC2626;
        }
        td {
            padding: 8px;
            border: 1px solid #ddd;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <p>Date d'export : ${currentDate}</p>
        <p>Total : ${sales.length} vente(s)</p>
    </div>
    <table>
        <thead>
            <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Téléphone</th>
                <th>Date d'achat</th>
                <th>Appartement</th>
                <th>Prix</th>
            </tr>
        </thead>
        <tbody>
            ${sales.map(sale => `
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
    <div class="footer">
        <p>Généré le ${currentDate} - Système de Gestion Immobilière</p>
    </div>
</body>
</html>
        `;
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('fr-FR');
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
}

