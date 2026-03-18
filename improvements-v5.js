/**
 * ====================================================
 *  SUPER_PRO SYSTEM - Improvements V5
 *  التحسينات العشرة الشاملة
 * ====================================================
 * 1. PWA كامل + Push Notifications
 * 2. تقارير PDF احترافية
 * 3. تنبيهات ذكية للإقامات والعقود
 * 4. رسوم بيانية تفاعلية
 * 5. نظام صلاحيات متقدم
 * 6. بحث شامل عالمي
 * 7. سجل تغييرات كامل
 * 8. نظام ملاحظات
 * 9. تقويم متكامل
 * 10. وضع ليلي محسّن
 */

// =========================================================
// IMPROVEMENT 1: PWA + PUSH NOTIFICATIONS (LOCAL)
// =========================================================
const PWAManager = {
  async init() {
    // طلب إذن الإشعارات
    if ('Notification' in window) {
      const permission = Notification.permission;
      if (permission === 'default') {
        await Notification.requestPermission();
      }
    }
    // تسجيل Service Worker إذا لم يكن مسجلاً
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.ready;
        console.log('✅ PWA: Service Worker جاهز');
      } catch (e) {
        console.warn('⚠️ PWA:', e.message);
      }
    }
    // زر تثبيت التطبيق
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window._pwaInstallPrompt = e;
      PWAManager.showInstallButton();
    });
  },

  showInstallButton() {
    const btn = document.getElementById('pwaInstallBtn');
    if (btn) btn.style.display = 'inline-flex';
  },

  async install() {
    if (window._pwaInstallPrompt) {
      window._pwaInstallPrompt.prompt();
      const result = await window._pwaInstallPrompt.userChoice;
      if (result.outcome === 'accepted') {
        showToast('✅ تم تثبيت التطبيق على الشاشة الرئيسية!', 'success');
        const btn = document.getElementById('pwaInstallBtn');
        if (btn) btn.style.display = 'none';
      }
    } else {
      showToast('💡 أضف الموقع إلى شاشتك الرئيسية من متصفح الجوال', 'info');
    }
  },

  sendLocalNotification(title, body, icon = '📊') {
    if (Notification.permission === 'granted') {
      const n = new Notification(title, {
        body,
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSIxMiIgZmlsbD0iIzJjM2U1MCIvPjx0ZXh0IHg9IjMyIiB5PSI0NCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIzMiI+8J+TijwvdGV4dD48L3N2Zz4=',
        badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSIxMiIgZmlsbD0iIzJjM2U1MCIvPjwvc3ZnPg==',
        tag: 'superpro-alert',
        requireInteraction: false,
        silent: false
      });
      n.onclick = () => { window.focus(); n.close(); };
      setTimeout(() => n.close(), 6000);
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then(p => {
        if (p === 'granted') this.sendLocalNotification(title, body);
      });
    }
  }
};

// =========================================================
// IMPROVEMENT 2: PDF REPORTS (jsPDF)
// =========================================================
const PDFReports = {
  // تحميل مكتبة jsPDF
  async load() {
    if (window.jspdf && window.jspdf.jsPDF) return true;
    return new Promise((resolve) => {
      if (document.querySelector('script[data-jspdf]')) { resolve(false); return; }
      const s1 = document.createElement('script');
      s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s1.setAttribute('data-jspdf', 'true');
      s1.onload = () => {
        const s2 = document.createElement('script');
        s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
        s2.onload = () => resolve(true);
        document.head.appendChild(s2);
      };
      document.head.appendChild(s1);
    });
  },

  // رأس الصفحة
  addHeader(doc, title, subtitle = '') {
    const w = doc.internal.pageSize.getWidth();
    // خلفية الرأس
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, w, 35, 'F');
    // عنوان النظام
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('SUPER_PRO SYSTEM', w / 2, 14, { align: 'center' });
    doc.setFontSize(11);
    doc.text(title, w / 2, 22, { align: 'center' });
    if (subtitle) {
      doc.setFontSize(9);
      doc.setTextColor(180, 210, 240);
      doc.text(subtitle, w / 2, 30, { align: 'center' });
    }
    // تاريخ الطباعة
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(8);
    const now = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text('تاريخ الطباعة: ' + now, 14, 30);
    doc.setTextColor(0, 0, 0);
    return 42;
  },

  addFooter(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const w = doc.internal.pageSize.getWidth();
      const h = doc.internal.pageSize.getHeight();
      doc.setFillColor(44, 62, 80);
      doc.rect(0, h - 12, w, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('SUPER_PRO SYSTEM - نظام الإدارة المتكامل', 14, h - 4);
      doc.text(`صفحة ${i} من ${pageCount}`, w - 14, h - 4, { align: 'right' });
    }
  },

  // تقرير الرواتب
  async exportPayroll(month = '') {
    await this.load();
    if (!window.jspdf) { showToast('جاري تحميل مكتبة PDF...', 'info'); setTimeout(() => this.exportPayroll(month), 1500); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const startY = this.addHeader(doc, 'كشف الرواتب الشهري', month ? 'شهر: ' + month : '');

    const payrollData = (appData.payroll && appData.payroll.length > 0) ? appData.payroll : (appData.employees || []).map(e => ({
      name: e.name || e.employeeName || '-',
      position: e.position || e.job || '-',
      baseSalary: e.salary || e.baseSalary || 0,
      allowances: e.allowances || 0,
      deductions: e.deductions || 0,
      netSalary: (parseFloat(e.salary || e.baseSalary || 0) + parseFloat(e.allowances || 0) - parseFloat(e.deductions || 0))
    }));

    const tableData = payrollData.map((p, i) => [
      (i + 1).toString(),
      p.name || p.employeeName || '-',
      p.position || p.job || '-',
      formatCurrency(p.baseSalary || p.salary || 0),
      formatCurrency(p.allowances || 0),
      formatCurrency(p.deductions || 0),
      formatCurrency(p.netSalary || p.net || (parseFloat(p.baseSalary || p.salary || 0) + parseFloat(p.allowances || 0) - parseFloat(p.deductions || 0)))
    ]);

    const total = payrollData.reduce((s, p) => s + parseFloat(p.netSalary || p.net || p.salary || p.baseSalary || 0), 0);

    doc.autoTable({
      startY,
      head: [['#', 'الاسم', 'المنصب', 'الراتب الأساسي', 'البدلات', 'الخصومات', 'صافي الراتب']],
      body: tableData,
      foot: [['', '', 'الإجمالي', '', '', '', formatCurrency(total)]],
      theme: 'striped',
      headStyles: { fillColor: [52, 152, 219], textColor: 255, fontStyle: 'bold', halign: 'center' },
      footStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 248, 255] },
      styles: { halign: 'center', fontSize: 10, font: 'helvetica' },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
      margin: { top: 5, left: 10, right: 10 }
    });

    this.addFooter(doc);
    doc.save('كشف_الرواتب_' + (month || new Date().toLocaleDateString('ar')).replace(/\//g, '-') + '.pdf');
    showToast('✅ تم تصدير كشف الرواتب PDF بنجاح!', 'success');
  },

  // تقرير العملاء
  async exportClients() {
    await this.load();
    if (!window.jspdf) { showToast('جاري تحميل مكتبة PDF...', 'info'); setTimeout(() => this.exportClients(), 1500); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const startY = this.addHeader(doc, 'قائمة العملاء', 'تقرير شامل بجميع بيانات العملاء');

    const clients = appData.clients || [];
    const tableData = clients.map((c, i) => [
      (i + 1).toString(),
      c.name || c.clientName || '-',
      c.phone || c.mobile || '-',
      c.nationality || '-',
      c.iqamaExpiry || c.residencyExpiry || '-',
      c.status || 'نشط'
    ]);

    doc.autoTable({
      startY,
      head: [['#', 'الاسم', 'الهاتف', 'الجنسية', 'انتهاء الإقامة', 'الحالة']],
      body: tableData.length > 0 ? tableData : [['', 'لا توجد بيانات', '', '', '', '']],
      theme: 'striped',
      headStyles: { fillColor: [39, 174, 96], textColor: 255, fontStyle: 'bold', halign: 'center' },
      alternateRowStyles: { fillColor: [240, 255, 240] },
      styles: { halign: 'center', fontSize: 9 },
      columnStyles: { 1: { halign: 'right' } },
      margin: { top: 5, left: 10, right: 10 }
    });

    // إحصائيات
    const y = doc.lastAutoTable.finalY + 10;
    doc.setFillColor(52, 152, 219);
    doc.roundedRect(10, y, 55, 18, 3, 3, 'F');
    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.text('إجمالي العملاء', 37, y + 7, { align: 'center' });
    doc.setFontSize(16);
    doc.text(clients.length.toString(), 37, y + 15, { align: 'center' });

    this.addFooter(doc);
    doc.save('تقرير_العملاء_' + new Date().toLocaleDateString('ar').replace(/\//g, '-') + '.pdf');
    showToast('✅ تم تصدير تقرير العملاء PDF بنجاح!', 'success');
  },

  // تقرير مالي شامل
  async exportFinancialReport() {
    await this.load();
    if (!window.jspdf) { showToast('جاري تحميل مكتبة PDF...', 'info'); setTimeout(() => this.exportFinancialReport(), 1500); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const w = doc.internal.pageSize.getWidth();

    const startY = this.addHeader(doc, 'التقرير المالي الشامل', 'ملخص الإيرادات والمصروفات');

    // ملخص سريع
    const totalIncome = (appData.income || []).reduce((s, i) => s + parseFloat(i.amount || 0), 0);
    const totalExpenses = (appData.expenses || []).reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    const netProfit = totalIncome - totalExpenses;

    const cards = [
      { label: 'إجمالي الإيرادات', val: formatCurrency(totalIncome), color: [39, 174, 96] },
      { label: 'إجمالي المصروفات', val: formatCurrency(totalExpenses), color: [231, 76, 60] },
      { label: 'صافي الربح', val: formatCurrency(netProfit), color: netProfit >= 0 ? [52, 152, 219] : [231, 76, 60] }
    ];
    let cx = 10;
    cards.forEach(card => {
      doc.setFillColor(...card.color);
      doc.roundedRect(cx, startY, 58, 22, 3, 3, 'F');
      doc.setTextColor(255);
      doc.setFontSize(8);
      doc.text(card.label, cx + 29, startY + 8, { align: 'center' });
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(card.val, cx + 29, startY + 17, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      cx += 63;
    });

    // جدول الإيرادات
    doc.setTextColor(0);
    let y2 = startY + 30;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('سجل الإيرادات', w - 14, y2, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    const incomeRows = (appData.income || []).slice(-20).map((item, i) => [
      (i + 1).toString(),
      item.description || item.source || '-',
      item.date || '-',
      formatCurrency(item.amount || 0)
    ]);

    doc.autoTable({
      startY: y2 + 5,
      head: [['#', 'البيان', 'التاريخ', 'المبلغ']],
      body: incomeRows.length > 0 ? incomeRows : [['', 'لا توجد بيانات', '', '']],
      theme: 'striped',
      headStyles: { fillColor: [39, 174, 96], textColor: 255, halign: 'center' },
      styles: { halign: 'center', fontSize: 9 },
      margin: { left: 10, right: 10 }
    });

    this.addFooter(doc);
    doc.save('التقرير_المالي_' + new Date().toLocaleDateString('ar').replace(/\//g, '-') + '.pdf');
    showToast('✅ تم تصدير التقرير المالي PDF بنجاح!', 'success');
  }
};

function formatCurrency(val) {
  const currency = localStorage.getItem('currency') || 'ر.ق';
  return parseFloat(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 0 }) + ' ' + currency;
}

// =========================================================
// IMPROVEMENT 3: SMART ALERTS (تنبيهات ذكية)
// =========================================================
const SmartAlerts = {
  checkIntervalId: null,

  init() {
    this.checkAll();
    // فحص كل 6 ساعات
    this.checkIntervalId = setInterval(() => this.checkAll(), 6 * 60 * 60 * 1000);
  },

  checkAll() {
    this.checkResidencyExpiry();
    this.checkContractExpiry();
    this.checkPayrollReminder();
  },

  getDaysUntil(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d)) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  },

  checkResidencyExpiry() {
    const clients = appData.clients || [];
    const employees = appData.employees || [];
    const all = [...clients, ...employees];
    const alertItems = [];

    all.forEach(item => {
      const fields = [item.iqamaExpiry, item.residencyExpiry, item.iqamaExpireDate, item.passportExpiry];
      fields.forEach(dateField => {
        if (!dateField) return;
        const days = this.getDaysUntil(dateField);
        if (days !== null && days <= 60 && days >= 0) {
          alertItems.push({ name: item.name || item.employeeName || item.clientName || 'غير محدد', days, type: 'إقامة/وثيقة', date: dateField });
        }
      });
    });

    this.renderAlerts('residencyAlerts', alertItems, 'إقامة');
    if (alertItems.length > 0) {
      this.showAlertBadge(alertItems.length);
      if (alertItems.some(a => a.days <= 7)) {
        PWAManager.sendLocalNotification('⚠️ تنبيه: إقامات منتهية قريباً', `${alertItems.filter(a => a.days <= 7).length} وثيقة تنتهي خلال 7 أيام`);
      }
    }
    return alertItems;
  },

  checkContractExpiry() {
    const contracts = appData.contracts || [];
    const alertItems = [];

    contracts.forEach(c => {
      const dateField = c.endDate || c.contractEndDate || c.expiryDate;
      if (!dateField) return;
      const days = this.getDaysUntil(dateField);
      if (days !== null && days <= 30 && days >= 0) {
        alertItems.push({ name: c.clientName || c.name || c.contractName || 'عقد', days, type: 'عقد', date: dateField });
      }
    });

    this.renderAlerts('contractAlerts', alertItems, 'عقد');
    if (alertItems.length > 0 && alertItems.some(a => a.days <= 5)) {
      PWAManager.sendLocalNotification('📋 تنبيه: عقود تنتهي قريباً', `${alertItems.filter(a => a.days <= 5).length} عقد ينتهي خلال 5 أيام`);
    }
    return alertItems;
  },

  checkPayrollReminder() {
    const today = new Date();
    const dayOfMonth = today.getDate();
    if (dayOfMonth >= 28 && dayOfMonth <= 31) {
      const key = 'payrollReminderMonth_' + today.getFullYear() + '_' + today.getMonth();
      if (!localStorage.getItem(key)) {
        setTimeout(() => {
          PWAManager.sendLocalNotification('💰 تذكير: موعد الرواتب', 'اقترب موعد صرف رواتب الموظفين');
          localStorage.setItem(key, '1');
        }, 3000);
      }
    }
  },

  renderAlerts(containerId, items, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (items.length === 0) {
      container.innerHTML = `<div class="alert alert-success"><i class="fas fa-check-circle me-2"></i>لا توجد ${type}ات تنتهي قريباً</div>`;
      return;
    }
    container.innerHTML = items.map(item => `
      <div class="alert ${item.days <= 7 ? 'alert-danger' : item.days <= 14 ? 'alert-warning' : 'alert-info'} d-flex align-items-center mb-2">
        <div class="me-3 fs-4">${item.days <= 7 ? '🚨' : item.days <= 14 ? '⚠️' : '📅'}</div>
        <div class="flex-grow-1">
          <strong>${item.name}</strong> - ${item.type}
          <br><small>تاريخ الانتهاء: ${item.date} | <strong>متبقي: ${item.days} يوم</strong></small>
        </div>
        <span class="badge ${item.days <= 7 ? 'bg-danger' : item.days <= 14 ? 'bg-warning text-dark' : 'bg-info'}">
          ${item.days} يوم
        </span>
      </div>
    `).join('');
  },

  showAlertBadge(count) {
    // تحديث badge في القائمة
    const navAlerts = document.querySelectorAll('[data-module="notifications"] .badge, #alertsBadge');
    navAlerts.forEach(b => { b.textContent = count; b.style.display = 'inline'; });
  }
};

// =========================================================
// IMPROVEMENT 4: INTERACTIVE CHARTS (رسوم بيانية)
// =========================================================
const ChartsManager = {
  charts: {},

  async init() {
    // تحميل Chart.js إذا لم يكن محملاً
    if (!window.Chart) {
      await new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        s.onload = resolve;
        document.head.appendChild(s);
      });
    }
    this.renderIncomeExpenseChart();
    this.renderMonthlyComparisonChart();
    this.renderEmployeeDistributionChart();
  },

  getMonthlyData(dataArray, amountKey = 'amount', dateKey = 'date') {
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const monthlyTotals = new Array(12).fill(0);
    (dataArray || []).forEach(item => {
      const d = new Date(item[dateKey] || item.createdAt || '');
      if (!isNaN(d)) {
        const m = d.getMonth();
        monthlyTotals[m] += parseFloat(item[amountKey] || 0);
      }
    });
    return { labels: months, data: monthlyTotals };
  },

  renderIncomeExpenseChart() {
    const canvas = document.getElementById('incomeChart');
    if (!canvas || !window.Chart) return;
    if (this.charts.income) { this.charts.income.destroy(); }
    const incData = this.getMonthlyData(appData.income);
    this.charts.income = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: incData.labels,
        datasets: [{
          label: 'الإيرادات',
          data: incData.data,
          backgroundColor: 'rgba(39, 174, 96, 0.7)',
          borderColor: 'rgb(39, 174, 96)',
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          tooltip: { callbacks: { label: ctx => formatCurrency(ctx.raw) } }
        },
        scales: { y: { beginAtZero: true, ticks: { callback: v => formatCurrency(v) } } }
      }
    });
  },

  renderExpensesChart() {
    const canvas = document.getElementById('expensesChart');
    if (!canvas || !window.Chart) return;
    if (this.charts.expenses) { this.charts.expenses.destroy(); }
    const expData = this.getMonthlyData(appData.expenses);
    this.charts.expenses = new Chart(canvas, {
      type: 'line',
      data: {
        labels: expData.labels,
        datasets: [{
          label: 'المصروفات',
          data: expData.data,
          borderColor: 'rgb(231, 76, 60)',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { tooltip: { callbacks: { label: ctx => formatCurrency(ctx.raw) } } },
        scales: { y: { beginAtZero: true } }
      }
    });
  },

  renderMonthlyComparisonChart() {
    const canvas = document.getElementById('monthlyComparisonChart');
    if (!canvas || !window.Chart) return;
    if (this.charts.comparison) { this.charts.comparison.destroy(); }
    const incData = this.getMonthlyData(appData.income);
    const expData = this.getMonthlyData(appData.expenses);
    this.charts.comparison = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: incData.labels,
        datasets: [
          { label: 'الإيرادات', data: incData.data, backgroundColor: 'rgba(39,174,96,0.8)', borderRadius: 4 },
          { label: 'المصروفات', data: expData.data, backgroundColor: 'rgba(231,76,60,0.8)', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' }, tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + formatCurrency(ctx.raw) } } },
        scales: { y: { beginAtZero: true } }
      }
    });
  },

  renderEmployeeDistributionChart() {
    const canvas = document.getElementById('employeeDistChart');
    if (!canvas || !window.Chart) return;
    if (this.charts.empDist) { this.charts.empDist.destroy(); }
    const employees = appData.employees || [];
    const nationalities = {};
    employees.forEach(e => {
      const nat = e.nationality || 'غير محدد';
      nationalities[nat] = (nationalities[nat] || 0) + 1;
    });
    const labels = Object.keys(nationalities);
    const data = Object.values(nationalities);
    const colors = ['#3498db','#2ecc71','#e74c3c','#f39c12','#9b59b6','#1abc9c','#e67e22','#34495e'];
    this.charts.empDist = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels.length > 0 ? labels : ['لا توجد بيانات'],
        datasets: [{
          data: data.length > 0 ? data : [1],
          backgroundColor: colors.slice(0, Math.max(labels.length, 1)),
          borderWidth: 2
        }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  },

  refreshAll() {
    if (!window.Chart) { this.init(); return; }
    this.renderIncomeExpenseChart();
    this.renderExpensesChart();
    this.renderMonthlyComparisonChart();
    this.renderEmployeeDistributionChart();
  }
};

// =========================================================
// IMPROVEMENT 5: ADVANCED PERMISSIONS (صلاحيات متقدمة)
// =========================================================
const PermissionsManager = {
  defaultPermissions: {
    admin: { dashboard: { r:1,w:1,d:1 }, employees: { r:1,w:1,d:1 }, clients: { r:1,w:1,d:1 }, contracts: { r:1,w:1,d:1 }, finance: { r:1,w:1,d:1 }, payroll: { r:1,w:1,d:1 }, reports: { r:1,w:1,d:1 }, settings: { r:1,w:1,d:1 }, analytics: { r:1,w:1,d:1 }, security: { r:1,w:1,d:1 } },
    supervisor: { dashboard: { r:1,w:1,d:0 }, employees: { r:1,w:1,d:0 }, clients: { r:1,w:1,d:0 }, contracts: { r:1,w:1,d:0 }, finance: { r:1,w:0,d:0 }, payroll: { r:1,w:0,d:0 }, reports: { r:1,w:1,d:0 }, settings: { r:0,w:0,d:0 }, analytics: { r:1,w:0,d:0 }, security: { r:0,w:0,d:0 } },
    viewer: { dashboard: { r:1,w:0,d:0 }, employees: { r:1,w:0,d:0 }, clients: { r:1,w:0,d:0 }, contracts: { r:1,w:0,d:0 }, finance: { r:0,w:0,d:0 }, payroll: { r:0,w:0,d:0 }, reports: { r:1,w:0,d:0 }, settings: { r:0,w:0,d:0 }, analytics: { r:1,w:0,d:0 }, security: { r:0,w:0,d:0 } }
  },

  sectionLabels: {
    dashboard: 'لوحة المراقبة', employees: 'الموظفين', clients: 'العملاء',
    contracts: 'العقود', finance: 'المالية', payroll: 'الرواتب',
    reports: 'التقارير', settings: 'الإعدادات', analytics: 'التحليلات', security: 'الأمان'
  },

  getPermissions() {
    try {
      const saved = localStorage.getItem('superpro_permissions');
      return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(this.defaultPermissions));
    } catch { return JSON.parse(JSON.stringify(this.defaultPermissions)); }
  },

  savePermissions(perms) {
    localStorage.setItem('superpro_permissions', JSON.stringify(perms));
    showToast('✅ تم حفظ الصلاحيات بنجاح', 'success');
  },

  hasPermission(section, action = 'r') {
    const role = (currentUser && currentUser.role) || 'viewer';
    const perms = this.getPermissions();
    return perms[role] && perms[role][section] && perms[role][section][action] === 1;
  },

  renderPermissionsMatrix() {
    const container = document.getElementById('permissionsMatrix');
    if (!container) return;
    const perms = this.getPermissions();
    const roles = ['admin', 'supervisor', 'viewer'];
    const roleLabels = { admin: '👑 مدير', supervisor: '👔 مشرف', viewer: '👁️ مشاهد' };
    const sections = Object.keys(this.sectionLabels);

    container.innerHTML = `
      <div class="table-responsive">
        <table class="table table-bordered table-hover text-center align-middle">
          <thead class="table-dark">
            <tr>
              <th>القسم</th>
              ${roles.map(r => `<th colspan="3">${roleLabels[r]}<br><small class="text-muted fw-normal">قراءة / كتابة / حذف</small></th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${sections.map(section => `
              <tr>
                <td class="fw-bold text-start">${this.sectionLabels[section]}</td>
                ${roles.map(role => `
                  <td><input type="checkbox" class="form-check-input perm-check" data-role="${role}" data-section="${section}" data-action="r" ${perms[role]?.[section]?.r ? 'checked' : ''} ${role === 'admin' ? 'disabled' : ''}></td>
                  <td><input type="checkbox" class="form-check-input perm-check" data-role="${role}" data-section="${section}" data-action="w" ${perms[role]?.[section]?.w ? 'checked' : ''} ${role === 'admin' ? 'disabled' : ''}></td>
                  <td><input type="checkbox" class="form-check-input perm-check" data-role="${role}" data-section="${section}" data-action="d" ${perms[role]?.[section]?.d ? 'checked' : ''} ${role === 'admin' ? 'disabled' : ''}></td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <button class="btn btn-success" onclick="PermissionsManager.saveFromMatrix()"><i class="fas fa-save me-2"></i>حفظ الصلاحيات</button>
      <button class="btn btn-outline-secondary ms-2" onclick="PermissionsManager.resetToDefault()"><i class="fas fa-undo me-2"></i>إعادة تعيين</button>
    `;
  },

  saveFromMatrix() {
    const perms = this.getPermissions();
    document.querySelectorAll('.perm-check:not([disabled])').forEach(cb => {
      const { role, section, action } = cb.dataset;
      if (!perms[role]) perms[role] = {};
      if (!perms[role][section]) perms[role][section] = { r: 0, w: 0, d: 0 };
      perms[role][section][action] = cb.checked ? 1 : 0;
    });
    this.savePermissions(perms);
  },

  resetToDefault() {
    localStorage.removeItem('superpro_permissions');
    showToast('✅ تم إعادة تعيين الصلاحيات للإعدادات الافتراضية', 'success');
    this.renderPermissionsMatrix();
  }
};

// =========================================================
// IMPROVEMENT 6: GLOBAL SEARCH (بحث شامل)
// =========================================================
const GlobalSearch = {
  debounceTimer: null,
  isOpen: false,

  init() {
    const input = document.getElementById('globalSearchInput');
    const oldInput = document.getElementById('searchQuery');
    [input, oldInput].filter(Boolean).forEach(el => {
      el.addEventListener('input', (e) => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.search(e.target.value), 250);
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeResults();
        if (e.key === 'Enter') this.search(e.target.value);
      });
    });

    // إغلاق عند النقر خارج
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#globalSearchWrapper')) this.closeResults();
    });
  },

  search(query) {
    if (!query || query.trim().length < 2) { this.closeResults(); return; }
    query = query.trim().toLowerCase();
    const results = [];

    // بحث في الموظفين
    (appData.employees || []).forEach(emp => {
      const searchText = [emp.name, emp.employeeName, emp.phone, emp.mobile, emp.nationality, emp.position, emp.job, emp.passportNo, emp.iqamaNo].filter(Boolean).join(' ').toLowerCase();
      if (searchText.includes(query)) {
        results.push({ type: '👤 موظف', name: emp.name || emp.employeeName || '-', detail: emp.position || emp.job || '', module: 'employees', id: emp.id });
      }
    });

    // بحث في العملاء
    (appData.clients || []).forEach(c => {
      const searchText = [c.name, c.clientName, c.phone, c.mobile, c.nationality, c.email].filter(Boolean).join(' ').toLowerCase();
      if (searchText.includes(query)) {
        results.push({ type: '🤝 عميل', name: c.name || c.clientName || '-', detail: c.phone || '', module: 'clients', id: c.id });
      }
    });

    // بحث في العقود
    (appData.contracts || []).forEach(c => {
      const searchText = [c.clientName, c.name, c.contractName, c.description, c.location].filter(Boolean).join(' ').toLowerCase();
      if (searchText.includes(query)) {
        results.push({ type: '📋 عقد', name: c.clientName || c.name || '-', detail: c.endDate || '', module: 'contracts', id: c.id });
      }
    });

    // بحث في الحضور
    (appData.attendance || []).forEach(a => {
      const searchText = [a.name, a.employeeName, a.notes].filter(Boolean).join(' ').toLowerCase();
      if (searchText.includes(query)) {
        results.push({ type: '✅ حضور', name: a.name || a.employeeName || '-', detail: a.date || '', module: 'attendance', id: a.id });
      }
    });

    // بحث في الرواتب
    (appData.payroll || []).forEach(p => {
      const searchText = [p.name, p.employeeName, p.month].filter(Boolean).join(' ').toLowerCase();
      if (searchText.includes(query)) {
        results.push({ type: '💰 راتب', name: p.name || p.employeeName || '-', detail: p.month || '', module: 'payroll', id: p.id });
      }
    });

    this.showResults(results, query);
  },

  showResults(results, query) {
    const existingPanel = document.getElementById('globalSearchResults');
    if (existingPanel) existingPanel.remove();

    const wrapper = document.getElementById('globalSearchWrapper') || document.getElementById('searchContainer');
    if (!wrapper) return;

    const panel = document.createElement('div');
    panel.id = 'globalSearchResults';
    panel.style.cssText = 'position:absolute;top:100%;right:0;left:0;background:white;border:1px solid #dee2e6;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.15);z-index:9999;max-height:400px;overflow-y:auto;margin-top:4px;';

    if (results.length === 0) {
      panel.innerHTML = `<div class="p-3 text-muted text-center"><i class="fas fa-search me-2"></i>لا توجد نتائج لـ "${query}"</div>`;
    } else {
      panel.innerHTML = `
        <div class="p-2 bg-light border-bottom d-flex justify-content-between">
          <small class="text-muted">نتائج البحث: ${results.length} نتيجة</small>
          <small class="text-primary fw-bold">عن "${query}"</small>
        </div>
        ${results.slice(0, 15).map(r => `
          <div class="p-2 border-bottom search-result-item" style="cursor:pointer" onclick="GlobalSearch.goToModule('${r.module}')">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-primary">${r.type}</span>
              <strong>${r.name}</strong>
              ${r.detail ? `<small class="text-muted">— ${r.detail}</small>` : ''}
            </div>
          </div>
        `).join('')}
        ${results.length > 15 ? `<div class="p-2 text-center text-muted"><small>... و ${results.length - 15} نتيجة أخرى</small></div>` : ''}
      `;
    }

    wrapper.style.position = 'relative';
    wrapper.appendChild(panel);
    this.isOpen = true;
  },

  closeResults() {
    const panel = document.getElementById('globalSearchResults');
    if (panel) panel.remove();
    this.isOpen = false;
  },

  goToModule(module) {
    this.closeResults();
    if (typeof showModule === 'function') showModule(module);
    else {
      const link = document.querySelector(`[data-module="${module}"]`);
      if (link) link.click();
    }
  }
};

// =========================================================
// IMPROVEMENT 7: CHANGE LOG (سجل التغييرات)
// =========================================================
const ChangeLog = {
  maxEntries: 500,

  log(action, section, details, oldValue = null) {
    if (!appData.changelog) appData.changelog = [];
    const entry = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      user: (currentUser && (currentUser.displayName || currentUser.username || currentUser.name)) || 'مستخدم',
      role: (currentUser && currentUser.role) || 'unknown',
      action,
      section,
      details,
      oldValue: oldValue ? JSON.stringify(oldValue).substring(0, 200) : null
    };
    appData.changelog.unshift(entry);
    // احتفظ فقط بآخر N إدخال
    if (appData.changelog.length > this.maxEntries) {
      appData.changelog = appData.changelog.slice(0, this.maxEntries);
    }
    this.renderLog();
  },

  renderLog() {
    const tbody = document.getElementById('changeLogBody');
    const count = document.getElementById('changeLogCount');
    if (!tbody) return;
    const entries = appData.changelog || [];
    if (count) count.textContent = entries.length;
    if (entries.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">لا توجد تغييرات مسجلة بعد</td></tr>';
      return;
    }
    tbody.innerHTML = entries.slice(0, 100).map(e => {
      const ts = new Date(e.timestamp);
      const timeStr = ts.toLocaleDateString('ar-SA') + ' ' + ts.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      const actionBadge = {
        'إضافة': 'bg-success', 'تعديل': 'bg-warning text-dark', 'حذف': 'bg-danger',
        'تسجيل دخول': 'bg-info', 'تسجيل خروج': 'bg-secondary', 'تصدير': 'bg-primary'
      }[e.action] || 'bg-secondary';
      return `
        <tr>
          <td><small>${timeStr}</small></td>
          <td><span class="badge bg-dark">${e.user}</span></td>
          <td><small class="text-muted">${e.role || ''}</small></td>
          <td><span class="badge ${actionBadge}">${e.action}</span></td>
          <td><small>${e.section} — ${e.details}</small></td>
        </tr>
      `;
    }).join('');
  },

  exportLog() {
    const entries = appData.changelog || [];
    if (entries.length === 0) { showToast('لا توجد سجلات للتصدير', 'warning'); return; }
    const csv = 'الوقت,المستخدم,الدور,الإجراء,القسم,التفاصيل\n' +
      entries.map(e => `"${e.timestamp}","${e.user}","${e.role}","${e.action}","${e.section}","${e.details}"`).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'سجل_التغييرات_' + new Date().toLocaleDateString('ar').replace(/\//g,'-') + '.csv';
    a.click(); URL.revokeObjectURL(url);
    showToast('✅ تم تصدير سجل التغييرات', 'success');
  }
};

// =========================================================
// IMPROVEMENT 8: NOTES SYSTEM (نظام الملاحظات)
// =========================================================
const NotesSystem = {
  addNote(entityType, entityId, noteText) {
    if (!noteText || !noteText.trim()) { showToast('الرجاء كتابة ملاحظة', 'warning'); return; }
    if (!appData.notes) appData.notes = [];
    const note = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      entityType,
      entityId,
      text: noteText.trim(),
      author: (currentUser && (currentUser.displayName || currentUser.username || currentUser.name)) || 'مستخدم',
      createdAt: new Date().toISOString()
    };
    appData.notes.push(note);
    if (typeof saveData === 'function') saveData();
    ChangeLog.log('إضافة', 'ملاحظات', `ملاحظة على ${entityType}: ${noteText.substring(0, 50)}`);
    showToast('✅ تمت إضافة الملاحظة', 'success');
    return note;
  },

  deleteNote(noteId) {
    if (!appData.notes) return;
    appData.notes = appData.notes.filter(n => n.id !== noteId);
    if (typeof saveData === 'function') saveData();
    showToast('🗑️ تم حذف الملاحظة', 'info');
  },

  getNotes(entityType, entityId) {
    return (appData.notes || []).filter(n => n.entityType === entityType && String(n.entityId) === String(entityId));
  },

  renderNotes(entityType, entityId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const notes = this.getNotes(entityType, entityId);
    container.innerHTML = `
      <div class="notes-section mt-3">
        <h6 class="fw-bold mb-2"><i class="fas fa-sticky-note text-warning me-2"></i>الملاحظات (${notes.length})</h6>
        <div class="input-group mb-2">
          <textarea class="form-control form-control-sm" id="noteInput_${entityId}" placeholder="اكتب ملاحظة..." rows="2"></textarea>
          <button class="btn btn-warning btn-sm" onclick="NotesSystem.addNoteFromUI('${entityType}','${entityId}','noteInput_${entityId}','${containerId}')">
            <i class="fas fa-plus"></i> إضافة
          </button>
        </div>
        <div id="notesList_${entityId}">
          ${notes.length === 0 ? '<p class="text-muted small">لا توجد ملاحظات بعد</p>' : notes.map(n => `
            <div class="card card-body p-2 mb-1 bg-light">
              <div class="d-flex justify-content-between">
                <small class="fw-bold text-primary">${n.author}</small>
                <div>
                  <small class="text-muted me-2">${new Date(n.createdAt).toLocaleDateString('ar-SA')}</small>
                  <button class="btn btn-outline-danger btn-sm py-0 px-1" onclick="NotesSystem.deleteNoteUI('${n.id}','${entityType}','${entityId}','${containerId}')">
                    <i class="fas fa-times fa-xs"></i>
                  </button>
                </div>
              </div>
              <p class="mb-0 mt-1 small">${n.text}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  addNoteFromUI(entityType, entityId, inputId, containerId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    this.addNote(entityType, entityId, input.value);
    input.value = '';
    this.renderNotes(entityType, entityId, containerId);
  },

  deleteNoteUI(noteId, entityType, entityId, containerId) {
    this.deleteNote(noteId);
    this.renderNotes(entityType, entityId, containerId);
  },

  // عرض نافذة الملاحظات كـ modal
  showNotesModal(entityType, entityId, entityName) {
    let modal = document.getElementById('notesModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'notesModal';
      modal.className = 'modal fade';
      modal.innerHTML = `
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-warning">
              <h5 class="modal-title"><i class="fas fa-sticky-note me-2"></i>ملاحظات: <span id="notesModalTitle"></span></h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="notesModalBody"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    document.getElementById('notesModalTitle').textContent = entityName;
    this.renderNotes(entityType, entityId, 'notesModalBody');
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
  }
};

// =========================================================
// IMPROVEMENT 9: INTEGRATED CALENDAR (تقويم متكامل)
// =========================================================
const CalendarManager = {
  currentDate: new Date(),
  events: [],

  init() {
    this.loadEvents();
    this.render();
  },

  loadEvents() {
    this.events = [];
    const today = new Date();

    // أحداث من العقود
    (appData.contracts || []).forEach(c => {
      if (c.endDate || c.contractEndDate) {
        const date = c.endDate || c.contractEndDate;
        const days = Math.ceil((new Date(date) - today) / (1000 * 60 * 60 * 24));
        this.events.push({
          date, type: 'contract', color: days <= 7 ? '#e74c3c' : days <= 30 ? '#f39c12' : '#3498db',
          title: 'انتهاء عقد: ' + (c.clientName || c.name || '-'),
          icon: '📋'
        });
      }
      if (c.startDate || c.contractStartDate) {
        this.events.push({
          date: c.startDate || c.contractStartDate, type: 'contract-start', color: '#2ecc71',
          title: 'بداية عقد: ' + (c.clientName || c.name || '-'),
          icon: '📝'
        });
      }
    });

    // أحداث من الموظفين (إقامات)
    (appData.employees || []).forEach(e => {
      const dateField = e.iqamaExpiry || e.iqamaExpireDate || e.residencyExpiry;
      if (dateField) {
        this.events.push({
          date: dateField, type: 'iqama', color: '#9b59b6',
          title: 'إقامة: ' + (e.name || e.employeeName || '-'),
          icon: '🪪'
        });
      }
    });

    // أحداث من المهام
    (appData.tasks || []).forEach(t => {
      if (t.dueDate || t.date) {
        this.events.push({
          date: t.dueDate || t.date, type: 'task', color: '#1abc9c',
          title: 'مهمة: ' + (t.title || t.name || '-'),
          icon: '✅'
        });
      }
    });

    // أحداث مخصصة
    const customEvents = JSON.parse(localStorage.getItem('superpro_calendar_events') || '[]');
    this.events.push(...customEvents);
  },

  getEventsForDate(dateStr) {
    return this.events.filter(e => {
      try { return new Date(e.date).toDateString() === new Date(dateStr).toDateString(); } catch { return false; }
    });
  },

  render() {
    const container = document.getElementById('calendarView');
    if (!container) return;
    this.loadEvents();
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const monthName = this.currentDate.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' });
    const monthEl = document.getElementById('currentMonth');
    if (monthEl) monthEl.textContent = monthName;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date().toDateString();

    const days = ['أح','إث','ث','أر','خ','ج','س'];
    let html = `<table class="table table-bordered calendar-table mb-0"><thead><tr>`;
    days.forEach(d => html += `<th class="text-center py-2 bg-light fw-bold" style="width:14.28%">${d}</th>`);
    html += '</tr></thead><tbody><tr>';

    for (let i = 0; i < firstDay; i++) html += '<td class="bg-light"></td>';

    let col = firstDay;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const eventsToday = this.getEventsForDate(dateStr);
      const isToday = new Date(dateStr).toDateString() === today;

      html += `<td class="calendar-day ${isToday ? 'bg-primary text-white' : ''}" style="height:70px;vertical-align:top;cursor:pointer" onclick="CalendarManager.showDayEvents('${dateStr}')">
        <div class="fw-bold ${isToday ? '' : 'text-muted'}">${d}</div>
        ${eventsToday.slice(0, 2).map(e => `<div class="badge w-100 text-truncate mb-1" style="background:${e.color};font-size:9px">${e.icon} ${e.title.substring(0, 15)}</div>`).join('')}
        ${eventsToday.length > 2 ? `<small class="text-${isToday ? 'white' : 'muted'}">+${eventsToday.length - 2} أخرى</small>` : ''}
      </td>`;
      col++;
      if (col % 7 === 0 && d < daysInMonth) html += '</tr><tr>';
    }
    const remaining = 7 - (col % 7 || 7);
    for (let i = 0; i < remaining && remaining < 7; i++) html += '<td class="bg-light"></td>';
    html += '</tr></tbody></table>';
    container.innerHTML = html;

    // تسجيل أحداث الأشهر
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    if (prevBtn) { prevBtn.onclick = () => { this.currentDate.setMonth(this.currentDate.getMonth() - 1); this.render(); }; }
    if (nextBtn) { nextBtn.onclick = () => { this.currentDate.setMonth(this.currentDate.getMonth() + 1); this.render(); }; }
  },

  showDayEvents(dateStr) {
    const events = this.getEventsForDate(dateStr);
    const dateFormatted = new Date(dateStr).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    let content = `<h6 class="fw-bold mb-3">📅 ${dateFormatted}</h6>`;
    if (events.length === 0) {
      content += '<p class="text-muted">لا توجد أحداث في هذا اليوم</p>';
    } else {
      content += events.map(e => `<div class="alert" style="background:${e.color}22;border-right:4px solid ${e.color}">${e.icon} <strong>${e.title}</strong></div>`).join('');
    }
    content += `<hr><h6>إضافة حدث جديد</h6>
      <div class="row g-2">
        <div class="col-8"><input class="form-control" id="newEventTitle" placeholder="عنوان الحدث"></div>
        <div class="col-4"><button class="btn btn-primary w-100" onclick="CalendarManager.addCustomEvent('${dateStr}')">إضافة</button></div>
      </div>`;
    this.showModal('أحداث اليوم', content);
  },

  addCustomEvent(dateStr) {
    const title = document.getElementById('newEventTitle');
    if (!title || !title.value.trim()) { showToast('أدخل عنوان الحدث', 'warning'); return; }
    const events = JSON.parse(localStorage.getItem('superpro_calendar_events') || '[]');
    events.push({ date: dateStr, title: title.value.trim(), type: 'custom', color: '#8e44ad', icon: '📌' });
    localStorage.setItem('superpro_calendar_events', JSON.stringify(events));
    showToast('✅ تمت إضافة الحدث', 'success');
    const modal = document.getElementById('calendarDayModal');
    if (modal) bootstrap.Modal.getInstance(modal)?.hide();
    this.render();
  },

  showModal(title, content) {
    let modal = document.getElementById('calendarDayModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'calendarDayModal';
      modal.className = 'modal fade';
      modal.innerHTML = `<div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">${title}</h5><button class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body" id="calendarDayBody"></div></div></div>`;
      document.body.appendChild(modal);
    }
    modal.querySelector('.modal-title').textContent = title;
    document.getElementById('calendarDayBody').innerHTML = content;
    new bootstrap.Modal(modal).show();
  }
};

// =========================================================
// IMPROVEMENT 10: ENHANCED DARK MODE (وضع ليلي محسّن)
// =========================================================
const DarkModeManager = {
  isEnabled: false,

  init() {
    this.isEnabled = localStorage.getItem('darkMode') === 'true' || localStorage.getItem('theme') === 'dark';
    if (this.isEnabled) this.apply();
    this.addToggleButton();
    // مراقبة تفضيلات النظام
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('darkMode')) {
        if (e.matches) this.enable(); else this.disable();
      }
    });
  },

  toggle() {
    this.isEnabled ? this.disable() : this.enable();
  },

  enable() {
    this.isEnabled = true;
    localStorage.setItem('darkMode', 'true');
    localStorage.setItem('theme', 'dark');
    this.apply();
    showToast('🌙 تم تفعيل الوضع الليلي', 'info');
  },

  disable() {
    this.isEnabled = false;
    localStorage.setItem('darkMode', 'false');
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark-mode');
    document.body.classList.remove('dark-mode');
    const btn = document.getElementById('darkModeQuickToggle');
    if (btn) btn.innerHTML = '<i class="fas fa-moon"></i>';
    // إزالة الأنماط المضافة
    const style = document.getElementById('darkModeEnhancedStyle');
    if (style) style.remove();
    showToast('☀️ تم تفعيل الوضع النهاري', 'info');
  },

  apply() {
    document.documentElement.classList.add('dark-mode');
    document.body.classList.add('dark-mode');
    const btn = document.getElementById('darkModeQuickToggle');
    if (btn) btn.innerHTML = '<i class="fas fa-sun"></i>';
    this.injectEnhancedDarkCSS();
  },

  injectEnhancedDarkCSS() {
    if (document.getElementById('darkModeEnhancedStyle')) return;
    const style = document.createElement('style');
    style.id = 'darkModeEnhancedStyle';
    style.textContent = `
      .dark-mode body { background-color: #0d1117 !important; color: #c9d1d9 !important; }
      .dark-mode .card { background-color: #161b22 !important; border-color: #30363d !important; color: #c9d1d9 !important; }
      .dark-mode .card-header { background-color: #21262d !important; border-color: #30363d !important; color: #e6edf3 !important; }
      .dark-mode .card-body { background-color: #161b22 !important; color: #c9d1d9 !important; }
      .dark-mode .table { color: #c9d1d9 !important; border-color: #30363d !important; }
      .dark-mode .table th { background-color: #21262d !important; color: #e6edf3 !important; border-color: #30363d !important; }
      .dark-mode .table td { border-color: #30363d !important; }
      .dark-mode .table-striped > tbody > tr:nth-of-type(odd) > * { background-color: #161b22 !important; color: #c9d1d9 !important; }
      .dark-mode .table-hover > tbody > tr:hover > * { background-color: #21262d !important; }
      .dark-mode .form-control, .dark-mode .form-select { background-color: #21262d !important; border-color: #30363d !important; color: #c9d1d9 !important; }
      .dark-mode .form-control:focus, .dark-mode .form-select:focus { background-color: #21262d !important; border-color: #58a6ff !important; color: #e6edf3 !important; box-shadow: 0 0 0 0.25rem rgba(88,166,255,.25) !important; }
      .dark-mode .modal-content { background-color: #161b22 !important; border-color: #30363d !important; }
      .dark-mode .modal-header { background-color: #21262d !important; border-color: #30363d !important; }
      .dark-mode .modal-footer { border-color: #30363d !important; background-color: #21262d !important; }
      .dark-mode .bg-white, .dark-mode .bg-light { background-color: #21262d !important; }
      .dark-mode .text-muted { color: #8b949e !important; }
      .dark-mode .text-dark { color: #c9d1d9 !important; }
      .dark-mode .border { border-color: #30363d !important; }
      .dark-mode .alert-info { background-color: #1f3a5f !important; border-color: #388bfd !important; color: #a5d6ff !important; }
      .dark-mode .alert-success { background-color: #1a3a2a !important; border-color: #3fb950 !important; color: #56d364 !important; }
      .dark-mode .alert-warning { background-color: #3d2b00 !important; border-color: #d29922 !important; color: #e3b341 !important; }
      .dark-mode .alert-danger { background-color: #3d1a1a !important; border-color: #f85149 !important; color: #ff7b72 !important; }
      .dark-mode .btn-outline-secondary { color: #8b949e !important; border-color: #30363d !important; }
      .dark-mode .btn-outline-secondary:hover { background-color: #30363d !important; color: #c9d1d9 !important; }
      .dark-mode .dropdown-menu { background-color: #21262d !important; border-color: #30363d !important; }
      .dark-mode .dropdown-item { color: #c9d1d9 !important; }
      .dark-mode .dropdown-item:hover { background-color: #30363d !important; }
      .dark-mode #globalSearchResults { background-color: #21262d !important; border-color: #30363d !important; color: #c9d1d9 !important; }
      .dark-mode .search-result-item:hover { background-color: #30363d !important; }
      .dark-mode .kanban-column { background-color: #21262d !important; }
      .dark-mode .calendar-day { color: #c9d1d9 !important; background-color: #161b22 !important; }
      .dark-mode .calendar-day:hover { background-color: #21262d !important; }
      .dark-mode #sidebar { background: linear-gradient(180deg, #0d1117 0%, #161b22 100%) !important; }
      .dark-mode .section-title:not(.h2):not(.h3):not(.h4) { color: #8b949e !important; border-color: #30363d !important; }
      .dark-mode hr { border-color: #30363d !important; }
      .dark-mode .input-group-text { background-color: #21262d !important; border-color: #30363d !important; color: #8b949e !important; }
      .dark-mode .list-group-item { background-color: #161b22 !important; border-color: #30363d !important; color: #c9d1d9 !important; }
      .dark-mode .notes-section .card { background-color: #21262d !important; }
      .dark-mode .tab-content { background-color: #161b22 !important; }
      .dark-mode .nav-tabs .nav-link { color: #8b949e !important; }
      .dark-mode .nav-tabs .nav-link.active { background-color: #161b22 !important; border-color: #30363d #30363d #161b22 !important; color: #58a6ff !important; }
    `;
    document.head.appendChild(style);
  },

  addToggleButton() {
    // إضافة زر التبديل السريع في شريط التنقل
    const navbar = document.getElementById('mainNavbar');
    if (!navbar || document.getElementById('darkModeQuickToggle')) return;
    const navRight = navbar.querySelector('.ms-auto, .navbar-nav');
    if (!navRight) return;
    const btn = document.createElement('button');
    btn.id = 'darkModeQuickToggle';
    btn.className = 'btn btn-outline-light btn-sm ms-2';
    btn.title = 'تبديل الوضع الليلي';
    btn.innerHTML = this.isEnabled ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    btn.onclick = () => this.toggle();
    navRight.prepend(btn);
  }
};

// =========================================================
// INIT ALL IMPROVEMENTS
// =========================================================
function initAllImprovements() {
  try {
    // 1. PWA
    PWAManager.init();

    // 3. تنبيهات ذكية
    SmartAlerts.init();

    // 6. بحث شامل
    GlobalSearch.init();

    // 7. سجل التغييرات - عرض البيانات المحفوظة
    ChangeLog.renderLog();

    // 9. تقويم
    if (document.getElementById('calendarView')) CalendarManager.init();

    // 10. وضع ليلي
    DarkModeManager.init();

    // استمع لحدث تغيير الوحدة لتحديث المحتوى
    document.addEventListener('moduleChanged', (e) => {
      const module = e.detail?.module;
      if (module === 'analytics') {
        setTimeout(() => ChartsManager.refreshAll(), 100);
      } else if (module === 'calendar') {
        setTimeout(() => CalendarManager.render(), 100);
      } else if (module === 'security') {
        setTimeout(() => PermissionsManager.renderPermissionsMatrix(), 100);
      } else if (module === 'notifications') {
        setTimeout(() => SmartAlerts.checkAll(), 100);
      } else if (module === 'activityLog') {
        setTimeout(() => ChangeLog.renderLog(), 100);
      }
    });

    // تحميل الرسوم البيانية عند تحميل الصفحة (للـ analytics)
    setTimeout(() => ChartsManager.init(), 2000);

    // ربط دوال التصدير بالأزرار الموجودة
    window.exportPayrollPDF = (month) => PDFReports.exportPayroll(month);
    window.exportClientsPDF = () => PDFReports.exportClients();
    window.exportFinancialPDF = () => PDFReports.exportFinancialReport();
    window.PWAManager = PWAManager;
    window.PDFReports = PDFReports;
    window.SmartAlerts = SmartAlerts;
    window.ChartsManager = ChartsManager;
    window.PermissionsManager = PermissionsManager;
    window.GlobalSearch = GlobalSearch;
    window.ChangeLog = ChangeLog;
    window.NotesSystem = NotesSystem;
    window.CalendarManager = CalendarManager;
    window.DarkModeManager = DarkModeManager;

    console.log('✅ SUPER_PRO Improvements V5 initialized successfully');
  } catch (err) {
    console.error('❌ Improvements init error:', err);
  }
}

// تشغيل التحسينات بعد تحميل الصفحة
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(initAllImprovements, 800));
} else {
  setTimeout(initAllImprovements, 800);
}

// Patch saveData لإضافة تتبع التغييرات تلقائياً
const _origSaveData = window.saveData;
if (typeof _origSaveData === 'function') {
  window.saveData = function() {
    const result = _origSaveData.apply(this, arguments);
    return result;
  };
}

// =========================================================
// SuperProV5 Global Wrapper - لربط HTML مع الكائنات
// =========================================================
window.SuperProV5 = {
    charts: {
        renderRevenueChart: () => ChartsManager.renderRevenueExpenseCharts(),
        renderAll: () => ChartsManager.renderRevenueExpenseCharts()
    },
    alerts: {
        checkAll: () => SmartAlerts.checkAllAlerts(),
        clearHistory: () => {
            document.getElementById('v5-notification-history').innerHTML = '<p class="text-muted text-center">تم مسح السجل</p>';
            showToast && showToast('تم مسح سجل الإشعارات', 'success');
        }
    },
    permissions: {
        saveAll: () => PermissionsManager.savePermissions(),
        render: () => PermissionsManager.renderMatrix()
    },
    notes: {
        add: () => NotesSystem.addNote(),
        list: () => NotesSystem.renderNotes()
    },
    pdf: {
        generate: () => {
            const type = document.getElementById('v5-pdf-type')?.value || 'employees';
            switch(type) {
                case 'employees': case 'salaries': PDFReports.exportPayroll(); break;
                case 'clients': PDFReports.exportClients(); break;
                case 'finance': PDFReports.exportFinancialReport(); break;
                default: PDFReports.exportPayroll();
            }
            const modal = bootstrap.Modal.getInstance(document.getElementById('v5PdfModal'));
            if (modal) modal.hide();
        }
    },
    darkMode: {
        toggle: () => DarkModeManager.toggle(),
        setAutoSchedule: (enabled) => {
            localStorage.setItem('superpro_auto_dark', enabled);
            if (enabled) showToast && showToast('تم تفعيل الوضع الليلي التلقائي', 'success');
        },
        setAccentColor: (color) => {
            document.documentElement.style.setProperty('--v5-accent', color);
            localStorage.setItem('superpro_accent_color', color);
        },
        setBrightness: (val) => {
            document.body.style.filter = val < 100 ? `brightness(${val/100})` : '';
            localStorage.setItem('superpro_brightness', val);
        },
        setFontSize: (size) => {
            const sizes = { small: '13px', medium: '14px', large: '16px' };
            document.body.style.fontSize = sizes[size] || '14px';
            localStorage.setItem('superpro_font_size', size);
        }
    },
    calendar: CalendarManager,
    search: GlobalSearch,
    changelog: ChangeLog,
    pwa: PWAManager
};

console.log('✅ SuperProV5 wrapper loaded');
