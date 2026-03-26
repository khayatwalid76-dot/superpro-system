// ===== SuperPro Ultimate V4 =====
// Fixes: Performance chart, Invoice list, Financial reports, Dashboard stats
// All data from actual Excel files - 100% accurate
(function() {
  "use strict";
  
  // ===== ACCURATE MONTHLY DATA FROM INVOICES =====
  const MONTHLY_DATA = {
    '2025-10': { revenue: 2400, paid: 2400, unpaid: 0, count: 1, label: 'أكتوبر 2025' },
    '2025-11': { revenue: 75375, paid: 74225, unpaid: 1150, count: 318, label: 'نوفمبر 2025' },
    '2025-12': { revenue: 87835, paid: 84655, unpaid: 3180, count: 351, label: 'ديسمبر 2025' },
    '2026-01': { revenue: 89425, paid: 87525, unpaid: 1900, count: 409, label: 'يناير 2026' },
    '2026-02': { revenue: 98885, paid: 94065, unpaid: 4820, count: 470, label: 'فبراير 2026' },
    '2026-03': { revenue: 78495, paid: 48595, unpaid: 29900, count: 368, label: 'مارس 2026' }
  };

  const TOTALS = {
    totalRevenue: 432415,
    totalPaid: 391465,
    totalUnpaid: 40950,
    totalInvoices: 1917,
    paidInvoices: 1785,
    unpaidInvoices: 132,
    totalClients: 855,
    totalContracts: 37,
    totalBookings: 1801
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

  function waitForSystem() {
    if (typeof Chart === 'undefined' || !document.getElementById('performanceChart')) {
      setTimeout(waitForSystem, 1500);
      return;
    }
    setTimeout(initUltimateV4, 2000);
  }

  function initUltimateV4() {
    console.log('🚀 SuperPro Ultimate V4: Initializing...');
    fixInvoiceStatuses();
    buildModernPerformanceChart();
    updateDashboardStats();
    buildInvoicesList();
    buildFinancialReport();
    buildAlerts();
    console.log('✅ SuperPro Ultimate V4: Complete!');
  }

  // ===== FIX INVOICE STATUS MISMATCH =====
  function fixInvoiceStatuses() {
    if (typeof window.financialTransactions === 'undefined') window.financialTransactions = [];
    if (typeof financialTransactions !== 'undefined') {
      financialTransactions.forEach(function(t) {
        if (t.type === 'فاتورة') {
          if (t.paymentStatus === 'Paid' || t.status === 'مدفوعة') {
            t.status = 'مدفوع';
          } else if (t.paymentStatus === 'Unpaid' || t.status === 'غير مدفوعة') {
            t.status = 'غير مدفوع';
          }
        }
      });
    }
    // Save to localStorage
    try {
      if (typeof LS_KEYS !== 'undefined') {
        localStorage.setItem(LS_KEYS.financialTransactions || 'superpro_financialTransactions', JSON.stringify(window.financialTransactions || financialTransactions));
      }
    } catch(e) {}
    console.log('✅ Invoice statuses fixed');
  }

  // ===== MODERN PERFORMANCE CHART =====
  function buildModernPerformanceChart() {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;

    // Destroy existing chart
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    const ctx = canvas.getContext('2d');
    const months = Object.keys(MONTHLY_DATA);
    const labels = months.map(m => MONTHLY_DATA[m].label);
    const revenues = months.map(m => MONTHLY_DATA[m].revenue);
    const paid = months.map(m => MONTHLY_DATA[m].paid);
    const unpaid = months.map(m => MONTHLY_DATA[m].unpaid);

    // Create beautiful gradients
    const revenueGradient = ctx.createLinearGradient(0, 0, 0, 350);
    revenueGradient.addColorStop(0, 'rgba(46, 204, 113, 0.8)');
    revenueGradient.addColorStop(1, 'rgba(46, 204, 113, 0.05)');

    const paidGradient = ctx.createLinearGradient(0, 0, 0, 350);
    paidGradient.addColorStop(0, 'rgba(52, 152, 219, 0.7)');
    paidGradient.addColorStop(1, 'rgba(52, 152, 219, 0.05)');

    const unpaidGradient = ctx.createLinearGradient(0, 0, 0, 350);
    unpaidGradient.addColorStop(0, 'rgba(231, 76, 60, 0.7)');
    unpaidGradient.addColorStop(1, 'rgba(231, 76, 60, 0.05)');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'إجمالي الإيرادات',
            data: revenues,
            backgroundColor: revenueGradient,
            borderColor: 'rgba(46, 204, 113, 1)',
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
            order: 3
          },
          {
            label: 'المدفوع',
            data: paid,
            type: 'line',
            fill: true,
            backgroundColor: paidGradient,
            borderColor: 'rgba(52, 152, 219, 1)',
            borderWidth: 3,
            pointBackgroundColor: '#fff',
            pointBorderColor: 'rgba(52, 152, 219, 1)',
            pointBorderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 9,
            tension: 0.4,
            order: 1
          },
          {
            label: 'غير المدفوع',
            data: unpaid,
            type: 'line',
            fill: true,
            backgroundColor: unpaidGradient,
            borderColor: 'rgba(231, 76, 60, 1)',
            borderWidth: 3,
            pointBackgroundColor: '#fff',
            pointBorderColor: 'rgba(231, 76, 60, 1)',
            pointBorderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 9,
            tension: 0.4,
            borderDash: [5, 5],
            order: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            rtl: true,
            labels: {
              font: { size: 13, weight: 'bold', family: 'Cairo, Tajawal, sans-serif' },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'rectRounded'
            }
          },
          tooltip: {
            rtl: true,
            backgroundColor: 'rgba(0,0,0,0.85)',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            padding: 14,
            cornerRadius: 10,
            displayColors: true,
            callbacks: {
              label: function(ctx) {
                let label = ctx.dataset.label || '';
                let value = ctx.parsed.y.toLocaleString('ar-SA');
                return label + ': ' + value + ' ر.ق';
              },
              afterBody: function(tooltipItems) {
                const idx = tooltipItems[0].dataIndex;
                const month = months[idx];
                const data = MONTHLY_DATA[month];
                return ['عدد الفواتير: ' + data.count, 'نسبة التحصيل: ' + ((data.paid/data.revenue)*100).toFixed(1) + '%'];
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 12, weight: 'bold', family: 'Cairo, Tajawal, sans-serif' } }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
            ticks: {
              font: { size: 11 },
              callback: function(value) { return value.toLocaleString() + ' ر.ق'; }
            }
          }
        },
        animation: { duration: 1500, easing: 'easeOutQuart' }
      }
    });

    // Set canvas height
    canvas.parentElement.style.height = '380px';
    console.log('✅ Modern performance chart built');
  }

  // ===== UPDATE DASHBOARD STATS =====
  function updateDashboardStats() {
    // Update stat cards
    const statClients = document.getElementById('statClients');
    if (statClients) statClients.textContent = TOTALS.totalClients;

    const statContracts = document.getElementById('statContracts');
    if (statContracts) statContracts.textContent = TOTALS.totalContracts;

    const statActiveContracts = document.getElementById('statActiveContracts');
    if (statActiveContracts) statActiveContracts.textContent = TOTALS.totalContracts;

    const statBalance = document.getElementById('statBalance');
    if (statBalance) statBalance.textContent = TOTALS.totalRevenue.toLocaleString() + ' ر.ق';

    // Update monthly performance display
    const perfDisplay = document.getElementById('monthlyPerformanceDisplay');
    if (perfDisplay) {
      const currentMonth = '2026-03';
      const cm = MONTHLY_DATA[currentMonth];
      const prevMonth = '2026-02';
      const pm = MONTHLY_DATA[prevMonth];
      const growth = ((cm.revenue - pm.revenue) / pm.revenue * 100).toFixed(1);
      const collectionRate = ((cm.paid / cm.revenue) * 100).toFixed(1);

      perfDisplay.innerHTML = `
        <div class="card border-0 shadow-sm" style="border-radius:16px;overflow:hidden;">
          <div class="card-body p-0">
            <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);color:white;padding:24px;">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 style="margin:0;font-weight:800;font-size:1.3rem;">📊 الأداء الشهري - مارس 2026</h5>
                <span class="badge" style="background:rgba(255,255,255,0.15);padding:8px 16px;font-size:0.85rem;border-radius:20px;">
                  <i class="fas fa-calendar"></i> ${new Date().toLocaleDateString('ar-SA')}
                </span>
              </div>
              <div class="row g-3">
                <div class="col-md-3 col-6">
                  <div style="background:rgba(46,204,113,0.15);border-radius:14px;padding:18px;text-align:center;border:1px solid rgba(46,204,113,0.3);">
                    <i class="fas fa-coins" style="font-size:24px;color:#2ecc71;"></i>
                    <h3 style="margin:8px 0 2px;font-size:1.5rem;font-weight:800;">${cm.revenue.toLocaleString()}</h3>
                    <small style="opacity:0.8;font-size:0.8rem;">إجمالي الإيرادات (ر.ق)</small>
                  </div>
                </div>
                <div class="col-md-3 col-6">
                  <div style="background:rgba(52,152,219,0.15);border-radius:14px;padding:18px;text-align:center;border:1px solid rgba(52,152,219,0.3);">
                    <i class="fas fa-check-circle" style="font-size:24px;color:#3498db;"></i>
                    <h3 style="margin:8px 0 2px;font-size:1.5rem;font-weight:800;">${cm.paid.toLocaleString()}</h3>
                    <small style="opacity:0.8;font-size:0.8rem;">المدفوع (ر.ق)</small>
                  </div>
                </div>
                <div class="col-md-3 col-6">
                  <div style="background:rgba(231,76,60,0.15);border-radius:14px;padding:18px;text-align:center;border:1px solid rgba(231,76,60,0.3);">
                    <i class="fas fa-exclamation-triangle" style="font-size:24px;color:#e74c3c;"></i>
                    <h3 style="margin:8px 0 2px;font-size:1.5rem;font-weight:800;">${cm.unpaid.toLocaleString()}</h3>
                    <small style="opacity:0.8;font-size:0.8rem;">غير المدفوع (ر.ق)</small>
                  </div>
                </div>
                <div class="col-md-3 col-6">
                  <div style="background:rgba(155,89,182,0.15);border-radius:14px;padding:18px;text-align:center;border:1px solid rgba(155,89,182,0.3);">
                    <i class="fas fa-file-invoice" style="font-size:24px;color:#9b59b6;"></i>
                    <h3 style="margin:8px 0 2px;font-size:1.5rem;font-weight:800;">${cm.count}</h3>
                    <small style="opacity:0.8;font-size:0.8rem;">عدد الفواتير</small>
                  </div>
                </div>
              </div>
              <div class="row g-2 mt-2">
                <div class="col-md-4 col-6">
                  <div style="background:rgba(255,255,255,0.08);border-radius:10px;padding:12px;text-align:center;">
                    <small style="opacity:0.7;">نسبة التحصيل</small>
                    <div style="font-size:1.3rem;font-weight:700;color:${parseFloat(collectionRate) > 70 ? '#2ecc71' : '#e74c3c'};">${collectionRate}%</div>
                    <div style="background:rgba(255,255,255,0.1);border-radius:10px;height:6px;margin-top:6px;">
                      <div style="background:${parseFloat(collectionRate) > 70 ? '#2ecc71' : '#e74c3c'};height:6px;border-radius:10px;width:${collectionRate}%;"></div>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 col-6">
                  <div style="background:rgba(255,255,255,0.08);border-radius:10px;padding:12px;text-align:center;">
                    <small style="opacity:0.7;">النمو الشهري</small>
                    <div style="font-size:1.3rem;font-weight:700;color:${parseFloat(growth) >= 0 ? '#2ecc71' : '#e74c3c'};">
                      ${parseFloat(growth) >= 0 ? '↑' : '↓'} ${Math.abs(growth)}%
                    </div>
                  </div>
                </div>
                <div class="col-md-4 col-12">
                  <div style="background:rgba(255,255,255,0.08);border-radius:10px;padding:12px;text-align:center;">
                    <small style="opacity:0.7;">إجمالي منذ البداية</small>
                    <div style="font-size:1.3rem;font-weight:700;color:#f39c12;">${TOTALS.totalRevenue.toLocaleString()} ر.ق</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    console.log('✅ Dashboard stats updated');
  }

  // ===== BUILD INVOICES LIST =====
  function buildInvoicesList() {
    const section = document.getElementById('invoices');
    if (!section) return;

    // Get all invoices from financialTransactions
    let allInvoices = [];
    try {
      const ft = window.financialTransactions || (typeof financialTransactions !== 'undefined' ? financialTransactions : []);
      allInvoices = ft.filter(t => t.type === 'فاتورة');
    } catch(e) {}

    if (allInvoices.length === 0) return;

    const paidCount = allInvoices.filter(t => t.status === 'مدفوع' || t.paymentStatus === 'Paid').length;
    const unpaidCount = allInvoices.filter(t => t.status === 'غير مدفوع' || t.paymentStatus === 'Unpaid').length;
    const totalAmount = allInvoices.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
    const paidAmount = allInvoices.filter(t => t.status === 'مدفوع' || t.paymentStatus === 'Paid').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
    const unpaidAmount = totalAmount - paidAmount;

    section.innerHTML = `
      <h2 class="section-title mb-4">💰 الفواتير</h2>
      
      <!-- Stats Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm" style="border-radius:14px;">
            <div class="card-body text-center" style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;border-radius:14px;">
              <i class="fas fa-file-invoice fa-2x mb-2"></i>
              <h3 class="mb-0">${allInvoices.length.toLocaleString()}</h3>
              <small>إجمالي الفواتير</small>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm" style="border-radius:14px;">
            <div class="card-body text-center" style="background:linear-gradient(135deg,#11998e,#38ef7d);color:white;border-radius:14px;">
              <i class="fas fa-check-double fa-2x mb-2"></i>
              <h3 class="mb-0">${paidCount.toLocaleString()}</h3>
              <small>مدفوعة (${paidAmount.toLocaleString()} ر.ق)</small>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm" style="border-radius:14px;">
            <div class="card-body text-center" style="background:linear-gradient(135deg,#eb3349,#f45c43);color:white;border-radius:14px;">
              <i class="fas fa-clock fa-2x mb-2"></i>
              <h3 class="mb-0">${unpaidCount.toLocaleString()}</h3>
              <small>غير مدفوعة (${unpaidAmount.toLocaleString()} ر.ق)</small>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="card border-0 shadow-sm" style="border-radius:14px;">
            <div class="card-body text-center" style="background:linear-gradient(135deg,#f7971e,#ffd200);color:white;border-radius:14px;">
              <i class="fas fa-coins fa-2x mb-2"></i>
              <h3 class="mb-0" style="font-size:1.2rem;">${totalAmount.toLocaleString()}</h3>
              <small>إجمالي المبلغ (ر.ق)</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter & Search -->
      <div class="card border-0 shadow-sm mb-3" style="border-radius:14px;">
        <div class="card-body">
          <div class="row g-2 align-items-end">
            <div class="col-md-4">
              <label class="form-label fw-bold"><i class="fas fa-search"></i> بحث</label>
              <input type="text" class="form-control" id="invoiceSearchV4" placeholder="بحث بالاسم أو رقم الفاتورة..." oninput="window._filterInvoicesV4()">
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold"><i class="fas fa-filter"></i> الحالة</label>
              <select class="form-select" id="invoiceStatusFilterV4" onchange="window._filterInvoicesV4()">
                <option value="all">الكل</option>
                <option value="paid">مدفوعة</option>
                <option value="unpaid">غير مدفوعة</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label fw-bold"><i class="fas fa-calendar"></i> الشهر</label>
              <select class="form-select" id="invoiceMonthFilterV4" onchange="window._filterInvoicesV4()">
                <option value="all">الكل</option>
                <option value="2025-10">أكتوبر 2025</option>
                <option value="2025-11">نوفمبر 2025</option>
                <option value="2025-12">ديسمبر 2025</option>
                <option value="2026-01">يناير 2026</option>
                <option value="2026-02">فبراير 2026</option>
                <option value="2026-03">مارس 2026</option>
              </select>
            </div>
            <div class="col-md-2">
              <button class="btn btn-success w-100" onclick="window._exportInvoicesV4()">
                <i class="fas fa-download"></i> تصدير
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoice Table -->
      <div class="card border-0 shadow-sm" style="border-radius:14px;">
        <div class="card-header d-flex justify-content-between align-items-center" style="background:linear-gradient(135deg,#2c3e50,#3498db);color:white;border-radius:14px 14px 0 0;">
          <h5 class="mb-0"><i class="fas fa-list"></i> قائمة الفواتير</h5>
          <div>
            <span class="badge bg-light text-dark" id="invoiceCountDisplayV4">${allInvoices.length} فاتورة</span>
            <button class="btn btn-sm btn-outline-light ms-2" onclick="window._printInvoicesV4()" title="طباعة">
              <i class="fas fa-print"></i>
            </button>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive" style="max-height:600px;overflow-y:auto;">
            <table class="table table-hover table-striped mb-0" id="invoicesTableV4">
              <thead class="table-dark" style="position:sticky;top:0;z-index:10;">
                <tr>
                  <th style="width:50px">#</th>
                  <th>رقم الفاتورة</th>
                  <th>العميل</th>
                  <th>التاريخ</th>
                  <th>المبلغ</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody id="invoicesTableBodyV4">
              </tbody>
            </table>
          </div>
        </div>
        <div class="card-footer text-center" id="invoicePaginationV4"></div>
      </div>
    `;

    // Store invoices globally for filtering
    window._allInvoicesV4 = allInvoices;
    window._currentPageV4 = 1;
    window._pageSizeV4 = 50;

    window._filterInvoicesV4 = function() {
      window._currentPageV4 = 1;
      window._renderInvoicesV4();
    };

    window._renderInvoicesV4 = function() {
      const search = (document.getElementById('invoiceSearchV4')?.value || '').toLowerCase();
      const statusFilter = document.getElementById('invoiceStatusFilterV4')?.value || 'all';
      const monthFilter = document.getElementById('invoiceMonthFilterV4')?.value || 'all';

      let filtered = window._allInvoicesV4.filter(function(inv) {
        // Search
        if (search && !(inv.invoiceNumber || inv.id || '').toLowerCase().includes(search) && !(inv.customer || '').toLowerCase().includes(search)) return false;
        // Status
        if (statusFilter === 'paid' && inv.paymentStatus !== 'Paid' && inv.status !== 'مدفوع') return false;
        if (statusFilter === 'unpaid' && inv.paymentStatus !== 'Unpaid' && inv.status !== 'غير مدفوع') return false;
        // Month
        if (monthFilter !== 'all') {
          const d = new Date(inv.date);
          if (isNaN(d)) return false;
          const m = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
          if (m !== monthFilter) return false;
        }
        return true;
      });

      const total = filtered.length;
      const totalPages = Math.ceil(total / window._pageSizeV4);
      const page = Math.min(window._currentPageV4, totalPages || 1);
      const start = (page - 1) * window._pageSizeV4;
      const pageData = filtered.slice(start, start + window._pageSizeV4);

      const tbody = document.getElementById('invoicesTableBodyV4');
      if (!tbody) return;

      tbody.innerHTML = pageData.map(function(inv, i) {
        const isPaid = inv.paymentStatus === 'Paid' || inv.status === 'مدفوع';
        return '<tr>' +
          '<td>' + (start + i + 1) + '</td>' +
          '<td><strong>' + (inv.invoiceNumber || inv.id || '-') + '</strong></td>' +
          '<td>' + (inv.customer || inv.clientName || '-') + '</td>' +
          '<td>' + (inv.date || '-') + '</td>' +
          '<td class="fw-bold ' + (isPaid ? 'text-success' : 'text-danger') + '">' + (parseFloat(inv.amount) || 0).toLocaleString() + ' ر.ق</td>' +
          '<td><span class="badge ' + (isPaid ? 'bg-success' : 'bg-danger') + '" style="font-size:0.8rem;padding:6px 12px;border-radius:20px;">' + (isPaid ? '✅ مدفوعة' : '⏳ غير مدفوعة') + '</span></td>' +
          '</tr>';
      }).join('');

      document.getElementById('invoiceCountDisplayV4').textContent = total + ' فاتورة';

      // Pagination
      const pag = document.getElementById('invoicePaginationV4');
      if (pag && totalPages > 1) {
        let html = '<nav><ul class="pagination pagination-sm justify-content-center mb-0">';
        html += '<li class="page-item ' + (page <= 1 ? 'disabled' : '') + '"><a class="page-link" href="#" onclick="window._currentPageV4--;window._renderInvoicesV4();return false;">السابق</a></li>';
        for (let p = Math.max(1, page-2); p <= Math.min(totalPages, page+2); p++) {
          html += '<li class="page-item ' + (p === page ? 'active' : '') + '"><a class="page-link" href="#" onclick="window._currentPageV4=' + p + ';window._renderInvoicesV4();return false;">' + p + '</a></li>';
        }
        html += '<li class="page-item ' + (page >= totalPages ? 'disabled' : '') + '"><a class="page-link" href="#" onclick="window._currentPageV4++;window._renderInvoicesV4();return false;">التالي</a></li>';
        html += '</ul></nav>';
        html += '<small class="text-muted">صفحة ' + page + ' من ' + totalPages + ' | عرض ' + start + '-' + Math.min(start + window._pageSizeV4, total) + ' من ' + total + '</small>';
        pag.innerHTML = html;
      } else if (pag) {
        pag.innerHTML = '';
      }
    };

    window._renderInvoicesV4();

    // Export function
    window._exportInvoicesV4 = function() {
      let csv = '\ufeff#,رقم الفاتورة,العميل,التاريخ,المبلغ,الحالة\n';
      window._allInvoicesV4.forEach(function(inv, i) {
        const isPaid = inv.paymentStatus === 'Paid' || inv.status === 'مدفوع';
        csv += (i+1) + ',' + (inv.invoiceNumber||inv.id||'') + ',"' + (inv.customer||'') + '",' + (inv.date||'') + ',' + (inv.amount||0) + ',' + (isPaid ? 'مدفوعة' : 'غير مدفوعة') + '\n';
      });
      const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'SuperPro_Invoices_' + new Date().toISOString().split('T')[0] + '.csv';
      link.click();
    };

    // Print function
    window._printInvoicesV4 = function() {
      const printContent = `
        <html dir="rtl"><head><title>فواتير SuperPro</title>
        <style>
          body{font-family:Cairo,Tajawal,Arial;direction:rtl;padding:20px;}
          h1{text-align:center;color:#2c3e50;} 
          table{width:100%;border-collapse:collapse;margin-top:20px;}
          th{background:#2c3e50;color:white;padding:10px;text-align:right;}
          td{padding:8px;border-bottom:1px solid #eee;text-align:right;}
          .paid{color:#27ae60;font-weight:bold;} .unpaid{color:#e74c3c;font-weight:bold;}
          .summary{display:flex;justify-content:space-around;margin:20px 0;padding:15px;background:#f8f9fa;border-radius:10px;}
          .summary div{text-align:center;} .summary h3{margin:0;color:#2c3e50;}
          @media print{body{padding:10px;font-size:12px;}}
        </style></head><body>
        <h1>🏢 SuperPro - قائمة الفواتير</h1>
        <p style="text-align:center;color:#666;">تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}</p>
        <div class="summary">
          <div><h3>${allInvoices.length}</h3><small>إجمالي الفواتير</small></div>
          <div><h3>${totalAmount.toLocaleString()} ر.ق</h3><small>إجمالي المبلغ</small></div>
          <div><h3>${paidCount}</h3><small>مدفوعة</small></div>
          <div><h3>${unpaidCount}</h3><small>غير مدفوعة</small></div>
        </div>
        <table>
          <thead><tr><th>#</th><th>رقم الفاتورة</th><th>العميل</th><th>التاريخ</th><th>المبلغ</th><th>الحالة</th></tr></thead>
          <tbody>
          ${allInvoices.map(function(inv, i) {
            const isPaid = inv.paymentStatus === 'Paid' || inv.status === 'مدفوع';
            return '<tr><td>'+(i+1)+'</td><td>'+(inv.invoiceNumber||inv.id||'')+'</td><td>'+(inv.customer||'')+'</td><td>'+(inv.date||'')+'</td><td>'+(parseFloat(inv.amount)||0).toLocaleString()+' ر.ق</td><td class="'+(isPaid?'paid':'unpaid')+'">'+(isPaid?'مدفوعة':'غير مدفوعة')+'</td></tr>';
          }).join('')}
          </tbody>
        </table>
        <script>window.onload=function(){window.print();}<\/script>
        </body></html>`;
      const w = window.open('', '_blank');
      w.document.write(printContent);
      w.document.close();
    };

    console.log('✅ Invoice list built: ' + allInvoices.length + ' invoices');
  }

  // ===== BUILD FINANCIAL REPORT =====
  function buildFinancialReport() {
    // Hook into the report section
    const reportBtn = document.getElementById('generateFinanceReport');
    if (reportBtn) {
      reportBtn.onclick = function() {
        showFinancialReport();
      };
    }

    // Also add to reports section
    const reportResult = document.getElementById('reportResult');
    const exportBtn = document.getElementById('exportReportBtn');
    if (exportBtn) {
      exportBtn.onclick = function() {
        showFinancialReport();
      };
    }
  }

  function showFinancialReport() {
    const reportResult = document.getElementById('reportResult');
    if (!reportResult) return;

    let allInvoices = [];
    try {
      const ft = window.financialTransactions || (typeof financialTransactions !== 'undefined' ? financialTransactions : []);
      allInvoices = ft.filter(t => t.type === 'فاتورة');
    } catch(e) {}

    const months = Object.keys(MONTHLY_DATA).sort();

    reportResult.innerHTML = `
      <div class="card border-0 shadow" style="border-radius:16px;">
        <div class="card-header text-white" style="background:linear-gradient(135deg,#1a1a2e,#0f3460);border-radius:16px 16px 0 0;padding:20px;">
          <div class="d-flex justify-content-between align-items-center">
            <h4 class="mb-0"><i class="fas fa-chart-pie"></i> التقرير المالي المفصل</h4>
            <div>
              <button class="btn btn-sm btn-outline-light me-2" onclick="window._printFinancialReport()"><i class="fas fa-print"></i> طباعة</button>
              <button class="btn btn-sm btn-success" onclick="window._downloadFinancialReport()"><i class="fas fa-download"></i> تحميل PDF</button>
            </div>
          </div>
          <small style="opacity:0.8;">الفترة: أكتوبر 2025 - مارس 2026 | تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}</small>
        </div>
        <div class="card-body" id="financialReportContent">
          <!-- Summary -->
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
                <small>${TOTALS.paidInvoices} فاتورة مدفوعة (${((TOTALS.totalPaid/TOTALS.totalRevenue)*100).toFixed(1)}%)</small>
              </div>
            </div>
            <div class="col-md-4">
              <div style="background:linear-gradient(135deg,#e74c3c,#c0392b);color:white;border-radius:14px;padding:20px;text-align:center;">
                <h6 style="opacity:0.9;">المبالغ المتبقية</h6>
                <h2 style="font-weight:800;">${TOTALS.totalUnpaid.toLocaleString()} ر.ق</h2>
                <small>${TOTALS.unpaidInvoices} فاتورة غير مدفوعة</small>
              </div>
            </div>
          </div>

          <!-- Monthly Breakdown -->
          <h5 class="mt-4 mb-3"><i class="fas fa-calendar-alt text-primary"></i> التفصيل الشهري</h5>
          <div class="table-responsive">
            <table class="table table-bordered table-hover">
              <thead class="table-dark">
                <tr>
                  <th>الشهر</th>
                  <th>الإيرادات</th>
                  <th>المدفوع</th>
                  <th>غير المدفوع</th>
                  <th>عدد الفواتير</th>
                  <th>نسبة التحصيل</th>
                  <th>النمو</th>
                </tr>
              </thead>
              <tbody>
                ${months.map(function(m, i) {
                  const d = MONTHLY_DATA[m];
                  const prev = i > 0 ? MONTHLY_DATA[months[i-1]].revenue : 0;
                  const growth = prev > 0 ? (((d.revenue - prev) / prev) * 100).toFixed(1) : '-';
                  const collRate = ((d.paid/d.revenue)*100).toFixed(1);
                  return '<tr>' +
                    '<td class="fw-bold">' + d.label + '</td>' +
                    '<td class="text-success fw-bold">' + d.revenue.toLocaleString() + ' ر.ق</td>' +
                    '<td>' + d.paid.toLocaleString() + ' ر.ق</td>' +
                    '<td class="text-danger">' + d.unpaid.toLocaleString() + ' ر.ق</td>' +
                    '<td class="text-center">' + d.count + '</td>' +
                    '<td><div class="progress" style="height:20px;"><div class="progress-bar ' + (parseFloat(collRate) > 80 ? 'bg-success' : parseFloat(collRate) > 60 ? 'bg-warning' : 'bg-danger') + '" style="width:' + collRate + '%;font-size:0.75rem;">' + collRate + '%</div></div></td>' +
                    '<td class="fw-bold ' + (growth !== '-' && parseFloat(growth) >= 0 ? 'text-success' : 'text-danger') + '">' + (growth !== '-' ? (parseFloat(growth) >= 0 ? '↑' : '↓') + ' ' + Math.abs(parseFloat(growth)) + '%' : '-') + '</td>' +
                    '</tr>';
                }).join('')}
                <tr class="table-warning fw-bold">
                  <td>الإجمالي</td>
                  <td class="text-success">${TOTALS.totalRevenue.toLocaleString()} ر.ق</td>
                  <td>${TOTALS.totalPaid.toLocaleString()} ر.ق</td>
                  <td class="text-danger">${TOTALS.totalUnpaid.toLocaleString()} ر.ق</td>
                  <td class="text-center">${TOTALS.totalInvoices}</td>
                  <td>${((TOTALS.totalPaid/TOTALS.totalRevenue)*100).toFixed(1)}%</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Top Customers -->
          <h5 class="mt-4 mb-3"><i class="fas fa-trophy text-warning"></i> أفضل 20 عميل</h5>
          <div class="table-responsive">
            <table class="table table-bordered table-hover table-sm">
              <thead class="table-primary">
                <tr><th>#</th><th>العميل</th><th>إجمالي المبلغ</th><th>عدد الفواتير</th><th>متوسط الفاتورة</th></tr>
              </thead>
              <tbody>
                ${TOP_CUSTOMERS.map(function(c, i) {
                  return '<tr><td class="fw-bold">' + (i+1) + '</td><td>' + c.name + '</td><td class="text-success fw-bold">' + c.total.toLocaleString() + ' ر.ق</td><td class="text-center">' + c.count + '</td><td>' + Math.round(c.total/c.count).toLocaleString() + ' ر.ق</td></tr>';
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Unpaid Invoices Detail -->
          <h5 class="mt-4 mb-3"><i class="fas fa-exclamation-circle text-danger"></i> الفواتير غير المدفوعة (${TOTALS.unpaidInvoices} فاتورة)</h5>
          <div class="table-responsive" style="max-height:400px;overflow-y:auto;">
            <table class="table table-bordered table-hover table-sm">
              <thead class="table-danger" style="position:sticky;top:0;">
                <tr><th>#</th><th>رقم الفاتورة</th><th>العميل</th><th>التاريخ</th><th>المبلغ</th></tr>
              </thead>
              <tbody>
                ${allInvoices.filter(function(inv) { return inv.paymentStatus === 'Unpaid' || inv.status === 'غير مدفوع'; }).map(function(inv, i) {
                  return '<tr><td>' + (i+1) + '</td><td>' + (inv.invoiceNumber||inv.id||'') + '</td><td>' + (inv.customer||'') + '</td><td>' + (inv.date||'') + '</td><td class="text-danger fw-bold">' + (parseFloat(inv.amount)||0).toLocaleString() + ' ر.ق</td></tr>';
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Print function
    window._printFinancialReport = function() {
      const content = document.getElementById('financialReportContent');
      if (!content) return;
      const w = window.open('', '_blank');
      w.document.write(`
        <html dir="rtl"><head><title>التقرير المالي - SuperPro</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>body{font-family:Cairo,Tajawal,Arial;direction:rtl;padding:30px;}h1{text-align:center;margin-bottom:20px;} @media print{.no-print{display:none!important;}}</style>
        </head><body>
        <h1>🏢 SuperPro - التقرير المالي المفصل</h1>
        <p style="text-align:center;color:#666;">الفترة: أكتوبر 2025 - مارس 2026 | تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</p>
        <hr>
        ${content.innerHTML}
        <script>setTimeout(function(){window.print();},1000);<\/script>
        </body></html>
      `);
      w.document.close();
    };

    // Download PDF function
    window._downloadFinancialReport = function() {
      if (typeof html2pdf !== 'undefined') {
        const content = document.getElementById('financialReportContent');
        html2pdf().set({
          margin: 10,
          filename: 'SuperPro_Financial_Report_' + new Date().toISOString().split('T')[0] + '.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(content).save();
      } else {
        window._printFinancialReport();
      }
    };

    console.log('✅ Financial report built');
  }

  // ===== BUILD ALERTS =====
  function buildAlerts() {
    const alertsDiv = document.getElementById('recentAlerts');
    if (!alertsDiv) return;

    let unpaidInvoices = [];
    try {
      const ft = window.financialTransactions || (typeof financialTransactions !== 'undefined' ? financialTransactions : []);
      unpaidInvoices = ft.filter(t => t.type === 'فاتورة' && (t.paymentStatus === 'Unpaid' || t.status === 'غير مدفوع'));
    } catch(e) {}

    const alertsCount = document.getElementById('alertsCount');
    if (alertsCount) alertsCount.textContent = unpaidInvoices.length;

    const topUnpaid = unpaidInvoices.slice(0, 8);
    alertsDiv.innerHTML = topUnpaid.map(function(inv) {
      return `
        <div class="d-flex align-items-center p-2 mb-2" style="background:#fff5f5;border-radius:10px;border-right:4px solid #e74c3c;">
          <i class="fas fa-exclamation-circle text-danger me-2"></i>
          <div class="flex-grow-1">
            <strong>${inv.customer || ''}</strong>
            <small class="text-muted d-block">${inv.invoiceNumber || inv.id || ''} - ${inv.date || ''}</small>
          </div>
          <span class="badge bg-danger">${(parseFloat(inv.amount)||0).toLocaleString()} ر.ق</span>
        </div>
      `;
    }).join('') + (unpaidInvoices.length > 8 ? '<div class="text-center mt-2"><small class="text-muted">و ' + (unpaidInvoices.length - 8) + ' فاتورة أخرى غير مدفوعة</small></div>' : '');

    console.log('✅ Alerts built: ' + unpaidInvoices.length + ' unpaid');
  }

  // Start
  waitForSystem();
})();
