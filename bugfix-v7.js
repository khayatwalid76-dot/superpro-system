// ============================================================================
// BUGFIX V7.0 - Comprehensive Fix: Firebase Data, Dashboard Alerts, Notifications
// ============================================================================
(function() {
  'use strict';
  console.log('🔧 BugFix V7.0: Starting comprehensive fixes...');

  function ensureArray(val) {
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'object') {
      return Object.values(val).filter(function(v) { return v != null; });
    }
    return [];
  }

  function safeStr(val) {
    if (val === undefined || val === null) return '';
    return String(val);
  }

  var DATA_KEYS = ['employees','clients','contracts','dailyWork','dailyIncome','dailyExpenses',
    'attendance','services','tasks','events','monthlyExpenses',
    'financialTransactions','salaryAdvances'];

  // ========================================================================
  // FIX A: Patch applyData IMMEDIATELY (before DOMContentLoaded)
  // This ensures Firebase objects are converted to arrays before any rendering
  // ========================================================================
  function patchApplyData() {
    var orig = window.applyData;
    if (typeof orig !== 'function' || orig._v7patched) return;

    window.applyData = function(data) {
      // Convert all Firebase objects to arrays
      DATA_KEYS.forEach(function(key) {
        if (data[key] && !Array.isArray(data[key]) && typeof data[key] === 'object') {
          data[key] = Object.values(data[key]).filter(function(v) { return v != null; });
          console.log('🔧 V7: applyData converted ' + key + ' (' + data[key].length + ' items)');
        } else if (Array.isArray(data[key])) {
          data[key] = data[key].filter(function(v) { return v != null; });
        }
      });
      // Call original
      orig.call(this, data);

      // Ensure window variables are synced as arrays
      DATA_KEYS.forEach(function(key) {
        if (window[key] && !Array.isArray(window[key])) {
          window[key] = ensureArray(window[key]);
        }
      });
    };
    window.applyData._v7patched = true;
    console.log('✅ V7: applyData patched (immediate)');
  }

  // Execute IMMEDIATELY - this runs before DOMContentLoaded
  patchApplyData();

  // ========================================================================
  // FIX B: Also patch saveData to always ensure arrays before saving
  // ========================================================================
  function patchSaveData() {
    var origSave = window.saveData;
    if (typeof origSave !== 'function' || origSave._v7patched) return;

    window.saveData = function() {
      // Ensure all data are proper arrays before saving
      DATA_KEYS.forEach(function(key) {
        if (window[key] && !Array.isArray(window[key])) {
          window[key] = ensureArray(window[key]);
        }
      });
      return origSave.apply(this, arguments);
    };
    window.saveData._v7patched = true;
  }

  // ========================================================================
  // FIX C: Dashboard Alerts - Only show expiring/expired + unpaid contracts
  // ========================================================================
  function fixDashboardContractAlerts() {
    var alertsCard = document.getElementById('recentAlerts');
    if (!alertsCard) return;

    var existingRow = alertsCard.closest('.row.mt-4');
    if (!existingRow) return;

    var today = new Date();
    var contractsList = ensureArray(window.contracts);
    var employeesList = ensureArray(window.employees);
    var dailyWorkList = ensureArray(window.dailyWork);

    // 1. تنبيهات العقود: فقط المنتهية/القريبة من الانتهاء والغير مدفوعة
    var contractAlerts = [];
    contractsList.forEach(function(c) {
      if (!c) return;
      if (c.paymentStatus === 'مدفوع') return; // تخطي العقود المدفوعة
      if (c.endDate) {
        var d = Math.ceil((new Date(c.endDate) - today) / 86400000);
        if (d <= 30 && d > 0) {
          contractAlerts.push({
            text: 'عقد ' + safeStr(c.number) + ' مع ' + safeStr(c.client || c.clientName) + ' ينتهي خلال ' + d + ' يوم — ' + safeStr(c.paymentStatus || 'غير مدفوع'),
            level: d <= 7 ? 'danger' : 'warning',
            icon: 'fas fa-clock'
          });
        } else if (d <= 0) {
          contractAlerts.push({
            text: 'عقد ' + safeStr(c.number) + ' مع ' + safeStr(c.client || c.clientName) + ' منتهي منذ ' + Math.abs(d) + ' يوم — ' + safeStr(c.paymentStatus || 'غير مدفوع'),
            level: 'danger',
            icon: 'fas fa-exclamation-triangle'
          });
        }
      }
    });

    // 2. تنبيهات الإقامات
    var residencyAlerts = [];
    employeesList.forEach(function(emp) {
      if (!emp) return;
      if (emp.residencyExpiry) {
        var d = Math.ceil((new Date(emp.residencyExpiry) - today) / 86400000);
        if (d <= 30 && d > 0) {
          residencyAlerts.push({
            text: safeStr(emp.name) + ' — الإقامة تنتهي خلال ' + d + ' يوم',
            level: d <= 7 ? 'danger' : 'warning',
            icon: 'fas fa-clock'
          });
        } else if (d <= 0) {
          residencyAlerts.push({
            text: safeStr(emp.name) + ' — الإقامة منتهية منذ ' + Math.abs(d) + ' يوم',
            level: 'danger',
            icon: 'fas fa-exclamation-circle'
          });
        }
      }
    });

    // 3. تنبيهات المبالغ غير المدفوعة
    var unpaidAlerts = [];
    contractsList.forEach(function(c) {
      if (!c) return;
      if (c.paymentStatus !== 'مدفوع') {
        var remaining = (parseFloat(c.amount) || 0) - (parseFloat(c.paidAmount) || 0);
        if (remaining > 0) {
          unpaidAlerts.push({
            text: 'عقد ' + safeStr(c.number) + ' مع ' + safeStr(c.client || c.clientName) + ': ' + remaining.toLocaleString() + ' ر.ق متبقية',
            level: 'warning',
            icon: 'fas fa-file-invoice-dollar'
          });
        }
      }
    });
    dailyWorkList.forEach(function(w) {
      if (!w) return;
      if (w.paymentStatus === 'غير مدفوع' || w.paymentStatus === 'مدفوع جزئي') {
        unpaidAlerts.push({
          text: 'عمل يومي بتاريخ ' + safeStr(w.date) + ' للعميل ' + safeStr(w.client || w.clientName) + ': ' + safeStr(w.amount) + ' ر.ق',
          level: 'info',
          icon: 'fas fa-calendar-day'
        });
      }
    });

    function buildAlertList(items) {
      if (items.length === 0) return '<div class="text-center text-muted py-2"><i class="fas fa-check-circle fa-lg mb-1 d-block text-success"></i><small>لا توجد تنبيهات</small></div>';
      var html = '<div style="max-height:200px;overflow-y:auto;">';
      items.forEach(function(item) {
        html += '<div class="alert alert-' + item.level + ' py-2 px-3 mb-2 d-flex align-items-center gap-2" style="font-size:13px;border-radius:8px;">' +
          '<i class="' + item.icon + '" style="flex-shrink:0;"></i>' +
          '<span style="flex:1;">' + item.text + '</span></div>';
      });
      html += '</div>';
      return html;
    }

    // Remove old alert rows (v6 and v7)
    var oldV6 = document.getElementById('v6-dashboard-alerts-row');
    if (oldV6) oldV6.remove();
    var oldV7 = document.getElementById('v7-dashboard-alerts-row');
    if (oldV7) oldV7.remove();

    var newRow = document.createElement('div');
    newRow.className = 'row mt-4';
    newRow.id = 'v7-dashboard-alerts-row';

    newRow.innerHTML =
      '<div class="col-md-4">' +
        '<div class="card h-100" style="border-right:4px solid #e74c3c;">' +
          '<div class="card-header d-flex justify-content-between align-items-center py-2" style="background:linear-gradient(135deg,#fff5f5,#ffe0e0);">' +
            '<span><i class="fas fa-file-contract text-danger me-2"></i>تنبيهات العقود</span>' +
            '<span class="badge bg-danger">' + contractAlerts.length + '</span>' +
          '</div>' +
          '<div class="card-body py-2">' + buildAlertList(contractAlerts) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="col-md-4">' +
        '<div class="card h-100" style="border-right:4px solid #f39c12;">' +
          '<div class="card-header d-flex justify-content-between align-items-center py-2" style="background:linear-gradient(135deg,#fffef5,#fff8e0);">' +
            '<span><i class="fas fa-passport text-warning me-2"></i>تنبيهات الإقامات</span>' +
            '<span class="badge bg-warning text-dark">' + residencyAlerts.length + '</span>' +
          '</div>' +
          '<div class="card-body py-2">' + buildAlertList(residencyAlerts) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="col-md-4">' +
        '<div class="card h-100" style="border-right:4px solid #3498db;">' +
          '<div class="card-header d-flex justify-content-between align-items-center py-2" style="background:linear-gradient(135deg,#f5f9ff,#e0edff);">' +
            '<span><i class="fas fa-money-bill-wave text-info me-2"></i>مبالغ غير مدفوعة</span>' +
            '<span class="badge bg-info">' + unpaidAlerts.length + '</span>' +
          '</div>' +
          '<div class="card-body py-2">' + buildAlertList(unpaidAlerts) + '</div>' +
        '</div>' +
      '</div>';

    existingRow.parentNode.insertBefore(newRow, existingRow);

    // Update total alerts count
    var totalAlerts = contractAlerts.length + residencyAlerts.length + unpaidAlerts.length;
    var alertsCountEl = document.getElementById('alertsCount');
    if (alertsCountEl) alertsCountEl.textContent = totalAlerts;

    alertsCard.innerHTML = '<div class="text-center text-muted py-2"><small>تم نقل التنبيهات لأقسام منفصلة أعلاه ↑</small></div>';
  }

  // ========================================================================
  // FIX D: Notification Bell - Stable IDs and Persistent Read State
  // ========================================================================
  function fixNotificationBell() {
    var bell = document.getElementById('notificationBell');
    var panel = document.getElementById('notificationPanel');
    var listEl = document.getElementById('notificationList');
    if (!bell || !panel || !listEl) return;

    var READ_KEY = 'superpro_read_notifications_v7';

    function getReadIds() {
      try { return JSON.parse(localStorage.getItem(READ_KEY) || '[]'); } catch(e) { return []; }
    }

    function saveReadIds(ids) {
      localStorage.setItem(READ_KEY, JSON.stringify(ids));
    }

    function markRead(id) {
      var read = getReadIds();
      if (!read.includes(id)) {
        read.push(id);
        saveReadIds(read);
      }
    }

    // Generate stable ID based on data content (not array index)
    function stableId(prefix, obj) {
      var key = safeStr(obj.number || obj.client || obj.clientName || obj.name || obj.idNumber || '')
                .replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '');
      return prefix + '_' + (key || 'unknown');
    }

    function gatherNotifications() {
      var notifs = [];
      var today = new Date();

      ensureArray(window.contracts).forEach(function(c) {
        if (!c) return;
        if (c.endDate) {
          var d = Math.ceil((new Date(c.endDate) - today) / 86400000);
          if (d <= 30 && d > 0) {
            notifs.push({
              id: stableId('c_exp', c),
              icon: 'fas fa-file-contract', color: 'warning',
              title: 'عقد يقترب من الانتهاء',
              text: safeStr(c.client || c.clientName || 'عقد') + ' — ينتهي بعد ' + d + ' يوم',
              time: c.endDate
            });
          } else if (d <= 0) {
            notifs.push({
              id: stableId('c_ended', c),
              icon: 'fas fa-exclamation-triangle', color: 'danger',
              title: 'عقد منتهي',
              text: safeStr(c.client || c.clientName || 'عقد') + ' — انتهى منذ ' + Math.abs(d) + ' يوم',
              time: c.endDate
            });
          }
        }
        if (c.paymentStatus === 'غير مدفوع') {
          notifs.push({
            id: stableId('c_unpaid', c),
            icon: 'fas fa-money-bill-wave', color: 'danger',
            title: 'عقد غير مدفوع',
            text: safeStr(c.client || c.clientName || 'عقد') + ' — ' + (c.amount || 0) + ' ر.ق',
            time: c.createdAt || ''
          });
        }
      });

      ensureArray(window.employees).forEach(function(emp) {
        if (!emp) return;
        if (emp.residencyExpiry) {
          var d = Math.ceil((new Date(emp.residencyExpiry) - today) / 86400000);
          if (d <= 30 && d > 0) {
            notifs.push({
              id: stableId('r_exp', emp),
              icon: 'fas fa-passport', color: 'warning',
              title: 'إقامة تنتهي قريباً',
              text: safeStr(emp.name || 'موظف') + ' — تنتهي بعد ' + d + ' يوم',
              time: emp.residencyExpiry
            });
          } else if (d <= 0) {
            notifs.push({
              id: stableId('r_ended', emp),
              icon: 'fas fa-exclamation-circle', color: 'danger',
              title: 'إقامة منتهية',
              text: safeStr(emp.name || 'موظف') + ' — انتهت منذ ' + Math.abs(d) + ' يوم',
              time: emp.residencyExpiry
            });
          }
        }
      });

      var unpaid = ensureArray(window.dailyWork).filter(function(w) {
        return w && w.paymentStatus === 'غير مدفوع';
      }).length;
      if (unpaid > 0) {
        notifs.push({
          id: 'unpaid_work_total',
          icon: 'fas fa-hand-holding-usd', color: 'info',
          title: 'أعمال غير مدفوعة',
          text: unpaid + ' سجل بحاجة لتحصيل',
          time: new Date().toISOString().split('T')[0]
        });
      }

      return notifs;
    }

    function renderNotifs() {
      var all = gatherNotifications();
      var readIds = getReadIds();
      var unread = all.filter(function(n) { return !readIds.includes(n.id); });

      var badge = document.getElementById('notificationBadge');
      if (badge) {
        badge.style.display = unread.length > 0 ? 'inline' : 'none';
        badge.textContent = unread.length;
      }

      if (unread.length === 0) {
        listEl.innerHTML = '<div class="text-center text-muted py-3"><i class="fas fa-bell-slash fa-2x mb-2 d-block"></i>لا توجد إشعارات جديدة</div>';
        return;
      }

      var html = '';
      unread.forEach(function(n) {
        var escapedId = n.id.replace(/'/g, "\\'");
        html += '<div class="v6-notif-item d-flex align-items-start gap-2 p-2 border-bottom" style="font-size:13px;" data-notif-id="' + n.id + '">' +
          '<i class="' + n.icon + ' text-' + n.color + ' mt-1" style="font-size:16px;flex-shrink:0;"></i>' +
          '<div style="flex:1;min-width:0;"><div style="font-weight:600;">' + n.title + '</div>' +
          '<div style="color:#666;font-size:12px;">' + n.text + '</div>' +
          (n.time ? '<div style="color:#999;font-size:11px;margin-top:2px;">' + n.time + '</div>' : '') +
          '</div>' +
          '<button class="btn btn-sm btn-outline-success v6-mark-read" onclick="v7MarkRead(\'' + escapedId + '\')" title="تحديد كمقروء" style="flex-shrink:0;padding:2px 6px;font-size:11px;"><i class="fas fa-check"></i></button>' +
          '</div>';
      });
      listEl.innerHTML = html;
    }

    // Global mark-read function
    window.v7MarkRead = function(id) {
      markRead(id);
      var item = document.querySelector('[data-notif-id="' + id + '"]');
      if (item) {
        item.style.transition = 'all 0.3s ease';
        item.style.opacity = '0';
        item.style.maxHeight = '0';
        item.style.padding = '0';
        item.style.overflow = 'hidden';
        setTimeout(function() { item.remove(); renderNotifs(); }, 350);
      } else {
        renderNotifs();
      }
    };

    // Override v6's mark-read too
    window.v6MarkRead = window.v7MarkRead;

    // Mark all read button
    var markAllBtn = document.getElementById('markAllReadBtn');
    if (markAllBtn) {
      var newMarkAll = markAllBtn.cloneNode(true);
      markAllBtn.parentNode.replaceChild(newMarkAll, markAllBtn);
      newMarkAll.addEventListener('click', function() {
        var all = gatherNotifications();
        all.forEach(function(n) { markRead(n.id); });
        renderNotifs();
      });
    }

    // Bell click - clone to remove old handlers
    var newBell = bell.cloneNode(true);
    bell.parentNode.replaceChild(newBell, bell);
    newBell.addEventListener('click', function(e) {
      e.stopPropagation();
      renderNotifs();
      panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    });

    // Close panel on outside click
    document.addEventListener('click', function(e) {
      if (panel.style.display === 'block' && !panel.contains(e.target) && !newBell.contains(e.target)) {
        panel.style.display = 'none';
      }
    });

    // Initial render
    renderNotifs();

    // Periodic refresh
    setInterval(renderNotifs, 30000);

    console.log('✅ V7: Notification system fixed with stable IDs');
  }

  // ========================================================================
  // FIX E: Patch loadDashboard to use V7 dashboard alerts
  // ========================================================================
  function patchLoadDashboard() {
    var orig = window.loadDashboard;
    if (typeof orig !== 'function' || orig._v7patched) return;

    window.loadDashboard = function() {
      // Ensure data arrays are proper
      DATA_KEYS.forEach(function(key) {
        if (window[key] && !Array.isArray(window[key])) {
          window[key] = ensureArray(window[key]);
        }
      });
      orig.call(this);
      // Apply our dashboard fix after v6's fix
      setTimeout(function() {
        try { fixDashboardContractAlerts(); } catch(e) {}
      }, 400);
    };
    window.loadDashboard._v7patched = true;
  }

  // ========================================================================
  // FIX F: Ensure all render functions handle Firebase objects
  // ========================================================================
  function fixRenderFunctions() {
    // Patch loadHR
    var origLoadHR = window.loadHR;
    if (typeof origLoadHR === 'function' && !origLoadHR._v7patched) {
      window.loadHR = function() {
        if (window.employees && !Array.isArray(window.employees)) {
          window.employees = ensureArray(window.employees);
        }
        origLoadHR.call(this);
      };
      window.loadHR._v7patched = true;
    }

    // Patch loadEmployees
    var origLoadEmp = window.loadEmployees;
    if (typeof origLoadEmp === 'function' && !origLoadEmp._v7patched) {
      window.loadEmployees = function() {
        if (window.employees && !Array.isArray(window.employees)) {
          window.employees = ensureArray(window.employees);
        }
        origLoadEmp.call(this);
      };
      window.loadEmployees._v7patched = true;
    }

    // Patch loadClients
    var origLoadCli = window.loadClients;
    if (typeof origLoadCli === 'function' && !origLoadCli._v7patched) {
      window.loadClients = function() {
        if (window.clients && !Array.isArray(window.clients)) {
          window.clients = ensureArray(window.clients);
        }
        origLoadCli.call(this);
      };
      window.loadClients._v7patched = true;
    }

    // Patch loadContracts
    var origLoadCon = window.loadContracts;
    if (typeof origLoadCon === 'function' && !origLoadCon._v7patched) {
      window.loadContracts = function() {
        if (window.contracts && !Array.isArray(window.contracts)) {
          window.contracts = ensureArray(window.contracts);
        }
        origLoadCon.call(this);
      };
      window.loadContracts._v7patched = true;
    }
  }

  // ========================================================================
  // FIX G: Continuous data integrity watcher
  // ========================================================================
  function startDataWatcher() {
    setInterval(function() {
      var fixed = false;
      DATA_KEYS.forEach(function(key) {
        if (window[key] && !Array.isArray(window[key]) && typeof window[key] === 'object') {
          window[key] = ensureArray(window[key]);
          fixed = true;
          console.log('🔧 V7 Watcher: Fixed ' + key);
        }
      });
    }, 2000);
  }

  // ========================================================================
  // STARTUP
  // ========================================================================
  function startV7() {
    console.log('🔧 V7: Starting phase 2 (post-load)...');

    // Re-ensure applyData is patched
    patchApplyData();

    // Patch save and load functions
    try { patchSaveData(); } catch(e) {}
    try { fixRenderFunctions(); } catch(e) {}
    try { patchLoadDashboard(); } catch(e) {}

    // Start data integrity watcher
    startDataWatcher();

    // Apply notification and dashboard fixes after V6 has finished (V6 Phase 3 = 3500ms)
    setTimeout(function() {
      console.log('🔧 V7: Applying notification and dashboard fixes...');
      try { fixNotificationBell(); } catch(e) { console.error('V7 notif error:', e); }
      try { fixDashboardContractAlerts(); } catch(e) { console.error('V7 dashboard error:', e); }
    }, 4500);

    // Another pass after everything should be loaded
    setTimeout(function() {
      try { fixNotificationBell(); } catch(e) {}
      try { fixDashboardContractAlerts(); } catch(e) {}
      // Final data integrity check
      DATA_KEYS.forEach(function(key) {
        if (window[key] && !Array.isArray(window[key])) {
          window[key] = ensureArray(window[key]);
        }
      });
    }, 8000);
  }

  if (document.readyState === 'complete') {
    startV7();
  } else {
    window.addEventListener('load', startV7);
  }

  console.log('✅ V7: Immediate patches applied');
})();
