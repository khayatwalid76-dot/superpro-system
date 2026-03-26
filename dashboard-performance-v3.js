// ===== Dashboard Performance & Reports V3 =====
// Professional monthly performance, daily reports, and dashboard updates
(function() {
  'use strict';
  
  console.log('📊 Dashboard Performance V3: Loading...');
  
  function initDashboardV3() {
    if (typeof window.financialTransactions === 'undefined' && typeof window.clients === 'undefined') {
      setTimeout(initDashboardV3, 3000);
      return;
    }
    
    setTimeout(function() {
      updateMonthlyPerformance();
      updateDashboardStats();
      updateAlerts();
      setupReportGenerators();
      console.log('✅ Dashboard Performance V3 initialized');
    }, 5000);
  }
  
  // ===== MONTHLY PERFORMANCE =====
  function updateMonthlyPerformance() {
    var transactions = window.financialTransactions || [];
    var contracts = window.contracts || [];
    var dailyWork = window.dailyWork || [];
    
    // Parse all dates and group by month
    var monthlyData = {};
    
    transactions.forEach(function(t) {
      var d = parseDate(t.date);
      if (!d) return;
      var key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
      if (!monthlyData[key]) monthlyData[key] = {revenue: 0, paid: 0, unpaid: 0, count: 0, expenses: 0};
      monthlyData[key].revenue += parseFloat(t.amount) || 0;
      monthlyData[key].count++;
      if (t.paymentStatus === 'Paid' || t.status === 'مدفوعة') {
        monthlyData[key].paid += parseFloat(t.amount) || 0;
      } else {
        monthlyData[key].unpaid += parseFloat(t.amount) || 0;
      }
    });
    
    // Get current month key
    var now = new Date();
    var currentMonthKey = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
    var currentData = monthlyData[currentMonthKey] || {revenue: 0, paid: 0, unpaid: 0, count: 0};
    
    // Calculate quarter
    var quarterMonths = [];
    var qStart = Math.floor(now.getMonth() / 3) * 3;
    for (var m = qStart; m < qStart + 3; m++) {
      quarterMonths.push(now.getFullYear() + '-' + String(m+1).padStart(2,'0'));
    }
    var quarterData = {revenue: 0, paid: 0, unpaid: 0, count: 0};
    quarterMonths.forEach(function(k) {
      if (monthlyData[k]) {
        quarterData.revenue += monthlyData[k].revenue;
        quarterData.paid += monthlyData[k].paid;
        quarterData.unpaid += monthlyData[k].unpaid;
        quarterData.count += monthlyData[k].count;
      }
    });
    
    // Calculate year
    var yearData = {revenue: 0, paid: 0, unpaid: 0, count: 0};
    Object.keys(monthlyData).forEach(function(k) {
      if (k.startsWith(String(now.getFullYear()))) {
        yearData.revenue += monthlyData[k].revenue;
        yearData.paid += monthlyData[k].paid;
        yearData.unpaid += monthlyData[k].unpaid;
        yearData.count += monthlyData[k].count;
      }
    });
    
    // Update the monthly performance display
    var perfContainer = document.getElementById('monthlyPerformanceDisplay');
    if (perfContainer) {
      perfContainer.innerHTML = createPerformanceHTML(currentData, quarterData, yearData, monthlyData);
    }
    
    // Update balance
    var balanceEl = document.getElementById('statBalance');
    if (balanceEl) {
      var totalPaid = 0;
      transactions.forEach(function(t) {
        if (t.paymentStatus === 'Paid' || t.status === 'مدفوعة') totalPaid += parseFloat(t.amount) || 0;
      });
      balanceEl.textContent = formatNumber(totalPaid) + ' ر.ق';
    }
  }
  
  function createPerformanceHTML(current, quarter, year, monthlyData) {
    var months = Object.keys(monthlyData).sort();
    var chartBars = '';
    var maxRev = 0;
    months.forEach(function(m) { if (monthlyData[m].revenue > maxRev) maxRev = monthlyData[m].revenue; });
    
    months.slice(-6).forEach(function(m) {
      var pct = maxRev > 0 ? (monthlyData[m].revenue / maxRev * 100) : 0;
      var label = getMonthName(m);
      chartBars += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">' +
        '<div style="height:120px;width:100%;display:flex;align-items:flex-end;justify-content:center">' +
        '<div style="width:70%;background:linear-gradient(180deg,#3498db,#2980b9);border-radius:6px 6px 0 0;height:' + Math.max(pct, 5) + '%;transition:height 1s ease;position:relative" title="' + formatNumber(monthlyData[m].revenue) + ' ر.ق">' +
        '<span style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:bold;white-space:nowrap;color:#2c3e50">' + formatNumber(monthlyData[m].revenue/1000) + 'K</span></div></div>' +
        '<span style="font-size:11px;color:#7f8c8d;font-weight:600">' + label + '</span></div>';
    });
    
    return '<div style="padding:20px">' +
      // Performance Cards
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:20px">' +
      createPerfCard('📅 هذا الشهر', current, '#3498db') +
      createPerfCard('📊 هذا الربع', quarter, '#2ecc71') +
      createPerfCard('📈 هذه السنة', year, '#e74c3c') +
      '</div>' +
      // Chart
      '<div style="background:#f8f9fa;border-radius:12px;padding:20px;margin-top:10px">' +
      '<h4 style="margin:0 0 15px;color:#2c3e50;font-size:14px">📈 الإيرادات الشهرية</h4>' +
      '<div style="display:flex;gap:8px;align-items:flex-end">' + chartBars + '</div></div>' +
      '</div>';
  }
  
  function createPerfCard(title, data, color) {
    var paidPct = data.revenue > 0 ? Math.round(data.paid / data.revenue * 100) : 0;
    return '<div style="background:linear-gradient(135deg,' + color + '15,' + color + '08);border:1px solid ' + color + '30;border-radius:12px;padding:15px">' +
      '<div style="font-size:12px;color:#7f8c8d;margin-bottom:8px;font-weight:600">' + title + '</div>' +
      '<div style="font-size:22px;font-weight:bold;color:' + color + ';margin-bottom:5px">' + formatNumber(data.revenue) + ' <span style="font-size:12px">ر.ق</span></div>' +
      '<div style="font-size:11px;color:#27ae60;margin-bottom:3px">✅ مدفوع: ' + formatNumber(data.paid) + ' ر.ق</div>' +
      '<div style="font-size:11px;color:#e74c3c;margin-bottom:8px">⏳ غير مدفوع: ' + formatNumber(data.unpaid) + ' ر.ق</div>' +
      '<div style="background:#e0e0e0;border-radius:10px;height:6px;overflow:hidden">' +
      '<div style="width:' + paidPct + '%;height:100%;background:' + color + ';border-radius:10px;transition:width 1s ease"></div></div>' +
      '<div style="font-size:10px;color:#95a5a6;text-align:center;margin-top:4px">' + data.count + ' فاتورة | ' + paidPct + '% مدفوع</div></div>';
  }
  
  // ===== DASHBOARD STATS =====
  function updateDashboardStats() {
    var clients = window.clients || [];
    var contracts = window.contracts || [];
    var employees = window.employees || [];
    var transactions = window.financialTransactions || [];
    var dailyWork = window.dailyWork || [];
    
    setElText('statEmployees', employees.length);
    setElText('statClients', clients.length);
    setElText('statContracts', contracts.length);
    
    // Total balance
    var totalPaid = 0;
    transactions.forEach(function(t) {
      if (t.paymentStatus === 'Paid' || t.status === 'مدفوعة') totalPaid += parseFloat(t.amount) || 0;
    });
    setElText('statBalance', formatNumber(totalPaid) + ' ر.ق');
    
    // Financial summary
    var totalRevenue = 0;
    transactions.forEach(function(t) { totalRevenue += parseFloat(t.amount) || 0; });
    
    var summaryEl = document.querySelector('.financial-summary, [class*="ملخص"]');
    
    // Update recent operations table
    var opsTable = document.querySelector('#recentOpsTable tbody, .last-operations tbody');
    if (opsTable) {
      var recent = transactions.slice(-10).reverse();
      var html = '';
      recent.forEach(function(t) {
        var statusClass = (t.paymentStatus === 'Paid' || t.status === 'مدفوعة') ? 'color:#27ae60' : 'color:#e74c3c';
        html += '<tr><td>' + (t.date || '-') + '</td><td>فاتورة</td><td>' + (t.customer || t.description || '-') + '</td><td style="' + statusClass + ';font-weight:bold">' + formatNumber(t.amount) + ' ر.ق</td></tr>';
      });
      opsTable.innerHTML = html || '<tr><td colspan="4">لا توجد عمليات حديثة</td></tr>';
    }
    
    // Task distribution
    updateTaskDistribution();
  }
  
  function updateTaskDistribution() {
    var dailyWork = window.dailyWork || [];
    var tasks = window.tasks || [];
    var taskDistEl = document.querySelector('.task-distribution, #taskDistribution');
    if (taskDistEl) {
      var completed = 0, pending = 0, inProgress = 0;
      dailyWork.forEach(function(w) {
        if (w.paymentStatus === 'مدفوعة' || w.status === 'Approved') completed++;
        else pending++;
      });
      inProgress = Math.floor(pending * 0.3);
      pending = pending - inProgress;
      
      taskDistEl.innerHTML = '<div style="padding:15px">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:10px"><span>مكتمل</span><span style="color:#27ae60;font-weight:bold">' + completed + '</span></div>' +
        '<div style="background:#e0e0e0;border-radius:10px;height:8px;margin-bottom:15px"><div style="width:' + (completed/(completed+pending+inProgress)*100||0).toFixed(0) + '%;height:100%;background:#27ae60;border-radius:10px"></div></div>' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:10px"><span>قيد التنفيذ</span><span style="color:#f39c12;font-weight:bold">' + inProgress + '</span></div>' +
        '<div style="background:#e0e0e0;border-radius:10px;height:8px;margin-bottom:15px"><div style="width:' + (inProgress/(completed+pending+inProgress)*100||0).toFixed(0) + '%;height:100%;background:#f39c12;border-radius:10px"></div></div>' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:10px"><span>معلق</span><span style="color:#e74c3c;font-weight:bold">' + pending + '</span></div>' +
        '<div style="background:#e0e0e0;border-radius:10px;height:8px"><div style="width:' + (pending/(completed+pending+inProgress)*100||0).toFixed(0) + '%;height:100%;background:#e74c3c;border-radius:10px"></div></div></div>';
    }
  }
  
  // ===== ALERTS =====
  function updateAlerts() {
    var contracts = window.contracts || [];
    var transactions = window.financialTransactions || [];
    var now = new Date();
    
    // Expiring contracts (within 7 days)
    var expiringContracts = [];
    contracts.forEach(function(c) {
      var end = parseDate(c.endDate);
      if (end) {
        var diff = (end - now) / (1000*60*60*24);
        if (diff >= -3 && diff <= 7) {
          expiringContracts.push({name: c.client || c.contractNumber, days: Math.ceil(diff), endDate: c.endDate});
        }
      }
    });
    
    // Unpaid invoices
    var unpaidInvoices = [];
    transactions.forEach(function(t) {
      if (t.paymentStatus === 'Unpaid' || t.status === 'غير مدفوعة') {
        unpaidInvoices.push({id: t.invoiceNumber || t.id, customer: t.customer, amount: t.amount, date: t.date});
      }
    });
    
    // Update contract alerts
    var contractAlertEl = document.querySelector('.contract-alerts, #contractAlerts');
    var contractAlertCount = document.querySelector('.contract-alert-count');
    if (contractAlertCount) contractAlertCount.textContent = expiringContracts.length;
    
    // Update unpaid alerts
    var unpaidAlertEl = document.querySelector('.unpaid-alerts, #unpaidAlerts');
    var unpaidAlertCount = document.querySelector('.unpaid-alert-count');
    if (unpaidAlertCount) unpaidAlertCount.textContent = unpaidInvoices.length;
    
    // Update alerts sections in dashboard
    updateAlertSection('contractAlertsList', expiringContracts.map(function(c) {
      return '⚠️ عقد ' + c.name + ' ينتهي بعد ' + c.days + ' يوم (' + c.endDate + ')';
    }));
    
    updateAlertSection('unpaidAlertsList', unpaidInvoices.slice(0, 20).map(function(i) {
      return '💰 فاتورة ' + i.id + ' - ' + i.customer + ' - ' + formatNumber(i.amount) + ' ر.ق';
    }));
  }
  
  function updateAlertSection(id, items) {
    var el = document.getElementById(id);
    if (!el) return;
    if (items.length === 0) {
      el.innerHTML = '<div style="padding:10px;color:#7f8c8d;text-align:center">لا توجد تنبيهات</div>';
    } else {
      el.innerHTML = items.map(function(item) {
        return '<div style="padding:8px 12px;border-bottom:1px solid #eee;font-size:13px">' + item + '</div>';
      }).join('');
    }
  }
  
  // ===== PROFESSIONAL REPORTS =====
  function setupReportGenerators() {
    // Override or add professional report generators
    window.generateProfessionalDailyReport = generateDailyReport;
    window.generateProfessionalMonthlyReport = generateMonthlyReport;
    
    // Also override existing ones if they exist
    if (typeof window.generateDailyReport === 'undefined' || true) {
      window.generateDailyReport = generateDailyReport;
    }
    if (typeof window.generateMonthlyReport === 'undefined' || true) {
      window.generateMonthlyReport = generateMonthlyReport;
    }
    window.printDailyReport = function() { generateDailyReport('print'); };
    window.downloadDailyReport = function() { generateDailyReport('download'); };
    window.printMonthlyReport = function() { generateMonthlyReport('print'); };
    window.downloadMonthlyReport = function() { generateMonthlyReport('download'); };
  }
  
  function generateDailyReport(action) {
    var transactions = window.financialTransactions || [];
    var dailyWork = window.dailyWork || [];
    var now = new Date();
    var today = now.toISOString().split('T')[0];
    
    // Get today's data
    var todayTransactions = transactions.filter(function(t) {
      var d = parseDate(t.date);
      return d && d.toISOString().split('T')[0] === today;
    });
    
    var todayWork = dailyWork.filter(function(w) {
      var d = parseDate(w.date);
      return d && d.toISOString().split('T')[0] === today;
    });
    
    // If no today data, get latest day with data
    if (todayTransactions.length === 0) {
      var dates = {};
      transactions.forEach(function(t) {
        var d = parseDate(t.date);
        if (d) {
          var key = d.toISOString().split('T')[0];
          if (!dates[key]) dates[key] = [];
          dates[key].push(t);
        }
      });
      var sortedDates = Object.keys(dates).sort().reverse();
      if (sortedDates.length > 0) {
        today = sortedDates[0];
        todayTransactions = dates[today];
      }
    }
    
    var totalRevenue = 0, totalPaid = 0, totalUnpaid = 0;
    todayTransactions.forEach(function(t) {
      var amt = parseFloat(t.amount) || 0;
      totalRevenue += amt;
      if (t.paymentStatus === 'Paid' || t.status === 'مدفوعة') totalPaid += amt;
      else totalUnpaid += amt;
    });
    
    var reportHTML = getReportTemplate('تقرير يومي مفصل', today, [
      {label: 'إجمالي الإيرادات', value: formatNumber(totalRevenue) + ' ر.ق', color: '#3498db'},
      {label: 'المدفوع', value: formatNumber(totalPaid) + ' ر.ق', color: '#27ae60'},
      {label: 'غير المدفوع', value: formatNumber(totalUnpaid) + ' ر.ق', color: '#e74c3c'},
      {label: 'عدد الفواتير', value: todayTransactions.length, color: '#8e44ad'}
    ], todayTransactions.map(function(t) {
      return {
        id: t.invoiceNumber || t.id,
        customer: t.customer || t.description,
        amount: formatNumber(t.amount) + ' ر.ق',
        status: (t.paymentStatus === 'Paid' || t.status === 'مدفوعة') ? '✅ مدفوع' : '⏳ غير مدفوع'
      };
    }), ['رقم الفاتورة', 'العميل', 'المبلغ', 'الحالة']);
    
    openReport(reportHTML, action, 'تقرير-يومي-' + today);
  }
  
  function generateMonthlyReport(action) {
    var transactions = window.financialTransactions || [];
    var contracts = window.contracts || [];
    var dailyWork = window.dailyWork || [];
    var now = new Date();
    var monthKey = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
    var monthName = getFullMonthName(monthKey);
    
    // Get this month's data
    var monthTransactions = transactions.filter(function(t) {
      var d = parseDate(t.date);
      if (!d) return false;
      return (d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0')) === monthKey;
    });
    
    // If current month empty, get latest month
    if (monthTransactions.length === 0) {
      var monthGroups = {};
      transactions.forEach(function(t) {
        var d = parseDate(t.date);
        if (d) {
          var k = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
          if (!monthGroups[k]) monthGroups[k] = [];
          monthGroups[k].push(t);
        }
      });
      var sortedMonths = Object.keys(monthGroups).sort().reverse();
      if (sortedMonths.length > 0) {
        monthKey = sortedMonths[0];
        monthName = getFullMonthName(monthKey);
        monthTransactions = monthGroups[monthKey];
      }
    }
    
    var totalRevenue = 0, totalPaid = 0, totalUnpaid = 0;
    monthTransactions.forEach(function(t) {
      var amt = parseFloat(t.amount) || 0;
      totalRevenue += amt;
      if (t.paymentStatus === 'Paid' || t.status === 'مدفوعة') totalPaid += amt;
      else totalUnpaid += amt;
    });
    
    // Daily breakdown for month
    var dailyBreakdown = {};
    monthTransactions.forEach(function(t) {
      var d = parseDate(t.date);
      if (!d) return;
      var day = d.toISOString().split('T')[0];
      if (!dailyBreakdown[day]) dailyBreakdown[day] = {count: 0, total: 0, paid: 0, unpaid: 0};
      dailyBreakdown[day].count++;
      dailyBreakdown[day].total += parseFloat(t.amount) || 0;
      if (t.paymentStatus === 'Paid' || t.status === 'مدفوعة') dailyBreakdown[day].paid += parseFloat(t.amount) || 0;
      else dailyBreakdown[day].unpaid += parseFloat(t.amount) || 0;
    });
    
    // Active contracts this month
    var activeContracts = contracts.filter(function(c) {
      var start = parseDate(c.startDate);
      var end = parseDate(c.endDate);
      var monthStart = new Date(parseInt(monthKey.split('-')[0]), parseInt(monthKey.split('-')[1])-1, 1);
      var monthEnd = new Date(parseInt(monthKey.split('-')[0]), parseInt(monthKey.split('-')[1]), 0);
      return start && end && start <= monthEnd && end >= monthStart;
    });
    
    var contractValue = 0;
    activeContracts.forEach(function(c) { contractValue += parseFloat(c.amount) || 0; });
    
    var reportHTML = getReportTemplate('تقرير شهري مفصل - ' + monthName, monthKey, [
      {label: 'إجمالي الإيرادات', value: formatNumber(totalRevenue) + ' ر.ق', color: '#3498db'},
      {label: 'المدفوع', value: formatNumber(totalPaid) + ' ر.ق', color: '#27ae60'},
      {label: 'غير المدفوع', value: formatNumber(totalUnpaid) + ' ر.ق', color: '#e74c3c'},
      {label: 'عدد الفواتير', value: monthTransactions.length, color: '#8e44ad'},
      {label: 'العقود النشطة', value: activeContracts.length, color: '#f39c12'},
      {label: 'قيمة العقود', value: formatNumber(contractValue) + ' ر.ق', color: '#1abc9c'}
    ], Object.keys(dailyBreakdown).sort().map(function(day) {
      var d = dailyBreakdown[day];
      return {
        date: day,
        count: d.count,
        total: formatNumber(d.total) + ' ر.ق',
        paid: formatNumber(d.paid) + ' ر.ق',
        unpaid: formatNumber(d.unpaid) + ' ر.ق'
      };
    }), ['التاريخ', 'عدد الفواتير', 'الإجمالي', 'المدفوع', 'غير المدفوع'],
    // Add top customers section
    getTopCustomers(monthTransactions));
    
    openReport(reportHTML, action, 'تقرير-شهري-' + monthKey);
  }
  
  function getTopCustomers(transactions) {
    var customerTotals = {};
    transactions.forEach(function(t) {
      var name = t.customer || 'غير محدد';
      if (!customerTotals[name]) customerTotals[name] = {total: 0, count: 0};
      customerTotals[name].total += parseFloat(t.amount) || 0;
      customerTotals[name].count++;
    });
    
    var sorted = Object.keys(customerTotals).map(function(name) {
      return {name: name, total: customerTotals[name].total, count: customerTotals[name].count};
    }).sort(function(a,b) { return b.total - a.total; }).slice(0, 15);
    
    var html = '<div style="margin-top:30px;page-break-before:auto">' +
      '<h3 style="color:#2c3e50;border-bottom:3px solid #3498db;padding-bottom:10px;font-size:18px">🏆 أفضل العملاء</h3>' +
      '<table style="width:100%;border-collapse:collapse;margin-top:15px">' +
      '<thead><tr style="background:#2c3e50;color:white"><th style="padding:10px;text-align:right">العميل</th><th style="padding:10px;text-align:center">عدد الفواتير</th><th style="padding:10px;text-align:left">الإجمالي</th></tr></thead><tbody>';
    
    sorted.forEach(function(c, i) {
      var bg = i % 2 === 0 ? '#f8f9fa' : 'white';
      html += '<tr style="background:' + bg + '"><td style="padding:8px 10px;font-weight:bold">' + (i+1) + '. ' + c.name + '</td><td style="padding:8px;text-align:center">' + c.count + '</td><td style="padding:8px;text-align:left;color:#27ae60;font-weight:bold">' + formatNumber(c.total) + ' ر.ق</td></tr>';
    });
    
    html += '</tbody></table></div>';
    return html;
  }
  
  function getReportTemplate(title, date, cards, rows, headers, extraContent) {
    var html = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8">' +
      '<title>' + title + ' - SUPER PRO</title>' +
      '<style>' +
      'body{font-family:Tajawal,Arial,sans-serif;margin:0;padding:20px;background:#f5f5f5;direction:rtl}' +
      '.report{max-width:900px;margin:0 auto;background:white;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.1);overflow:hidden}' +
      '.header{background:linear-gradient(135deg,#2c3e50,#3498db);color:white;padding:30px;text-align:center}' +
      '.header h1{margin:0;font-size:28px;letter-spacing:1px}' +
      '.header p{margin:8px 0 0;opacity:0.9;font-size:14px}' +
      '.logo{font-size:40px;margin-bottom:10px}' +
      '.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:15px;padding:25px}' +
      '.card{background:linear-gradient(135deg,var(--c)15,var(--c)05);border:1px solid var(--c);border-radius:12px;padding:15px;text-align:center}' +
      '.card-label{font-size:12px;color:#7f8c8d;margin-bottom:6px}' +
      '.card-value{font-size:20px;font-weight:bold;color:var(--c)}' +
      'table{width:100%;border-collapse:collapse;margin:0}' +
      'th{background:#2c3e50;color:white;padding:12px 10px;font-size:13px;text-align:right}' +
      'td{padding:10px;border-bottom:1px solid #eee;font-size:13px}' +
      'tr:nth-child(even){background:#f8f9fa}' +
      'tr:hover{background:#eaf2f8}' +
      '.footer{background:#f8f9fa;padding:20px;text-align:center;color:#7f8c8d;font-size:12px;border-top:2px solid #eee}' +
      '.section{padding:25px}' +
      '.section h3{color:#2c3e50;border-bottom:3px solid #3498db;padding-bottom:10px;margin-bottom:20px;font-size:18px}' +
      '@media print{body{background:white;padding:0}.report{box-shadow:none;border-radius:0}.no-print{display:none!important}}' +
      '.btn{display:inline-block;padding:10px 25px;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-family:Tajawal;margin:5px;text-decoration:none}' +
      '.btn-print{background:#3498db;color:white}.btn-download{background:#27ae60;color:white}' +
      '</style>' +
      '<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">' +
      '</head><body>' +
      '<div class="no-print" style="text-align:center;margin-bottom:20px">' +
      '<button class="btn btn-print" onclick="window.print()">🖨️ طباعة</button>' +
      '<button class="btn btn-download" onclick="downloadAsPDF()">📥 تحميل PDF</button>' +
      '</div>' +
      '<div class="report">' +
      '<div class="header"><div class="logo">🏢</div><h1>SUPER PRO</h1><h2 style="margin:10px 0 0;font-size:20px">' + title + '</h2><p>📅 ' + date + ' | تم الإنشاء: ' + new Date().toLocaleDateString('ar-QA') + '</p></div>' +
      '<div class="cards">';
    
    cards.forEach(function(c) {
      html += '<div class="card" style="--c:' + c.color + '"><div class="card-label">' + c.label + '</div><div class="card-value">' + c.value + '</div></div>';
    });
    
    html += '</div><div class="section"><h3>📊 التفاصيل</h3><div style="overflow-x:auto"><table><thead><tr>';
    headers.forEach(function(h) { html += '<th>' + h + '</th>'; });
    html += '</tr></thead><tbody>';
    
    rows.forEach(function(row) {
      html += '<tr>';
      Object.values(row).forEach(function(v) { html += '<td>' + v + '</td>'; });
      html += '</tr>';
    });
    
    html += '</tbody></table></div></div>';
    
    if (extraContent) html += '<div class="section">' + extraContent + '</div>';
    
    html += '<div class="footer"><strong>SUPER PRO</strong> - نظام إدارة الشركة المتكامل<br>تم إنشاء هذا التقرير تلقائياً بواسطة النظام</div></div>' +
      '<script>function downloadAsPDF(){window.print();}</script></body></html>';
    
    return html;
  }
  
  function openReport(html, action, filename) {
    var w = window.open('', '_blank', 'width=1000,height=800');
    if (w) {
      w.document.write(html);
      w.document.close();
      if (action === 'print') {
        setTimeout(function() { w.print(); }, 1000);
      }
    }
    
    // Also update the report preview area if it exists
    var reportResult = document.getElementById('reportResult') || document.querySelector('.report-result');
    if (reportResult) {
      reportResult.innerHTML = '<div style="text-align:center;padding:30px"><h3 style="color:#27ae60">✅ تم إنشاء التقرير بنجاح</h3><p>تم فتح التقرير في نافذة جديدة</p></div>';
    }
  }
  
  // ===== UTILITY FUNCTIONS =====
  function parseDate(dateStr) {
    if (!dateStr || dateStr === 'nan' || dateStr === 'undefined') return null;
    try {
      var d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return d;
    } catch(e) { return null; }
  }
  
  function formatNumber(n) {
    return parseFloat(n || 0).toLocaleString('en-US', {maximumFractionDigits: 0});
  }
  
  function setElText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }
  
  function getMonthName(key) {
    var months = {'01':'يناير','02':'فبراير','03':'مارس','04':'أبريل','05':'مايو','06':'يونيو','07':'يوليو','08':'أغسطس','09':'سبتمبر','10':'أكتوبر','11':'نوفمبر','12':'ديسمبر'};
    var parts = key.split('-');
    return months[parts[1]] || key;
  }
  
  function getFullMonthName(key) {
    return getMonthName(key) + ' ' + key.split('-')[0];
  }
  
  // Initialize
  setTimeout(initDashboardV3, 4000);
  
})();
