/**
 * bugfix-v12.js — SuperPro System V12
 * ======================================
 * 1. طباعة/تحميل بيانات الموظف
 * 2. نموذج عقد قابل للتعديل والطباعة والتحميل والحذف
 * 3. نموذج فاتورة قابل للتعديل والطباعة والتحميل والحذف  
 * 4. إخفاء العقود القديمة/المدفوعة إلا بالفلترة
 */
(function() {
    'use strict';
    console.log('🔧 SuperPro V12: Loading...');

    // ==========================================================
    // CSS Styles
    // ==========================================================
    const v12Style = document.createElement('style');
    v12Style.textContent = `
        /* Print Contract Template Styles */
        .contract-template {
            direction: rtl;
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            line-height: 2;
            color: #333;
        }
        .contract-template h2 {
            text-align: center;
            color: #2c3e50;
            border-bottom: 3px double #2c3e50;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .contract-template .contract-section {
            margin-bottom: 15px;
        }
        .contract-template .contract-section h4 {
            color: #34495e;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .contract-template .signature-area {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 20px;
        }
        .contract-template .signature-box {
            text-align: center;
            width: 45%;
        }
        .contract-template .signature-line {
            border-top: 1px solid #333;
            margin-top: 60px;
            padding-top: 5px;
        }
        .contract-template .dotted { border-bottom: 1px dotted #999; }

        /* Invoice Template Styles */
        .invoice-template {
            direction: ltr;
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            padding: 30px;
            max-width: 800px;
            margin: 0 auto;
            color: #333;
        }
        .invoice-template .inv-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 15px;
        }
        .invoice-template .inv-logo {
            font-size: 24px;
            font-weight: 800;
            color: #2c3e50;
        }
        .invoice-template .inv-info { text-align: right; }
        .invoice-template .inv-bill-to {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .invoice-template .inv-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .invoice-template .inv-table th {
            background: #2c3e50;
            color: white;
            padding: 10px;
            text-align: left;
        }
        .invoice-template .inv-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #eee;
        }
        .invoice-template .inv-table .total-row {
            font-weight: bold;
            background: #f0f0f0;
            font-size: 1.1em;
        }
        .invoice-template .inv-footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #2c3e50;
            font-size: 0.9em;
            color: #666;
        }

        /* Employee Profile Print */
        .employee-profile {
            direction: rtl;
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            padding: 30px;
            max-width: 700px;
            margin: 0 auto;
        }
        .employee-profile .ep-header {
            text-align: center;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .employee-profile .ep-header h2 {
            color: #2c3e50;
            margin: 0;
        }
        .employee-profile .ep-avatar {
            width: 80px; height: 80px; border-radius: 50%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white; font-size: 32px; font-weight: bold;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 10px;
        }
        .employee-profile table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .employee-profile table td {
            padding: 10px 15px;
            border-bottom: 1px solid #eee;
        }
        .employee-profile table td:first-child {
            font-weight: bold;
            color: #2c3e50;
            width: 40%;
            background: #f8f9fa;
        }

        /* Modal improvements for invoice */
        .inv-service-row {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-bottom: 8px;
        }
        .inv-service-row input {
            flex: 1;
        }
        .inv-service-row .inv-amount-input {
            max-width: 150px;
        }
        .inv-service-row .btn-remove-service {
            flex-shrink: 0;
        }

        /* Contract default filter indicator */
        .v12-filter-note {
            font-size: 0.8em;
            color: #6c757d;
            margin-top: 5px;
            font-style: italic;
        }

        /* V12 Modal */
        #v12InvoiceModal .modal-body { max-height: 75vh; overflow-y: auto; }
        #v12ContractPrintModal .modal-body { max-height: 80vh; overflow-y: auto; }
    `;
    document.head.appendChild(v12Style);


    // ==========================================================
    // UTILITY: Print HTML using existing printHtml mechanism
    // ==========================================================
    function v12Print(title, html) {
        if (typeof printHtml === 'function') {
            printHtml(title, html);
        } else {
            const area = document.getElementById('printArea');
            if (!area) return;
            area.innerHTML = `<div style="font-size:20px;font-weight:800;margin-bottom:16px">${title}</div>${html}`;
            document.body.classList.add('printing');
            setTimeout(() => { window.print(); setTimeout(() => { document.body.classList.remove('printing'); area.innerHTML = ''; }, 300); }, 60);
        }
    }

    function v12Download(filename, html) {
        const fullHtml = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8">
            <style>body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;padding:20px;direction:rtl}
            table{width:100%;border-collapse:collapse}td,th{padding:8px 12px;border-bottom:1px solid #ddd}
            th{background:#2c3e50;color:#fff}h2,h3{color:#2c3e50}.dotted{border-bottom:1px dotted #999}</style>
            </head><body>${html}</body></html>`;
        const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ==========================================================
    // 1. EMPLOYEE PRINT/DOWNLOAD
    // ==========================================================
    function getEmployeeProfileHtml(emp) {
        const totalSalary = (parseFloat(emp.salary) || 0) + (parseFloat(emp.housingAllowance) || 0) +
            (parseFloat(emp.transportAllowance) || 0) + (parseFloat(emp.foodAllowance) || 0) +
            (parseFloat(emp.otherAllowance) || 0);

        // Find contracts for this employee
        const empContracts = (window.contracts || []).filter(c => c.employee === emp.name);
        let contractsHtml = '';
        if (empContracts.length > 0) {
            contractsHtml = `<h3 style="color:#2c3e50;margin-top:20px">العقود المرتبطة</h3><table>
                <tr style="background:#2c3e50;color:#fff"><th>رقم العقد</th><th>العميل</th><th>النوع</th><th>من</th><th>إلى</th><th>القيمة</th></tr>
                ${empContracts.map(c => `<tr><td>${c.number||'-'}</td><td>${c.client}</td><td>${c.type}</td><td>${c.startDate}</td><td>${c.endDate}</td><td>${c.amount} ر.ق</td></tr>`).join('')}
            </table>`;
        }

        return `<div class="employee-profile">
            <div class="ep-header">
                <div class="ep-avatar">${emp.name ? emp.name.charAt(0) : '?'}</div>
                <h2>${emp.name}</h2>
                <p style="color:#666;margin:5px 0">${emp.job || 'غير محدد'}</p>
            </div>
            <h3 style="color:#2c3e50">المعلومات الشخصية</h3>
            <table>
                <tr><td>الاسم الكامل</td><td>${emp.name}</td></tr>
                <tr><td>الجنسية</td><td>${emp.nationality || 'غير محدد'}</td></tr>
                <tr><td>الجنس</td><td>${emp.gender || 'غير محدد'}</td></tr>
                <tr><td>رقم الهوية</td><td>${emp.idNumber || 'غير محدد'}</td></tr>
                <tr><td>الهاتف</td><td>${emp.phone || 'غير محدد'}</td></tr>
                <tr><td>الحالة</td><td>${emp.status || 'نشط'}</td></tr>
                <tr><td>تاريخ التوظيف</td><td>${emp.hireDate || emp.joinDate || 'غير محدد'}</td></tr>
                <tr><td>تاريخ انتهاء الإقامة</td><td>${emp.residencyExpiry || 'غير محدد'}</td></tr>
            </table>
            <h3 style="color:#2c3e50">المعلومات المالية</h3>
            <table>
                <tr><td>الراتب الأساسي</td><td>${emp.salary || 0} ر.ق</td></tr>
                <tr><td>بدل سكن</td><td>${emp.housingAllowance || 0} ر.ق</td></tr>
                <tr><td>بدل مواصلات</td><td>${emp.transportAllowance || 0} ر.ق</td></tr>
                <tr><td>بدل طعام</td><td>${emp.foodAllowance || 0} ر.ق</td></tr>
                <tr><td>بدلات أخرى</td><td>${emp.otherAllowance || 0} ر.ق</td></tr>
                <tr style="background:#e8f5e9;font-weight:bold"><td>إجمالي الراتب</td><td>${totalSalary} ر.ق</td></tr>
            </table>
            ${contractsHtml}
            <div style="text-align:center;margin-top:30px;color:#999;font-size:0.85em">
                تم الطباعة من نظام SuperPro بتاريخ ${new Date().toLocaleDateString('ar-SA')}
            </div>
        </div>`;
    }

    window.printEmployeeProfile = function(index) {
        const emp = window.employees[index];
        if (!emp) return;
        v12Print('بيانات الموظف - ' + emp.name, getEmployeeProfileHtml(emp));
    };

    window.downloadEmployeeProfile = function(index) {
        const emp = window.employees[index];
        if (!emp) return;
        v12Download(`بيانات_${emp.name}.html`, getEmployeeProfileHtml(emp));
        if (typeof showToast === 'function') showToast('تم تحميل بيانات الموظف');
    };

    // Override renderEmployeesTable to add print/download buttons
    const _origRenderEmployees = window.renderEmployeesTable;
    window.renderEmployeesTable = function() {
        if (typeof _origRenderEmployees === 'function') _origRenderEmployees();

        const tbody = document.getElementById('employees-table-body');
        if (!tbody) return;

        tbody.querySelectorAll('tr').forEach((tr, idx) => {
            const lastTd = tr.querySelector('td:last-child');
            if (!lastTd || !lastTd.querySelector('.btn-group')) return;
            const btnGroup = lastTd.querySelector('.btn-group');
            if (btnGroup.querySelector('.v12-print-btn')) return; // already added

            const printBtn = document.createElement('button');
            printBtn.type = 'button';
            printBtn.className = 'btn btn-outline-info quick-action-btn v12-print-btn';
            printBtn.title = 'طباعة';
            printBtn.innerHTML = '<i class="fas fa-print"></i>';
            printBtn.onclick = function(e) { e.stopPropagation(); printEmployeeProfile(idx); };

            const downloadBtn = document.createElement('button');
            downloadBtn.type = 'button';
            downloadBtn.className = 'btn btn-outline-success quick-action-btn v12-download-btn';
            downloadBtn.title = 'تحميل';
            downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
            downloadBtn.onclick = function(e) { e.stopPropagation(); downloadEmployeeProfile(idx); };

            btnGroup.insertBefore(printBtn, btnGroup.firstChild);
            btnGroup.insertBefore(downloadBtn, printBtn.nextSibling);
        });
    };


    // ==========================================================
    // 2. CONTRACT TEMPLATE — PRINT/DOWNLOAD  
    // ==========================================================
    function getContractTemplateHtml(contract) {
        // Find client details
        const clientObj = (window.clients || []).find(c => c.name === contract.client) || {};
        // Find employee details
        const empObj = (window.employees || []).find(e => e.name === contract.employee) || {};

        const contractDate = contract.createdAt ? new Date(contract.createdAt).toLocaleDateString('ar-SA') : new Date().toLocaleDateString('ar-SA');

        return `<div class="contract-template">
            <h2>نموذج عقد تقديم خدمات تنظيف منزلية</h2>

            <div class="contract-section">
                <p><strong>الطرف الأول:</strong> شركة SuperPro للتنظيفات والخدمات</p>
                <p>ويمثلها في هذا العقد: <strong>وليد الخياط</strong></p>
                <p>رقم الهاتف: <strong>+97430004595</strong></p>
            </div>

            <div class="contract-section">
                <p><strong>الطرف الثاني:</strong> السيد/السيدة: <strong>${contract.client || '........................'}</strong></p>
                <p>رقم الهوية: <strong>${clientObj.idNumber || clientObj.id || '.........................'}</strong></p>
                <p>رقم الهاتف: <strong>${clientObj.phone || '.................'}</strong></p>
                ${clientObj.address ? `<p>العنوان: <strong>${clientObj.address}</strong></p>` : ''}
            </div>

            <div class="contract-section">
                <h4>موضوع العقد:</h4>
                <p>اتفق الطرفان بموجب هذا العقد على أن يقوم الطرف الأول بتوفير عاملة تنظيف منزلية للعمل لدى الطرف الثاني وفقاً للشروط التالية:</p>
            </div>

            <div class="contract-section">
                <h4>البند الأول: معلومات العاملة</h4>
                <p>الاسم: <strong>${contract.employee || '.....................................'}</strong></p>
                <p>الجنسية: <strong>${empObj.nationality || '.....................'}</strong></p>
                ${empObj.idNumber ? `<p>رقم الهوية: <strong>${empObj.idNumber}</strong></p>` : ''}
            </div>

            <div class="contract-section">
                <h4>البند الثاني: مدة العقد</h4>
                <p>تبدأ مدة هذا العقد من تاريخ <strong>${contract.startDate || '..................'}</strong> وتنتهي بتاريخ <strong>${contract.endDate || '..........................'}</strong>، قابلة للتجديد باتفاق الطرفين كتابياً.</p>
                <p>نوع العقد: <strong>${contract.type || 'كامل'}</strong></p>
                ${contract.workDays && contract.workDays.length > 0 ? `<p>أيام العمل: <strong>${contract.workDays.join('، ')}</strong></p>` : ''}
            </div>

            <div class="contract-section">
                <h4>البند الثالث: ساعات العمل</h4>
                <p>تعمل العاملة من الساعة <strong>${contract.startTime || '08:00'}</strong> إلى الساعة <strong>${contract.endTime || '16:00'}</strong> يومياً.</p>
                <p>في حال تجاوز عدد الساعات اليومية، يحق للطرف الأول إلغاء العقد دون تحمل أي مسؤولية.</p>
            </div>

            <div class="contract-section">
                <h4>البند الرابع: الأجر ووسائل الدفع</h4>
                <p>تم الاتفاق على أن قيمة العقد الشهري هي <strong>${contract.amount || '............'} ريال قطري</strong> شاملة تكاليف النقل.</p>
                <p>يجب دفع كامل المبلغ من قبل الطرف الثاني في بداية كل شهر.</p>
                <p>المبلغ المدفوع: <strong>${contract.paidAmount || 0} ر.ق</strong></p>
                <p>حالة الدفع: <strong>${contract.paymentStatus || 'غير مدفوع'}</strong></p>
            </div>

            <div class="contract-section">
                <h4>البند الخامس: فسخ العقد</h4>
                <p>يحق للطرف الأول فسخ العقد وإعادة المبلغ للطرف الثاني في حال وجود أسباب قانونية أو أخلاقية.</p>
                <p>في حال إنهاء العقد وإعادة العاملة، يتم خصم 150 ريال قطري عن كل يوم عملت فيه العاملة من المبلغ المدفوع، ويتم إعادة المتبقي.</p>
            </div>

            <div class="contract-section">
                <h4>البند السادس: أحكام عامة</h4>
                <p>يلتزم الطرف الثاني بالتعامل الإنساني والقانوني مع العاملة.</p>
                <p>لا يجوز للطرف الثاني نقل العاملة للعمل في مكان آخر بدون موافقة كتابية من الطرف الأول.</p>
                <p>يعتبر هذا العقد ملزماً للطرفين، ولا يجوز تعديله إلا بموافقة مكتوبة منهما.</p>
            </div>

            ${contract.notes ? `<div class="contract-section"><h4>ملاحظات:</h4><p>${contract.notes}</p></div>` : ''}

            <div class="contract-section">
                <p>حرر هذا العقد بتاريخ: <strong>${contractDate}</strong></p>
                <p>وبناءً عليه، تم التوقيع من قبل الطرفين:</p>
            </div>

            <div class="signature-area">
                <div class="signature-box">
                    <p><strong>توقيع الطرف الأول (عن الشركة)</strong></p>
                    <p>الاسم: وليد الخياط</p>
                    <p>الختم:</p>
                    <div class="signature-line"></div>
                </div>
                <div class="signature-box">
                    <p><strong>توقيع الطرف الثاني (صاحب المنزل)</strong></p>
                    <p>الاسم: ${contract.client || '..............................'}</p>
                    <div class="signature-line"></div>
                </div>
            </div>

            <div style="text-align:center;margin-top:30px;color:#999;font-size:0.85em">
                رقم العقد: ${contract.number || '-'} | تم الطباعة من نظام SuperPro
            </div>
        </div>`;
    }

    window.printContractTemplate = function(index) {
        const contract = window.contracts[index];
        if (!contract) return;
        v12Print('عقد - ' + contract.client, getContractTemplateHtml(contract));
    };

    window.downloadContractTemplate = function(index) {
        const contract = window.contracts[index];
        if (!contract) return;
        v12Download(`عقد_${contract.number || contract.client}.html`, getContractTemplateHtml(contract));
        if (typeof showToast === 'function') showToast('تم تحميل نموذج العقد');
    };


    // ==========================================================
    // 3. INVOICE SYSTEM — Full overhaul  
    // ==========================================================

    // Invoice data stored in window.v12Invoices and synced to financialTransactions
    function getV12Invoices() {
        return (window.financialTransactions || []).filter(t => t.type === 'فاتورة' || t.v12Invoice);
    }

    function saveV12Invoice(invoice) {
        invoice.type = 'فاتورة';
        invoice.v12Invoice = true;
        if (!invoice.id) {
            // Auto-number
            const existing = getV12Invoices();
            const maxNum = existing.reduce((max, inv) => {
                const match = (inv.id || '').match(/INV-(\d+)/);
                return match ? Math.max(max, parseInt(match[1])) : max;
            }, 0);
            invoice.id = 'INV-' + String(maxNum + 1).padStart(3, '0');
        }
        invoice.createdAt = invoice.createdAt || new Date().toISOString();
        window.financialTransactions.push(invoice);
        
        // Save to localStorage & Firebase
        try { localStorage.setItem(window.LS_KEYS?.invoices || 'superpro_invoices', JSON.stringify(window.financialTransactions)); } catch(e) {}
        if (typeof saveData === 'function') saveData();
        return invoice;
    }

    function deleteV12Invoice(invoiceId) {
        const idx = window.financialTransactions.findIndex(t => t.id === invoiceId);
        if (idx >= 0) {
            window.financialTransactions.splice(idx, 1);
            try { localStorage.setItem(window.LS_KEYS?.invoices || 'superpro_invoices', JSON.stringify(window.financialTransactions)); } catch(e) {}
            if (typeof saveData === 'function') saveData();
        }
    }

    function getInvoiceTemplateHtml(inv) {
        const services = inv.services || [];
        const total = services.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);

        let servicesRows = services.map((s, i) => 
            `<tr><td>${i + 1}</td><td>${s.description || 'Cleaning services'}</td><td style="text-align:right">${(parseFloat(s.amount) || 0).toLocaleString()} QAR</td></tr>`
        ).join('');

        // Fill remaining rows to match template look
        for (let i = services.length; i < 5; i++) {
            servicesRows += `<tr><td>${i + 1}</td><td style="color:#ccc">-</td><td></td></tr>`;
        }

        return `<div class="invoice-template">
            <div class="inv-header">
                <div>
                    <div class="inv-logo">SUPER PRO</div>
                    <div style="color:#666">Cleaning & Services</div>
                    <div style="color:#666;font-size:0.85em">Qatar, Doha</div>
                </div>
                <div class="inv-info">
                    <div style="font-size:1.5em;font-weight:bold;color:#2c3e50">INVOICE</div>
                    <div><strong>Invoice #:</strong> ${inv.id || 'NEW'}</div>
                    <div><strong>Date:</strong> ${inv.date || new Date().toISOString().split('T')[0]}</div>
                </div>
            </div>

            <div class="inv-bill-to">
                <div style="display:flex;justify-content:space-between">
                    <div>
                        <strong>Bill To:</strong><br>
                        ${inv.clientName || 'N/A'}<br>
                        ${inv.clientAddress || 'Qatar, Doha'}<br>
                        ${inv.clientPhone ? 'Phone: ' + inv.clientPhone : ''}
                    </div>
                    <div style="text-align:right">
                        <strong>For:</strong><br>
                        ${inv.serviceType || 'Cleaning services'}
                    </div>
                </div>
            </div>

            <table class="inv-table">
                <thead>
                    <tr>
                        <th style="width:50px">#</th>
                        <th>Type of Service</th>
                        <th style="width:150px;text-align:right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${servicesRows}
                    <tr class="total-row">
                        <td colspan="2" style="text-align:right;padding-right:20px"><strong>Total Cost:</strong></td>
                        <td style="text-align:right"><strong>${total.toLocaleString()} QAR</strong></td>
                    </tr>
                </tbody>
            </table>

            ${inv.notes ? `<div style="margin-bottom:15px;padding:10px;background:#fff3cd;border-radius:5px"><strong>Notes:</strong> ${inv.notes}</div>` : ''}

            <div class="inv-footer">
                <p><strong>Make all checks payable to Super Pro Cleaning And Services</strong></p>
                <p>If you have any questions concerning this invoice, contact 30004595</p>
                <p style="font-size:1.1em;font-weight:bold;color:#2c3e50;margin-top:10px">Thank you for your business!</p>
            </div>
        </div>`;
    }

    window.printV12Invoice = function(invoiceId) {
        const inv = getV12Invoices().find(i => i.id === invoiceId);
        if (!inv) return;
        v12Print('Invoice - ' + inv.id, getInvoiceTemplateHtml(inv));
    };

    window.downloadV12Invoice = function(invoiceId) {
        const inv = getV12Invoices().find(i => i.id === invoiceId);
        if (!inv) return;
        v12Download(`Invoice_${inv.id}.html`, getInvoiceTemplateHtml(inv));
        if (typeof showToast === 'function') showToast('تم تحميل الفاتورة');
    };

    window.deleteV12Invoice = function(invoiceId) {
        if (!confirm('هل تريد حذف هذه الفاتورة؟')) return;
        deleteV12Invoice(invoiceId);
        if (typeof showToast === 'function') showToast('تم حذف الفاتورة بنجاح');
        loadV12Invoices();
    };

    window.editV12Invoice = function(invoiceId) {
        const inv = getV12Invoices().find(i => i.id === invoiceId);
        if (!inv) return;
        showV12InvoiceModal(inv);
    };

    function showV12InvoiceModal(existingInv) {
        let modal = document.getElementById('v12InvoiceModal');
        if (!modal) {
            // Create modal HTML
            const modalDiv = document.createElement('div');
            modalDiv.innerHTML = `
            <div class="modal fade" id="v12InvoiceModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">فاتورة جديدة</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="v12InvoiceForm" class="row g-3">
                                <input type="hidden" id="v12InvEditId">
                                <div class="col-md-6">
                                    <label class="form-label">العميل</label>
                                    <select id="v12InvClient" class="form-select" required>
                                        <option value="">اختر العميل</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">التاريخ</label>
                                    <input id="v12InvDate" type="date" class="form-control" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">هاتف العميل</label>
                                    <input id="v12InvPhone" class="form-control" placeholder="رقم الهاتف">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">عنوان العميل</label>
                                    <input id="v12InvAddress" class="form-control" placeholder="Qatar, Doha">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">نوع الخدمة</label>
                                    <input id="v12InvServiceType" class="form-control" value="Hourly cleaning services">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">الحالة</label>
                                    <select id="v12InvStatus" class="form-select">
                                        <option value="معلق">معلق</option>
                                        <option value="مدفوع">مدفوع</option>
                                        <option value="مرفوض">مرفوض</option>
                                    </select>
                                </div>
                                <div class="col-12">
                                    <label class="form-label fw-bold">بنود الخدمات</label>
                                    <div id="v12InvServicesContainer"></div>
                                    <button type="button" class="btn btn-outline-primary btn-sm mt-2" id="v12AddServiceRow">
                                        <i class="fas fa-plus me-1"></i>إضافة بند
                                    </button>
                                </div>
                                <div class="col-12">
                                    <div class="alert alert-success mb-0 py-2">
                                        <strong>الإجمالي: <span id="v12InvTotal">0</span> QAR</strong>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <label class="form-label">ملاحظات</label>
                                    <textarea id="v12InvNotes" class="form-control" rows="2"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                            <button type="button" class="btn btn-primary" id="v12SaveInvoiceBtn">حفظ الفاتورة</button>
                        </div>
                    </div>
                </div>
            </div>`;
            document.body.appendChild(modalDiv.firstElementChild);
            modal = document.getElementById('v12InvoiceModal');

            // Wire up events
            document.getElementById('v12AddServiceRow').addEventListener('click', function() {
                addV12ServiceRow();
            });

            document.getElementById('v12SaveInvoiceBtn').addEventListener('click', function() {
                saveV12InvoiceFromModal();
            });
        }

        // Populate clients dropdown
        const clientSelect = document.getElementById('v12InvClient');
        clientSelect.innerHTML = '<option value="">اختر العميل</option>';
        (window.clients || []).forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.name;
            opt.textContent = c.name;
            clientSelect.appendChild(opt);
        });

        // Reset or fill form
        const form = document.getElementById('v12InvoiceForm');
        form.reset();
        document.getElementById('v12InvServicesContainer').innerHTML = '';
        document.getElementById('v12InvEditId').value = '';

        if (existingInv) {
            document.querySelector('#v12InvoiceModal .modal-title').textContent = 'تعديل الفاتورة';
            document.getElementById('v12InvEditId').value = existingInv.id;
            document.getElementById('v12InvClient').value = existingInv.clientName || '';
            document.getElementById('v12InvDate').value = existingInv.date || '';
            document.getElementById('v12InvPhone').value = existingInv.clientPhone || '';
            document.getElementById('v12InvAddress').value = existingInv.clientAddress || '';
            document.getElementById('v12InvServiceType').value = existingInv.serviceType || 'Hourly cleaning services';
            document.getElementById('v12InvStatus').value = existingInv.status || 'معلق';
            document.getElementById('v12InvNotes').value = existingInv.notes || '';
            
            if (existingInv.services && existingInv.services.length > 0) {
                existingInv.services.forEach(s => addV12ServiceRow(s.description, s.amount));
            } else {
                addV12ServiceRow();
            }
        } else {
            document.querySelector('#v12InvoiceModal .modal-title').textContent = 'فاتورة جديدة';
            document.getElementById('v12InvDate').value = new Date().toISOString().split('T')[0];
            addV12ServiceRow();
        }

        // Auto-fill client info when selected
        clientSelect.onchange = function() {
            const client = (window.clients || []).find(c => c.name === this.value);
            if (client) {
                document.getElementById('v12InvPhone').value = client.phone || '';
                document.getElementById('v12InvAddress').value = client.address || 'Qatar, Doha';
            }
        };

        updateV12InvoiceTotal();
        new bootstrap.Modal(modal).show();
    }

    function addV12ServiceRow(desc, amount) {
        const container = document.getElementById('v12InvServicesContainer');
        const row = document.createElement('div');
        row.className = 'inv-service-row';
        row.innerHTML = `
            <input type="text" class="form-control inv-desc-input" placeholder="وصف الخدمة (مثل: Cleaning services)" value="${desc || ''}">
            <input type="number" class="form-control inv-amount-input" placeholder="المبلغ" value="${amount || ''}" min="0">
            <button type="button" class="btn btn-outline-danger btn-sm btn-remove-service" title="حذف">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(row);

        row.querySelector('.btn-remove-service').addEventListener('click', function() {
            row.remove();
            updateV12InvoiceTotal();
        });

        row.querySelector('.inv-amount-input').addEventListener('input', updateV12InvoiceTotal);
    }

    function updateV12InvoiceTotal() {
        const amounts = document.querySelectorAll('#v12InvServicesContainer .inv-amount-input');
        let total = 0;
        amounts.forEach(input => { total += parseFloat(input.value) || 0; });
        const totalEl = document.getElementById('v12InvTotal');
        if (totalEl) totalEl.textContent = total.toLocaleString();
    }

    function saveV12InvoiceFromModal() {
        const clientName = document.getElementById('v12InvClient').value;
        const date = document.getElementById('v12InvDate').value;
        if (!clientName || !date) {
            if (typeof showToast === 'function') showToast('يرجى ملء العميل والتاريخ', 'error');
            return;
        }

        const services = [];
        document.querySelectorAll('#v12InvServicesContainer .inv-service-row').forEach(row => {
            const desc = row.querySelector('.inv-desc-input').value;
            const amt = row.querySelector('.inv-amount-input').value;
            if (desc || amt) {
                services.push({ description: desc || 'Cleaning services', amount: parseFloat(amt) || 0 });
            }
        });

        const totalAmount = services.reduce((sum, s) => sum + s.amount, 0);
        const editId = document.getElementById('v12InvEditId').value;

        if (editId) {
            // Update existing
            const idx = window.financialTransactions.findIndex(t => t.id === editId);
            if (idx >= 0) {
                window.financialTransactions[idx] = {
                    ...window.financialTransactions[idx],
                    clientName,
                    date,
                    clientPhone: document.getElementById('v12InvPhone').value,
                    clientAddress: document.getElementById('v12InvAddress').value,
                    serviceType: document.getElementById('v12InvServiceType').value,
                    status: document.getElementById('v12InvStatus').value,
                    notes: document.getElementById('v12InvNotes').value,
                    services,
                    amount: totalAmount,
                    updatedAt: new Date().toISOString()
                };
                try { localStorage.setItem(window.LS_KEYS?.invoices || 'superpro_invoices', JSON.stringify(window.financialTransactions)); } catch(e) {}
                if (typeof saveData === 'function') saveData();
                if (typeof showToast === 'function') showToast('تم تحديث الفاتورة بنجاح');
            }
        } else {
            // Create new
            saveV12Invoice({
                clientName,
                date,
                clientPhone: document.getElementById('v12InvPhone').value,
                clientAddress: document.getElementById('v12InvAddress').value,
                serviceType: document.getElementById('v12InvServiceType').value,
                status: document.getElementById('v12InvStatus').value,
                notes: document.getElementById('v12InvNotes').value,
                services,
                amount: totalAmount
            });
            if (typeof showToast === 'function') showToast('تم إنشاء الفاتورة بنجاح');
        }

        bootstrap.Modal.getInstance(document.getElementById('v12InvoiceModal'))?.hide();
        loadV12Invoices();
    }

    // Override loadInvoices to use the new V12 system
    function loadV12Invoices() {
        const section = document.getElementById('invoices');
        if (!section) return;

        const invoiceList = getV12Invoices();
        const totalInvoices = invoiceList.length;
        const paidInvoices = invoiceList.filter(t => t.status === 'مدفوع').length;
        const pendingInvoices = invoiceList.filter(t => t.status === 'معلق').length;
        const totalAmount = invoiceList.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        section.innerHTML = `
            <h2 class="section-title mb-4">💰 الفواتير</h2>
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <div class="card stat-card p-3 text-center bg-primary text-white">
                        <i class="fas fa-file-invoice-dollar" style="font-size:28px;"></i>
                        <h4>${totalInvoices}</h4>
                        <p>إجمالي الفواتير</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card stat-card p-3 text-center bg-success text-white">
                        <i class="fas fa-check-circle" style="font-size:28px;"></i>
                        <h4>${paidInvoices}</h4>
                        <p>فواتير مدفوعة</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card stat-card p-3 text-center bg-warning text-white">
                        <i class="fas fa-hourglass-end" style="font-size:28px;"></i>
                        <h4>${pendingInvoices}</h4>
                        <p>فواتير معلقة</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card stat-card p-3 text-center bg-info text-white">
                        <i class="fas fa-money-bill-wave" style="font-size:28px;"></i>
                        <h4>${totalAmount.toLocaleString()} ر.ق</h4>
                        <p>إجمالي المبلغ</p>
                    </div>
                </div>
            </div>

            <div class="card mb-3">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">قائمة الفواتير</h5>
                    <button class="btn btn-primary btn-sm" id="v12NewInvoiceBtn">
                        <i class="fas fa-plus me-2"></i>فاتورة جديدة
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive" style="overflow:auto!important;max-height:500px">
                        <table class="table table-hover table-striped">
                            <thead class="table-dark">
                                <tr>
                                    <th>#</th>
                                    <th>رقم الفاتورة</th>
                                    <th>العميل</th>
                                    <th>التاريخ</th>
                                    <th>المبلغ</th>
                                    <th>الحالة</th>
                                    <th width="200">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${invoiceList.length === 0 ? '<tr><td colspan="7" class="text-center py-3 text-muted">لا توجد فواتير</td></tr>' : 
                                    invoiceList.map((inv, idx) => `
                                    <tr>
                                        <td>${idx + 1}</td>
                                        <td><strong>${inv.id || '-'}</strong></td>
                                        <td>${inv.clientName || '-'}</td>
                                        <td>${inv.date || '-'}</td>
                                        <td class="fw-bold text-success">${(parseFloat(inv.amount) || 0).toLocaleString()} ر.ق</td>
                                        <td>
                                            <span class="badge ${inv.status === 'مدفوع' ? 'bg-success' : inv.status === 'معلق' ? 'bg-warning' : 'bg-secondary'}">
                                                ${inv.status || 'معلق'}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-info" title="طباعة" onclick="printV12Invoice('${inv.id}')">
                                                    <i class="fas fa-print"></i>
                                                </button>
                                                <button class="btn btn-outline-success" title="تحميل" onclick="downloadV12Invoice('${inv.id}')">
                                                    <i class="fas fa-download"></i>
                                                </button>
                                                <button class="btn btn-outline-warning" title="تعديل" onclick="editV12Invoice('${inv.id}')">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn btn-outline-danger" title="حذف" onclick="deleteV12Invoice('${inv.id}')">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Wire up the new invoice button
        const newBtn = document.getElementById('v12NewInvoiceBtn');
        if (newBtn) {
            newBtn.addEventListener('click', function() { showV12InvoiceModal(null); });
        }
    }

    // Override the original loadInvoices
    window.loadInvoices = loadV12Invoices;


    // ==========================================================
    // 4. CONTRACTS: Default filter = active only, add print button
    // ==========================================================

    // Override updateContractsTable to default to active non-paid
    const _origUpdateContractsTable = window.updateContractsTable;
    
    // Track if initial load happened
    let v12ContractsInitialized = false;

    window.updateContractsTable = function() {
        const searchTerm = document.getElementById('contract-search')?.value?.toLowerCase() || '';
        const activeFilter = document.querySelector('#contracts .btn-group .active')?.getAttribute('data-filter') || 'all';

        let filteredContracts = window.contracts || [];

        // Apply search
        if (searchTerm) {
            filteredContracts = filteredContracts.filter(contract =>
                (contract.number && contract.number.toLowerCase().includes(searchTerm)) ||
                (contract.client && contract.client.toLowerCase().includes(searchTerm)) ||
                (contract.employee && contract.employee.toLowerCase().includes(searchTerm))
            );
        }

        // Apply filter
        if (activeFilter === 'نشط_غير_مدفوع') {
            // Default: show only active + not fully paid
            filteredContracts = filteredContracts.filter(contract => {
                const isActive = contract.status === 'نشط';
                const isNotPaid = contract.paymentStatus !== 'مدفوع';
                const isNotExpired = !contract.endDate || new Date(contract.endDate) >= new Date();
                return isActive && isNotPaid && isNotExpired;
            });
        } else if (activeFilter !== 'all') {
            if (activeFilter === 'عقود جزئية') {
                filteredContracts = filteredContracts.filter(contract => contract.type === 'جزئي');
            } else if (activeFilter === 'منتهي') {
                const today = new Date();
                filteredContracts = filteredContracts.filter(contract => {
                    if (!contract.endDate) return false;
                    const endDate = new Date(contract.endDate);
                    return endDate < today;
                });
            } else {
                filteredContracts = filteredContracts.filter(contract =>
                    contract.paymentStatus === activeFilter
                );
            }
        }

        // Render using the existing renderFilteredContracts
        if (typeof renderFilteredContracts === 'function') {
            renderFilteredContracts(filteredContracts);
        }

        // Update counter
        const counter = document.getElementById('contractsTableCount');
        if (counter) counter.textContent = filteredContracts.length + ' عقد';

        // Add print/download buttons to each contract row
        setTimeout(() => {
            addContractPrintButtons();
        }, 50);
    };

    function addContractPrintButtons() {
        const tbody = document.getElementById('contracts-table-body');
        if (!tbody) return;

        tbody.querySelectorAll('tr').forEach(tr => {
            const lastTd = tr.querySelector('td:last-child');
            if (!lastTd) return;
            const btnGroup = lastTd.querySelector('.btn-group');
            if (!btnGroup || btnGroup.querySelector('.v12-contract-print')) return;

            // Find the contract index from the edit button's onclick
            const editBtn = btnGroup.querySelector('button.btn-outline-warning');
            if (!editBtn) return;
            const onclickStr = editBtn.getAttribute('onclick') || '';
            const match = onclickStr.match(/editContract\((\d+)\)/);
            if (!match) return;
            const contractIdx = parseInt(match[1]);

            const printBtn = document.createElement('button');
            printBtn.type = 'button';
            printBtn.className = 'btn btn-outline-info v12-contract-print';
            printBtn.title = 'طباعة العقد';
            printBtn.innerHTML = '<i class="fas fa-print"></i>';
            printBtn.onclick = function(e) { e.stopPropagation(); printContractTemplate(contractIdx); };

            const downloadBtn = document.createElement('button');
            downloadBtn.type = 'button';
            downloadBtn.className = 'btn btn-outline-dark v12-contract-download';
            downloadBtn.title = 'تحميل العقد';
            downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
            downloadBtn.onclick = function(e) { e.stopPropagation(); downloadContractTemplate(contractIdx); };

            btnGroup.appendChild(printBtn);
            btnGroup.appendChild(downloadBtn);
        });
    }

    // Setup default filter on contracts load
    function setupV12ContractFilter() {
        const contractsSection = document.getElementById('contracts');
        if (!contractsSection) return;

        const btnGroup = contractsSection.querySelector('.btn-group');
        if (!btnGroup || btnGroup.querySelector('[data-filter="نشط_غير_مدفوع"]')) return;

        // Add new default button before "الكل"
        const defaultBtn = document.createElement('button');
        defaultBtn.type = 'button';
        defaultBtn.className = 'btn btn-outline-dark';
        defaultBtn.setAttribute('data-filter', 'نشط_غير_مدفوع');
        defaultBtn.textContent = 'نشطة غير مدفوعة';

        const allBtn = btnGroup.querySelector('[data-filter="all"]');
        if (allBtn) {
            btnGroup.insertBefore(defaultBtn, allBtn);

            // Set default: click the new button
            if (!v12ContractsInitialized) {
                v12ContractsInitialized = true;
                // Remove active from all
                btnGroup.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                // Set new default as active
                defaultBtn.classList.add('active');

                // Wire up click event
                defaultBtn.addEventListener('click', function() {
                    btnGroup.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    window.updateContractsTable();
                });

                // Trigger table update
                window.updateContractsTable();
            }
        }

        // Add filter note
        if (!contractsSection.querySelector('.v12-filter-note')) {
            const note = document.createElement('div');
            note.className = 'v12-filter-note';
            note.textContent = '* يتم عرض العقود النشطة غير المدفوعة افتراضياً. اضغط "الكل" لعرض جميع العقود.';
            if (btnGroup.parentElement) btnGroup.parentElement.appendChild(note);
        }
    }


    // ==========================================================
    // INITIALIZATION
    // ==========================================================
    function initV12() {
        console.log('🔧 SuperPro V12: Initializing features...');

        // Setup contract filter
        setupV12ContractFilter();

        // Override loadInvoices
        window.loadInvoices = loadV12Invoices;

        // If invoices section is visible, reload it
        const invoicesSection = document.getElementById('invoices');
        if (invoicesSection && invoicesSection.style.display !== 'none') {
            loadV12Invoices();
        }

        // Re-render employees table to add buttons
        if (typeof window.renderEmployeesTable === 'function') {
            const tbody = document.getElementById('employees-table-body');
            if (tbody && tbody.children.length > 0) {
                window.renderEmployeesTable();
            }
        }

        console.log('✅ SuperPro V12: All features loaded!');
    }

    // Run after DOM and data are ready
    if (document.readyState === 'complete') {
        setTimeout(initV12, 1500);
    } else {
        window.addEventListener('load', () => setTimeout(initV12, 1500));
    }

    // Also re-init when modules load
    const origLoadModule = window.loadModule;
    if (typeof origLoadModule === 'function') {
        window.loadModule = function(moduleId) {
            const result = origLoadModule.apply(this, arguments);
            
            setTimeout(() => {
                if (moduleId === 'contracts') {
                    setupV12ContractFilter();
                } else if (moduleId === 'invoices') {
                    loadV12Invoices();
                } else if (moduleId === 'employees') {
                    if (typeof window.renderEmployeesTable === 'function') {
                        window.renderEmployeesTable();
                    }
                }
            }, 300);

            return result;
        };
    }

    // MutationObserver to handle dynamic content
    const v12Observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Check if employees table was re-rendered
                const empTbody = document.getElementById('employees-table-body');
                if (empTbody && empTbody.children.length > 0 && !empTbody.querySelector('.v12-print-btn')) {
                    const rows = empTbody.querySelectorAll('tr');
                    rows.forEach((tr, idx) => {
                        const btnGroup = tr.querySelector('.btn-group');
                        if (btnGroup && !btnGroup.querySelector('.v12-print-btn')) {
                            const printBtn = document.createElement('button');
                            printBtn.type = 'button';
                            printBtn.className = 'btn btn-outline-info quick-action-btn v12-print-btn';
                            printBtn.title = 'طباعة';
                            printBtn.innerHTML = '<i class="fas fa-print"></i>';
                            printBtn.onclick = function(e) { e.stopPropagation(); printEmployeeProfile(idx); };

                            const downloadBtn = document.createElement('button');
                            downloadBtn.type = 'button';
                            downloadBtn.className = 'btn btn-outline-success quick-action-btn v12-download-btn';
                            downloadBtn.title = 'تحميل';
                            downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
                            downloadBtn.onclick = function(e) { e.stopPropagation(); downloadEmployeeProfile(idx); };

                            btnGroup.insertBefore(printBtn, btnGroup.firstChild);
                            btnGroup.insertBefore(downloadBtn, printBtn.nextSibling);
                        }
                    });
                }

                // Check if contracts table was re-rendered
                const contTbody = document.getElementById('contracts-table-body');
                if (contTbody && contTbody.children.length > 0 && !contTbody.querySelector('.v12-contract-print')) {
                    setTimeout(addContractPrintButtons, 100);
                }
            }
        });
    });

    v12Observer.observe(document.body, { childList: true, subtree: true });

})();
