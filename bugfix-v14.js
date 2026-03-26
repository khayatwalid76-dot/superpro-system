/**
 * SuperPro System - BugFix V14 (Rewritten)
 * إصلاح شامل وموثوق لجميع مشاكل الطباعة والتحميل
 * 
 * المشاكل الجذرية المحلولة:
 * 1. v13 يعيد تعريف دوال الطباعة بعد v14 (initV13 بعد 800ms)
 * 2. html2pdf لا يعمل مع container مخفي (left:-9999px)
 * 3. التحميل يحفظ HTML بدلاً من PDF
 * 
 * الحل:
 * - تأخير تعريف الدوال لتعمل بعد v13 و v12
 * - استخدام نافذة جديدة للطباعة (الأكثر موثوقية)
 * - استخدام container مرئي للـ PDF مع loading overlay
 * - حماية الدوال من إعادة التعريف بواسطة الملفات القديمة
 */

(function() {
    'use strict';

    console.log('🔧 SuperPro V14: بدء تحميل إصلاحات الطباعة والتحميل...');

    // ==========================================================
    // CSS للـ loading overlay
    // ==========================================================
    var style = document.createElement('style');
    style.id = 'v14-styles';
    style.textContent = [
        '.v14-loading-overlay {',
        '  position:fixed; top:0; left:0; right:0; bottom:0;',
        '  background:rgba(255,255,255,0.95); z-index:999999;',
        '  display:flex; align-items:center; justify-content:center;',
        '  flex-direction:column; font-family:Segoe UI,Tahoma,Arial,sans-serif;',
        '}',
        '.v14-loading-overlay .v14-spinner {',
        '  width:50px; height:50px; border:4px solid #e0e0e0;',
        '  border-top-color:#667eea; border-radius:50%;',
        '  animation:v14spin 0.8s linear infinite; margin-bottom:15px;',
        '}',
        '@keyframes v14spin { to { transform:rotate(360deg); } }',
        '.v14-loading-overlay .v14-msg {',
        '  font-size:16px; font-weight:bold; color:#2c3e50;',
        '}',
        '.v14-loading-overlay .v14-sub {',
        '  font-size:12px; color:#888; margin-top:5px;',
        '}'
    ].join('\n');
    document.head.appendChild(style);


    // ==========================================================
    // CSS مشتركة للطباعة والتحميل
    // ==========================================================
    var SHARED_CSS = [
        'body{font-family:Segoe UI,Tahoma,Arial,sans-serif;direction:rtl;padding:20px 30px;color:#333;max-width:900px;margin:0 auto;background:white}',
        'table{width:100%;border-collapse:collapse;margin:10px 0}',
        'th{background:#2c3e50;color:white;padding:10px 12px;text-align:right;font-size:13px;-webkit-print-color-adjust:exact;print-color-adjust:exact}',
        'td{padding:8px 12px;border-bottom:1px solid #eee;font-size:13px}',
        'tr:nth-child(even){background:#f8f9fa;-webkit-print-color-adjust:exact;print-color-adjust:exact}',
        'h2{color:#2c3e50;font-size:20px;margin:15px 0 10px}',
        'h3{color:#2c3e50;font-size:16px;margin:15px 0 8px;border-bottom:2px solid #2c3e50;padding-bottom:5px}',
        'h4{color:#2c3e50;font-size:14px;margin:10px 0 6px}',
        '.report-summary{background:#f0f7ff;padding:15px;border-radius:8px;margin:10px 0 15px;display:flex;gap:20px;flex-wrap:wrap;-webkit-print-color-adjust:exact;print-color-adjust:exact}',
        '.summary-item{flex:1;min-width:100px;text-align:center}',
        '.num{font-size:1.5em;font-weight:bold;color:#2c3e50}',
        '.label{font-size:0.85em;color:#666}',
        '.badge-danger{background:#dc3545;color:white;padding:3px 8px;border-radius:4px;font-size:12px;-webkit-print-color-adjust:exact;print-color-adjust:exact}',
        '.badge-warning{background:#ffc107;color:#333;padding:3px 8px;border-radius:4px;font-size:12px;-webkit-print-color-adjust:exact;print-color-adjust:exact}',
        '.badge-success{background:#28a745;color:white;padding:3px 8px;border-radius:4px;font-size:12px;-webkit-print-color-adjust:exact;print-color-adjust:exact}',
        '.badge-info{background:#17a2b8;color:white;padding:3px 8px;border-radius:4px;font-size:12px;-webkit-print-color-adjust:exact;print-color-adjust:exact}',
        '.ep-header{text-align:center;margin-bottom:20px}',
        '.ep-avatar{width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);color:white;font-size:28px;font-weight:bold;display:inline-flex;align-items:center;justify-content:center;margin-bottom:10px;-webkit-print-color-adjust:exact;print-color-adjust:exact}',
        '.inv-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}',
        '.inv-logo{font-size:24px;font-weight:bold;color:#2c3e50}',
        '.inv-bill-to{background:#f8f9fa;padding:15px;border-radius:8px;margin:15px 0}',
        '.total-row{background:#e8f5e9;font-weight:bold;-webkit-print-color-adjust:exact;print-color-adjust:exact}',
        '.inv-footer{text-align:center;margin-top:30px;padding-top:15px;border-top:2px solid #eee}',
        '.contract-section{margin:15px 0;padding:12px;background:#f8f9fa;border-radius:8px}',
        '.v14-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:15px;border-bottom:3px solid #2c3e50}',
        '.v14-title{font-size:22px;font-weight:800;color:#2c3e50}',
        '.v14-company{font-size:13px;color:#666;margin-top:3px}',
        '.v14-date{font-size:12px;color:#888;text-align:left}',
        '@media print{',
        '  .no-print{display:none !important}',
        '  body{padding:10px 15px}',
        '  th{background:#2c3e50 !important;color:white !important;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important}',
        '  .badge-danger{background:#dc3545 !important;color:white !important}',
        '  .badge-warning{background:#ffc107 !important;color:#333 !important}',
        '  .badge-success{background:#28a745 !important;color:white !important}',
        '  .badge-info{background:#17a2b8 !important;color:white !important}',
        '  .report-summary{background:#f0f7ff !important}',
        '  .total-row{background:#e8f5e9 !important}',
        '  tr:nth-child(even){background:#f8f9fa !important}',
        '}'
    ].join('\n');


    // ==========================================================
    // أدوات مساعدة
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
        } catch(e) { return dateStr; }
    }

    function daysDiff(dateStr) {
        try {
            var today = new Date(); today.setHours(0,0,0,0);
            var target = new Date(dateStr); target.setHours(0,0,0,0);
            return Math.ceil((target - today) / 86400000);
        } catch(e) { return 999; }
    }

    function getCompanyName() {
        try { return (window.settings && window.settings.companyName) || 'SUPER PRO SYSTEM'; }
        catch(e) { return 'SUPER PRO SYSTEM'; }
    }

    function buildHeader(title) {
        return '<div class="v14-header">' +
            '<div><div class="v14-title">' + title + '</div>' +
            '<div class="v14-company">' + getCompanyName() + '</div></div>' +
            '<div class="v14-date">' + new Date().toLocaleDateString('ar-SA') + '</div></div>';
    }

    function showLoading(msg) {
        var el = document.createElement('div');
        el.className = 'v14-loading-overlay';
        el.id = 'v14LoadingOverlay';
        el.innerHTML = '<div class="v14-spinner"></div>' +
            '<div class="v14-msg">' + (msg || 'جاري المعالجة...') + '</div>' +
            '<div class="v14-sub">يرجى الانتظار</div>';
        document.body.appendChild(el);
        return el;
    }

    function hideLoading() {
        var el = document.getElementById('v14LoadingOverlay');
        if (el) el.parentNode.removeChild(el);
    }


    // ==========================================================
    // دالة الطباعة: نافذة جديدة (الأكثر موثوقية عبر المتصفحات)
    // ==========================================================
    function v14Print(title, htmlContent) {
        var w = window.open('', '_blank', 'width=900,height=700');
        if (!w) {
            if (typeof showToast === 'function') showToast('يرجى السماح بالنوافذ المنبثقة للطباعة', 'warning');
            return;
        }

        var html = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">' +
            '<title>' + title + '</title>' +
            '<style>' + SHARED_CSS + '</style></head><body>' +
            buildHeader(title) +
            htmlContent +
            '<script>window.onload=function(){window.print();}<\/script>' +
            '</body></html>';

        w.document.open();
        w.document.write(html);
        w.document.close();
    }


    // ==========================================================
    // دالة التحميل PDF: container مرئي + html2pdf
    // ==========================================================
    function v14DownloadPDF(filename, htmlContent) {
        var loadingEl = showLoading('جاري إنشاء ملف PDF...');
        var pdfFilename = filename.replace(/\.(html|pdf)$/i, '') + '.pdf';

        // إنشاء container مرئي (خلف overlay التحميل)
        var container = document.createElement('div');
        container.id = 'v14PdfContainer';
        container.style.cssText = 'position:fixed;left:0;top:0;width:794px;min-height:100px;' +
            'z-index:999998;background:white;padding:20px 25px;direction:rtl;' +
            'font-family:Segoe UI,Tahoma,Arial,sans-serif;color:#333;overflow:visible;';

        // إضافة الأنماط والمحتوى
        container.innerHTML = '<style>' +
            'table{width:100%;border-collapse:collapse;margin:8px 0}' +
            'th{background:#2c3e50 !important;color:white !important;padding:8px 10px;text-align:right;font-size:11px;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
            'td{padding:6px 10px;border-bottom:1px solid #eee;font-size:11px}' +
            'tr:nth-child(even){background:#f8f9fa}' +
            'h2{color:#2c3e50;font-size:16px;margin:12px 0 8px}' +
            'h3{color:#2c3e50;font-size:14px;margin:10px 0 6px;border-bottom:2px solid #2c3e50;padding-bottom:4px}' +
            'h4{color:#2c3e50;font-size:12px;margin:8px 0 4px}' +
            '.report-summary{background:#f0f7ff;padding:12px;border-radius:6px;margin:8px 0 12px;display:flex;gap:15px;flex-wrap:wrap}' +
            '.summary-item{flex:1;min-width:80px;text-align:center}' +
            '.num{font-size:1.3em;font-weight:bold;color:#2c3e50}' +
            '.label{font-size:0.75em;color:#666}' +
            '.badge-danger{background:#dc3545;color:white;padding:2px 6px;border-radius:3px;font-size:10px}' +
            '.badge-warning{background:#ffc107;color:#333;padding:2px 6px;border-radius:3px;font-size:10px}' +
            '.badge-success{background:#28a745;color:white;padding:2px 6px;border-radius:3px;font-size:10px}' +
            '.badge-info{background:#17a2b8;color:white;padding:2px 6px;border-radius:3px;font-size:10px}' +
            '.ep-header{text-align:center;margin-bottom:15px}' +
            '.ep-avatar{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);color:white;font-size:24px;font-weight:bold;display:inline-flex;align-items:center;justify-content:center;margin-bottom:8px}' +
            '.inv-header{display:flex;justify-content:space-between;margin-bottom:15px}' +
            '.inv-logo{font-size:18px;font-weight:bold;color:#2c3e50}' +
            '.inv-bill-to{background:#f8f9fa;padding:12px;border-radius:6px;margin:10px 0}' +
            '.total-row{background:#e8f5e9;font-weight:bold}' +
            '.inv-footer{text-align:center;margin-top:20px;padding-top:12px;border-top:2px solid #eee}' +
            '.contract-section{margin:10px 0;padding:10px;background:#f8f9fa;border-radius:6px}' +
            '.v14-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;padding-bottom:10px;border-bottom:3px solid #2c3e50}' +
            '.v14-title{font-size:16px;font-weight:800;color:#2c3e50}' +
            '.v14-company{font-size:11px;color:#666;margin-top:2px}' +
            '.v14-date{font-size:10px;color:#888}' +
            '</style>' +
            buildHeader(filename.replace(/[_\.]/g, ' ').replace(/\s+/g, ' ').trim()) +
            htmlContent;

        document.body.appendChild(container);

        // إعطاء وقت للمتصفح لرسم المحتوى
        setTimeout(function() {
            if (typeof html2pdf !== 'undefined') {
                try {
                    html2pdf().set({
                        margin: [8, 8, 8, 8],
                        filename: pdfFilename,
                        image: { type: 'jpeg', quality: 0.95 },
                        html2canvas: {
                            scale: 2,
                            useCORS: true,
                            logging: false,
                            letterRendering: true,
                            width: 794,
                            windowWidth: 794
                        },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                    }).from(container).save().then(function() {
                        cleanup();
                        if (typeof showToast === 'function') showToast('تم تحميل ' + pdfFilename + ' بنجاح ✅', 'success');
                    }).catch(function(err) {
                        console.error('V14 PDF error:', err);
                        cleanup();
                        fallbackDownload(filename, htmlContent);
                    });
                } catch(err) {
                    console.error('V14 PDF exception:', err);
                    cleanup();
                    fallbackDownload(filename, htmlContent);
                }
            } else {
                // لا توجد مكتبة html2pdf - استخدام الطريقة البديلة
                cleanup();
                fallbackDownload(filename, htmlContent);
            }
        }, 500);

        function cleanup() {
            try { document.body.removeChild(container); } catch(e) {}
            hideLoading();
        }
    }


    // ==========================================================
    // طريقة بديلة: فتح نافذة للطباعة/حفظ كـ PDF
    // ==========================================================
    function fallbackDownload(title, htmlContent) {
        var w = window.open('', '_blank', 'width=900,height=700');
        if (!w) {
            if (typeof showToast === 'function') showToast('يرجى السماح بالنوافذ المنبثقة لتحميل PDF', 'warning');
            return;
        }

        var html = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8">' +
            '<title>' + title + '</title>' +
            '<style>' + SHARED_CSS +
            '.dl-bar{text-align:center;margin-bottom:20px;padding:15px;background:#f0f7ff;border-radius:8px}' +
            '.dl-btn{background:#667eea;color:white;border:none;padding:10px 30px;border-radius:8px;cursor:pointer;font-size:14px;margin:5px}' +
            '.dl-btn:hover{background:#5a6fd6}' +
            '.dl-btn.green{background:#28a745}.dl-btn.green:hover{background:#218838}' +
            '</style></head><body>' +
            '<div class="dl-bar no-print">' +
            '<p style="margin:0 0 10px;color:#2c3e50;font-weight:bold">لتحميل كملف PDF: اضغط طباعة ثم اختر "حفظ كـ PDF"</p>' +
            '<button class="dl-btn" onclick="window.print()">🖨️ طباعة / حفظ كـ PDF</button>' +
            '<button class="dl-btn green" onclick="window.close()">✕ إغلاق</button>' +
            '</div>' +
            buildHeader(title) +
            htmlContent +
            '</body></html>';

        w.document.open();
        w.document.write(html);
        w.document.close();

        if (typeof showToast === 'function') showToast('تم فتح نافذة التحميل - اضغط "طباعة" ثم اختر "حفظ كـ PDF"', 'info');
    }


    // ==========================================================
    // بناء HTML بيانات الموظف
    // ==========================================================
    function getEmployeeHtml(emp) {
        if (!emp) return '';

        var totalSalary = safeNum(emp.salary) + safeNum(emp.housingAllowance) + safeNum(emp.transportAllowance) +
                         safeNum(emp.foodAllowance) + safeNum(emp.otherAllowance);

        // خصومات تأديبية
        var deductions = [];
        try {
            var stored = localStorage.getItem('superpro_disciplinary_deductions');
            if (stored) {
                var allDed = JSON.parse(stored);
                deductions = allDed.filter(function(d) { return d.employeeName === emp.name || d.employee === emp.name; });
            }
        } catch(e) {}
        var totalDeductions = deductions.reduce(function(s, d) { return s + safeNum(d.amount); }, 0);

        // عقود الموظف
        var empContracts = (window.contracts || []).filter(function(c) { return c.employee === emp.name; });
        var contractsHtml = '';
        if (empContracts.length > 0) {
            contractsHtml = '<h3>العقود المرتبطة</h3><table>' +
                '<tr><th>رقم العقد</th><th>العميل</th><th>القيمة</th><th>البدء</th><th>الانتهاء</th><th>حالة الدفع</th></tr>';
            empContracts.forEach(function(c) {
                contractsHtml += '<tr><td>' + (c.number || '') + '</td><td>' + (c.client || '') + '</td>' +
                    '<td>' + safeNum(c.amount).toLocaleString() + ' ر.ق</td>' +
                    '<td>' + fmtDate(c.startDate) + '</td><td>' + fmtDate(c.endDate) + '</td>' +
                    '<td>' + (c.paymentStatus || '-') + '</td></tr>';
            });
            contractsHtml += '</table>';
        }

        // قسم الخصومات
        var deductionsHtml = '';
        if (deductions.length > 0) {
            deductionsHtml = '<h3 style="color:#c0392b;border-bottom-color:#c0392b">الخصومات التأديبية</h3><table>' +
                '<tr><th style="background:#c0392b">التاريخ</th><th style="background:#c0392b">السبب</th><th style="background:#c0392b">النوع</th><th style="background:#c0392b">المبلغ</th></tr>';
            deductions.forEach(function(d) {
                deductionsHtml += '<tr><td>' + fmtDate(d.date) + '</td><td>' + (d.reason || '') + '</td>' +
                    '<td>' + (d.type || '') + '</td><td style="color:#c0392b">' + safeNum(d.amount).toLocaleString() + ' ر.ق</td></tr>';
            });
            deductionsHtml += '<tr style="background:#fce4ec;font-weight:bold"><td colspan="3">إجمالي الخصومات</td>' +
                '<td style="color:#c0392b">' + totalDeductions.toLocaleString() + ' ر.ق</td></tr></table>';
        }

        // حالة الإقامة
        var residencyInfo = '';
        if (emp.residencyExpiry) {
            var days = daysDiff(emp.residencyExpiry);
            if (days < 0) residencyInfo = ' <span class="badge-danger">منتهية</span>';
            else if (days <= 30) residencyInfo = ' <span class="badge-warning">تنتهي خلال ' + days + ' يوم</span>';
        }

        var initials = (emp.name || '?').charAt(0);

        return '<div class="ep-header">' +
            '<div class="ep-avatar">' + initials + '</div>' +
            '<h2 style="margin:5px 0">' + (emp.name || '') + '</h2>' +
            '<p style="color:#666">' + (emp.job || '') + ' | ' + (emp.status || 'نشط') + '</p></div>' +
            '<h3>المعلومات الشخصية</h3>' +
            '<table>' +
            '<tr><td style="width:40%;font-weight:bold">الاسم الكامل</td><td>' + (emp.name || '') + '</td></tr>' +
            '<tr><td style="font-weight:bold">الوظيفة</td><td>' + (emp.job || '-') + '</td></tr>' +
            '<tr><td style="font-weight:bold">الجنسية</td><td>' + (emp.nationality || '-') + '</td></tr>' +
            '<tr><td style="font-weight:bold">الجنس</td><td>' + (emp.gender || '-') + '</td></tr>' +
            '<tr><td style="font-weight:bold">رقم الهاتف</td><td>' + (emp.phone || '-') + '</td></tr>' +
            '<tr><td style="font-weight:bold">رقم الهوية</td><td>' + (emp.idNumber || '-') + '</td></tr>' +
            '<tr><td style="font-weight:bold">الحالة</td><td>' + (emp.status || 'نشط') + '</td></tr>' +
            '<tr><td style="font-weight:bold">تاريخ الانضمام</td><td>' + fmtDate(emp.joinDate || emp.startDate || emp.hireDate) + '</td></tr>' +
            '<tr><td style="font-weight:bold">رقم الإقامة</td><td>' + (emp.residencyNumber || emp.idNumber || '-') + '</td></tr>' +
            '<tr><td style="font-weight:bold">تاريخ انتهاء الإقامة</td><td>' + fmtDate(emp.residencyExpiry) + residencyInfo + '</td></tr>' +
            '</table>' +
            '<h3>المعلومات المالية</h3>' +
            '<table>' +
            '<tr><td style="width:40%;font-weight:bold">الراتب الأساسي</td><td>' + safeNum(emp.salary).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr><td style="font-weight:bold">بدل سكن</td><td>' + safeNum(emp.housingAllowance).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr><td style="font-weight:bold">بدل مواصلات</td><td>' + safeNum(emp.transportAllowance).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr><td style="font-weight:bold">بدل طعام</td><td>' + safeNum(emp.foodAllowance).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr><td style="font-weight:bold">بدلات أخرى</td><td>' + safeNum(emp.otherAllowance).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr class="total-row"><td style="font-weight:bold">إجمالي الراتب</td><td>' + totalSalary.toLocaleString() + ' ر.ق</td></tr>' +
            (totalDeductions > 0 ?
                '<tr style="background:#fce4ec;font-weight:bold"><td>الخصومات التأديبية</td><td style="color:#c0392b">-' + totalDeductions.toLocaleString() + ' ر.ق</td></tr>' +
                '<tr style="background:#d4edda;font-weight:bold"><td>صافي الراتب</td><td style="color:#28a745">' + (totalSalary - totalDeductions).toLocaleString() + ' ر.ق</td></tr>' : '') +
            '</table>' +
            contractsHtml + deductionsHtml +
            '<div style="text-align:center;margin-top:25px;color:#999;font-size:0.85em">تم الطباعة من نظام SuperPro بتاريخ ' + new Date().toLocaleDateString('ar-SA') + '</div>';
    }


    // ==========================================================
    // بناء HTML العقد
    // ==========================================================
    function getContractHtml(contract) {
        var clientObj = (window.clients || []).find(function(c) { return c.name === contract.client; }) || {};

        return '<h2 style="text-align:center;margin-bottom:20px">نموذج عقد تقديم خدمات</h2>' +
            '<div class="contract-section">' +
            '<h4>الطرف الأول (مقدم الخدمة)</h4>' +
            '<p><strong>الشركة:</strong> SuperPro للتنظيفات والخدمات</p>' +
            '<p><strong>الممثل:</strong> وليد الخياط</p>' +
            '<p><strong>الهاتف:</strong> +97430004595</p></div>' +
            '<div class="contract-section">' +
            '<h4>الطرف الثاني (العميل)</h4>' +
            '<p><strong>الاسم:</strong> ' + (contract.client || '-') + '</p>' +
            '<p><strong>رقم الهوية:</strong> ' + (clientObj.idNumber || clientObj.id || '-') + '</p>' +
            '<p><strong>الهاتف:</strong> ' + (clientObj.phone || '-') + '</p>' +
            (clientObj.address ? '<p><strong>العنوان:</strong> ' + clientObj.address + '</p>' : '') +
            '</div>' +
            '<div class="contract-section">' +
            '<h4>تفاصيل العقد</h4>' +
            '<table>' +
            '<tr><td style="width:40%;font-weight:bold">رقم العقد</td><td>' + (contract.number || '-') + '</td></tr>' +
            '<tr><td style="font-weight:bold">نوع العقد</td><td>' + (contract.type || '-') + '</td></tr>' +
            '<tr><td style="font-weight:bold">العامل/ة</td><td>' + (contract.employee || '-') + '</td></tr>' +
            '<tr><td style="font-weight:bold">تاريخ البدء</td><td>' + fmtDate(contract.startDate) + '</td></tr>' +
            '<tr><td style="font-weight:bold">تاريخ الانتهاء</td><td>' + fmtDate(contract.endDate) + '</td></tr>' +
            '<tr><td style="font-weight:bold">مدة العقد</td><td>' + (contract.duration || '-') + '</td></tr>' +
            '<tr class="total-row"><td style="font-weight:bold">قيمة العقد</td><td>' + safeNum(contract.amount).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr><td style="font-weight:bold">حالة الدفع</td><td>' + (contract.paymentStatus || '-') + '</td></tr>' +
            '</table></div>' +
            (contract.notes ? '<div class="contract-section"><h4>ملاحظات</h4><p>' + contract.notes + '</p></div>' : '') +
            '<div style="margin-top:30px;display:flex;justify-content:space-around">' +
            '<div style="text-align:center"><p><strong>الطرف الأول</strong></p><p style="border-top:1px dashed #999;min-width:150px;padding-top:5px;margin-top:40px">التوقيع</p></div>' +
            '<div style="text-align:center"><p><strong>الطرف الثاني</strong></p><p style="border-top:1px dashed #999;min-width:150px;padding-top:5px;margin-top:40px">التوقيع</p></div></div>' +
            '<div style="text-align:center;margin-top:20px;color:#999;font-size:0.85em">تاريخ: ' + new Date().toLocaleDateString('ar-SA') + '</div>';
    }


    // ==========================================================
    // بناء HTML الفاتورة
    // ==========================================================
    function getInvoiceHtml(inv) {
        var services = inv.services || [];
        var total = services.reduce(function(sum, s) { return sum + (parseFloat(s.amount) || 0); }, 0);
        if (total === 0 && inv.amount) total = parseFloat(inv.amount) || 0;

        var rows = '';
        if (services.length > 0) {
            services.forEach(function(s, i) {
                rows += '<tr><td>' + (i+1) + '</td><td>' + (s.description || 'Cleaning services') + '</td>' +
                    '<td style="text-align:right">' + (parseFloat(s.amount)||0).toLocaleString() + ' QAR</td></tr>';
            });
        } else {
            rows = '<tr><td>1</td><td>' + (inv.serviceType || inv.description || 'Cleaning services') + '</td>' +
                '<td style="text-align:right">' + total.toLocaleString() + ' QAR</td></tr>';
        }

        return '<div class="inv-header">' +
            '<div><div class="inv-logo">SUPER PRO</div><div style="color:#666">Cleaning & Services</div><div style="color:#666;font-size:0.85em">Qatar, Doha</div></div>' +
            '<div style="text-align:left"><div style="font-size:1.5em;font-weight:bold;color:#2c3e50">INVOICE</div>' +
            '<div><strong>Invoice #:</strong> ' + (inv.id || 'NEW') + '</div>' +
            '<div><strong>Date:</strong> ' + (inv.date || new Date().toISOString().split('T')[0]) + '</div></div></div>' +
            '<div class="inv-bill-to"><div style="display:flex;justify-content:space-between">' +
            '<div><strong>Bill To:</strong><br>' + (inv.clientName || 'N/A') + '<br>' + (inv.clientAddress || 'Qatar, Doha') +
            (inv.clientPhone ? '<br>Phone: ' + inv.clientPhone : '') + '</div>' +
            '<div style="text-align:left"><strong>For:</strong><br>' + (inv.serviceType || 'Cleaning services') + '</div></div></div>' +
            '<table><thead><tr><th style="width:50px">#</th><th>Type of Service</th><th style="width:150px;text-align:right">Amount</th></tr></thead>' +
            '<tbody>' + rows +
            '<tr class="total-row"><td colspan="2" style="text-align:right;padding-right:20px"><strong>Total Cost:</strong></td>' +
            '<td style="text-align:right"><strong>' + total.toLocaleString() + ' QAR</strong></td></tr></tbody></table>' +
            (inv.notes ? '<div style="margin:15px 0;padding:10px;background:#fff3cd;border-radius:5px"><strong>Notes:</strong> ' + inv.notes + '</div>' : '') +
            '<div class="inv-footer">' +
            '<p><strong>Make all checks payable to Super Pro Cleaning And Services</strong></p>' +
            '<p>If you have any questions concerning this invoice, contact 30004595</p>' +
            '<p style="font-size:1.1em;font-weight:bold;color:#2c3e50;margin-top:10px">Thank you for your business!</p></div>';
    }


    // ==========================================================
    // بناء HTML كشف الراتب
    // ==========================================================
    function getPayslipHtml(row) {
        return '<div style="border:2px solid #2c3e50;border-radius:12px;padding:20px;max-width:600px;margin:0 auto">' +
            '<div style="text-align:center;margin-bottom:15px"><h2 style="margin:0;color:#2c3e50">كشف راتب</h2></div>' +
            '<table>' +
            '<tr><td style="width:40%;font-weight:bold">اسم الموظف</td><td>' + (row.employee || '') + '</td></tr>' +
            '<tr><td style="font-weight:bold">الشهر</td><td>' + (row.month || '') + '</td></tr>' +
            '<tr><td style="font-weight:bold">الراتب الأساسي</td><td>' + safeNum(row.basic).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr><td style="font-weight:bold">البدلات</td><td>' + safeNum(row.allowances).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr><td style="font-weight:bold">الخصومات</td><td style="color:#dc3545">' + safeNum(row.deductions).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr><td style="font-weight:bold">أيام الغياب</td><td>' + (row.absenceDays || 0) + ' يوم</td></tr>' +
            '<tr><td style="font-weight:bold">خصم الغياب</td><td style="color:#dc3545">' + safeNum(row.absenceDeduction).toLocaleString() + ' ر.ق</td></tr>' +
            '<tr class="total-row"><td style="font-weight:bold">صافي الراتب</td><td style="color:#28a745;font-size:1.2em">' + safeNum(row.net).toLocaleString() + ' ر.ق</td></tr>' +
            '</table>' +
            '<div style="margin-top:20px;display:flex;justify-content:space-between">' +
            '<div style="text-align:center"><p style="border-top:1px dashed #999;padding-top:5px;min-width:120px">توقيع الموظف</p></div>' +
            '<div style="text-align:center"><p style="border-top:1px dashed #999;padding-top:5px;min-width:120px">توقيع المسؤول</p></div></div></div>';
    }


    // ==========================================================
    // بناء HTML الإيصال
    // ==========================================================
    function getReceiptHtml(item, type) {
        var isIncome = type === 'income';
        var title = isIncome ? 'إيصال مدخول' : 'إيصال مصروف';
        var color = isIncome ? '#28a745' : '#dc3545';

        return '<div style="border:2px solid ' + color + ';border-radius:12px;padding:20px;max-width:500px;margin:0 auto">' +
            '<div style="text-align:center;margin-bottom:15px">' +
            '<h2 style="margin:0;color:' + color + '">' + title + '</h2>' +
            '<p style="color:#666;font-size:0.85em">#' + (item.id || '') + '</p></div>' +
            '<table>' +
            '<tr><td style="width:40%;font-weight:bold">الوصف</td><td>' + (item.description || item.category || '-') + '</td></tr>' +
            '<tr><td style="font-weight:bold">التاريخ</td><td>' + fmtDate(item.date) + '</td></tr>' +
            '<tr><td style="font-weight:bold">الفئة</td><td>' + (item.category || '-') + '</td></tr>' +
            (item.client ? '<tr><td style="font-weight:bold">العميل</td><td>' + item.client + '</td></tr>' : '') +
            (item.paymentMethod ? '<tr><td style="font-weight:bold">طريقة الدفع</td><td>' + item.paymentMethod + '</td></tr>' : '') +
            '<tr style="background:' + (isIncome ? '#e8f5e9' : '#fce4ec') + ';font-weight:bold"><td>المبلغ</td>' +
            '<td style="color:' + color + ';font-size:1.2em">' + safeNum(item.amount).toLocaleString() + ' ر.ق</td></tr>' +
            '</table>' +
            (item.notes ? '<p style="margin-top:10px;padding:8px;background:#f8f9fa;border-radius:5px"><strong>ملاحظات:</strong> ' + item.notes + '</p>' : '') +
            '<div style="text-align:center;margin-top:20px;color:#999;font-size:0.8em">تم الطباعة من نظام SuperPro</div></div>';
    }


    // ==========================================================
    // بناء HTML تقرير الإقامات
    // ==========================================================
    function getResidencyReportHtml() {
        var emps = window.employees || [];
        var items = [];
        var today = new Date(); today.setHours(0,0,0,0);

        emps.forEach(function(emp) {
            if (!emp.residencyExpiry) return;
            var expDate = new Date(emp.residencyExpiry);
            if (isNaN(expDate.getTime())) return;
            expDate.setHours(0,0,0,0);
            var diff = Math.ceil((expDate - today) / 86400000);
            if (diff <= 90) {
                items.push({
                    name: emp.name || '', nationality: emp.nationality || '-',
                    job: emp.job || '-', phone: emp.phone || '-',
                    expiryDate: emp.residencyExpiry, daysDiff: diff,
                    status: diff < 0 ? 'منتهية' : diff <= 7 ? 'عاجل' : diff <= 30 ? 'قريبة' : 'تحذير'
                });
            }
        });
        items.sort(function(a, b) { return a.daysDiff - b.daysDiff; });

        var expired = items.filter(function(i) { return i.daysDiff < 0; });
        var urgent = items.filter(function(i) { return i.daysDiff >= 0 && i.daysDiff <= 7; });
        var soon = items.filter(function(i) { return i.daysDiff > 7 && i.daysDiff <= 30; });
        var warning = items.filter(function(i) { return i.daysDiff > 30; });

        var html = '<h2>📋 تقرير الإقامات المنتهية والقريبة من الانتهاء</h2>' +
            '<div class="report-summary">' +
            '<div class="summary-item"><div class="num" style="color:#dc3545">' + expired.length + '</div><div class="label">منتهية</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#fd7e14">' + urgent.length + '</div><div class="label">عاجل (7 أيام)</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#ffc107">' + soon.length + '</div><div class="label">قريبة (30 يوم)</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#17a2b8">' + warning.length + '</div><div class="label">تحذير (90 يوم)</div></div></div>';

        if (items.length === 0) {
            html += '<p style="text-align:center;color:#28a745;font-size:1.2em;padding:30px">✅ لا توجد إقامات منتهية أو قريبة من الانتهاء</p>';
        } else {
            html += '<table><thead><tr><th>#</th><th>الموظف</th><th>الجنسية</th><th>الوظيفة</th><th>الهاتف</th><th>تاريخ الانتهاء</th><th>المتبقي</th><th>الحالة</th></tr></thead><tbody>';
            items.forEach(function(item, idx) {
                var badge = item.status === 'منتهية' || item.status === 'عاجل' ? 'badge-danger' :
                           item.status === 'قريبة' ? 'badge-warning' : 'badge-info';
                var remaining = item.daysDiff < 0 ? 'منتهية منذ ' + Math.abs(item.daysDiff) + ' يوم' :
                               item.daysDiff === 0 ? 'تنتهي اليوم' : item.daysDiff + ' يوم';
                html += '<tr><td>' + (idx+1) + '</td><td><strong>' + item.name + '</strong></td><td>' + item.nationality + '</td>' +
                    '<td>' + item.job + '</td><td>' + item.phone + '</td><td>' + fmtDate(item.expiryDate) + '</td>' +
                    '<td>' + remaining + '</td><td><span class="' + badge + '">' + item.status + '</span></td></tr>';
            });
            html += '</tbody></table>';
        }
        return html;
    }


    // ==========================================================
    // بناء HTML تقرير الفواتير غير المدفوعة
    // ==========================================================
    function getUnpaidInvoicesHtml() {
        var contractsArr = window.contracts || [];
        var items = [];

        contractsArr.forEach(function(c) {
            var paid = safeNum(c.paidAmount);
            var total = safeNum(c.amount);
            var remaining = total - paid;
            if (remaining > 0 || (c.paymentStatus && c.paymentStatus !== 'مدفوع' && c.paymentStatus !== 'مدفوع بالكامل')) {
                items.push({
                    number: c.number || '-', client: c.client || '-', employee: c.employee || '-',
                    totalAmount: total, paidAmount: paid,
                    remaining: remaining > 0 ? remaining : total,
                    startDate: c.startDate, endDate: c.endDate,
                    paymentStatus: c.paymentStatus || (paid > 0 ? 'مدفوع جزئياً' : 'غير مدفوع')
                });
            }
        });

        var totalUnpaid = items.reduce(function(s, i) { return s + i.remaining; }, 0);
        var totalAmount = items.reduce(function(s, i) { return s + i.totalAmount; }, 0);
        var totalPaid = items.reduce(function(s, i) { return s + i.paidAmount; }, 0);

        var html = '<h2>📋 تقرير الفواتير غير المدفوعة</h2>' +
            '<div class="report-summary">' +
            '<div class="summary-item"><div class="num">' + items.length + '</div><div class="label">عدد الفواتير</div></div>' +
            '<div class="summary-item"><div class="num">' + totalAmount.toLocaleString() + '</div><div class="label">إجمالي (ر.ق)</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#28a745">' + totalPaid.toLocaleString() + '</div><div class="label">المدفوع (ر.ق)</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#dc3545">' + totalUnpaid.toLocaleString() + '</div><div class="label">المتبقي (ر.ق)</div></div></div>';

        if (items.length === 0) {
            html += '<p style="text-align:center;color:#28a745;font-size:1.2em;padding:30px">✅ جميع الفواتير مدفوعة</p>';
        } else {
            html += '<table><thead><tr><th>#</th><th>رقم العقد</th><th>العميل</th><th>الموظف</th><th>القيمة</th><th>المدفوع</th><th>المتبقي</th><th>البدء</th><th>الانتهاء</th><th>الحالة</th></tr></thead><tbody>';
            items.forEach(function(item, idx) {
                var badge = item.paymentStatus === 'غير مدفوع' ? 'badge-danger' : 'badge-warning';
                html += '<tr><td>' + (idx+1) + '</td><td>' + item.number + '</td><td><strong>' + item.client + '</strong></td>' +
                    '<td>' + item.employee + '</td><td>' + item.totalAmount.toLocaleString() + '</td>' +
                    '<td style="color:#28a745">' + item.paidAmount.toLocaleString() + '</td>' +
                    '<td style="color:#dc3545;font-weight:bold">' + item.remaining.toLocaleString() + '</td>' +
                    '<td>' + fmtDate(item.startDate) + '</td><td>' + fmtDate(item.endDate) + '</td>' +
                    '<td><span class="' + badge + '">' + item.paymentStatus + '</span></td></tr>';
            });
            html += '<tr style="background:#e8f5e9;font-weight:bold"><td colspan="6">الإجمالي</td>' +
                '<td style="color:#dc3545">' + totalUnpaid.toLocaleString() + ' ر.ق</td><td colspan="3"></td></tr></tbody></table>';
        }
        return html;
    }


    // ==========================================================
    // بناء HTML تقرير العقود القريبة من الانتهاء
    // ==========================================================
    function getExpiringContractsHtml(filterType) {
        var contractsArr = window.contracts || [];
        var today = new Date(); today.setHours(0,0,0,0);
        var items = [];

        contractsArr.forEach(function(c) {
            if (!c.endDate) return;
            var endDate = new Date(c.endDate);
            if (isNaN(endDate.getTime())) return;
            endDate.setHours(0,0,0,0);
            var diff = Math.ceil((endDate - today) / 86400000);
            if (diff <= 90) {
                var isPaid = c.paymentStatus === 'مدفوع' || c.paymentStatus === 'مدفوع بالكامل';
                if (filterType === 'paid' && !isPaid) return;
                if (filterType === 'unpaid' && isPaid) return;
                items.push({
                    number: c.number || '-', client: c.client || '-', employee: c.employee || '-',
                    amount: safeNum(c.amount), startDate: c.startDate, endDate: c.endDate,
                    daysDiff: diff,
                    status: diff < 0 ? 'منتهي' : diff <= 7 ? 'عاجل' : diff <= 30 ? 'قريب' : 'تحذير',
                    paymentStatus: c.paymentStatus || '-', isPaid: isPaid
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
            '<div class="report-summary">' +
            '<div class="summary-item"><div class="num" style="color:#dc3545">' + expired.length + '</div><div class="label">منتهية</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#fd7e14">' + urgent.length + '</div><div class="label">عاجل</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#ffc107">' + soon.length + '</div><div class="label">قريبة</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#17a2b8">' + warning.length + '</div><div class="label">تحذير</div></div></div>';

        if (items.length === 0) {
            html += '<p style="text-align:center;color:#28a745;font-size:1.2em;padding:30px">✅ لا توجد عقود قريبة من الانتهاء' + filterLabel + '</p>';
        } else {
            html += '<table><thead><tr><th>#</th><th>رقم العقد</th><th>العميل</th><th>الموظف</th><th>القيمة</th><th>البدء</th><th>الانتهاء</th><th>المتبقي</th><th>الدفع</th><th>الحالة</th></tr></thead><tbody>';
            items.forEach(function(item, idx) {
                var sBadge = item.status === 'منتهي' || item.status === 'عاجل' ? 'badge-danger' : item.status === 'قريب' ? 'badge-warning' : 'badge-info';
                var pBadge = item.isPaid ? 'badge-success' : 'badge-danger';
                var remaining = item.daysDiff < 0 ? 'منتهي منذ ' + Math.abs(item.daysDiff) + ' يوم' : item.daysDiff === 0 ? 'ينتهي اليوم' : item.daysDiff + ' يوم';
                html += '<tr><td>' + (idx+1) + '</td><td>' + item.number + '</td><td><strong>' + item.client + '</strong></td>' +
                    '<td>' + item.employee + '</td><td>' + item.amount.toLocaleString() + '</td>' +
                    '<td>' + fmtDate(item.startDate) + '</td><td>' + fmtDate(item.endDate) + '</td>' +
                    '<td>' + remaining + '</td><td><span class="' + pBadge + '">' + item.paymentStatus + '</span></td>' +
                    '<td><span class="' + sBadge + '">' + item.status + '</span></td></tr>';
            });
            html += '</tbody></table>';
        }
        return html;
    }


    // ==========================================================
    // تصدير Excel
    // ==========================================================
    function exportToExcel(data, sheetName, filename) {
        if (typeof XLSX === 'undefined') {
            if (typeof showToast === 'function') showToast('مكتبة Excel غير متوفرة', 'error');
            return;
        }
        var ws = XLSX.utils.json_to_sheet(data);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, filename);
        if (typeof showToast === 'function') showToast('تم تصدير ' + filename + ' بنجاح ✅', 'success');
    }


    // ==========================================================
    // تعريف جميع الدوال العامة (مع حماية من إعادة التعريف)
    // ==========================================================
    function defineAllFunctions() {
        console.log('🔧 V14: تعريف دوال الطباعة والتحميل...');

        // --------- الموظفين ---------
        window.printEmployeeProfile = function(index) {
            var emp = (window.employees || [])[index];
            if (!emp) { if (typeof showToast === 'function') showToast('لم يتم العثور على الموظف', 'error'); return; }
            v14Print('بيانات الموظف - ' + emp.name, getEmployeeHtml(emp));
        };
        window.downloadEmployeeProfile = function(index) {
            var emp = (window.employees || [])[index];
            if (!emp) { if (typeof showToast === 'function') showToast('لم يتم العثور على الموظف', 'error'); return; }
            v14DownloadPDF('بيانات_' + emp.name, getEmployeeHtml(emp));
        };

        // --------- العقود ---------
        window.printContractTemplate = function(index) {
            var contract = (window.contracts || [])[index];
            if (!contract) { if (typeof showToast === 'function') showToast('لم يتم العثور على العقد', 'error'); return; }
            v14Print('عقد - ' + (contract.client || contract.number), getContractHtml(contract));
        };
        window.downloadContractTemplate = function(index) {
            var contract = (window.contracts || [])[index];
            if (!contract) { if (typeof showToast === 'function') showToast('لم يتم العثور على العقد', 'error'); return; }
            v14DownloadPDF('عقد_' + (contract.number || contract.client || ''), getContractHtml(contract));
        };

        // --------- الفواتير ---------
        window.printV12Invoice = function(invoiceId) {
            var transactions = window.financialTransactions || [];
            var inv = transactions.find(function(t) { return t.id === invoiceId; });
            if (!inv) { if (typeof showToast === 'function') showToast('لم يتم العثور على الفاتورة', 'error'); return; }
            v14Print('فاتورة - ' + inv.id, getInvoiceHtml(inv));
        };
        window.downloadV12Invoice = function(invoiceId) {
            var transactions = window.financialTransactions || [];
            var inv = transactions.find(function(t) { return t.id === invoiceId; });
            if (!inv) { if (typeof showToast === 'function') showToast('لم يتم العثور على الفاتورة', 'error'); return; }
            v14DownloadPDF('فاتورة_' + inv.id, getInvoiceHtml(inv));
        };

        // --------- تقارير الإقامات ---------
        window.printResidencyReport = function() {
            v14Print('تقرير الإقامات المنتهية والقريبة من الانتهاء', getResidencyReportHtml());
        };
        window.downloadResidencyReport = function() {
            v14DownloadPDF('تقرير_الإقامات_' + new Date().toISOString().split('T')[0], getResidencyReportHtml());
        };
        window.downloadResidencyExcel = function() {
            var emps = window.employees || [];
            var data = [];
            var today = new Date(); today.setHours(0,0,0,0);
            emps.forEach(function(emp) {
                if (!emp.residencyExpiry) return;
                var d = new Date(emp.residencyExpiry); if (isNaN(d.getTime())) return;
                d.setHours(0,0,0,0);
                var diff = Math.ceil((d - today) / 86400000);
                if (diff <= 90) {
                    data.push({ 'الموظف': emp.name, 'الجنسية': emp.nationality || '', 'الوظيفة': emp.job || '',
                        'الهاتف': emp.phone || '', 'تاريخ الانتهاء': emp.residencyExpiry, 'الأيام المتبقية': diff });
                }
            });
            exportToExcel(data, 'الإقامات', 'تقرير_الإقامات.xlsx');
        };

        // --------- تقارير فواتير غير مدفوعة ---------
        window.printUnpaidInvoicesReport = function() {
            v14Print('تقرير الفواتير غير المدفوعة', getUnpaidInvoicesHtml());
        };
        window.downloadUnpaidInvoicesReport = function() {
            v14DownloadPDF('تقرير_فواتير_غير_مدفوعة_' + new Date().toISOString().split('T')[0], getUnpaidInvoicesHtml());
        };

        // --------- تقارير العقود القريبة من الانتهاء ---------
        window.printExpiringContractsReport = function(type) {
            v14Print('تقرير العقود القريبة من الانتهاء', getExpiringContractsHtml(type || 'all'));
        };
        window.downloadExpiringContractsReport = function(type) {
            var t = type || 'all';
            var suffix = t === 'paid' ? '_مدفوعة' : t === 'unpaid' ? '_غير_مدفوعة' : '';
            v14DownloadPDF('تقرير_عقود' + suffix + '_' + new Date().toISOString().split('T')[0], getExpiringContractsHtml(t));
        };

        // --------- كشوف الرواتب ---------
        window.printPayslip = function(index) {
            var rows = window.__lastPayrollRows || [];
            var row = rows[index];
            if (!row) { if (typeof showToast === 'function') showToast('لم يتم العثور على كشف الراتب', 'error'); return; }
            v14Print('كشف راتب - ' + row.employee, getPayslipHtml(row));
        };
        window.printPayslipByEmployee = function(employeeName, month) {
            var rows = window.__lastPayrollRows || [];
            var row = rows.find(function(r) { return r.employee === employeeName && r.month === month; }) ||
                      rows.find(function(r) { return r.employee === employeeName; });
            if (!row) { if (typeof showToast === 'function') showToast('لا يوجد كشف راتب لهذا الموظف', 'warning'); return; }
            v14Print('كشف راتب - ' + row.employee, getPayslipHtml(row));
        };

        // --------- إيصالات ---------
        window.printIncomeReceipt = function(id) {
            var items = window.dailyIncome || [];
            var item = items.find(function(i) { return i.id == id; });
            if (!item) { if (typeof showToast === 'function') showToast('لم يتم العثور على الإيصال', 'error'); return; }
            v14Print('إيصال مدخول #' + id, getReceiptHtml(item, 'income'));
        };
        window.printExpenseReceipt = function(id) {
            var items = window.dailyExpenses || [];
            var item = items.find(function(i) { return i.id == id; });
            if (!item) { if (typeof showToast === 'function') showToast('لم يتم العثور على الإيصال', 'error'); return; }
            v14Print('إيصال مصروف #' + id, getReceiptHtml(item, 'expense'));
        };

        // --------- دالة printHtml العامة ---------
        window.printHtml = function(title, htmlContent) {
            v14Print(title, htmlContent);
        };

        // --------- تصدير PDF عام ---------
        window.exportToPDF = function(title, description) {
            var html = '<h2>' + title + '</h2>' + (description ? '<p>' + description + '</p>' : '');
            var activeModule = document.querySelector('.module-container.active-module, .module-container[style*="display: block"]');
            if (activeModule) {
                activeModule.querySelectorAll('table').forEach(function(t) { html += t.outerHTML; });
            }
            v14DownloadPDF(title, html);
        };

        // --------- تصدير Excel عام ---------
        window.exportEmployeeReport = function() {
            var data = (window.employees || []).map(function(emp) {
                return { 'الاسم': emp.name || '', 'الوظيفة': emp.job || '', 'الجنسية': emp.nationality || '',
                    'الهاتف': emp.phone || '', 'الحالة': emp.status || '', 'الراتب': safeNum(emp.salary),
                    'تاريخ الانضمام': emp.joinDate || emp.startDate || '', 'انتهاء الإقامة': emp.residencyExpiry || '' };
            });
            exportToExcel(data, 'الموظفين', 'تقرير_الموظفين_' + new Date().toISOString().split('T')[0] + '.xlsx');
        };

        window.exportFinanceReport = function() {
            if (typeof XLSX === 'undefined') return;
            var incData = (window.dailyIncome || []).map(function(i) {
                return { 'الوصف': i.description || '', 'المبلغ': safeNum(i.amount), 'التاريخ': i.date || '', 'الفئة': i.category || '' };
            });
            var expData = (window.dailyExpenses || []).map(function(e) {
                return { 'الوصف': e.description || '', 'المبلغ': safeNum(e.amount), 'التاريخ': e.date || '', 'الفئة': e.category || '' };
            });
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(incData), 'الإيرادات');
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expData), 'المصروفات');
            XLSX.writeFile(wb, 'التقرير_المالي_' + new Date().toISOString().split('T')[0] + '.xlsx');
            if (typeof showToast === 'function') showToast('تم تصدير التقرير المالي ✅', 'success');
        };

        window.exportAttendanceReport = function() {
            var data = (window.attendanceRecords || []).map(function(r) {
                return { 'الموظف': r.employee || '', 'التاريخ': r.date || '', 'الدخول': r.checkIn || '', 'الخروج': r.checkOut || '', 'الحالة': r.status || '' };
            });
            exportToExcel(data, 'الحضور', 'تقرير_الحضور_' + new Date().toISOString().split('T')[0] + '.xlsx');
        };

        console.log('✅ V14: تم تعريف جميع دوال الطباعة والتحميل بنجاح');
    }


    // ==========================================================
    // حارس الدوال - يمنع v13/v12 من إعادة التعريف
    // ==========================================================
    function protectFunctions() {
        var protectedFns = [
            'printEmployeeProfile', 'downloadEmployeeProfile',
            'printContractTemplate', 'downloadContractTemplate',
            'printV12Invoice', 'downloadV12Invoice',
            'printHtml', 'exportToPDF',
            'printResidencyReport', 'downloadResidencyReport',
            'printUnpaidInvoicesReport', 'downloadUnpaidInvoicesReport',
            'printExpiringContractsReport', 'downloadExpiringContractsReport',
            'printPayslip', 'printPayslipByEmployee',
            'printIncomeReceipt', 'printExpenseReceipt'
        ];

        protectedFns.forEach(function(fnName) {
            var originalFn = window[fnName];
            if (typeof originalFn === 'function') {
                try {
                    Object.defineProperty(window, fnName, {
                        get: function() { return originalFn; },
                        set: function(newFn) {
                            // السماح فقط لـ v14 بالتعديل
                            console.log('⚠️ V14: تم حظر محاولة إعادة تعريف ' + fnName);
                        },
                        configurable: true
                    });
                } catch(e) {
                    // في حالة فشل defineProperty
                    console.warn('V14: لا يمكن حماية ' + fnName);
                }
            }
        });

        console.log('🛡️ V14: تم حماية ' + protectedFns.length + ' دالة من إعادة التعريف');
    }


    // ==========================================================
    // التهيئة - تعمل بعد جميع الملفات الأخرى
    // ==========================================================
    function initV14() {
        console.log('🔧 V14: بدء التهيئة النهائية...');

        // إخفاء printArea الأصلي
        var oldArea = document.getElementById('printArea');
        if (oldArea) {
            oldArea.style.display = 'none';
            oldArea.innerHTML = '';
        }

        // إزالة أي printing class عالقة
        document.body.classList.remove('printing');
        document.body.classList.remove('v14-printing');

        // تعريف الدوال
        defineAllFunctions();

        // حماية الدوال من إعادة التعريف بواسطة الملفات القديمة
        protectFunctions();

        console.log('✅ SuperPro V14: جاهز - الطباعة والتحميل يعملان بشكل صحيح');
        console.log('   📄 الطباعة: نافذة جديدة (موثوقة عبر المتصفحات)');
        console.log('   📥 التحميل: PDF حقيقي عبر html2pdf.js');
        console.log('   🛡️ الدوال محمية من إعادة التعريف');
    }

    // تنفيذ بعد 3 ثوانٍ لضمان تحميل v12 (1.5s) و v13 (800ms) أولاً
    // ثم نعيد تعريف الدوال ونحميها
    var INIT_DELAY = 3000;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initV14, INIT_DELAY);
        });
    } else {
        setTimeout(initV14, INIT_DELAY);
    }

    // تنفيذ إضافي عند تغيير الصفحة (loadModule) لإعادة فرض الدوال
    var _origLoadModule = window.loadModule;
    if (typeof _origLoadModule === 'function') {
        window.loadModule = function() {
            var result = _origLoadModule.apply(this, arguments);
            // إعادة تعريف الدوال بعد تغيير الوحدة
            setTimeout(function() {
                defineAllFunctions();
                protectFunctions();
            }, 500);
            return result;
        };
    }

})();
