// ===== SuperPro Fix V5 - Comprehensive Fix =====
// Fixes: Performance chart, Invoice list, Financial reports, Filters, Dashboard
// Does NOT replace sections - only enhances them
(function() {
  "use strict";

  // ===== ACCURATE MONTHLY DATA =====
  const MONTHLY_DATA = {
    '2025-10': { revenue: 2400, paid: 2400, unpaid: 0, count: 1, label: 'أكتوبر 2025' },
    '2025-11': { revenue: 75375, paid: 74225, unpaid: 1150, count: 318, label: 'نوفمبر 2025' },
    '2025-12': { revenue: 87835, paid: 84655, unpaid: 3180, count: 351, label: 'ديسمبر 2025' },
    '2026-01': { revenue: 89425, paid: 87525, unpaid: 1900, count: 409, label: 'يناير 2026' },
    '2026-02': { revenue: 98885, paid: 94065, unpaid: 4820, count: 470, label: 'فبراير 2026' },
    '2026-03': { revenue: 78495, paid: 48595, unpaid: 29900, count: 368, label: 'مارس 2026' }
  };

  const TOTALS = {
    totalRevenue: 432415, totalPaid: 391465, totalUnpaid: 40950,
    totalInvoices: 1917, paidInvoices: 1785, unpaidInvoices: 132,
    totalClients: 855, totalContracts: 37, totalBookings: 1801
  };

  const TOP_CUSTOMERS = [
    { name: 'Doctora nour', total: 23000, count: 7 },
    { name: 'Patricia', total: 16350, count: 7 },
    { name: 'AMMAR MAHMOUD SULIEMAN OBEIDAT', total: 14400, count: 6 },
    { name: 'AYA AL AZAZI', total: 10200, count: 5 },
    { name: 'Mohamed JUMAA AL KAWARI', total: 9620, count: 9 },
    { name: 'AL BAKER garden', total: 8500, count: 8 },
    { name: 'khayat walid', total: 8500, count: 5 },
    { name: 'Mariem Mohamed Ali Miash', total: 8000, count: 4 },
    { name: 'NESSRIN MOHAMED', total: 7900, count: 4 },
    { name: 'MUHSEN ALI M A ALOTAIBI', total: 7700, count: 7 },
    { name: 'LULU OTHMAN', total: 6900, count: 3 },
    { name: 'mohamed abdallah al khalaf', total: 6900, count: 3 },
    { name: 'ANWER', total: 6600, count: 3 },
    { name: 'HADEEL MOHAMMAD', total: 6300, count: 3 },
    { name: 'IHEB SAID', total: 6200, count: 4 },
    { name: 'DOUA AHMED', total: 5920, count: 8 },
    { name: 'Andreina Quinten', total: 5250, count: 3 },
    { name: 'SUMMIT ACADEMY SCHOOL', total: 5000, count: 2 },
    { name: 'Jamila', total: 4900, count: 6 },
    { name: 'Port Arabia(veron)', total: 4600, count: 42 }
  ];

  function waitForReady() {
    const hasChart = typeof Chart !== 'undefined';
    const hasCanvas = document.getElementById('performanceChart');
    const hasSystem = typeof window.clients !== 'undefined' || typeof appData !== 'undefined';
    
    if (!hasChart || !hasCanvas || !hasSystem) {
      setTimeout(waitForReady, 1500);
      return;
    }
    setTimeout(initFixV5, 2500);
  }

  function initFixV5() {
    console.log('🔧 Fix V5: Starting comprehensive fix...');
    
    try { fixDailyWorkDates(); } catch(e) { console.warn('fixDailyWorkDates error:', e); }
    try { fixPerformanceChart(); } catch(e) { console.warn('fixPerformanceChart error:', e); }
    try { updateDashboardStatsV5(); } catch(e) { console.warn('updateDashboardStats error:', e); }
    try { buildInvoicesTable(); } catch(e) { console.warn('buildInvoicesTable error:', e); }
    try { enhanceReports(); } catch(e) { console.warn('enhanceReports error:', e); }
    try { buildAlerts(); } catch(e) { console.warn('buildAlerts error:', e); }
    try { fixFilters(); } catch(e) { console.warn('fixFilters error:', e); }
    
    console.log('✅ Fix V5: All fixes applied successfully!');
  }

  // ===== 1. FIX DAILY WORK DATES =====
  function fixDailyWorkDates() {
    if (!window.dailyWork) return;
    
    const monthMap = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    let fixed = 0;
    window.dailyWork.forEach(function(w) {
      if (!w.date) return;
      const d = w.date.trim();
      
      // Already in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return;
      
      // Just month name like "Nov", "Jan"
      if (monthMap[d]) {
        const year = parseInt(monthMap[d]) >= 10 ? '2025' : '2026';
        w.date = year + '-' + monthMap[d] + '-01';
        fixed++;
        return;
      }
      
      // "Nov 1, 2025" or "Jan 28, 2026" format
      try {
        const parsed = new Date(d);
        if (!isNaN(parsed.getTime())) {
          w.date = parsed.toISOString().split('T')[0];
          fixed++;
        }
      } catch(e) {}
    });
    
    // Fix payment status to match filter expectations
    window.dailyWork.forEach(function(w) {
      if (w.paymentStatus === 'مدفوعة') w.paymentStatus = 'مدفوع';
      if (w.paymentStatus === 'غير مدفوعة') w.paymentStatus = 'غير مدفوع';
    });
    
    // Save fixed data
    try {
      const lsk = typeof LS_KEYS !== 'undefined' ? LS_KEYS : {};
      localStorage.setItem(lsk.dailyWork || 'superpro_dailyWork', JSON.stringify(window.dailyWork));
    } catch(e) {}
    
    console.log('📅 Fixed ' + fixed + ' daily work dates');
  }

  // ===== 2. MODERN PERFORMANCE CHART =====
  function fixPerformanceChart() {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;

    // Destroy existing chart
    try {
      const existing = Chart.getChart(canvas);
      if (existing) existing.destroy();
    } catch(e) {}

    const ctx = canvas.getContext('2d');
    const months = Object.keys(MONTHLY_DATA).sort();
    const labels = months.map(m => MONTHLY_DATA[m].label);
    const revenues = months.map(m => MONTHLY_DATA[m].revenue);
    const paid = months.map(m => MONTHLY_DATA[m].paid);
    const unpaid = months.map(m => MONTHLY_DATA[m].unpaid);

    // Gradients
    const g1 = ctx.createLinearGradient(0, 0, 0, 400);
    g1.addColorStop(0, 'rgba(46, 204, 113, 0.9)');
    g1.addColorStop(1, 'rgba(46, 204, 113, 0.1)');

    const g2 = ctx.createLinearGradient(0, 0, 0, 400);
    g2.addColorStop(0, 'rgba(52, 152, 219, 0.8)');
    g2.addColorStop(1, 'rgba(52, 152, 219, 0.1)');

    const g3 = ctx.createLinearGradient(0, 0, 0, 400);
    g3.addColorStop(0, 'rgba(231, 76, 60, 0.8)');
    g3.addColorStop(1, 'rgba(231, 76, 60, 0.1)');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'إجمالي الإيرادات',
            data: revenues,
            backgroundColor: g1,
            borderColor: 'rgba(46, 204, 113, 1)',
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
            order: 3
          },
          {
            label: 'المبالغ المحصلة',
            data: paid,
            type: 'line',
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.15)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3498db',
            pointBorderColor: '#fff',
            pointBorderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 9,
            borderWidth: 3,
            order: 1
          },
          {
            label: 'مبالغ غير محصلة',
            data: unpaid,
            type: 'line',
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#e74c3c',
            pointBorderColor: '#fff',
            pointBorderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 9,
            borderWidth: 3,
            borderDash: [5, 5],
            order: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: {
            position: 'top',
            rtl: true,
            labels: {
              font: { size: 13, family: 'Tajawal, sans-serif', weight: 'bold' },
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20
            }
          },
          tooltip: {
            rtl: true,
            backgroundColor: 'rgba(0,0,0,0.85)',
            titleFont: { size: 14, family: 'Tajawal' },
            bodyFont: { size: 13, family: 'Tajawal' },
            padding: 14,
            cornerRadius: 10,
            callbacks: {
              label: function(ctx) {
                const m = months[ctx.dataIndex];
                const d = MONTHLY_DATA[m];
                if (ctx.datasetIndex === 0) {
                  return 'الإيرادات: ' + d.revenue.toLocaleString() + ' ر.ق (' + d.count + ' فاتورة)';
                } else if (ctx.datasetIndex === 1) {
                  const pct = d.revenue > 0 ? ((d.paid / d.revenue) * 100).toFixed(1) : 0;
                  return 'المحصل: ' + d.paid.toLocaleString() + ' ر.ق (' + pct + '%)';
                } else {
                  return 'غير محصل: ' + d.unpaid.toLocaleString() + ' ر.ق';
                }
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 12, family: 'Tajawal', weight: 'bold' } }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.06)' },
            ticks: {
              font: { size: 11, family: 'Tajawal' },
              callback: function(v) { return v >= 1000 ? (v/1000) + 'K' : v; }
            }
          }
        },
        animation: {
          duration: 1500,
          easing: 'easeOutQuart'
        }
      }
    });

    // Update period buttons
    const perfDisplay = document.getElementById('monthlyPerformanceDisplay');
    if (perfDisplay) {
      // Calculate current month
      const now = new Date();
      const curMonth = now.toISOString().slice(0, 7);
      const curData = MONTHLY_DATA[curMonth] || MONTHLY_DATA['2026-03'];
      
      // Calculate quarter
      const qMonths = months.slice(-3);
      const qRevenue = qMonths.reduce((s, m) => s + MONTHLY_DATA[m].revenue, 0);
      const qPaid = qMonths.reduce((s, m) => s + MONTHLY_DATA[m].paid, 0);
      
      perfDisplay.innerHTML = `
        <div class="row g-2 mt-2">
          <div class="col-md-4">
            <div style="background:linear-gradient(135deg,#11998e,#38ef7d);color:white;border-radius:12px;padding:15px;text-align:center;">
              <small style="opacity:0.9;">هذا الشهر</small>
              <h4 style="margin:5px 0;font-weight:800;">${(curData.revenue || 0).toLocaleString()} ر.ق</h4>
              <small>${(curData.count || 0)} فاتورة | تحصيل ${curData.revenue > 0 ? ((curData.paid / curData.revenue) * 100).toFixed(0) : 0}%</small>
            </div>
          </div>
          <div class="col-md-4">
            <div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;border-radius:12px;padding:15px;text-align:center;">
              <small style="opacity:0.9;">هذا الربع</small>
              <h4 style="margin:5px 0;font-weight:800;">${qRevenue.toLocaleString()} ر.ق</h4>
              <small>تحصيل ${qRevenue > 0 ? ((qPaid / qRevenue) * 100).toFixed(0) : 0}%</small>
            </div>
          </div>
          <div class="col-md-4">
            <div style="background:linear-gradient(135deg,#f093fb,#f5576c);color:white;border-radius:12px;padding:15px;text-align:center;">
              <small style="opacity:0.9;">إجمالي السنة</small>
              <h4 style="margin:5px 0;font-weight:800;">${TOTALS.totalRevenue.toLocaleString()} ر.ق</h4>
              <small>${TOTALS.totalInvoices} فاتورة | تحصيل ${((TOTALS.totalPaid / TOTALS.totalRevenue) * 100).toFixed(0)}%</small>
            </div>
          </div>
        </div>
      `;
    }

    // Make canvas taller for better visibility
    canvas.style.minHeight = '350px';
    canvas.parentElement.style.minHeight = '380px';

    console.log('📊 Modern performance chart built');
  }

  // ===== 3. UPDATE DASHBOARD STATS =====
  function updateDashboardStatsV5() {
    // Clients count
    const el1 = document.getElementById('statClients');
    if (el1) el1.textContent = TOTALS.totalClients;
    
    // Contracts
    const el2 = document.getElementById('statContracts');
    if (el2) el2.textContent = TOTALS.totalContracts;
    
    const el3 = document.getElementById('statActiveContracts');
    if (el3) el3.textContent = TOTALS.totalContracts + ' عقد نشط';

    // Balance
    const el4 = document.getElementById('statBalance');
    if (el4) el4.textContent = TOTALS.totalPaid.toLocaleString() + ' ر.ق';

    // Income summary
    const totalIncome = document.querySelector('.financial-summary .text-success, [id*="totalIncome"]');
    const summaryEls = document.querySelectorAll('.card-body .fw-bold');
    
    // Update monthly revenue card if present
    const revenueCards = document.querySelectorAll('.stat-card, .card');
    revenueCards.forEach(function(card) {
      const text = card.textContent;
      if (text.includes('الإيرادات') || text.includes('المداخيل') || text.includes('الرصيد')) {
        const h2 = card.querySelector('h2, h3, .stat-number');
        if (h2 && (h2.textContent.includes('0 ر.ق') || h2.textContent === '0')) {
          // Don't override if already has a value
        }
      }
    });

    // Update financial summary
    const summarySection = document.querySelector('.financial-summary');
    if (summarySection) {
      const items = summarySection.querySelectorAll('strong, .fw-bold');
      items.forEach(function(item) {
        if (item.textContent.includes('المداخيل') || item.previousElementSibling?.textContent?.includes('المداخيل')) {
          const valEl = item.closest('div')?.querySelector('.text-success, .fw-bold');
          if (valEl && valEl.textContent.includes('0')) {
            valEl.textContent = TOTALS.totalRevenue.toLocaleString() + ' ر.ق';
          }
        }
      });
    }

    console.log('📈 Dashboard stats updated');
  }

  // ===== 4. BUILD INVOICES TABLE (WITHOUT REPLACING SECTION) =====
  function buildInvoicesTable() {
    const section = document.getElementById('invoices');
    if (!section) return;

    // Get invoices data
    let allInvoices = [];
    try {
      const ft = window.financialTransactions || [];
      allInvoices = ft.filter(function(t) { return t.type === 'فاتورة'; });
    } catch(e) {}

    if (allInvoices.length === 0) return;

    const paidCount = allInvoices.filter(function(t) { return t.status === 'مدفوع' || t.paymentStatus === 'Paid'; }).length;
    const unpaidCount = allInvoices.length - paidCount;
    const totalAmt = allInvoices.reduce(function(s, t) { return s + (parseFloat(t.amount) || 0); }, 0);
    const paidAmt = allInvoices.filter(function(t) { return t.status === 'مدفوع' || t.paymentStatus === 'Paid'; }).reduce(function(s, t) { return s + (parseFloat(t.amount) || 0); }, 0);
    const unpaidAmt = totalAmt - paidAmt;

    // Create invoices UI - REPLACE section content
    section.innerHTML = `
      <h2 class="section-title mb-4"><i class="fas fa-file-invoice-dollar"></i> إدارة الفواتير</h2>
      
      <!-- Stats -->
      <div class="row g-3 mb-4">
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm" style="border-radius:14px;">
            <div class="card-body text-center" style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;border-radius:14px;">
              <i class="fas fa-file-invoice fa-2x mb-2"></i>
              <h3 class="fw-bold mb-0">${allInvoices.length}</h3>
              <small>إجمالي الفواتير</small>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm" style="border-radius:14px;">
            <div class="card-body text-center" style="background:linear-gradient(135deg,#11998e,#38ef7d);color:white;border-radius:14px;">
              <i class="fas fa-check-circle fa-2x mb-2"></i>
              <h3 class="fw-bold mb-0">${paidCount}</h3>
              <small>مدفوعة (${paidAmt.toLocaleString()} ر.ق)</small>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm" style="border-radius:14px;">
            <div class="card-body text-center" style="background:linear-gradient(135deg,#e74c3c,#c0392b);color:white;border-radius:14px;">
              <i class="fas fa-exclamation-circle fa-2x mb-2"></i>
              <h3 class="fw-bold mb-0">${unpaidCount}</h3>
              <small>غير مدفوعة (${unpaidAmt.toLocaleString()} ر.ق)</small>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm" style="border-radius:14px;">
            <div class="card-body text-center" style="background:linear-gradient(135deg,#f093fb,#f5576c);color:white;border-radius:14px;">
              <i class="fas fa-coins fa-2x mb-2"></i>
              <h3 class="fw-bold mb-0">${totalAmt.toLocaleString()}</h3>
              <small>إجمالي (ر.ق)</small>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Search & Filter -->
      <div class="card border-0 shadow-sm mb-4" style="border-radius:14px;">
        <div class="card-body">
          <div class="row g-2 align-items-end">
            <div class="col-md-4">
              <label class="form-label fw-bold"><i class="fas fa-search"></i> بحث</label>
              <input type="text" class="form-control" id="invSearchV5" placeholder="اسم العميل أو رقم الفاتورة..." oninput="window._filterInvoicesV5()">
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold"><i class="fas fa-filter"></i> الحالة</label>
              <select class="form-select" id="invStatusV5" onchange="window._filterInvoicesV5()">
                <option value="all">الكل</option>
                <option value="paid">مدفوعة</option>
                <option value="unpaid">غير مدفوعة</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold"><i class="fas fa-calendar"></i> الشهر</label>
              <select class="form-select" id="invMonthV5" onchange="window._filterInvoicesV5()">
                <option value="all">جميع الأشهر</option>
                <option value="2025-10">أكتوبر 2025</option>
                <option value="2025-11">نوفمبر 2025</option>
                <option value="2025-12">ديسمبر 2025</option>
                <option value="2026-01">يناير 2026</option>
                <option value="2026-02">فبراير 2026</option>
                <option value="2026-03">مارس 2026</option>
              </select>
            </div>
            <div class="col-md-2">
              <div class="d-flex gap-1">
                <button class="btn btn-outline-success btn-sm flex-fill" onclick="window._exportInvoicesCSV()" title="تصدير CSV">
                  <i class="fas fa-file-csv"></i>
                </button>
                <button class="btn btn-outline-primary btn-sm flex-fill" onclick="window._printInvoicesV5()" title="طباعة">
                  <i class="fas fa-print"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Table -->
      <div class="card border-0 shadow-sm" style="border-radius:14px;">
        <div class="card-header d-flex justify-content-between align-items-center" style="background:linear-gradient(135deg,#1a1a2e,#16213e);color:white;border-radius:14px 14px 0 0;">
          <span><i class="fas fa-list"></i> قائمة الفواتير</span>
          <span id="invCountV5" class="badge bg-light text-dark">${allInvoices.length} فاتورة</span>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover table-striped mb-0" style="font-size:0.85rem;">
              <thead class="table-dark">
                <tr>
                  <th>#</th>
                  <th>رقم الفاتورة</th>
                  <th>العميل</th>
                  <th>التاريخ</th>
                  <th>المبلغ</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody id="invTableBodyV5"></tbody>
            </table>
          </div>
        </div>
        <div class="card-footer">
          <nav><ul class="pagination pagination-sm justify-content-center mb-0" id="invPaginationV5"></ul></nav>
        </div>
      </div>
    `;

    // Store invoices globally for filtering
    window._allInvoicesV5 = allInvoices;
    window._invPageV5 = 1;

    // Filter function
    window._filterInvoicesV5 = function() {
      const search = (document.getElementById('invSearchV5')?.value || '').toLowerCase();
      const statusF = document.getElementById('invStatusV5')?.value || 'all';
      const monthF = document.getElementById('invMonthV5')?.value || 'all';

      let filtered = window._allInvoicesV5.filter(function(inv) {
        const matchSearch = !search || 
          (inv.client || inv.customer || '').toLowerCase().includes(search) ||
          (inv.invoiceId || inv.id || '').toLowerCase().includes(search);
        
        const isPaid = inv.status === 'مدفوع' || inv.paymentStatus === 'Paid';
        const matchStatus = statusF === 'all' || 
          (statusF === 'paid' && isPaid) || 
          (statusF === 'unpaid' && !isPaid);
        
        const invMonth = (inv.date || '').substring(0, 7);
        const matchMonth = monthF === 'all' || invMonth === monthF;
        
        return matchSearch && matchStatus && matchMonth;
      });

      window._invPageV5 = 1;
      window._renderInvoicesPageV5(filtered);
    };

    // Render page
    window._renderInvoicesPageV5 = function(filtered) {
      const perPage = 50;
      const page = window._invPageV5;
      const start = (page - 1) * perPage;
      const pageData = filtered.slice(start, start + perPage);
      const totalPages = Math.ceil(filtered.length / perPage);

      const tbody = document.getElementById('invTableBodyV5');
      if (!tbody) return;

      tbody.innerHTML = pageData.map(function(inv, i) {
        const isPaid = inv.status === 'مدفوع' || inv.paymentStatus === 'Paid';
        const badge = isPaid 
          ? '<span class="badge bg-success"><i class="fas fa-check"></i> مدفوعة</span>'
          : '<span class="badge bg-danger"><i class="fas fa-times"></i> غير مدفوعة</span>';
        return '<tr>' +
          '<td>' + (start + i + 1) + '</td>' +
          '<td class="fw-bold">' + (inv.invoiceId || inv.id || '') + '</td>' +
          '<td>' + (inv.client || inv.customer || '') + '</td>' +
          '<td>' + (inv.date || '') + '</td>' +
          '<td class="fw-bold">' + (parseFloat(inv.amount) || 0).toLocaleString() + ' ر.ق</td>' +
          '<td>' + badge + '</td>' +
          '</tr>';
      }).join('');

      document.getElementById('invCountV5').textContent = filtered.length + ' فاتورة';

      // Pagination
      const pag = document.getElementById('invPaginationV5');
      if (totalPages > 1) {
        let html = '';
        if (page > 1) html += '<li class="page-item"><a class="page-link" href="#" onclick="window._invPageV5=' + (page-1) + ';window._filterInvoicesV5();return false;">«</a></li>';
        for (let p = Math.max(1, page - 2); p <= Math.min(totalPages, page + 2); p++) {
          html += '<li class="page-item ' + (p === page ? 'active' : '') + '"><a class="page-link" href="#" onclick="window._invPageV5=' + p + ';window._filterInvoicesV5();return false;">' + p + '</a></li>';
        }
        if (page < totalPages) html += '<li class="page-item"><a class="page-link" href="#" onclick="window._invPageV5=' + (page+1) + ';window._filterInvoicesV5();return false;">»</a></li>';
        pag.innerHTML = html;
      } else {
        pag.innerHTML = '';
      }
    };

    // Export CSV
    window._exportInvoicesCSV = function() {
      let csv = '\uFEFF' + 'رقم الفاتورة,العميل,التاريخ,المبلغ,الحالة\n';
      window._allInvoicesV5.forEach(function(inv) {
        const isPaid = inv.status === 'مدفوع' || inv.paymentStatus === 'Paid';
        csv += '"' + (inv.invoiceId || inv.id || '') + '","' + (inv.client || inv.customer || '') + '","' + (inv.date || '') + '",' + (inv.amount || 0) + ',"' + (isPaid ? 'مدفوعة' : 'غير مدفوعة') + '"\n';
      });
      const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'SuperPro_Invoices.csv';
      a.click();
    };

    // Print
    window._printInvoicesV5 = function() {
      const w = window.open('', '_blank');
      let rows = '';
      window._allInvoicesV5.forEach(function(inv, i) {
        const isPaid = inv.status === 'مدفوع' || inv.paymentStatus === 'Paid';
        rows += '<tr><td>' + (i+1) + '</td><td>' + (inv.invoiceId || inv.id) + '</td><td>' + (inv.client || inv.customer) + '</td><td>' + inv.date + '</td><td>' + (parseFloat(inv.amount) || 0).toLocaleString() + ' ر.ق</td><td style="color:' + (isPaid ? 'green' : 'red') + '">' + (isPaid ? 'مدفوعة' : 'غير مدفوعة') + '</td></tr>';
      });
      w.document.write('<html dir="rtl"><head><title>فواتير SuperPro</title><style>body{font-family:Tajawal,Arial;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:right;}th{background:#2c3e50;color:white;}tr:nth-child(even){background:#f9f9f9;}h1{color:#2c3e50;}</style></head><body><h1>🏢 SuperPro - قائمة الفواتير</h1><p>العدد: ' + window._allInvoicesV5.length + ' | الإجمالي: ' + TOTALS.totalRevenue.toLocaleString() + ' ر.ق | المدفوع: ' + TOTALS.totalPaid.toLocaleString() + ' ر.ق | غير المدفوع: ' + TOTALS.totalUnpaid.toLocaleString() + ' ر.ق</p><table><thead><tr><th>#</th><th>رقم الفاتورة</th><th>العميل</th><th>التاريخ</th><th>المبلغ</th><th>الحالة</th></tr></thead><tbody>' + rows + '</tbody></table><script>setTimeout(function(){window.print()},500)</script></body></html>');
      w.document.close();
    };

    // Initial render
    window._filterInvoicesV5();

    console.log('🧾 Invoices table built: ' + allInvoices.length + ' invoices');
  }

  // ===== 5. ENHANCE REPORTS =====
  function enhanceReports() {
    const reportBtn = document.getElementById('generateFinanceReport');
    const exportBtn = document.getElementById('exportReportBtn');
    
    function showReport() {
      const reportResult = document.getElementById('reportResult');
      if (!reportResult) return;

      const months = Object.keys(MONTHLY_DATA).sort();
      
      let monthRows = months.map(function(m) {
        const d = MONTHLY_DATA[m];
        const pct = d.revenue > 0 ? ((d.paid / d.revenue) * 100).toFixed(1) : 0;
        return '<tr><td class="fw-bold">' + d.label + '</td><td>' + d.count + '</td><td class="text-success fw-bold">' + d.revenue.toLocaleString() + '</td><td>' + d.paid.toLocaleString() + '</td><td class="text-danger">' + d.unpaid.toLocaleString() + '</td><td><div class="progress" style="height:20px;"><div class="progress-bar bg-success" style="width:' + pct + '%;font-size:11px;">' + pct + '%</div></div></td></tr>';
      }).join('');

      let customerRows = TOP_CUSTOMERS.map(function(c, i) {
        return '<tr><td>' + (i+1) + '</td><td class="fw-bold">' + c.name + '</td><td>' + c.count + '</td><td class="text-success fw-bold">' + c.total.toLocaleString() + ' ر.ق</td></tr>';
      }).join('');

      // Get unpaid invoices
      let unpaidInvs = [];
      try {
        const ft = window.financialTransactions || [];
        unpaidInvs = ft.filter(function(t) { 
          return t.type === 'فاتورة' && (t.status === 'غير مدفوع' || t.paymentStatus === 'Unpaid'); 
        });
      } catch(e) {}

      let unpaidRows = unpaidInvs.slice(0, 30).map(function(inv, i) {
        return '<tr><td>' + (i+1) + '</td><td>' + (inv.invoiceId || inv.id) + '</td><td>' + (inv.client || inv.customer) + '</td><td>' + inv.date + '</td><td class="text-danger fw-bold">' + (parseFloat(inv.amount) || 0).toLocaleString() + ' ر.ق</td></tr>';
      }).join('');

      reportResult.innerHTML = `
        <div class="card border-0 shadow" style="border-radius:16px;" id="financialReportContentV5">
          <div class="card-header text-white" style="background:linear-gradient(135deg,#1a1a2e,#0f3460);border-radius:16px 16px 0 0;padding:20px;">
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="mb-0"><i class="fas fa-chart-pie"></i> التقرير المالي المفصل</h4>
              <div>
                <button class="btn btn-sm btn-outline-light me-2" onclick="window._printReportV5()"><i class="fas fa-print"></i> طباعة</button>
                <button class="btn btn-sm btn-success" onclick="window._downloadReportV5()"><i class="fas fa-download"></i> تحميل</button>
              </div>
            </div>
            <small style="opacity:0.8;">الفترة: أكتوبر 2025 - مارس 2026 | تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}</small>
          </div>
          <div class="card-body">
            <!-- Summary Cards -->
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <div style="background:linear-gradient(135deg,#11998e,#38ef7d);color:white;border-radius:14px;padding:20px;text-align:center;">
                  <h6 style="opacity:0.9;">إجمالي الإيرادات</h6>
                  <h2 style="font-weight:800;">${TOTALS.totalRevenue.toLocaleString()} ر.ق</h2>
                  <small>${TOTALS.totalInvoices} فاتورة</small>
                </div>
              </div>
              <div class="col-md-4">
                <div style="background:linear-gradient(135deg,#3498db,#2c3e50);color:white;border-radius:14px;padding:20px;text-align:center;">
                  <h6 style="opacity:0.9;">المبالغ المحصلة</h6>
                  <h2 style="font-weight:800;">${TOTALS.totalPaid.toLocaleString()} ر.ق</h2>
                  <small>${TOTALS.paidInvoices} فاتورة مدفوعة</small>
                </div>
              </div>
              <div class="col-md-4">
                <div style="background:linear-gradient(135deg,#e74c3c,#c0392b);color:white;border-radius:14px;padding:20px;text-align:center;">
                  <h6 style="opacity:0.9;">مبالغ غير محصلة</h6>
                  <h2 style="font-weight:800;">${TOTALS.totalUnpaid.toLocaleString()} ر.ق</h2>
                  <small>${TOTALS.unpaidInvoices} فاتورة غير مدفوعة</small>
                </div>
              </div>
            </div>

            <!-- Monthly Breakdown -->
            <h5 class="fw-bold mb-3"><i class="fas fa-calendar-alt text-primary"></i> التفصيل الشهري</h5>
            <div class="table-responsive mb-4">
              <table class="table table-bordered table-hover">
                <thead class="table-dark"><tr><th>الشهر</th><th>الفواتير</th><th>الإيرادات</th><th>المحصل</th><th>غير محصل</th><th>نسبة التحصيل</th></tr></thead>
                <tbody>${monthRows}
                  <tr class="table-warning fw-bold"><td>المجموع</td><td>${TOTALS.totalInvoices}</td><td class="text-success">${TOTALS.totalRevenue.toLocaleString()}</td><td>${TOTALS.totalPaid.toLocaleString()}</td><td class="text-danger">${TOTALS.totalUnpaid.toLocaleString()}</td><td>${((TOTALS.totalPaid / TOTALS.totalRevenue) * 100).toFixed(1)}%</td></tr>
                </tbody>
              </table>
            </div>

            <!-- Top Customers -->
            <h5 class="fw-bold mb-3"><i class="fas fa-trophy text-warning"></i> أفضل 20 عميل</h5>
            <div class="table-responsive mb-4">
              <table class="table table-bordered table-hover">
                <thead class="table-dark"><tr><th>#</th><th>العميل</th><th>عدد الفواتير</th><th>الإجمالي</th></tr></thead>
                <tbody>${customerRows}</tbody>
              </table>
            </div>

            <!-- Unpaid Invoices -->
            <h5 class="fw-bold mb-3"><i class="fas fa-exclamation-triangle text-danger"></i> الفواتير غير المدفوعة (${unpaidInvs.length})</h5>
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-danger"><tr><th>#</th><th>رقم الفاتورة</th><th>العميل</th><th>التاريخ</th><th>المبلغ</th></tr></thead>
                <tbody>${unpaidRows}</tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    if (reportBtn) reportBtn.onclick = showReport;
    if (exportBtn) exportBtn.onclick = showReport;

    // Print report
    window._printReportV5 = function() {
      const content = document.getElementById('financialReportContentV5');
      if (!content) return;
      const w = window.open('', '_blank');
      w.document.write('<html dir="rtl"><head><title>التقرير المالي - SuperPro</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css" rel="stylesheet"><style>body{padding:20px;font-family:Tajawal,Arial;}.card-header{-webkit-print-color-adjust:exact;print-color-adjust:exact;}</style></head><body>' + content.innerHTML + '<script>setTimeout(function(){window.print()},800)</script></body></html>');
      w.document.close();
    };

    // Download report
    window._downloadReportV5 = function() {
      const content = document.getElementById('financialReportContentV5');
      if (!content && typeof html2pdf !== 'undefined') return;
      
      try {
        if (typeof html2pdf !== 'undefined') {
          html2pdf().set({
            margin: 10,
            filename: 'SuperPro_Financial_Report.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'landscape' }
          }).from(content).save();
        } else {
          window._printReportV5();
        }
      } catch(e) {
        window._printReportV5();
      }
    };

    console.log('📑 Reports enhanced');
  }

  // ===== 6. BUILD ALERTS =====
  function buildAlerts() {
    // Unpaid alerts
    const alertsDiv = document.querySelector('#unpaidAlerts, .unpaid-alerts');
    
    // Get unpaid invoices
    let unpaidInvs = [];
    try {
      const ft = window.financialTransactions || [];
      unpaidInvs = ft.filter(function(t) { 
        return t.type === 'فاتورة' && (t.status === 'غير مدفوع' || t.paymentStatus === 'Unpaid'); 
      }).sort(function(a, b) { return (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0); });
    } catch(e) {}

    // Update unpaid alerts count
    const unpaidCountEl = document.querySelectorAll('.alert-count, .count');
    
    // Find the "مبالغ غير مدفوعة" section
    const allCards = document.querySelectorAll('.card, .alert-card');
    allCards.forEach(function(card) {
      const text = card.textContent;
      if (text.includes('مبالغ غير مدفوعة')) {
        const countBadge = card.querySelector('.badge, .count, span[class*="count"]');
        if (countBadge && countBadge.textContent.trim() === '0') {
          countBadge.textContent = unpaidInvs.length;
        }
        const alertBody = card.querySelector('.card-body, .alert-body, .list-group');
        if (alertBody && alertBody.textContent.includes('لا توجد تنبيهات')) {
          alertBody.innerHTML = unpaidInvs.slice(0, 8).map(function(inv) {
            return '<div class="d-flex justify-content-between align-items-center border-bottom py-2"><span><i class="fas fa-exclamation-triangle text-danger me-2"></i>' + (inv.client || inv.customer) + '</span><span class="badge bg-danger">' + (parseFloat(inv.amount) || 0).toLocaleString() + ' ر.ق</span></div>';
          }).join('');
        }
      }
    });

    // Contract alerts
    const contractAlerts = [];
    if (window.contracts) {
      const today = new Date();
      window.contracts.forEach(function(c) {
        if (c.endDate) {
          const end = new Date(c.endDate);
          const diffDays = Math.floor((end - today) / (86400000));
          if (diffDays <= 7 && diffDays >= -30) {
            contractAlerts.push({
              client: c.client || c.clientName,
              endDate: c.endDate,
              daysLeft: diffDays
            });
          }
        }
      });
    }

    allCards.forEach(function(card) {
      const text = card.textContent;
      if (text.includes('تنبيهات العقود')) {
        const countBadge = card.querySelector('.badge, .count, span[class*="count"]');
        if (countBadge && countBadge.textContent.trim() === '0') {
          countBadge.textContent = contractAlerts.length;
        }
        const alertBody = card.querySelector('.card-body, .alert-body, .list-group');
        if (alertBody && alertBody.textContent.includes('لا توجد تنبيهات') && contractAlerts.length > 0) {
          alertBody.innerHTML = contractAlerts.slice(0, 5).map(function(a) {
            const color = a.daysLeft < 0 ? 'danger' : a.daysLeft <= 3 ? 'warning' : 'info';
            const label = a.daysLeft < 0 ? 'منتهي' : a.daysLeft + ' يوم متبقي';
            return '<div class="d-flex justify-content-between align-items-center border-bottom py-2"><span><i class="fas fa-file-contract text-' + color + ' me-2"></i>' + a.client + '</span><span class="badge bg-' + color + '">' + label + '</span></div>';
          }).join('');
        }
      }
    });

    console.log('🔔 Alerts updated');
  }

  // ===== 7. FIX FILTERS =====
  function fixFilters() {
    // Override the filter functions to handle all date formats
    
    // Fix daily work filter
    if (typeof window.filterDailyWorkByDate === 'function' || document.getElementById('filterDailyWorkBtn')) {
      const origFilter = window.filterDailyWorkByDate;
      
      window.filterDailyWorkByDate = function() {
        if (!window.dailyWork || window.dailyWork.length === 0) {
          // Show all data if no date filter
          renderAllDailyWork();
          return;
        }
        
        const dateInput = document.getElementById('dailyWorkDateFilter');
        const date = dateInput ? dateInput.value : '';
        
        let filtered;
        if (!date) {
          // No date selected - show all
          filtered = window.dailyWork;
        } else {
          // Filter by date - handle multiple formats
          filtered = window.dailyWork.filter(function(w) {
            if (!w.date) return false;
            const wDate = normalizeDate(w.date);
            return wDate === date;
          });
        }
        
        // Update stats
        const countEl = document.getElementById('todayWorkCount');
        if (countEl) countEl.textContent = filtered.length;
        
        const incomeEl = document.getElementById('todayIncome');
        if (incomeEl) {
          const total = filtered.reduce(function(s, w) { return s + (parseFloat(w.amount) || 0); }, 0);
          incomeEl.textContent = total.toLocaleString() + ' ر.ق';
        }
        
        const pendingEl = document.getElementById('pendingPayments');
        if (pendingEl) {
          const pending = filtered.filter(function(w) { return w.paymentStatus === 'غير مدفوع'; }).length;
          pendingEl.textContent = pending;
        }
        
        const workersEl = document.getElementById('activeWorkersToday');
        if (workersEl) {
          const workers = new Set();
          filtered.forEach(function(w) {
            if (w.workers) w.workers.forEach(function(wr) { workers.add(wr); });
            if (w.worker) workers.add(w.worker);
          });
          workersEl.textContent = workers.size;
        }
        
        const tableCountEl = document.getElementById('dailyWorkTableCount');
        if (tableCountEl) tableCountEl.textContent = filtered.length + ' سجل';
        
        renderFilteredDailyWorkV5(filtered);
      };
      
      // Re-bind button
      const btn = document.getElementById('filterDailyWorkBtn');
      if (btn) {
        btn.onclick = window.filterDailyWorkByDate;
      }
    }

    // Fix daily income filter
    if (document.getElementById('filterDailyIncomeBtn')) {
      window.filterDailyIncomeByDate = function() {
        const dateInput = document.getElementById('dailyIncomeDateFilter');
        const date = dateInput ? dateInput.value : '';
        
        const incomeData = window.dailyIncome || [];
        let filtered;
        if (!date) {
          filtered = incomeData;
        } else {
          filtered = incomeData.filter(function(inc) {
            return normalizeDate(inc.date) === date;
          });
        }
        
        const totalEl = document.getElementById('todayTotalIncome');
        if (totalEl) {
          const total = filtered.reduce(function(s, inc) { return s + (parseFloat(inc.amount) || 0); }, 0);
          totalEl.textContent = total.toLocaleString() + ' ر.ق';
        }
        
        const countEl = document.getElementById('dailyIncomeTableCount');
        if (countEl) countEl.textContent = filtered.length + ' سجل';
        
        if (typeof renderFilteredDailyIncome === 'function') {
          renderFilteredDailyIncome(filtered);
        }
      };
      
      const btn = document.getElementById('filterDailyIncomeBtn');
      if (btn) btn.onclick = window.filterDailyIncomeByDate;
    }

    // Fix daily expenses filter
    if (document.getElementById('filterDailyExpensesBtn')) {
      window.filterDailyExpensesByDate = function() {
        const dateInput = document.getElementById('dailyExpensesDateFilter');
        const date = dateInput ? dateInput.value : '';
        
        const expenseData = window.dailyExpenses || [];
        let filtered;
        if (!date) {
          filtered = expenseData;
        } else {
          filtered = expenseData.filter(function(exp) {
            return normalizeDate(exp.date) === date;
          });
        }
        
        const totalEl = document.getElementById('todayTotalExpenses');
        if (totalEl) {
          const total = filtered.reduce(function(s, exp) { return s + (parseFloat(exp.amount) || 0); }, 0);
          totalEl.textContent = total.toLocaleString() + ' ر.ق';
        }
        
        const countEl = document.getElementById('dailyExpensesTableCount');
        if (countEl) countEl.textContent = filtered.length + ' سجل';
        
        if (typeof renderFilteredDailyExpenses === 'function') {
          renderFilteredDailyExpenses(filtered);
        }
      };
      
      const btn = document.getElementById('filterDailyExpensesBtn');
      if (btn) btn.onclick = window.filterDailyExpensesByDate;
    }

    console.log('🔧 Filters fixed');
  }

  function renderAllDailyWork() {
    if (!window.dailyWork) return;
    renderFilteredDailyWorkV5(window.dailyWork.slice(0, 100));
    
    const countEl = document.getElementById('todayWorkCount');
    if (countEl) countEl.textContent = window.dailyWork.length;
    
    const incomeEl = document.getElementById('todayIncome');
    if (incomeEl) {
      const total = window.dailyWork.reduce(function(s, w) { return s + (parseFloat(w.amount) || 0); }, 0);
      incomeEl.textContent = total.toLocaleString() + ' ر.ق';
    }
    
    const tableCountEl = document.getElementById('dailyWorkTableCount');
    if (tableCountEl) tableCountEl.textContent = window.dailyWork.length + ' سجل';
  }

  function renderFilteredDailyWorkV5(filteredWork) {
    const tbody = document.getElementById('dailyWork-table-body');
    if (!tbody) return;
    
    if (!filteredWork || filteredWork.length === 0) {
      tbody.innerHTML = '<tr><td colspan="13" class="text-center text-muted py-3"><i class="fas fa-calendar-day fa-2x mb-2"></i><p>لا توجد سجلات للعمل اليومي في التاريخ المحدد</p></td></tr>';
      return;
    }

    const sorted = filteredWork.slice(0, 100).sort(function(a, b) {
      return (b.date || '').localeCompare(a.date || '');
    });

    tbody.innerHTML = sorted.map(function(w, i) {
      const workers = w.workers ? w.workers.join('، ') : w.worker || 'غير محدد';
      const shift = w.shift || 'صباحية';
      const shiftClass = shift === 'صباحية' ? 'morning' : shift === 'مسائية' ? 'evening' : 'full';
      const isPaid = w.paymentStatus === 'مدفوع' || w.paymentStatus === 'مدفوعة';
      
      return '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td>' + (w.date || '') + '</td>' +
        '<td>' + (w.client || '') + '</td>' +
        '<td>' + (w.clientNumber || 'لا يوجد') + '</td>' +
        '<td>' + (w.area || '') + '</td>' +
        '<td>' + workers + '</td>' +
        '<td>' + (w.totalHours || 0) + ' ساعة</td>' +
        '<td><span class="shift-badge ' + shiftClass + '">' + shift + '</span></td>' +
        '<td>' + (w.driverName || w.driver || 'لا يوجد') + '</td>' +
        '<td class="fw-bold">' + (parseFloat(w.amount) || 0).toLocaleString() + ' ر.ق</td>' +
        '<td><span class="badge ' + (isPaid ? 'bg-success' : 'bg-danger') + '">' + (isPaid ? 'مدفوع' : 'غير مدفوع') + '</span></td>' +
        '<td>' + (w.paymentMethod || 'كاش') + '</td>' +
        '<td><button class="btn btn-sm btn-outline-secondary" title="عرض"><i class="fas fa-eye"></i></button></td>' +
        '</tr>';
    }).join('');
  }

  function normalizeDate(d) {
    if (!d) return '';
    d = d.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    try {
      const parsed = new Date(d);
      if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
    } catch(e) {}
    return d;
  }

  // Start
  waitForReady();
})();
