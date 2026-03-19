// ============================================================================
// BUGFIX V6.3 - إصلاح جذري شامل + تحسينات لوحة التحكم
// ============================================================================
(function() {
  'use strict';
  console.log('🔧 BugFix V6.3: بدء تحميل الإصلاحات...');

  // ========================================================================
  // أدوات مساعدة
  // ========================================================================
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

  // ========================================================================
  // إصلاح 1: Toast System
  // ========================================================================
  function fixToastSystem() {
    var container = document.createElement('div');
    container.id = 'v6-toast-container';
    container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;display:flex;flex-direction:column-reverse;gap:8px;pointer-events:none;direction:rtl;';
    document.body.appendChild(container);

    var style = document.createElement('style');
    style.textContent = '@keyframes v6SlideIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}' +
      '@keyframes v6SlideOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(100%)}}' +
      '.v6-toast{animation:v6SlideIn 0.4s ease;pointer-events:auto;cursor:pointer;}' +
      '.v6-toast.hiding{animation:v6SlideOut 0.4s ease forwards;}';
    document.head.appendChild(style);

    window.showToast = function(message, type) {
      type = type || 'success';
      var colors = {
        success: { bg: 'linear-gradient(135deg, #28a745, #20c997)', icon: 'fas fa-check-circle' },
        error: { bg: 'linear-gradient(135deg, #dc3545, #e74c3c)', icon: 'fas fa-times-circle' },
        warning: { bg: 'linear-gradient(135deg, #ffc107, #f39c12)', icon: 'fas fa-exclamation-triangle' },
        info: { bg: 'linear-gradient(135deg, #17a2b8, #3498db)', icon: 'fas fa-info-circle' }
      };
      var c = colors[type] || colors.success;
      var toast = document.createElement('div');
      toast.className = 'v6-toast';
      toast.style.cssText = 'background:' + c.bg + ';color:white;padding:14px 22px;border-radius:12px;box-shadow:0 6px 20px rgba(0,0,0,0.25);display:flex;align-items:center;gap:12px;font-size:14px;max-width:420px;min-width:260px;font-family:Tajawal,sans-serif;';
      toast.innerHTML = '<i class="' + c.icon + '" style="font-size:20px;flex-shrink:0;"></i><span style="flex:1;">' + message + '</span>';
      toast.onclick = function() { removeToast(toast); };
      container.appendChild(toast);
      function removeToast(t) {
        t.classList.add('hiding');
        setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 400);
      }
      setTimeout(function() { removeToast(toast); }, 4000);
    };
    window.showNotification = function(message, type) { window.showToast(message, type || 'info'); };
  }

  // ========================================================================
  // إصلاح 2: ضمان البيانات كمصفوفات
  // ========================================================================
  function fixDataArrays() {
    var keys = ['employees','clients','contracts','dailyWork','dailyIncome','dailyExpenses',
                'attendance','services','tasks','events','monthlyExpenses',
                'financialTransactions','salaryAdvances'];
    keys.forEach(function(key) {
      if (window[key] && !Array.isArray(window[key])) {
        window[key] = ensureArray(window[key]);
        console.log('🔧 V6.3: تحويل ' + key + ' (' + window[key].length + ' عنصر)');
      }
    });

    var origApplyData = window.applyData;
    if (typeof origApplyData === 'function' && !origApplyData._v6patched) {
      window.applyData = function(data) {
        keys.forEach(function(key) {
          if (data[key] && !Array.isArray(data[key])) {
            data[key] = ensureArray(data[key]);
          }
        });
        origApplyData.call(this, data);
        setTimeout(refreshActiveModule, 300);
      };
      window.applyData._v6patched = true;
    }
  }

  // ========================================================================
  // إصلاح 3: عرض العقود
  // ========================================================================
  function renderContractsDirectly() {
    var tbody = document.getElementById('contracts-table-body');
    if (!tbody) return;
    var allContracts = ensureArray(window.contracts);
    var activeFilter = 'all';
    var activeBtn = document.querySelector('#contracts [data-filter].active');
    if (activeBtn) activeFilter = activeBtn.getAttribute('data-filter');
    var searchInput = document.getElementById('contract-search');
    var searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    var filtered = allContracts.slice();
    if (searchTerm) {
      filtered = filtered.filter(function(c) {
        return [c.number, c.client, c.clientName, c.employee, c.notes].join(' ').toLowerCase().indexOf(searchTerm) !== -1;
      });
    }
    if (activeFilter !== 'all') {
      var today = new Date();
      if (activeFilter === 'عقود جزئية') {
        filtered = filtered.filter(function(c) { return c.type === 'جزئي'; });
      } else if (activeFilter === 'منتهي') {
        filtered = filtered.filter(function(c) {
          if (!c.endDate) return false;
          return new Date(c.endDate) < today;
        });
      } else {
        filtered = filtered.filter(function(c) { return c.paymentStatus === activeFilter; });
      }
    }
    tbody.innerHTML = '';
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="15" class="text-center text-muted py-3"><i class="fas fa-file-contract fa-2x mb-2 d-block"></i>لا توجد عقود تطابق معايير البحث</td></tr>';
    } else {
      filtered.forEach(function(contract, idx) {
        var realIdx = allContracts.indexOf(contract);
        if (realIdx === -1) realIdx = idx;
        var paid = parseFloat(contract.paidAmount) || 0;
        var total = parseFloat(contract.amount) || 0;
        var payBadge = contract.paymentStatus === 'مدفوع' ? 'bg-success' : contract.paymentStatus === 'مدفوع جزئي' ? 'bg-warning' : 'bg-danger';
        var statusBadge = contract.status === 'نشط' ? 'bg-success' : contract.status === 'منتهي' ? 'bg-secondary' : 'bg-danger';
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + (idx + 1) + '</td>' +
          '<td>' + safeStr(contract.number || 'غير محدد') + '</td>' +
          '<td>' + safeStr(contract.client || contract.clientName || '-') + '</td>' +
          '<td>' + safeStr(contract.employee || '-') + '</td>' +
          '<td>' + safeStr(contract.type || '-') + '</td>' +
          '<td>' + (contract.workDays ? (Array.isArray(contract.workDays) ? contract.workDays.join('، ') : contract.workDays) : 'غير محدد') + '</td>' +
          '<td>' + safeStr(contract.startTime || '08:00') + ' - ' + safeStr(contract.endTime || '16:00') + '</td>' +
          '<td>' + total + ' ر.ق</td>' +
          '<td class="text-success">' + paid + ' ر.ق</td>' +
          '<td class="text-danger">' + (total - paid) + ' ر.ق</td>' +
          '<td>' + safeStr(contract.startDate || '-') + '</td>' +
          '<td>' + safeStr(contract.endDate || '-') + '</td>' +
          '<td><span class="badge ' + payBadge + '">' + safeStr(contract.paymentStatus || 'غير مدفوع') + '</span></td>' +
          '<td><span class="badge ' + statusBadge + '">' + safeStr(contract.status || 'نشط') + '</span></td>' +
          '<td><div class="btn-group btn-group-sm">' +
            '<button type="button" class="btn btn-outline-warning" onclick="editContract(' + realIdx + ')"><i class="fas fa-edit"></i></button>' +
            '<button type="button" class="btn btn-outline-success" onclick="markContractAsPaid(' + realIdx + ')"><i class="fas fa-check"></i></button>' +
            '<button type="button" class="btn btn-outline-danger" onclick="deleteContract(' + realIdx + ')"><i class="fas fa-trash"></i></button>' +
          '</div></td>';
        tbody.appendChild(tr);
      });
    }
    var countEl = document.getElementById('contractsTableCount');
    if (countEl) countEl.textContent = filtered.length + ' عقد';
    // تحديث إحصائيات العقود
    try {
      document.getElementById('totalContractsCount').textContent = allContracts.length;
      document.getElementById('paidContractsCount').textContent = allContracts.filter(function(c){return c.paymentStatus==='مدفوع';}).length;
      document.getElementById('unpaidContractsCount').textContent = allContracts.filter(function(c){return c.paymentStatus==='غير مدفوع';}).length;
    } catch(e){}
  }

  // ========================================================================
  // إصلاح 4: عرض العملاء
  // ========================================================================
  function renderClientsDirectly() {
    var tbody = document.getElementById('clients-table-body');
    if (!tbody) return;
    var clientsList = ensureArray(window.clients);
    if (clientsList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3"><i class="fas fa-users fa-2x mb-2 d-block"></i>لا يوجد عملاء</td></tr>';
      return;
    }
    tbody.innerHTML = '';
    clientsList.forEach(function(client, index) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + (index + 1) + '</td>' +
        '<td>' + safeStr(client.name || '-') + '</td>' +
        '<td>' + safeStr(client.phone || 'لا يوجد') + '</td>' +
        '<td>' + safeStr(client.email || 'لا يوجد') + '</td>' +
        '<td>' + safeStr(client.service || 'تنظيف') + '</td>' +
        '<td>' + safeStr(client.area || client.address || 'غير محدد') + '</td>' +
        '<td><span class="badge bg-success">نشط</span></td>' +
        '<td><button type="button" class="btn btn-sm btn-outline-warning me-1" onclick="editClient(' + index + ')"><i class="fas fa-edit"></i></button>' +
        '<button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteClient(' + index + ')"><i class="fas fa-trash"></i></button></td>';
      tbody.appendChild(tr);
    });
    var countEl = document.getElementById('clientsTableCount');
    if (countEl) countEl.textContent = clientsList.length + ' عميل';
  }

  // ========================================================================
  // إصلاح 5: عرض الموظفين (شؤون الموظفين)
  // ========================================================================
  function renderEmployeesDirectly() {
    var tbody = document.getElementById('employees-table-body');
    if (!tbody) return;
    var empList = ensureArray(window.employees);
    if (empList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4"><i class="fas fa-users fa-2x text-muted mb-2 d-block"></i><p class="text-muted">لا يوجد موظفين مسجلين بعد</p></td></tr>';
      return;
    }
    tbody.innerHTML = '';
    empList.forEach(function(emp, index) {
      var tr = document.createElement('tr');
      tr.className = 'employee-card';
      var statusClass = emp.status === 'نشط' ? 'bg-success' : (emp.status === 'إجازة' ? 'bg-warning' : 'bg-secondary');
      tr.innerHTML = '<td>' + (index + 1) + '</td>' +
        '<td><div class="d-flex align-items-center"><div class="employee-avatar me-3">' + (emp.name ? emp.name.charAt(0) : '?') + '</div><div><h6 class="mb-1">' + safeStr(emp.name) + '</h6><small class="text-muted">' + safeStr(emp.job) + '</small></div></div></td>' +
        '<td><div class="employee-info-item"><i class="fas fa-flag"></i> <span>' + safeStr(emp.nationality) + '</span></div>' +
        '<div class="employee-info-item"><i class="fas fa-id-card"></i> <span>' + safeStr(emp.idNumber || 'لا يوجد') + '</span></div>' +
        '<div class="employee-info-item"><i class="fas fa-phone"></i> <span>' + safeStr(emp.phone || 'لا يوجد') + '</span></div></td>' +
        '<td><div class="employee-info-item"><strong>الراتب: </strong><span class="text-success">' + safeStr(emp.salary) + ' ر.ق</span></div></td>' +
        '<td><span class="status-badge ' + statusClass + '">' + safeStr(emp.status) + '</span></td>' +
        '<td>' + (emp.residencyExpiry ? '<div class="employee-info-item"><i class="fas fa-calendar-alt"></i> <span>' + emp.residencyExpiry + '</span></div>' : '<span class="text-muted">غير محدد</span>') + '</td>' +
        '<td><div class="btn-group btn-group-sm">' +
          '<button type="button" class="btn btn-outline-warning quick-action-btn" onclick="editEmployee(' + index + ')"><i class="fas fa-edit"></i></button>' +
          '<button type="button" class="btn btn-outline-danger quick-action-btn" onclick="deleteEmployee(' + index + ')"><i class="fas fa-trash"></i></button>' +
        '</div></td>';
      tbody.appendChild(tr);
    });
    // تحديث الإحصائيات
    try {
      document.getElementById('totalEmployeesCount').textContent = empList.length;
      document.getElementById('activeEmployeesCount').textContent = empList.filter(function(e){return e.status==='نشط';}).length;
      document.getElementById('employeesTableCount').textContent = empList.length + ' موظف';
      var totalSal = empList.reduce(function(s,e){return s+(parseFloat(e.salary)||0);},0);
      document.getElementById('totalSalaries').textContent = totalSal.toLocaleString() + ' ر.ق';
      var today = new Date();
      var expiring = empList.filter(function(e){
        if(!e.residencyExpiry) return false;
        var d = Math.ceil((new Date(e.residencyExpiry)-today)/(1000*3600*24));
        return d<=30 && d>=0;
      }).length;
      document.getElementById('expiringResidenciesCount').textContent = expiring;
    } catch(e){}
  }

  // ========================================================================
  // إصلاح 6: عرض الموظفين في الموارد البشرية
  // ========================================================================
  function fixHRModule() {
    // اعتراض loadHR لضمان المصفوفة
    var origLoadHR = window.loadHR;
    if (typeof origLoadHR === 'function' && !origLoadHR._v6patched) {
      window.loadHR = function() {
        if (window.employees && !Array.isArray(window.employees)) {
          window.employees = ensureArray(window.employees);
        }
        origLoadHR.call(this);
      };
      window.loadHR._v6patched = true;
    }
  }

  // ========================================================================
  // إصلاح 7: مراقب القائمة النشطة (مع إصلاح selector!)
  // ========================================================================
  function getActiveModuleId() {
    // إصلاح حرج! HTML يستخدم module-container وليس module-section
    var active = document.querySelector('.module-container.active-module') ||
                 document.querySelector('.module-container.active');
    if (active) return active.id;
    // fallback
    var containers = document.querySelectorAll('.module-container');
    for (var i = 0; i < containers.length; i++) {
      var s = containers[i].style.display;
      if (s !== 'none' && containers[i].offsetParent !== null) {
        return containers[i].id;
      }
    }
    return null;
  }

  function refreshActiveModule() {
    var moduleId = getActiveModuleId();
    if (!moduleId) return;
    if (moduleId === 'contracts') {
      renderContractsDirectly();
    } else if (moduleId === 'clients') {
      renderClientsDirectly();
    } else if (moduleId === 'employees') {
      renderEmployeesDirectly();
    } else if (moduleId === 'hr') {
      if (typeof window.loadHR === 'function') window.loadHR();
    } else if (moduleId === 'dashboard') {
      fixDashboardAlerts();
    }
  }

  function startTableWatcher() {
    setInterval(function() {
      try {
        var moduleId = getActiveModuleId();
        if (!moduleId) return;
        
        if (moduleId === 'contracts') {
          var tbody = document.getElementById('contracts-table-body');
          var data = ensureArray(window.contracts);
          if (tbody && data.length > 0) {
            var rows = tbody.querySelectorAll('tr');
            var empty = rows.length === 0 || (rows.length === 1 && rows[0].querySelector('td[colspan]'));
            if (empty) {
              console.log('🔧 V6.3: إعادة عرض العقود (' + data.length + ')');
              renderContractsDirectly();
            }
          }
        } else if (moduleId === 'clients') {
          var tbody = document.getElementById('clients-table-body');
          var data = ensureArray(window.clients);
          if (tbody && data.length > 0) {
            var rows = tbody.querySelectorAll('tr');
            var empty = rows.length === 0 || (rows.length === 1 && rows[0].querySelector('td[colspan]'));
            if (empty) {
              console.log('🔧 V6.3: إعادة عرض العملاء (' + data.length + ')');
              renderClientsDirectly();
            }
          }
        } else if (moduleId === 'employees') {
          var tbody = document.getElementById('employees-table-body');
          var data = ensureArray(window.employees);
          if (tbody && data.length > 0) {
            var rows = tbody.querySelectorAll('tr');
            var empty = rows.length === 0 || (rows.length === 1 && rows[0].querySelector('td[colspan]'));
            if (empty) {
              console.log('🔧 V6.3: إعادة عرض الموظفين (' + data.length + ')');
              renderEmployeesDirectly();
            }
          }
        }
      } catch(e) {}
    }, 1500);
  }

  // ========================================================================
  // إصلاح 8: فلاتر العقود
  // ========================================================================
  function fixContractFilters() {
    var btns = document.querySelectorAll('#contracts [data-filter]');
    btns.forEach(function(btn) {
      var newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('#contracts [data-filter]').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        renderContractsDirectly();
      });
    });
    var searchInput = document.getElementById('contract-search');
    if (searchInput) {
      var newSearch = searchInput.cloneNode(true);
      searchInput.parentNode.replaceChild(newSearch, searchInput);
      newSearch.addEventListener('input', function() { renderContractsDirectly(); });
    }
  }

  // ========================================================================
  // إصلاح 9: تعديل العمل اليومي
  // ========================================================================
  function fixDailyWorkEdit() {
    window.editDailyWork = function(index) {
      var work = (window.dailyWork || [])[index];
      if (!work) { window.showToast('لم يتم العثور على سجل العمل', 'error'); return; }
      if (!window.editState) window.editState = {};
      if (!window.editState.dailyWork) window.editState.dailyWork = {};
      window.editState.dailyWork.isEditMode = true;
      window.editState.dailyWork.editIndex = index;
      var modal = document.getElementById('dailyWorkModal');
      if (!modal) return;
      var titleEl = modal.querySelector('.modal-title');
      if (titleEl) titleEl.textContent = 'تعديل سجل العمل';
      var saveBtn = document.getElementById('saveDailyWorkBtn');
      if (saveBtn) saveBtn.textContent = 'تحديث البيانات';

      function fillForm() {
        var fields = {
          'dailyWorkClient': work.client || work.clientName || '',
          'dailyWorkEmployee': work.employee || work.employeeName || '',
          'dailyWorkDate': work.date || '',
          'dailyWorkService': work.service || work.serviceType || '',
          'dailyWorkAmount': work.amount || '',
          'dailyWorkNotes': work.notes || '',
          'dailyWorkPaymentStatus': work.paymentStatus || 'غير مدفوع',
          'dailyWorkArea': work.area || work.location || '',
          'dailyWorkHours': work.hours || work.duration || ''
        };
        Object.keys(fields).forEach(function(id) {
          var el = document.getElementById(id);
          if (el) {
            if (el.tagName === 'SELECT') {
              var found = false;
              for (var i = 0; i < el.options.length; i++) {
                if (el.options[i].value === fields[id] || el.options[i].textContent.trim() === fields[id]) {
                  el.selectedIndex = i; found = true; break;
                }
              }
              if (!found && fields[id]) { el.value = fields[id]; }
            } else {
              el.value = fields[id];
            }
          }
        });
      }

      modal.removeEventListener('shown.bs.modal', modal._v6FillHandler);
      modal._v6FillHandler = function() { setTimeout(fillForm, 100); };
      modal.addEventListener('shown.bs.modal', modal._v6FillHandler);

      try {
        var bsModal = bootstrap.Modal.getOrCreateInstance(modal);
        bsModal.show();
        setTimeout(fillForm, 300);
      } catch(e) { console.error('V6.3 editDailyWork modal:', e); }
    };
  }

  // ========================================================================
  // إصلاح 10: نظام الإشعارات الفردي
  // ========================================================================
  function fixNotificationSystem() {
    var bell = document.getElementById('notificationBell');
    var panel = document.getElementById('notificationPanel');
    var listEl = document.getElementById('notificationList');
    if (!bell || !panel || !listEl) return;

    function getReadIds() {
      try { return JSON.parse(localStorage.getItem('superpro_read_notifications') || '[]'); } catch(e) { return []; }
    }
    function markRead(id) {
      var read = getReadIds();
      if (!read.includes(id)) { read.push(id); localStorage.setItem('superpro_read_notifications', JSON.stringify(read)); }
    }

    function gatherNotifications() {
      var notifs = [];
      var today = new Date();
      ensureArray(window.contracts).forEach(function(c, i) {
        if (c.endDate) {
          var d = Math.ceil((new Date(c.endDate) - today) / 86400000);
          if (d <= 30 && d > 0) notifs.push({id:'c_exp_'+i, icon:'fas fa-file-contract', color:'warning', title:'عقد يقترب من الانتهاء', text:(c.client||'عقد')+' — ينتهي بعد '+d+' يوم', time:c.endDate});
          else if (d <= 0) notifs.push({id:'c_ended_'+i, icon:'fas fa-exclamation-triangle', color:'danger', title:'عقد منتهي', text:(c.client||'عقد')+' — انتهى منذ '+Math.abs(d)+' يوم', time:c.endDate});
        }
        if (c.paymentStatus === 'غير مدفوع') notifs.push({id:'c_unpaid_'+i, icon:'fas fa-money-bill-wave', color:'danger', title:'عقد غير مدفوع', text:(c.client||'عقد')+' — '+(c.amount||0)+' ر.ق', time:c.createdAt||''});
      });
      ensureArray(window.employees).forEach(function(emp, i) {
        if (emp.residencyExpiry) {
          var d = Math.ceil((new Date(emp.residencyExpiry) - today) / 86400000);
          if (d <= 30 && d > 0) notifs.push({id:'r_exp_'+i, icon:'fas fa-passport', color:'warning', title:'إقامة تنتهي قريباً', text:(emp.name||'موظف')+' — تنتهي بعد '+d+' يوم', time:emp.residencyExpiry});
          else if (d <= 0) notifs.push({id:'r_ended_'+i, icon:'fas fa-exclamation-circle', color:'danger', title:'إقامة منتهية', text:(emp.name||'موظف')+' — انتهت منذ '+Math.abs(d)+' يوم', time:emp.residencyExpiry});
        }
      });
      var unpaid = ensureArray(window.dailyWork).filter(function(w){return w.paymentStatus==='غير مدفوع';}).length;
      if (unpaid > 0) notifs.push({id:'unpaid_work', icon:'fas fa-hand-holding-usd', color:'info', title:'أعمال غير مدفوعة', text:unpaid+' سجل بحاجة لتحصيل', time:new Date().toISOString().split('T')[0]});
      return notifs;
    }

    function renderNotifs() {
      var all = gatherNotifications();
      var readIds = getReadIds();
      var unread = all.filter(function(n) { return !readIds.includes(n.id); });
      var badge = document.getElementById('notificationBadge');
      if (badge) { badge.style.display = unread.length > 0 ? 'inline' : 'none'; badge.textContent = unread.length; }
      if (unread.length === 0) {
        listEl.innerHTML = '<div class="text-center text-muted py-3"><i class="fas fa-bell-slash fa-2x mb-2 d-block"></i>لا توجد إشعارات جديدة</div>';
        return;
      }
      var html = '';
      unread.forEach(function(n) {
        html += '<div class="v6-notif-item d-flex align-items-start gap-2 p-2 border-bottom" style="font-size:13px;" data-notif-id="' + n.id + '">' +
          '<i class="' + n.icon + ' text-' + n.color + ' mt-1" style="font-size:16px;flex-shrink:0;"></i>' +
          '<div style="flex:1;min-width:0;"><div style="font-weight:600;">' + n.title + '</div>' +
          '<div style="color:#666;font-size:12px;">' + n.text + '</div>' +
          (n.time ? '<div style="color:#999;font-size:11px;margin-top:2px;">' + n.time + '</div>' : '') +
          '</div>' +
          '<button class="btn btn-sm btn-outline-success v6-mark-read" onclick="v6MarkRead(\'' + n.id + '\')" title="تحديد كمقروء" style="flex-shrink:0;padding:2px 6px;font-size:11px;"><i class="fas fa-check"></i></button>' +
          '</div>';
      });
      listEl.innerHTML = html;
    }

    window.v6MarkRead = function(id) {
      markRead(id);
      var item = document.querySelector('[data-notif-id="' + id + '"]');
      if (item) {
        item.style.transition = 'all 0.3s ease';
        item.style.opacity = '0';
        item.style.maxHeight = '0';
        item.style.padding = '0';
        item.style.overflow = 'hidden';
        setTimeout(function() { item.remove(); renderNotifs(); }, 350);
      } else { renderNotifs(); }
    };

    // زر تحديد الكل
    var markAllBtn = document.getElementById('markAllReadBtn');
    if (markAllBtn) {
      var newBtn = markAllBtn.cloneNode(true);
      markAllBtn.parentNode.replaceChild(newBtn, markAllBtn);
      newBtn.addEventListener('click', function() {
        var all = gatherNotifications();
        all.forEach(function(n) { markRead(n.id); });
        renderNotifs();
        window.showToast('تم تحديد جميع الإشعارات كمقروءة', 'info');
      });
    }

    // فتح/إغلاق اللوحة
    var newBell = bell.cloneNode(true);
    bell.parentNode.replaceChild(newBell, bell);
    newBell.addEventListener('click', function(e) {
      e.preventDefault(); e.stopPropagation();
      if (panel.style.display === 'block') { panel.style.display = 'none'; }
      else { panel.style.display = 'block'; renderNotifs(); }
    });

    var closeBtn = document.getElementById('closeNotificationPanel');
    if (closeBtn) {
      var newClose = closeBtn.cloneNode(true);
      closeBtn.parentNode.replaceChild(newClose, closeBtn);
      newClose.addEventListener('click', function() { panel.style.display = 'none'; });
    }

    renderNotifs();
  }

  // ========================================================================
  // إصلاح 11: تنقل بين الأقسام
  // ========================================================================
  function fixNavigation() {
    document.querySelectorAll('[data-module]').forEach(function(link) {
      link.addEventListener('click', function() {
        var moduleId = this.getAttribute('data-module');
        setTimeout(function() {
          fixDataArrays();
          refreshActiveModule();
        }, 200);
      });
    });
  }

  // ========================================================================
  // إصلاح 12: اعتراض saveData
  // ========================================================================
  function patchSaveOperations() {
    var origSave = window.saveData;
    if (typeof origSave === 'function' && !origSave._v6patched) {
      window.saveData = function() {
        fixDataArrays();
        var result = origSave.apply(this, arguments);
        setTimeout(refreshActiveModule, 200);
        return result;
      };
      window.saveData._v6patched = true;
    }
  }

  // ========================================================================
  // إصلاح 13: editState
  // ========================================================================
  function fixEditState() {
    if (!window.editState) window.editState = {};
    ['employee','client','contract','service','dailyWork','dailyIncome','dailyExpense'].forEach(function(key) {
      if (!window.editState[key]) window.editState[key] = { isEditMode: false, editIndex: -1 };
    });
  }

  // ========================================================================
  // ميزة جديدة 1: لوحة التحكم - 3 قوائم تنبيهات منفصلة
  // ========================================================================
  function fixDashboardAlerts() {
    // البحث عن صف التنبيهات والمهام الحالي وإزالته
    var alertsCard = document.getElementById('recentAlerts');
    if (!alertsCard) return;
    
    // البحث عن row الأب
    var existingRow = alertsCard.closest('.row.mt-4');
    if (!existingRow) return;
    
    var today = new Date();
    var contractsList = ensureArray(window.contracts);
    var employeesList = ensureArray(window.employees);
    var dailyWorkList = ensureArray(window.dailyWork);

    // 1. تنبيهات العقود
    var contractAlerts = [];
    contractsList.forEach(function(c) {
      if (c.endDate) {
        var d = Math.ceil((new Date(c.endDate) - today) / 86400000);
        if (d <= 30 && d > 0) contractAlerts.push({text: 'عقد ' + safeStr(c.number) + ' مع ' + safeStr(c.client) + ' ينتهي خلال ' + d + ' يوم', level: d <= 7 ? 'danger' : 'warning', icon: 'fas fa-clock'});
        else if (d <= 0) contractAlerts.push({text: 'عقد ' + safeStr(c.number) + ' مع ' + safeStr(c.client) + ' منتهي منذ ' + Math.abs(d) + ' يوم', level: 'danger', icon: 'fas fa-exclamation-triangle'});
      }
    });

    // 2. تنبيهات الإقامات
    var residencyAlerts = [];
    employeesList.forEach(function(emp) {
      if (emp.residencyExpiry) {
        var d = Math.ceil((new Date(emp.residencyExpiry) - today) / 86400000);
        if (d <= 30 && d > 0) residencyAlerts.push({text: safeStr(emp.name) + ' — الإقامة تنتهي خلال ' + d + ' يوم', level: d <= 7 ? 'danger' : 'warning', icon: 'fas fa-clock'});
        else if (d <= 0) residencyAlerts.push({text: safeStr(emp.name) + ' — الإقامة منتهية منذ ' + Math.abs(d) + ' يوم', level: 'danger', icon: 'fas fa-exclamation-circle'});
      }
    });

    // 3. تنبيهات المبالغ غير المدفوعة
    var unpaidAlerts = [];
    contractsList.forEach(function(c) {
      if (c.paymentStatus !== 'مدفوع') {
        var remaining = (parseFloat(c.amount)||0) - (parseFloat(c.paidAmount)||0);
        if (remaining > 0) unpaidAlerts.push({text: 'عقد ' + safeStr(c.number) + ' مع ' + safeStr(c.client) + ': ' + remaining.toLocaleString() + ' ر.ق متبقية', level: 'warning', icon: 'fas fa-file-invoice-dollar'});
      }
    });
    dailyWorkList.forEach(function(w) {
      if (w.paymentStatus === 'غير مدفوع' || w.paymentStatus === 'مدفوع جزئي') {
        unpaidAlerts.push({text: 'عمل يومي بتاريخ ' + safeStr(w.date) + ' للعميل ' + safeStr(w.client) + ': ' + safeStr(w.amount) + ' ر.ق', level: 'info', icon: 'fas fa-calendar-day'});
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

    // بناء 3 قوائم منفصلة
    var newRow = document.createElement('div');
    newRow.className = 'row mt-4';
    newRow.id = 'v6-dashboard-alerts-row';

    // إزالة القائمة القديمة إن وجدت
    var oldRow = document.getElementById('v6-dashboard-alerts-row');
    if (oldRow) oldRow.remove();

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
          '<div class="card-header d-flex justify-content-between align-items-center py-2" style="background:linear-gradient(135deg,#fffbf0,#fff3cd);">' +
            '<span><i class="fas fa-id-card text-warning me-2"></i>تنبيهات انتهاء الإقامات</span>' +
            '<span class="badge bg-warning text-dark">' + residencyAlerts.length + '</span>' +
          '</div>' +
          '<div class="card-body py-2">' + buildAlertList(residencyAlerts) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="col-md-4">' +
        '<div class="card h-100" style="border-right:4px solid #3498db;">' +
          '<div class="card-header d-flex justify-content-between align-items-center py-2" style="background:linear-gradient(135deg,#f0f8ff,#d6eaf8);">' +
            '<span><i class="fas fa-money-bill-wave text-primary me-2"></i>مبالغ غير مدفوعة</span>' +
            '<span class="badge bg-primary">' + unpaidAlerts.length + '</span>' +
          '</div>' +
          '<div class="card-body py-2">' + buildAlertList(unpaidAlerts) + '</div>' +
        '</div>' +
      '</div>';

    // إدراج قبل صف التنبيهات القديم
    existingRow.parentNode.insertBefore(newRow, existingRow);

    // تحديث العداد
    var totalAlerts = contractAlerts.length + residencyAlerts.length + unpaidAlerts.length;
    var alertsCountEl = document.getElementById('alertsCount');
    if (alertsCountEl) alertsCountEl.textContent = totalAlerts;

    // الاحتفاظ بالقائمة القديمة مطوية (لا نحذفها لتجنب أخطاء)
    alertsCard.innerHTML = '<div class="text-center text-muted py-2"><small>تم نقل التنبيهات لأقسام منفصلة أعلاه ↑</small></div>';
  }

  // اعتراض loadDashboard لإضافة التنبيهات المنفصلة
  function patchLoadDashboard() {
    var origLoad = window.loadDashboard;
    if (typeof origLoad === 'function' && !origLoad._v6patched) {
      window.loadDashboard = function() {
        fixDataArrays();
        origLoad.call(this);
        setTimeout(fixDashboardAlerts, 100);
      };
      window.loadDashboard._v6patched = true;
    }
  }

  // ========================================================================
  // ميزة جديدة 2: إخفاء الأيام/التوقيت عند نوع العقد "كامل"
  // ========================================================================
  function fixContractTypeToggle() {
    var typeSelect = document.getElementById('contractType');
    if (!typeSelect) return;
    
    var daysContainer = document.querySelector('.contract-days-container');
    var daysParent = daysContainer ? daysContainer.closest('.col-md-12') : null;
    
    var timeStart = document.getElementById('contractStartTime');
    var timeParent = timeStart ? timeStart.closest('.col-md-6') : null;

    function toggleFields() {
      var isPartial = typeSelect.value === 'جزئي';
      if (daysParent) daysParent.style.display = isPartial ? '' : 'none';
      if (timeParent) timeParent.style.display = isPartial ? '' : 'none';
    }

    // تطبيق فوري
    toggleFields();

    // مراقبة التغيير
    typeSelect.addEventListener('change', toggleFields);

    // عند فتح المودال
    var contractModal = document.getElementById('contractModal');
    if (contractModal) {
      contractModal.addEventListener('shown.bs.modal', function() {
        setTimeout(toggleFields, 50);
      });
    }
  }

  // ========================================================================
  // CSS إضافي
  // ========================================================================
  function addExtraStyles() {
    var s = document.createElement('style');
    s.textContent = 
      '.v6-notif-item{transition:all 0.3s ease;overflow:hidden;}.v6-notif-item:hover{background:rgba(0,123,255,0.06);}' +
      '.v6-mark-read{opacity:0.7;transition:all 0.2s;}.v6-mark-read:hover{opacity:1;transform:scale(1.1);}' +
      '#notificationPanel{direction:rtl;max-height:400px;overflow-y:auto;}' +
      '.dark-mode .v6-notif-item:hover{background:rgba(255,255,255,0.06);}' +
      '.dark-mode .v6-notif-item{border-color:#444!important;color:#ddd;}' +
      '.dark-mode .v6-notif-item div[style*="color:#666"]{color:#aaa!important;}' +
      '.dark-mode #v6-dashboard-alerts-row .card-header{background:rgba(30,30,30,0.8)!important;color:#ddd;}' +
      '.dark-mode #v6-dashboard-alerts-row .card{background:#2d2d2d;border-color:#444;}' +
      '.dark-mode #v6-dashboard-alerts-row .alert{background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.1);color:#ccc;}' +
      '.alert-section{margin-bottom:12px;}.alert-section-header h6{margin:0 0 8px;font-size:14px;font-weight:700;}';
    document.head.appendChild(s);
  }

  // ========================================================================
  // التشغيل الرئيسي
  // ========================================================================
  function scheduleStart() {
    // المرحلة 1: فورية
    setTimeout(function() {
      try { fixToastSystem(); } catch(e) { console.error('V6.3:', e); }
      try { addExtraStyles(); } catch(e) {}
      try { fixEditState(); } catch(e) {}
      try { fixDataArrays(); } catch(e) {}
      try { patchSaveOperations(); } catch(e) {}
      try { fixDailyWorkEdit(); } catch(e) {}
      try { fixContractTypeToggle(); } catch(e) {}
      try { fixHRModule(); } catch(e) {}
      try { patchLoadDashboard(); } catch(e) {}
      console.log('✅ V6.3: المرحلة 1');
    }, 600);

    // المرحلة 2: بعد تحميل البيانات
    setTimeout(function() {
      try { fixDataArrays(); } catch(e) {}
      try { fixContractFilters(); } catch(e) {}
      try { fixNavigation(); } catch(e) {}
      try { startTableWatcher(); } catch(e) {}
      try { refreshActiveModule(); } catch(e) {}
      try { fixContractTypeToggle(); } catch(e) {}
      console.log('✅ V6.3: المرحلة 2');
    }, 2000);

    // المرحلة 3: إشعارات + تنبيهات لوحة التحكم
    setTimeout(function() {
      try { fixNotificationSystem(); } catch(e) { console.error('V6.3 Notif:', e); }
      try { fixDataArrays(); } catch(e) {}
      try { refreshActiveModule(); } catch(e) {}
      try { fixDashboardAlerts(); } catch(e) {}
      console.log('✅ V6.3: المرحلة 3');
    }, 3500);
  }

  if (document.readyState === 'complete') {
    scheduleStart();
  } else {
    window.addEventListener('load', scheduleStart);
  }

})();
