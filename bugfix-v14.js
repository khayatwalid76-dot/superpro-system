/**
 * SuperPro System - BugFix V14
 * إصلاح شامل لجميع مشاكل الطباعة والتحميل في كل القوائم
 * 
 * المشاكل المحلولة:
 * 1. printArea يبقى display:none أثناء الطباعة - لا تظهر البيانات
 * 2. التحميل يحفظ كملف HTML بدلاً من PDF
 * 3. نفس المشاكل في: الموظفين، العقود، الفواتير، التقارير، الرواتب
 * 4. مراجعة شاملة لجميع القوائم
 */

(function() {
    'use strict';

    console.log('🔧 SuperPro V14: تحميل إصلاحات الطباعة والتحميل الشاملة...');

    // ==========================================================
    // CSS: إصلاح أنماط الطباعة
    // ==========================================================
    var v14Style = document.createElement('style');
    v14Style.id = 'v14-print-fix-styles';
    v14Style.textContent = `
        /* V14: إصلاح عرض printArea أثناء الطباعة */
        #v14PrintOverlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 999999;
            background: white;
            overflow: auto;
            padding: 20px 30px;
            direction: rtl;
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            color: #333;
        }

        body.v14-printing #v14PrintOverlay {
            display: block !important;
        }

        body.v14-printing > *:not(#v14PrintOverlay) {
            display: none !important;
        }

        body.v14-printing #v14PrintOverlay {
            display: block !important;
        }

        @media print {
            body.v14-printing > *:not(#v14PrintOverlay) {
                display: none !important;
                visibility: hidden !important;
            }

            body.v14-printing #v14PrintOverlay {
                display: block !important;
                visibility: visible !important;
                position: static !important;
                overflow: visible !important;
                padding: 10px !important;
            }

            body.v14-printing #v14PrintOverlay * {
                visibility: visible !important;
            }

            /* Override old print rules */
            body.v14-printing #printArea {
                display: none !important;
            }
        }

        /* أنماط محتوى الطباعة */
        #v14PrintOverlay .v14-print-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #2c3e50;
        }

        #v14PrintOverlay .v14-print-title {
            font-size: 22px;
            font-weight: 800;
            color: #2c3e50;
        }

        #v14PrintOverlay .v14-print-company {
            font-size: 13px;
            color: #666;
            margin-top: 3px;
        }

        #v14PrintOverlay .v14-print-date {
            font-size: 12px;
            color: #888;
            text-align: left;
        }

        #v14PrintOverlay table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }

        #v14PrintOverlay th {
            background: #2c3e50;
            color: white;
            padding: 10px 12px;
            text-align: right;
            font-size: 13px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        #v14PrintOverlay td {
            padding: 8px 12px;
            border-bottom: 1px solid #eee;
            font-size: 13px;
        }

        #v14PrintOverlay tr:nth-child(even) {
            background: #f8f9fa;
        }

        #v14PrintOverlay h2 {
            color: #2c3e50;
            font-size: 20px;
            margin: 15px 0 10px;
        }

        #v14PrintOverlay h3 {
            color: #2c3e50;
            font-size: 16px;
            margin: 15px 0 8px;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 5px;
        }

        #v14PrintOverlay .report-summary {
            background: #f0f7ff;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0 15px;
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }

        #v14PrintOverlay .summary-item {
            flex: 1;
            min-width: 100px;
            text-align: center;
        }

        #v14PrintOverlay .num {
            font-size: 1.6em;
            font-weight: bold;
            color: #2c3e50;
        }

        #v14PrintOverlay .label {
            font-size: 0.8em;
            color: #666;
        }

        #v14PrintOverlay .badge-danger {
            background: #dc3545;
            color: white;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
        }

        #v14PrintOverlay .badge-warning {
            background: #ffc107;
            color: #333;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
        }

        #v14PrintOverlay .badge-success {
            background: #28a745;
            color: white;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
        }

        #v14PrintOverlay .badge-info {
            background: #17a2b8;
            color: white;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 12px;
        }

        /* Employee profile print */
        #v14PrintOverlay .employee-profile .ep-header {
            text-align: center;
            margin-bottom: 20px;
        }

        #v14PrintOverlay .employee-profile .ep-avatar {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            font-size: 28px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 10px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        /* Invoice template print */
        #v14PrintOverlay .invoice-template .inv-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
        }

        #v14PrintOverlay .invoice-template .inv-logo {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
        }

        #v14PrintOverlay .invoice-template .inv-bill-to {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }

        #v14PrintOverlay .invoice-template .inv-table th {
            background: #2c3e50;
        }

        #v14PrintOverlay .invoice-template .total-row {
            background: #e8f5e9;
            font-weight: bold;
        }

        #v14PrintOverlay .invoice-template .inv-footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #eee;
        }

        /* Contract template print */
        #v14PrintOverlay .contract-template h2 {
            text-align: center;
            color: #2c3e50;
        }

        #v14PrintOverlay .contract-template .contract-section {
            margin: 15px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 8px;
        }

        /* PDF download loading */
        .v14-pdf-loading {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
        }

        .v14-pdf-loading-box {
            background: white;
            padding: 30px 50px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .v14-pdf-loading-box .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e0e0e0;
            border-top-color: #667eea;
            border-radius: 50%;
            animation: v14spin 1s linear infinite;
            margin: 0 auto 15px;
        }

        @keyframes v14spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(v14Style);


    // ==========================================================
    // إنشاء عنصر الطباعة الجديد
    // ==========================================================
    var printOverlay = document.createElement('div');
    printOverlay.id = 'v14PrintOverlay';
    document.body.appendChild(printOverlay);


    // ==========================================================
    // دالة الطباعة الرئيسية المُصلحة (تعمل في كل المتصفحات)
    // ==========================================================
    function v14Print(title, htmlContent) {
        var companyName = '';
        try { companyName = (window.settings && window.settings.companyName) || 'SUPER PRO SYSTEM'; } catch(e) { companyName = 'SUPER PRO SYSTEM'; }
        
        var dateStr = new Date().toLocaleDateString('ar-SA');
        
        var fullHtml = '<div class="v14-print-header">' +
            '<div>' +
            '<div class="v14-print-title">' + title + '</div>' +
            '<div class="v14-print-company">' + companyName + '</div>' +
            '</div>' +
            '<div class="v14-print-date">' + dateStr + '</div>' +
            '</div>' +
            '<div class="v14-print-content">' + htmlContent + '</div>';

        printOverlay.innerHTML = fullHtml;
        document.body.classList.add('v14-printing');

        setTimeout(function() {
            window.print();
        }, 300);

        // Cleanup after print dialog closes
        var cleanup = function() {
            document.body.classList.remove('v14-printing');
            printOverlay.innerHTML = '';
            window.removeEventListener('afterprint', cleanup);
        };

        window.addEventListener('afterprint', cleanup);
        
        // Fallback cleanup after 60 seconds
        setTimeout(function() {
            if (document.body.classList.contains('v14-printing')) {
                cleanup();
            }
        }, 60000);
    }


    // ==========================================================
    // دالة التحميل كـ PDF (باستخدام html2pdf.js)
    // ==========================================================
    function v14DownloadPDF(filename, htmlContent) {
        // Show loading
        var loadingEl = document.createElement('div');
        loadingEl.className = 'v14-pdf-loading';
        loadingEl.innerHTML = '<div class="v14-pdf-loading-box">' +
            '<div class="spinner"></div>' +
            '<div style="font-size:16px;font-weight:bold;color:#2c3e50">جاري إنشاء ملف PDF...</div>' +
            '<div style="font-size:12px;color:#888;margin-top:5px">يرجى الانتظار</div>' +
            '</div>';
        document.body.appendChild(loadingEl);

        var companyName = '';
        try { companyName = (window.settings && window.settings.companyName) || 'SUPER PRO SYSTEM'; } catch(e) { companyName = 'SUPER PRO SYSTEM'; }

        // Prepare PDF filename
        var pdfFilename = filename.replace(/\.html$/i, '').replace(/\.pdf$/i, '') + '.pdf';

        // Create temporary container
        var container = document.createElement('div');
        container.style.cssText = 'position:absolute;left:-9999px;top:0;width:800px;direction:rtl;font-family:Segoe UI,Tahoma,Arial,sans-serif;color:#333;padding:20px;background:white;';
        
        var dateStr = new Date().toLocaleDateString('ar-SA');
        container.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:15px;padding-bottom:12px;border-bottom:3px solid #2c3e50">' +
            '<div><div style="font-size:18px;font-weight:800;color:#2c3e50">' + (filename.replace(/\.[^.]+$/, '').replace(/_/g, ' ')) + '</div>' +
            '<div style="font-size:11px;color:#666;margin-top:3px">' + companyName + '</div></div>' +
            '<div style="font-size:11px;color:#888">' + dateStr + '</div></div>' +
            '<style>' +
            'table{width:100%;border-collapse:collapse;margin:8px 0}' +
            'th{background:#2c3e50 !important;color:white !important;padding:8px 10px;text-align:right;font-size:11px}' +
            'td{padding:6px 10px;border-bottom:1px solid #eee;font-size:11px}' +
            'tr:nth-child(even){background:#f8f9fa}' +
            'h2{color:#2c3e50;font-size:16px;margin:12px 0 8px}' +
            'h3{color:#2c3e50;font-size:14px;margin:10px 0 6px;border-bottom:2px solid #2c3e50;padding-bottom:4px}' +
            '.report-summary{background:#f0f7ff;padding:12px;border-radius:6px;margin:8px 0 12px;display:flex;gap:15px;flex-wrap:wrap}' +
            '.summary-item{flex:1;min-width:80px;text-align:center}' +
            '.num{font-size:1.4em;font-weight:bold;color:#2c3e50}' +
            '.label{font-size:0.75em;color:#666}' +
            '.badge-danger{background:#dc3545;color:white;padding:2px 6px;border-radius:3px;font-size:10px}' +
            '.badge-warning{background:#ffc107;color:#333;padding:2px 6px;border-radius:3px;font-size:10px}' +
            '.badge-success{background:#28a745;color:white;padding:2px 6px;border-radius:3px;font-size:10px}' +
            '.badge-info{background:#17a2b8;color:white;padding:2px 6px;border-radius:3px;font-size:10px}' +
            '.ep-header{text-align:center;margin-bottom:15px}' +
            '.ep-avatar{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);color:white;font-size:24px;font-weight:bold;display:flex;align-items:center;justify-content:center;margin:0 auto 8px}' +
            '.inv-header{display:flex;justify-content:space-between;margin-bottom:15px}' +
            '.inv-logo{font-size:20px;font-weight:bold;color:#2c3e50}' +
            '.inv-bill-to{background:#f8f9fa;padding:12px;border-radius:6px;margin:10px 0}' +
            '.total-row{background:#e8f5e9;font-weight:bold}' +
            '.inv-footer{text-align:center;margin-top:20px;padding-top:12px;border-top:2px solid #eee}' +
            '.contract-section{margin:10px 0;padding:10px;background:#f8f9fa;border-radius:6px}' +
            '</style>' +
            htmlContent;

        document.body.appendChild(container);

        // Check if html2pdf is available
        if (typeof html2pdf !== 'undefined') {
            var opt = {
                margin: [8, 8, 8, 8],
                filename: pdfFilename,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true, 
                    logging: false,
                    letterRendering: true,
                    scrollX: 0,
                    scrollY: 0
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait' 
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            html2pdf().set(opt).from(container).save().then(function() {
                document.body.removeChild(container);
                document.body.removeChild(loadingEl);
                if (typeof showToast === 'function') showToast('تم تحميل ' + pdfFilename + ' بنجاح', 'success');
            }).catch(function(err) {
                console.error('PDF generation error:', err);
                document.body.removeChild(container);
                document.body.removeChild(loadingEl);
                // Fallback to window.open method
                v14DownloadFallback(pdfFilename.replace('.pdf', ''), htmlContent);
            });
        } else if (typeof jspdf !== 'undefined' || (typeof window.jspdf !== 'undefined')) {
            // Use jsPDF directly
            try {
                var jsPDFLib = window.jspdf || jspdf;
                var doc = new jsPDFLib.jsPDF('p', 'mm', 'a4');
                doc.html(container, {
                    callback: function(doc) {
                        doc.save(pdfFilename);
                        document.body.removeChild(container);
                        document.body.removeChild(loadingEl);
                        if (typeof showToast === 'function') showToast('تم تحميل ' + pdfFilename + ' بنجاح', 'success');
                    },
                    x: 5,
                    y: 5,
                    width: 190,
                    windowWidth: 800
                });
            } catch(e) {
                console.error('jsPDF error:', e);
                document.body.removeChild(container);
                document.body.removeChild(loadingEl);
                v14DownloadFallback(pdfFilename.replace('.pdf', ''), htmlContent);
            }
        } else {
            // No PDF library: fallback to browser print-to-PDF
            document.body.removeChild(container);
            document.body.removeChild(loadingEl);
            v14DownloadFallback(pdfFilename.replace('.pdf', ''), htmlContent);
        }
    }

    // Fallback: Open in new window for browser's Save as PDF
    function v14DownloadFallback(title, htmlContent) {
        var companyName = '';
        try { companyName = (window.settings && window.settings.companyName) || 'SUPER PRO SYSTEM'; } catch(e) { companyName = 'SUPER PRO SYSTEM'; }
        
        var printWin = window.open('', '_blank', 'width=900,height=700');
        if (!printWin) {
            if (typeof showToast === 'function') showToast('يرجى السماح بالنوافذ المنبثقة لتحميل PDF', 'warning');
            return;
        }

        printWin.document.write('<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">');
        printWin.document.write('<title>' + title + '</title>');
        printWin.document.write('<style>');
        printWin.document.write('body{font-family:Segoe UI,Tahoma,Arial,sans-serif;direction:rtl;padding:20px 30px;color:#333;max-width:900px;margin:0 auto}');
        printWin.document.write('table{width:100%;border-collapse:collapse;margin:10px 0}');
        printWin.document.write('th{background:#2c3e50;color:white;padding:10px 12px;text-align:right;font-size:13px}');
        printWin.document.write('td{padding:8px 12px;border-bottom:1px solid #eee;font-size:13px}');
        printWin.document.write('tr:nth-child(even){background:#f8f9fa}');
        printWin.document.write('h2{color:#2c3e50;font-size:20px}h3{color:#2c3e50;font-size:16px;border-bottom:2px solid #2c3e50;padding-bottom:5px}');
        printWin.document.write('.report-summary{background:#f0f7ff;padding:15px;border-radius:8px;margin:10px 0;display:flex;gap:20px;flex-wrap:wrap}');
        printWin.document.write('.summary-item{flex:1;min-width:100px;text-align:center}');
        printWin.document.write('.num{font-size:1.5em;font-weight:bold;color:#2c3e50}.label{font-size:0.85em;color:#666}');
        printWin.document.write('.badge-danger{background:#dc3545;color:white;padding:3px 8px;border-radius:4px;font-size:12px}');
        printWin.document.write('.badge-warning{background:#ffc107;color:#333;padding:3px 8px;border-radius:4px;font-size:12px}');
        printWin.document.write('.badge-success{background:#28a745;color:white;padding:3px 8px;border-radius:4px;font-size:12px}');
        printWin.document.write('.badge-info{background:#17a2b8;color:white;padding:3px 8px;border-radius:4px;font-size:12px}');
        printWin.document.write('.ep-header{text-align:center;margin-bottom:20px}');
        printWin.document.write('.ep-avatar{width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);color:white;font-size:28px;font-weight:bold;display:inline-flex;align-items:center;justify-content:center;margin-bottom:10px}');
        printWin.document.write('.inv-header{display:flex;justify-content:space-between;margin-bottom:20px}');
        printWin.document.write('.inv-logo{font-size:24px;font-weight:bold;color:#2c3e50}');
        printWin.document.write('.inv-bill-to{background:#f8f9fa;padding:15px;border-radius:8px;margin:15px 0}');
        printWin.document.write('.total-row{background:#e8f5e9;font-weight:bold}');
        printWin.document.write('.inv-footer{text-align:center;margin-top:30px;padding-top:15px;border-top:2px solid #eee}');
        printWin.document.write('.contract-section{margin:15px 0;padding:10px;background:#f8f9fa;border-radius:8px}');
        printWin.document.write('.no-print-btn{background:#667eea;color:white;border:none;padding:10px 30px;border-radius:8px;cursor:pointer;font-size:14px;margin:5px}');
        printWin.document.write('.no-print-btn:hover{background:#5a6fd6}');
        printWin.document.write('@media print{.no-print{display:none !important}}');
        printWin.document.write('</style></head><body>');
        printWin.document.write('<div class="no-print" style="text-align:center;margin-bottom:20px;padding:15px;background:#f0f7ff;border-radius:8px">');
        printWin.document.write('<p style="margin:0 0 10px;color:#2c3e50;font-weight:bold">لتحميل كملف PDF: اضغط طباعة ثم اختر "حفظ كـ PDF"</p>');
        printWin.document.write('<button class="no-print-btn" onclick="window.print()">🖨️ طباعة / حفظ كـ PDF</button>');
        printWin.document.write('<button class="no-print-btn" style="background:#28a745" onclick="window.close()">✕ إغلاق</button>');
        printWin.document.write('</div>');
        printWin.document.write('<div style="display:flex;justify-content:space-between;margin-bottom:15px;padding-bottom:12px;border-bottom:3px solid #2c3e50">');
        printWin.document.write('<div><div style="font-size:20px;font-weight:800;color:#2c3e50">' + title + '</div>');
        printWin.document.write('<div style="font-size:12px;color:#666">' + companyName + '</div></div>');
        printWin.document.write('<div style="font-size:12px;color:#888">' + new Date().toLocaleDateString('ar-SA') + '</div></div>');
        printWin.document.write(htmlContent);
        printWin.document.write('</body></html>');
        printWin.document.close();
        
        if (typeof showToast === 'function') showToast('تم فتح نافذة التحميل - اضغط "طباعة" ثم اختر "حفظ كـ PDF"', 'info');
    }


    // ==========================================================
    // إعادة كتابة دالة printHtml الأصلية
    // ==========================================================
    window.printHtml = function(title, innerHtml) {
        v14Print(title, innerHtml);
    };


    // ==========================================================
    // إعادة كتابة طباعة/تحميل الموظفين
    // ==========================================================
    window.printEmployeeProfile = function(index) {
        var emp = (window.employees || [])[index];
        if (!emp) {
            if (typeof showToast === 'function') showToast('لم يتم العثور على الموظف', 'error');
            return;
        }
        var html = getV14EmployeeHtml(emp);
        v14Print('بيانات الموظف - ' + emp.name, html);
    };

    window.downloadEmployeeProfile = function(index) {
        var emp = (window.employees || [])[index];
        if (!emp) {
            if (typeof showToast === 'function') showToast('لم يتم العثور على الموظف', 'error');
            return;
        }
        var html = getV14EmployeeHtml(emp);
        v14DownloadPDF('بيانات_' + emp.name, html);
    };


    // ==========================================================
    // إعادة كتابة طباعة/تحميل العقود
    // ==========================================================
    window.printContractTemplate = function(index) {
        var contract = (window.contracts || [])[index];
        if (!contract) {
            if (typeof showToast === 'function') showToast('لم يتم العثور على العقد', 'error');
            return;
        }
        var html = getV14ContractHtml(contract);
        v14Print('عقد - ' + (contract.client || contract.number), html);
    };

    window.downloadContractTemplate = function(index) {
        var contract = (window.contracts || [])[index];
        if (!contract) {
            if (typeof showToast === 'function') showToast('لم يتم العثور على العقد', 'error');
            return;
        }
        var html = getV14ContractHtml(contract);
        v14DownloadPDF('عقد_' + (contract.number || contract.client || ''), html);
    };


    // ==========================================================
    // إعادة كتابة طباعة/تحميل الفواتير
    // ==========================================================
    window.printV12Invoice = function(invoiceId) {
        var inv = getV14Invoice(invoiceId);
        if (!inv) {
            if (typeof showToast === 'function') showToast('لم يتم العثور على الفاتورة', 'error');
            return;
        }
        var html = getV14InvoiceHtml(inv);
        v14Print('فاتورة - ' + inv.id, html);
    };

    window.downloadV12Invoice = function(invoiceId) {
        var inv = getV14Invoice(invoiceId);
        if (!inv) {
            if (typeof showToast === 'function') showToast('لم يتم العثور على الفاتورة', 'error');
            return;
        }
        var html = getV14InvoiceHtml(inv);
        v14DownloadPDF('فاتورة_' + inv.id, html);
    };


    // ==========================================================
    // إعادة كتابة طباعة/تحميل تقارير الإقامات
    // ==========================================================
    window.printResidencyReport = function() {
        var html = generateV14ResidencyReportHtml();
        v14Print('تقرير الإقامات المنتهية والقريبة من الانتهاء', html);
    };

    window.downloadResidencyReport = function() {
        var html = generateV14ResidencyReportHtml();
        v14DownloadPDF('تقرير_الإقامات_' + new Date().toISOString().split('T')[0], html);
    };


    // ==========================================================
    // إعادة كتابة طباعة/تحميل تقارير الفواتير غير المدفوعة
    // ==========================================================
    window.printUnpaidInvoicesReport = function() {
        var html = generateV14UnpaidInvoicesHtml();
        v14Print('تقرير الفواتير غير المدفوعة', html);
    };

    window.downloadUnpaidInvoicesReport = function() {
        var html = generateV14UnpaidInvoicesHtml();
        v14DownloadPDF('تقرير_فواتير_غير_مدفوعة_' + new Date().toISOString().split('T')[0], html);
    };


    // ==========================================================
    // إعادة كتابة طباعة/تحميل تقارير العقود القريبة من الانتهاء
    // ==========================================================
    window.printExpiringContractsReport = function(type) {
        var html = generateV14ExpiringContractsHtml(type || 'all');
        v14Print('تقرير العقود القريبة من الانتهاء', html);
    };

    window.downloadExpiringContractsReport = function(type) {
        var t = type || 'all';
        var suffix = t === 'paid' ? '_مدفوعة' : t === 'unpaid' ? '_غير_مدفوعة' : '';
        var html = generateV14ExpiringContractsHtml(t);
        v14DownloadPDF('تقرير_عقود_قريبة_انتهاء' + suffix + '_' + new Date().toISOString().split('T')[0], html);
    };


    // ==========================================================
    // إعادة كتابة طباعة كشف الرواتب
    // ==========================================================
    window.printPayslip = function(index) {
        var rows = window.__lastPayrollRows || [];
        var row = rows[index];
        if (!row) {
            if (typeof showToast === 'function') showToast('لم يتم العثور على كشف الراتب', 'error');
            return;
        }
        var html = getV14PayslipHtml(row);
        v14Print('كشف راتب - ' + row.employee, html);
    };

    window.printPayslipByEmployee = function(employeeName, month) {
        var rows = window.__lastPayrollRows || [];
        var row = rows.find(function(r) { return r.employee === employeeName && r.month === month; }) || 
                  rows.find(function(r) { return r.employee === employeeName; });
        if (!row) {
            if (typeof showToast === 'function') showToast('لا يوجد كشف راتب لهذا الموظف', 'warning');
            return;
        }
        var html = getV14PayslipHtml(row);
        v14Print('كشف راتب - ' + row.employee, html);
    };


    // ==========================================================
    // إعادة كتابة طباعة إيصال الدخل
    // ==========================================================
    window.printIncomeReceipt = function(id) {
        var items = window.dailyIncome || [];
        var item = items.find(function(i) { return i.id == id; });
        if (!item) {
            if (typeof showToast === 'function') showToast('لم يتم العثور على الإيصال', 'error');
            return;
        }
        var html = getV14ReceiptHtml(item, 'income');
        v14Print('إيصال مدخول #' + id, html);
    };


    // ==========================================================
    // إعادة كتابة طباعة إيصال المصروف
    // ==========================================================
    window.printExpenseReceipt = function(id) {
        var items = window.dailyExpenses || [];
        var item = items.find(function(i) { return i.id == id; });
        if (!item) {
            if (typeof showToast === 'function') showToast('لم يتم العثور على الإيصال', 'error');
            return;
        }
        var html = getV14ReceiptHtml(item, 'expense');
        v14Print('إيصال مصروف #' + id, html);
    };


    // ==========================================================
    // إصلاح تصدير التقارير في قسم analytics
    // ==========================================================
    window.exportToPDF = function(title, description) {
        var html = '<h2>' + title + '</h2><p>' + (description || '') + '</p>';
        
        // Try to collect data from the current visible module
        var activeModule = document.querySelector('.module-container.active-module, .module-container[style*="display: block"]');
        if (activeModule) {
            var tables = activeModule.querySelectorAll('table');
            tables.forEach(function(t) {
                html += t.outerHTML;
            });
        }
        
        v14DownloadPDF(title, html);
    };


    // ==========================================================
    // HELPER: الحصول على بيانات الموظف كـ HTML
    // ==========================================================
    function getV14EmployeeHtml(emp) {
        if (!emp) return '';

        var totalSalary = safeNum(emp.salary) + safeNum(emp.housingAllowance) + safeNum(emp.transportAllowance) +
                         safeNum(emp.foodAllowance) + safeNum(emp.otherAllowance);

        // Disciplinary deductions
        var deductions = [];
        try {
            var stored = localStorage.getItem('superpro_disciplinary_deductions');
            if (stored) {
                var allDed = JSON.parse(stored);
                deductions = allDed.filter(function(d) { return d.employeeName === emp.name; });
            }
        } catch(e) {}
        var totalDeductions = deductions.reduce(function(s, d) { return s + safeNum(d.amount); }, 0);

        // Employee contracts
        var empContracts = (window.contracts || []).filter(function(c) { return c.employee === emp.name; });
        var contractsHtml = '';
        if (empContracts.length > 0) {
            contractsHtml = '<h3 style="color:#2c3e50;margin-top:20px;border-bottom:2px solid #2c3e50;padding-bottom:5px">العقود المرتبطة</h3><table>' +
                '<tr style="background:#2c3e50;color:white"><th style="padding:8px">رقم العقد</th><th style="padding:8px">العميل</th><th style="padding:8px">القيمة</th><th style="padding:8px">البدء</th><th style="padding:8px">الانتهاء</th><th style="padding:8px">حالة الدفع</th></tr>';
            empContracts.forEach(function(c) {
                contractsHtml += '<tr><td style="padding:8px">' + (c.number || '') + '</td><td style="padding:8px">' + (c.client || '') + '</td>' +
                    '<td style="padding:8px">' + safeNum(c.amount).toLocaleString() + ' ر.ق</td>' +
                    '<td style="padding:8px">' + fmtDate(c.startDate) + '</td><td style="padding:8px">' + fmtDate(c.endDate) + '</td>' +
                    '<td style="padding:8px">' + (c.paymentStatus || '-') + '</td></tr>';
            });
            contractsHtml += '</table>';
        }

        // Deductions section
        var deductionsHtml = '';
        if (deductions.length > 0) {
            deductionsHtml = '<h3 style="color:#c0392b;margin-top:20px;border-bottom:2px solid #c0392b;padding-bottom:5px">الخصومات التأديبية</h3><table>' +
                '<tr style="background:#c0392b;color:white"><th style="padding:8px">التاريخ</th><th style="padding:8px">السبب</th><th style="padding:8px">النوع</th><th style="padding:8px">المبلغ</th></tr>';
            deductions.forEach(function(d) {
                deductionsHtml += '<tr><td style="padding:8px">' + fmtDate(d.date) + '</td><td style="padding:8px">' + (d.reason || '') + '</td>' +
                    '<td style="padding:8px">' + (d.type || '') + '</td>' +
                    '<td style="padding:8px;color:#c0392b">' + safeNum(d.amount).toLocaleString() + ' ر.ق</td></tr>';
            });
            deductionsHtml += '<tr style="background:#fce4ec;font-weight:bold"><td colspan="3" style="padding:8px">إجمالي الخصومات</td>' +
                '<td style="padding:8px;color:#c0392b">' + totalDeductions.toLocaleString() + ' ر.ق</td></tr></table>';
        }

        // Residency status
        var residencyStatus = '';
        if (emp.residencyExpiry) {
            var days = daysDiff(emp.residencyExpiry);
            if (days < 0) residencyStatus = ' <span style="color:#dc3545;font-weight:bold">(منتهية)</span>';
            else if (days <= 30) residencyStatus = ' <span style="color:#fd7e14;font-weight:bold">(تنتهي خلال ' + days + ' يوم)</span>';
        }

        var initials = (emp.name || '?').charAt(0);

        return '<div class="employee-profile">' +
            '<div class="ep-header">' +
            '<div class="ep-avatar">' + initials + '</div>' +
            '<h2>' + (emp.name || '') + '</h2>' +
            '<p style="color:#666">' + (emp.job || '') + ' | ' + (emp.status || 'نشط') + '</p>' +
            '</div>' +
            '<h3>المعلومات الشخصية</h3>' +
            '<table>' +
            '<tr><td style="width:40%">الاسم الكامل</td><td>' + (emp.name || '') + '</td></tr>' +
            '<tr><td>الوظيفة</td><td>' + (emp.job || '-') + '</td></tr>' +
            '<tr><td>الجنسية</td><td>' + (emp.nationality || '-') + '</td></tr>' +
            '<tr><td>الجنس</td><td>' + (emp.gender || '-') + '</td></tr>' +
            '<tr><td>رقم الهاتف</td><td>' + (emp.phone || '-') + '</td></tr>' +
            '<tr><td>رقم الهوية</td><td>' + (emp.idNumber || '-') + '</td></tr>' +
            '<tr><td>الحالة</td><td>' + (emp.status || 'نشط') + '</td></tr>' +
            '<tr><td>تاريخ الانضمام</td><td>' + fmtDate(emp.joinDate || emp.startDate || emp.hireDate) + '</td></tr>' +
            '<tr><td>رقم الإقامة</td><td>' + (emp.residencyNumber || emp.idNumber || '-') + '</td></tr>' +
            '<tr><td>تاريخ انتهاء الإقامة</td><td>' + fmtDate(emp.residencyExpiry) + residencyStatus + '</td></tr>' +
            '</table>' +
            '<h3>المعلومات المالية</h3>' +
            '<table>' +
            '<tr><td style="width:40%">الراتب الأساسي</td><td>' + safeNum(emp.salary).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr><td>بدل سكن</td><td>' + safeNum(emp.housingAllowance).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr><td>بدل مواصلات</td><td>' + safeNum(emp.transportAllowance).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr><td>بدل طعام</td><td>' + safeNum(emp.foodAllowance).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr><td>بدلات أخرى</td><td>' + safeNum(emp.otherAllowance).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr style="background:#e8f5e9;font-weight:bold"><td>إجمالي الراتب</td><td>' + totalSalary.toLocaleString() + ' ر.ق</td></tr>' +
            (totalDeductions > 0 ? '<tr style="background:#fce4ec;font-weight:bold"><td>الخصومات التأديبية</td><td style="color:#c0392b">-' + totalDeductions.toLocaleString() + ' ر.ق</td></tr>' +
            '<tr style="background:#d4edda;font-weight:bold"><td>صافي الراتب</td><td style="color:#28a745">' + (totalSalary - totalDeductions).toLocaleString() + ' ر.ق</td></tr>' : '') +
            '</table>' +
            contractsHtml +
            deductionsHtml +
            '<div style="text-align:center;margin-top:25px;color:#999;font-size:0.85em">' +
            'تم الطباعة من نظام SuperPro بتاريخ ' + new Date().toLocaleDateString('ar-SA') +
            '</div></div>';
    }


    // ==========================================================
    // HELPER: الحصول على بيانات العقد كـ HTML
    // ==========================================================
    function getV14ContractHtml(contract) {
        var clientObj = (window.clients || []).find(function(c) { return c.name === contract.client; }) || {};
        var empObj = (window.employees || []).find(function(e) { return e.name === contract.employee; }) || {};

        return '<div class="contract-template">' +
            '<h2 style="text-align:center;color:#2c3e50;margin-bottom:20px">نموذج عقد تقديم خدمات</h2>' +
            '<div class="contract-section">' +
            '<h4 style="color:#2c3e50">الطرف الأول (مقدم الخدمة)</h4>' +
            '<p><strong>الشركة:</strong> SuperPro للتنظيفات والخدمات</p>' +
            '<p><strong>الممثل:</strong> وليد الخياط</p>' +
            '<p><strong>الهاتف:</strong> +97430004595</p>' +
            '</div>' +
            '<div class="contract-section">' +
            '<h4 style="color:#2c3e50">الطرف الثاني (العميل)</h4>' +
            '<p><strong>الاسم:</strong> ' + (contract.client || '-') + '</p>' +
            '<p><strong>رقم الهوية:</strong> ' + (clientObj.idNumber || clientObj.id || '-') + '</p>' +
            '<p><strong>الهاتف:</strong> ' + (clientObj.phone || '-') + '</p>' +
            (clientObj.address ? '<p><strong>العنوان:</strong> ' + clientObj.address + '</p>' : '') +
            '</div>' +
            '<div class="contract-section">' +
            '<h4 style="color:#2c3e50">تفاصيل العقد</h4>' +
            '<table>' +
            '<tr><td style="width:40%"><strong>رقم العقد</strong></td><td>' + (contract.number || '-') + '</td></tr>' +
            '<tr><td><strong>نوع العقد</strong></td><td>' + (contract.type || '-') + '</td></tr>' +
            '<tr><td><strong>العامل/ة</strong></td><td>' + (contract.employee || '-') + '</td></tr>' +
            '<tr><td><strong>تاريخ البدء</strong></td><td>' + fmtDate(contract.startDate) + '</td></tr>' +
            '<tr><td><strong>تاريخ الانتهاء</strong></td><td>' + fmtDate(contract.endDate) + '</td></tr>' +
            '<tr><td><strong>مدة العقد</strong></td><td>' + (contract.duration || '-') + '</td></tr>' +
            '<tr style="background:#e8f5e9;font-weight:bold"><td><strong>قيمة العقد</strong></td><td>' + safeNum(contract.amount).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr><td><strong>حالة الدفع</strong></td><td>' + (contract.paymentStatus || '-') + '</td></tr>' +
            '</table>' +
            '</div>' +
            (contract.notes ? '<div class="contract-section"><h4 style="color:#2c3e50">ملاحظات</h4><p>' + contract.notes + '</p></div>' : '') +
            '<div style="margin-top:30px;display:flex;justify-content:space-around">' +
            '<div style="text-align:center"><p><strong>الطرف الأول</strong></p><p style="border-top:1px dashed #999;min-width:150px;padding-top:5px;margin-top:40px">التوقيع</p></div>' +
            '<div style="text-align:center"><p><strong>الطرف الثاني</strong></p><p style="border-top:1px dashed #999;min-width:150px;padding-top:5px;margin-top:40px">التوقيع</p></div>' +
            '</div>' +
            '<div style="text-align:center;margin-top:20px;color:#999;font-size:0.85em">تاريخ إنشاء العقد: ' + new Date().toLocaleDateString('ar-SA') + '</div>' +
            '</div>';
    }


    // ==========================================================
    // HELPER: الحصول على فاتورة
    // ==========================================================
    function getV14Invoice(invoiceId) {
        var transactions = window.financialTransactions || [];
        return transactions.find(function(t) { return t.id === invoiceId; });
    }

    function getV14InvoiceHtml(inv) {
        var services = inv.services || [];
        var total = services.reduce(function(sum, s) { return sum + (parseFloat(s.amount) || 0); }, 0);
        if (total === 0 && inv.amount) total = parseFloat(inv.amount) || 0;

        var servicesRows = '';
        if (services.length > 0) {
            services.forEach(function(s, i) {
                servicesRows += '<tr><td>' + (i + 1) + '</td><td>' + (s.description || 'Cleaning services') + '</td>' +
                    '<td style="text-align:right">' + (parseFloat(s.amount) || 0).toLocaleString() + ' QAR</td></tr>';
            });
        } else {
            servicesRows = '<tr><td>1</td><td>' + (inv.serviceType || inv.description || 'Cleaning services') + '</td>' +
                '<td style="text-align:right">' + total.toLocaleString() + ' QAR</td></tr>';
        }

        return '<div class="invoice-template">' +
            '<div class="inv-header">' +
            '<div><div class="inv-logo">SUPER PRO</div><div style="color:#666">Cleaning & Services</div><div style="color:#666;font-size:0.85em">Qatar, Doha</div></div>' +
            '<div style="text-align:left"><div style="font-size:1.5em;font-weight:bold;color:#2c3e50">INVOICE</div>' +
            '<div><strong>Invoice #:</strong> ' + (inv.id || 'NEW') + '</div>' +
            '<div><strong>Date:</strong> ' + (inv.date || new Date().toISOString().split('T')[0]) + '</div></div>' +
            '</div>' +
            '<div class="inv-bill-to"><div style="display:flex;justify-content:space-between">' +
            '<div><strong>Bill To:</strong><br>' + (inv.clientName || 'N/A') + '<br>' + (inv.clientAddress || 'Qatar, Doha') + 
            (inv.clientPhone ? '<br>Phone: ' + inv.clientPhone : '') + '</div>' +
            '<div style="text-align:left"><strong>For:</strong><br>' + (inv.serviceType || 'Cleaning services') + '</div></div></div>' +
            '<table><thead><tr><th style="width:50px">#</th><th>Type of Service</th><th style="width:150px;text-align:right">Amount</th></tr></thead>' +
            '<tbody>' + servicesRows +
            '<tr class="total-row"><td colspan="2" style="text-align:right;padding-right:20px"><strong>Total Cost:</strong></td>' +
            '<td style="text-align:right"><strong>' + total.toLocaleString() + ' QAR</strong></td></tr></tbody></table>' +
            (inv.notes ? '<div style="margin:15px 0;padding:10px;background:#fff3cd;border-radius:5px"><strong>Notes:</strong> ' + inv.notes + '</div>' : '') +
            '<div class="inv-footer">' +
            '<p><strong>Make all checks payable to Super Pro Cleaning And Services</strong></p>' +
            '<p>If you have any questions concerning this invoice, contact 30004595</p>' +
            '<p style="font-size:1.1em;font-weight:bold;color:#2c3e50;margin-top:10px">Thank you for your business!</p></div></div>';
    }


    // ==========================================================
    // HELPER: كشف الراتب
    // ==========================================================
    function getV14PayslipHtml(row) {
        return '<div style="border:2px solid #2c3e50;border-radius:12px;padding:20px;max-width:600px;margin:0 auto">' +
            '<div style="text-align:center;margin-bottom:15px"><h2 style="margin:0;color:#2c3e50">كشف راتب</h2></div>' +
            '<table>' +
            '<tr><td style="width:40%"><strong>اسم الموظف</strong></td><td>' + (row.employee || '') + '</td></tr>' +
            '<tr><td><strong>الشهر</strong></td><td>' + (row.month || '') + '</td></tr>' +
            '<tr><td><strong>الراتب الأساسي</strong></td><td>' + safeNum(row.basic).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr><td><strong>البدلات</strong></td><td>' + safeNum(row.allowances).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr><td><strong>الخصومات</strong></td><td style="color:#dc3545">' + safeNum(row.deductions).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr><td><strong>أيام الغياب</strong></td><td>' + (row.absenceDays || 0) + ' يوم</td></tr>' +
            '<tr><td><strong>خصم الغياب</strong></td><td style="color:#dc3545">' + safeNum(row.absenceDeduction).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr style="background:#e8f5e9;font-weight:bold"><td><strong>صافي الراتب</strong></td><td style="color:#28a745;font-size:1.2em">' + safeNum(row.net).toLocaleString() + ' ر.ق</td></tr>' +
            '</table>' +
            '<div style="margin-top:20px;display:flex;justify-content:space-between">' +
            '<div style="text-align:center"><p style="border-top:1px dashed #999;padding-top:5px;min-width:120px">توقيع الموظف</p></div>' +
            '<div style="text-align:center"><p style="border-top:1px dashed #999;padding-top:5px;min-width:120px">توقيع المسؤول</p></div></div></div>';
    }


    // ==========================================================
    // HELPER: إيصال مدخول/مصروف
    // ==========================================================
    function getV14ReceiptHtml(item, type) {
        var isIncome = type === 'income';
        var title = isIncome ? 'إيصال مدخول' : 'إيصال مصروف';
        var color = isIncome ? '#28a745' : '#dc3545';

        return '<div style="border:2px solid ' + color + ';border-radius:12px;padding:20px;max-width:500px;margin:0 auto">' +
            '<div style="text-align:center;margin-bottom:15px">' +
            '<h2 style="margin:0;color:' + color + '">' + title + '</h2>' +
            '<p style="color:#666;font-size:0.85em">#' + (item.id || '') + '</p></div>' +
            '<table>' +
            '<tr><td style="width:40%"><strong>الوصف</strong></td><td>' + (item.description || item.category || '-') + '</td></tr>' +
            '<tr><td><strong>التاريخ</strong></td><td>' + fmtDate(item.date) + '</td></tr>' +
            '<tr><td><strong>الفئة</strong></td><td>' + (item.category || '-') + '</td></tr>' +
            (item.client ? '<tr><td><strong>العميل</strong></td><td>' + item.client + '</td></tr>' : '') +
            (item.paymentMethod ? '<tr><td><strong>طريقة الدفع</strong></td><td>' + item.paymentMethod + '</td></tr>' : '') +
            '<tr style="background:' + (isIncome ? '#e8f5e9' : '#fce4ec') + ';font-weight:bold"><td><strong>المبلغ</strong></td><td style="color:' + color + ';font-size:1.2em">' + safeNum(item.amount).toLocaleString() + ' ر.ق</td></tr>' +
            '</table>' +
            (item.notes ? '<p style="margin-top:10px;padding:8px;background:#f8f9fa;border-radius:5px"><strong>ملاحظات:</strong> ' + item.notes + '</p>' : '') +
            '<div style="text-align:center;margin-top:20px;color:#999;font-size:0.8em">تم الطباعة من نظام SuperPro</div></div>';
    }


    // ==========================================================
    // HELPER: تقرير الإقامات
    // ==========================================================
    function generateV14ResidencyReportHtml() {
        var emps = window.employees || [];
        var items = [];
        var today = new Date();
        today.setHours(0, 0, 0, 0);

        emps.forEach(function(emp) {
            if (!emp.residencyExpiry) return;
            var expDate = new Date(emp.residencyExpiry);
            if (isNaN(expDate.getTime())) return;
            expDate.setHours(0, 0, 0, 0);
            var diff = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

            if (diff <= 90) {
                var status = diff < 0 ? 'منتهية' : diff <= 7 ? 'عاجل' : diff <= 30 ? 'قريبة' : 'تحذير';
                items.push({
                    name: emp.name || '',
                    nationality: emp.nationality || '-',
                    job: emp.job || '-',
                    phone: emp.phone || '-',
                    expiryDate: emp.residencyExpiry,
                    daysDiff: diff,
                    status: status
                });
            }
        });

        items.sort(function(a, b) { return a.daysDiff - b.daysDiff; });

        var expired = items.filter(function(i) { return i.daysDiff < 0; });
        var urgent = items.filter(function(i) { return i.daysDiff >= 0 && i.daysDiff <= 7; });
        var soon = items.filter(function(i) { return i.daysDiff > 7 && i.daysDiff <= 30; });
        var warning = items.filter(function(i) { return i.daysDiff > 30; });

        var html = '<h2>📋 تقرير الإقامات المنتهية والقريبة من الانتهاء</h2>' +
            '<p style="color:#666">تاريخ التقرير: ' + new Date().toLocaleDateString('ar-SA') + '</p>' +
            '<div class="report-summary">' +
            '<div class="summary-item"><div class="num" style="color:#dc3545">' + expired.length + '</div><div class="label">منتهية</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#fd7e14">' + urgent.length + '</div><div class="label">عاجل (7 أيام)</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#ffc107">' + soon.length + '</div><div class="label">قريبة (30 يوم)</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#17a2b8">' + warning.length + '</div><div class="label">تحذير (90 يوم)</div></div>' +
            '</div>';

        if (items.length === 0) {
            html += '<p style="text-align:center;color:#28a745;font-size:1.2em;padding:30px">✅ لا توجد إقامات منتهية أو قريبة من الانتهاء</p>';
        } else {
            html += '<table><thead><tr><th>#</th><th>الموظف</th><th>الجنسية</th><th>الوظيفة</th><th>الهاتف</th><th>تاريخ الانتهاء</th><th>المتبقي</th><th>الحالة</th></tr></thead><tbody>';
            items.forEach(function(item, idx) {
                var badge = item.status === 'منتهية' || item.status === 'عاجل' ? 'badge-danger' :
                           item.status === 'قريبة' ? 'badge-warning' : 'badge-info';
                var remaining = item.daysDiff < 0 ? 'منتهية منذ ' + Math.abs(item.daysDiff) + ' يوم' :
                               item.daysDiff === 0 ? 'تنتهي اليوم' : item.daysDiff + ' يوم';
                html += '<tr><td>' + (idx + 1) + '</td><td><strong>' + item.name + '</strong></td><td>' + item.nationality + '</td>' +
                    '<td>' + item.job + '</td><td>' + item.phone + '</td><td>' + fmtDate(item.expiryDate) + '</td>' +
                    '<td>' + remaining + '</td><td><span class="' + badge + '">' + item.status + '</span></td></tr>';
            });
            html += '</tbody></table>';
        }

        html += '<div style="text-align:center;margin-top:20px;color:#999;font-size:0.85em">تم إنشاء التقرير من نظام SuperPro بتاريخ ' + new Date().toLocaleDateString('ar-SA') + '</div>';
        return html;
    }


    // ==========================================================
    // HELPER: تقرير الفواتير غير المدفوعة
    // ==========================================================
    function generateV14UnpaidInvoicesHtml() {
        var contractsArr = window.contracts || [];
        var items = [];

        contractsArr.forEach(function(c) {
            var paid = safeNum(c.paidAmount);
            var total = safeNum(c.amount);
            var remaining = total - paid;
            if (remaining > 0 || (c.paymentStatus && c.paymentStatus !== 'مدفوع' && c.paymentStatus !== 'مدفوع بالكامل')) {
                items.push({
                    number: c.number || '-',
                    client: c.client || '-',
                    employee: c.employee || '-',
                    totalAmount: total,
                    paidAmount: paid,
                    remaining: remaining > 0 ? remaining : total,
                    startDate: c.startDate,
                    endDate: c.endDate,
                    paymentStatus: c.paymentStatus || (paid > 0 ? 'مدفوع جزئياً' : 'غير مدفوع')
                });
            }
        });

        var totalUnpaid = items.reduce(function(s, i) { return s + i.remaining; }, 0);
        var totalAmount = items.reduce(function(s, i) { return s + i.totalAmount; }, 0);
        var totalPaid = items.reduce(function(s, i) { return s + i.paidAmount; }, 0);

        var html = '<h2>📋 تقرير الفواتير غير المدفوعة</h2>' +
            '<p style="color:#666">تاريخ التقرير: ' + new Date().toLocaleDateString('ar-SA') + '</p>' +
            '<div class="report-summary">' +
            '<div class="summary-item"><div class="num">' + items.length + '</div><div class="label">عدد الفواتير</div></div>' +
            '<div class="summary-item"><div class="num">' + totalAmount.toLocaleString() + '</div><div class="label">إجمالي المبالغ (ر.ق)</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#28a745">' + totalPaid.toLocaleString() + '</div><div class="label">المدفوع (ر.ق)</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#dc3545">' + totalUnpaid.toLocaleString() + '</div><div class="label">المتبقي (ر.ق)</div></div>' +
            '</div>';

        if (items.length === 0) {
            html += '<p style="text-align:center;color:#28a745;font-size:1.2em;padding:30px">✅ جميع الفواتير مدفوعة</p>';
        } else {
            html += '<table><thead><tr><th>#</th><th>رقم العقد</th><th>العميل</th><th>الموظف</th><th>قيمة العقد</th><th>المدفوع</th><th>المتبقي</th><th>البدء</th><th>الانتهاء</th><th>الحالة</th></tr></thead><tbody>';
            items.forEach(function(item, idx) {
                var badge = item.paymentStatus === 'غير مدفوع' ? 'badge-danger' : 'badge-warning';
                html += '<tr><td>' + (idx + 1) + '</td><td>' + item.number + '</td><td><strong>' + item.client + '</strong></td>' +
                    '<td>' + item.employee + '</td><td>' + item.totalAmount.toLocaleString() + ' ر.ق</td>' +
                    '<td style="color:#28a745">' + item.paidAmount.toLocaleString() + ' ر.ق</td>' +
                    '<td style="color:#dc3545;font-weight:bold">' + item.remaining.toLocaleString() + ' ر.ق</td>' +
                    '<td>' + fmtDate(item.startDate) + '</td><td>' + fmtDate(item.endDate) + '</td>' +
                    '<td><span class="' + badge + '">' + item.paymentStatus + '</span></td></tr>';
            });
            html += '<tr style="background:#e8f5e9;font-weight:bold"><td colspan="6" style="text-align:left">الإجمالي</td>' +
                '<td style="color:#dc3545">' + totalUnpaid.toLocaleString() + ' ر.ق</td><td colspan="3"></td></tr>';
            html += '</tbody></table>';
        }

        html += '<div style="text-align:center;margin-top:20px;color:#999;font-size:0.85em">تم إنشاء التقرير من نظام SuperPro بتاريخ ' + new Date().toLocaleDateString('ar-SA') + '</div>';
        return html;
    }


    // ==========================================================
    // HELPER: تقرير العقود القريبة من الانتهاء
    // ==========================================================
    function generateV14ExpiringContractsHtml(filterType) {
        var contractsArr = window.contracts || [];
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var items = [];

        contractsArr.forEach(function(c) {
            if (!c.endDate) return;
            var endDate = new Date(c.endDate);
            if (isNaN(endDate.getTime())) return;
            endDate.setHours(0, 0, 0, 0);
            var diff = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

            if (diff <= 90) {
                var isPaid = c.paymentStatus === 'مدفوع' || c.paymentStatus === 'مدفوع بالكامل';
                if (filterType === 'paid' && !isPaid) return;
                if (filterType === 'unpaid' && isPaid) return;

                items.push({
                    number: c.number || '-',
                    client: c.client || '-',
                    employee: c.employee || '-',
                    amount: safeNum(c.amount),
                    startDate: c.startDate,
                    endDate: c.endDate,
                    daysDiff: diff,
                    status: diff < 0 ? 'منتهي' : diff <= 7 ? 'عاجل' : diff <= 30 ? 'قريب' : 'تحذير',
                    paymentStatus: c.paymentStatus || '-',
                    isPaid: isPaid
                });
            }
        });

        items.sort(function(a, b) { return a.daysDiff - b.daysDiff; });

        var filterLabel = filterType === 'paid' ? ' (المدفوعة)' : filterType === 'unpaid' ? ' (غير المدفوعة)' : '';
        var expired = items.filter(function(i) { return i.daysDiff < 0; });
        var urgent = items.filter(function(i) { return i.daysDiff >= 0 && i.daysDiff <= 7; });
        var soon = items.filter(function(i) { return i.daysDiff > 7 && i.daysDiff <= 30; });
        var warning = items.filter(function(i) { return i.daysDiff > 30; });

        var html = '<h2>📋 تقرير العقود القريبة من الانتهاء' + filterLabel + '</h2>' +
            '<p style="color:#666">تاريخ التقرير: ' + new Date().toLocaleDateString('ar-SA') + '</p>' +
            '<div class="report-summary">' +
            '<div class="summary-item"><div class="num" style="color:#dc3545">' + expired.length + '</div><div class="label">منتهية</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#fd7e14">' + urgent.length + '</div><div class="label">عاجل (7 أيام)</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#ffc107">' + soon.length + '</div><div class="label">قريبة (30 يوم)</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#17a2b8">' + warning.length + '</div><div class="label">تحذير (90 يوم)</div></div>' +
            '</div>';

        if (items.length === 0) {
            html += '<p style="text-align:center;color:#28a745;font-size:1.2em;padding:30px">✅ لا توجد عقود منتهية أو قريبة من الانتهاء' + filterLabel + '</p>';
        } else {
            html += '<table><thead><tr><th>#</th><th>رقم العقد</th><th>العميل</th><th>الموظف</th><th>القيمة</th><th>البدء</th><th>الانتهاء</th><th>المتبقي</th><th>الدفع</th><th>الحالة</th></tr></thead><tbody>';
            items.forEach(function(item, idx) {
                var statusBadge = item.status === 'منتهي' || item.status === 'عاجل' ? 'badge-danger' :
                                 item.status === 'قريب' ? 'badge-warning' : 'badge-info';
                var payBadge = item.isPaid ? 'badge-success' : 'badge-danger';
                var remaining = item.daysDiff < 0 ? 'منتهي منذ ' + Math.abs(item.daysDiff) + ' يوم' :
                               item.daysDiff === 0 ? 'ينتهي اليوم' : item.daysDiff + ' يوم';
                html += '<tr><td>' + (idx + 1) + '</td><td>' + item.number + '</td><td><strong>' + item.client + '</strong></td>' +
                    '<td>' + item.employee + '</td><td>' + item.amount.toLocaleString() + ' ر.ق</td>' +
                    '<td>' + fmtDate(item.startDate) + '</td><td>' + fmtDate(item.endDate) + '</td>' +
                    '<td>' + remaining + '</td><td><span class="' + payBadge + '">' + item.paymentStatus + '</span></td>' +
                    '<td><span class="' + statusBadge + '">' + item.status + '</span></td></tr>';
            });
            html += '</tbody></table>';
        }

        html += '<div style="text-align:center;margin-top:20px;color:#999;font-size:0.85em">تم إنشاء التقرير من نظام SuperPro بتاريخ ' + new Date().toLocaleDateString('ar-SA') + '</div>';
        return html;
    }


    // ==========================================================
    // إصلاح تصدير Excel للتقارير
    // ==========================================================
    window.exportEmployeeReport = function() {
        try {
            var data = (window.employees || []).map(function(emp) {
                return {
                    'الاسم': emp.name || '',
                    'الوظيفة': emp.job || '',
                    'الجنسية': emp.nationality || '',
                    'الهاتف': emp.phone || '',
                    'الحالة': emp.status || '',
                    'الراتب': safeNum(emp.salary),
                    'تاريخ الانضمام': emp.joinDate || emp.startDate || '',
                    'انتهاء الإقامة': emp.residencyExpiry || ''
                };
            });
            if (typeof XLSX !== 'undefined') {
                var ws = XLSX.utils.json_to_sheet(data);
                var wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'الموظفين');
                XLSX.writeFile(wb, 'تقرير_الموظفين_' + new Date().toISOString().split('T')[0] + '.xlsx');
                if (typeof showToast === 'function') showToast('تم تصدير تقرير الموظفين', 'success');
            }
        } catch(e) { console.error('Export error:', e); }
    };

    window.exportFinanceReport = function() {
        try {
            var incomeData = (window.dailyIncome || []).map(function(i) {
                return { 'الوصف': i.description || '', 'المبلغ': safeNum(i.amount), 'التاريخ': i.date || '', 'الفئة': i.category || '' };
            });
            var expenseData = (window.dailyExpenses || []).map(function(e) {
                return { 'الوصف': e.description || '', 'المبلغ': safeNum(e.amount), 'التاريخ': e.date || '', 'الفئة': e.category || '' };
            });
            if (typeof XLSX !== 'undefined') {
                var wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(incomeData), 'الإيرادات');
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expenseData), 'المصروفات');
                XLSX.writeFile(wb, 'التقرير_المالي_' + new Date().toISOString().split('T')[0] + '.xlsx');
                if (typeof showToast === 'function') showToast('تم تصدير التقرير المالي', 'success');
            }
        } catch(e) { console.error('Export error:', e); }
    };

    window.exportAttendanceReport = function() {
        try {
            var data = (window.attendanceRecords || []).map(function(r) {
                return { 'الموظف': r.employee || '', 'التاريخ': r.date || '', 'الدخول': r.checkIn || '', 'الخروج': r.checkOut || '', 'الحالة': r.status || '' };
            });
            if (typeof XLSX !== 'undefined') {
                var ws = XLSX.utils.json_to_sheet(data);
                var wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'الحضور');
                XLSX.writeFile(wb, 'تقرير_الحضور_' + new Date().toISOString().split('T')[0] + '.xlsx');
                if (typeof showToast === 'function') showToast('تم تصدير تقرير الحضور', 'success');
            }
        } catch(e) { console.error('Export error:', e); }
    };


    // ==========================================================
    // دوال مساعدة
    // ==========================================================
    function safeNum(val) {
        var n = parseFloat(val);
        return isNaN(n) ? 0 : n;
    }

    function fmtDate(dateStr) {
        if (!dateStr) return '-';
        try {
            var d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('ar-SA');
        } catch(e) {
            return dateStr;
        }
    }

    function daysDiff(dateStr) {
        try {
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            var target = new Date(dateStr);
            target.setHours(0, 0, 0, 0);
            return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
        } catch(e) { return 999; }
    }


    // ==========================================================
    // إصلاح: تأكد من وجود printArea المخفي الأصلي لا يتداخل
    // ==========================================================
    function fixOriginalPrintArea() {
        var oldArea = document.getElementById('printArea');
        if (oldArea) {
            oldArea.style.display = 'none';
            oldArea.innerHTML = '';
        }
    }


    // ==========================================================
    // التهيئة
    // ==========================================================
    function initV14() {
        console.log('🔧 SuperPro V14: تهيئة إصلاحات الطباعة والتحميل...');

        fixOriginalPrintArea();

        // Remove old printing class if stuck
        document.body.classList.remove('printing');

        console.log('✅ SuperPro V14: تم تحميل الإصلاحات بنجاح');
        console.log('   - الطباعة: تستخدم overlay جديد بدلاً من printArea');
        console.log('   - التحميل: يولد PDF باستخدام html2pdf.js');
        console.log('   - جميع القوائم: موظفين، عقود، فواتير، تقارير، رواتب، إيصالات');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initV14);
    } else {
        setTimeout(initV14, 100);
    }

})();
