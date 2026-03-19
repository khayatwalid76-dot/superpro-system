// ============================================================================
// BUGFIX V8.0 - إصلاح جذري شامل لجميع المشاكل
// ============================================================================
// المشاكل المحلولة:
// 1. عدم عرض جميع الموظفين/العملاء/العقود/HR من Firebase
// 2. تكرار البيانات عند تعديل العمل اليومي
// 3. إنشاء فواتير تلقائية عند إدخال عمل يومي أو عقد
// 4. تعديل/طباعة/حذف الفواتير
// 5. تنبيهات لوحة التحكم (عقود منتهية/غير مدفوعة فقط)
// 6. حفظ حالة الإشعارات المقروءة
// ============================================================================
(function() {
  'use strict';
  console.log('🔧 BugFix V8.0: بدء الإصلاح الجذري الشامل...');

  // ========================================================================
  // أدوات مساعدة
  // ========================================================================
  function ensureArray(val) {
    if (Array.isArray(val)) return val.filter(function(v) { return v != null; });
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
  // CORE FIX: مزامنة المتغيرات المحلية مع window
  // ========================================================================
  function syncAllData() {
    DATA_KEYS.forEach(function(key) {
      if (window[key] && !Array.isArray(window[key]) && typeof window[key] === 'object') {
        window[key] = ensureArray(window[key]);
      }
    });
  }

  // ========================================================================
  // FIX 1: إعادة كتابة renderEmployeesTable لاستخدام window.employees دائماً
  // ========================================================================
  function overrideRenderEmployeesTable() {
    window.renderEmployeesTable = function() {
      var tbody = document.getElementById('employees-table-body');
      if (!tbody) return;
      var empList = ensureArray(window.employees);
      tbody.innerHTML = '';
      if (empList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4"><i class="fas fa-users fa-2x text-muted mb-2 d-block"></i><p class="text-muted">لا يوجد موظفين مسجلين بعد</p></td></tr>';
        return;
      }
      empList.forEach(function(emp, index) {
        if (!emp) return;
        var statusClass = emp.status === 'نشط' ? 'bg-success' : (emp.status === 'إجازة' ? 'bg-warning' : 'bg-secondary');
        var tr = document.createElement('tr');
        tr.className = 'employee-card';
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
        var el;
        el = document.getElementById('totalEmployeesCount'); if (el) el.textContent = empList.length;
        el = document.getElementById('activeEmployeesCount'); if (el) el.textContent = empList.filter(function(e){return e.status==='نشط';}).length;
        el = document.getElementById('employeesTableCount'); if (el) el.textContent = empList.length + ' موظف';
        var totalSal = empList.reduce(function(s,e){return s+(parseFloat(e.salary)||0);},0);
        el = document.getElementById('totalSalaries'); if (el) el.textContent = totalSal.toLocaleString() + ' ر.ق';
        var today = new Date();
        var expiring = empList.filter(function(e){
          if(!e.residencyExpiry) return false;
          var d = Math.ceil((new Date(e.residencyExpiry)-today)/(1000*3600*24));
          return d<=30 && d>=0;
        }).length;
        el = document.getElementById('expiringResidenciesCount'); if (el) el.textContent = expiring;
      } catch(e){}
      console.log('✅ V8: renderEmployeesTable - ' + empList.length + ' موظف');
    };
  }

  // ========================================================================
  // FIX 2: إعادة كتابة renderClientsTable لاستخدام window.clients دائماً
  // ========================================================================
  function overrideRenderClientsTable() {
    window.renderClientsTable = function() {
      var tbody = document.getElementById('clients-table-body');
      if (!tbody) return;
      var clientsList = ensureArray(window.clients);
      tbody.innerHTML = '';
      if (clientsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3"><i class="fas fa-users fa-2x mb-2 d-block"></i>لا يوجد عملاء</td></tr>';
        return;
      }
      clientsList.forEach(function(client, index) {
        if (!client) return;
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
      console.log('✅ V8: renderClientsTable - ' + clientsList.length + ' عميل');
    };
  }

  // ========================================================================
  // FIX 3: إعادة كتابة loadContracts لاستخدام window.contracts دائماً
  // ========================================================================
  function overrideLoadContracts() {
    window.renderContractsTable = function() {
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
      try {
        var el;
        el = document.getElementById('totalContractsCount'); if (el) el.textContent = allContracts.length;
        el = document.getElementById('paidContractsCount'); if (el) el.textContent = allContracts.filter(function(c){return c.paymentStatus==='مدفوع';}).length;
        el = document.getElementById('unpaidContractsCount'); if (el) el.textContent = allContracts.filter(function(c){return c.paymentStatus==='غير مدفوع';}).length;
      } catch(e){}
      console.log('✅ V8: renderContractsTable - ' + filtered.length + '/' + allContracts.length + ' عقد');
    };

    window.loadContracts = function() {
      syncAllData();
      window.renderContractsTable();
    };
    window.loadContracts._v6patched = true;
    window.loadContracts._v7patched = true;
  }

  // ========================================================================
  // FIX 4: إعادة كتابة loadHR لاستخدام window.employees دائماً
  // ========================================================================
  function overrideLoadHR() {
    window.loadHR = function() {
      var section = document.getElementById('hr');
      if (!section) return;
      var empList = ensureArray(window.employees);
      var today = new Date();
      var activeCount = empList.filter(function(e){return e.status==='نشط';}).length;
      var totalSalaries = empList.reduce(function(s,e){return s+(parseFloat(e.salary)||0);},0);
      var expiringResidencies = empList.filter(function(e){
        if(!e.residencyExpiry) return false;
        var d = Math.ceil((new Date(e.residencyExpiry)-today)/(1000*3600*24));
        return d<=90 && d>=0;
      });

      section.innerHTML =
        '<div class="row g-3 mb-4">' +
          '<div class="col-md-3"><div class="card stat-card p-3 text-center bg-primary text-white"><i class="fas fa-users" style="font-size:28px;"></i><h4>' + empList.length + '</h4><p>إجمالي الموظفين</p></div></div>' +
          '<div class="col-md-3"><div class="card stat-card p-3 text-center bg-success text-white"><i class="fas fa-user-check" style="font-size:28px;"></i><h4>' + activeCount + '</h4><p>موظفون نشطون</p></div></div>' +
          '<div class="col-md-3"><div class="card stat-card p-3 text-center bg-info text-white"><i class="fas fa-money-bill-wave" style="font-size:28px;"></i><h4>' + totalSalaries.toLocaleString() + '</h4><p>إجمالي الرواتب</p></div></div>' +
          '<div class="col-md-3"><div class="card stat-card p-3 text-center bg-warning text-white"><i class="fas fa-id-card" style="font-size:28px;"></i><h4>' + expiringResidencies.length + '</h4><p>إقامات تنتهي قريباً</p></div></div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="card-header d-flex justify-content-between align-items-center"><h5 class="mb-0"><i class="fas fa-users-cog me-2"></i>سجل الموظفين - الموارد البشرية</h5></div>' +
          '<div class="card-body"><div class="table-responsive"><table class="table table-hover table-striped"><thead class="table-dark"><tr>' +
            '<th>#</th><th>الاسم</th><th>الوظيفة</th><th>الجنسية</th><th>رقم الهوية</th><th>الهاتف</th><th>الراتب</th><th>الحالة</th><th>تاريخ التعيين</th><th>انتهاء الإقامة</th>' +
          '</tr></thead><tbody id="hrTableBody"></tbody></table></div></div>' +
        '</div>';

      var hrBody = document.getElementById('hrTableBody');
      if (!hrBody) return;

      if (empList.length === 0) {
        hrBody.innerHTML = '<tr><td colspan="10" class="text-center py-3 text-muted">لا يوجد موظفين</td></tr>';
        return;
      }

      empList.forEach(function(emp, idx) {
        if (!emp) return;
        var statusClass = emp.status === 'نشط' ? 'bg-success' : (emp.status === 'إجازة' ? 'bg-warning' : 'bg-secondary');
        var residencyWarning = '';
        if (emp.residencyExpiry) {
          var d = Math.ceil((new Date(emp.residencyExpiry) - today) / (1000*3600*24));
          if (d <= 30 && d > 0) residencyWarning = ' <span class="badge bg-warning text-dark">⚠ ' + d + ' يوم</span>';
          else if (d <= 0) residencyWarning = ' <span class="badge bg-danger">❌ منتهية</span>';
        }
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + (idx + 1) + '</td>' +
          '<td><strong>' + safeStr(emp.name) + '</strong></td>' +
          '<td>' + safeStr(emp.job) + '</td>' +
          '<td>' + safeStr(emp.nationality) + '</td>' +
          '<td>' + safeStr(emp.idNumber || '-') + '</td>' +
          '<td>' + safeStr(emp.phone || '-') + '</td>' +
          '<td class="text-success fw-bold">' + (parseFloat(emp.salary)||0).toLocaleString() + ' ر.ق</td>' +
          '<td><span class="badge ' + statusClass + '">' + safeStr(emp.status) + '</span></td>' +
          '<td>' + safeStr(emp.hireDate || emp.joinDate || '-') + '</td>' +
          '<td>' + safeStr(emp.residencyExpiry || '-') + residencyWarning + '</td>';
        hrBody.appendChild(tr);
      });
      console.log('✅ V8: loadHR - ' + empList.length + ' موظف');
    };
    window.loadHR._v6patched = true;
    window.loadHR._v7patched = true;
  }

  // ========================================================================
  // FIX 5: إعادة كتابة loadEmployees و loadClients
  // ========================================================================
  function overrideLoadFunctions() {
    var origLoadEmp = window.loadEmployees;
    window.loadEmployees = function() {
      syncAllData();
      window.renderEmployeesTable();
      // setup events
      if (typeof window.updateEmployeeStats === 'function') {
        try { window.updateEmployeeStats(); } catch(e) {}
      }
      if (typeof window.setupEmployeeEvents === 'function') {
        try { window.setupEmployeeEvents(); } catch(e) {}
      }
    };

    var origLoadCli = window.loadClients;
    window.loadClients = function() {
      syncAllData();
      window.renderClientsTable();
      if (typeof window.setupClientEvents === 'function') {
        try { window.setupClientEvents(); } catch(e) {}
      }
    };
  }

  // ========================================================================
  // FIX 6: إعادة كتابة updateAllUI
  // ========================================================================
  function overrideUpdateAllUI() {
    var origUpdateAllUI = window.updateAllUI;
    window.updateAllUI = function() {
      syncAllData();
      console.log('🔄 V8: updateAllUI...');
      try { window.loadEmployees(); } catch(e) { console.warn('V8 loadEmployees:', e); }
      try { window.loadClients(); } catch(e) { console.warn('V8 loadClients:', e); }
      try { window.loadContracts(); } catch(e) { console.warn('V8 loadContracts:', e); }
      try { if (typeof window.loadServices === 'function') window.loadServices(); } catch(e) {}
      try { if (typeof window.loadDashboard === 'function') window.loadDashboard(); } catch(e) {}
      try { if (typeof window.loadDailyWork === 'function') window.loadDailyWork(); } catch(e) {}
      try { if (typeof window.loadDailyIncome === 'function') window.loadDailyIncome(); } catch(e) {}
      try { if (typeof window.loadDailyExpenses === 'function') window.loadDailyExpenses(); } catch(e) {}
      try { if (typeof window.loadAttendance === 'function') window.loadAttendance(); } catch(e) {}
      try { if (typeof window.updateStatistics === 'function') window.updateStatistics(); } catch(e) {}
    };
  }

  // ========================================================================
  // FIX 7: إصلاح تحرير العمل اليومي (منع التكرار)
  // ========================================================================
  function fixDailyWorkEdit() {
    window.editDailyWork = function(index) {
      var workList = ensureArray(window.dailyWork);
      var work = workList[index];
      if (!work) { if (typeof window.showToast === 'function') window.showToast('لم يتم العثور على سجل العمل', 'error'); return; }

      if (!window.editState) window.editState = {};
      if (!window.editState.dailyWork) window.editState.dailyWork = {};
      window.editState.dailyWork.isEditMode = true;
      window.editState.dailyWork.editIndex = index;

      var modal = document.getElementById('dailyWorkModal');
      if (!modal) return;

      // ملء الحقول
      var fields = {
        'dailyWorkDate': work.date || '',
        'dailyWorkClientNumber': work.clientNumber || '',
        'dailyWorkArea': work.area || work.location || '',
        'dailyWorkTotalHours': work.totalHours || work.hours || 8,
        'dailyWorkShift': work.shift || 'صباحية',
        'dailyWorkDriver': work.driver || '',
        'dailyWorkAmount': work.amount || '',
        'dailyWorkPaymentStatus': work.paymentStatus || 'غير مدفوع',
        'dailyWorkPaymentMethod': work.paymentMethod || '',
        'dailyWorkNotes': work.notes || ''
      };
      Object.keys(fields).forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = fields[id];
      });

      // ملء العميل
      var clientSelect = document.getElementById('dailyWorkClient');
      var clientManual = document.getElementById('dailyWorkClientManual');
      var toggleBtn = document.getElementById('toggleClientInput');
      if (clientSelect && clientManual) {
        var clientName = work.client || work.clientName || '';
        var found = false;
        for (var i = 0; i < clientSelect.options.length; i++) {
          if (clientSelect.options[i].value === clientName) { found = true; break; }
        }
        if (found) {
          clientSelect.value = clientName;
          clientSelect.classList.remove('d-none');
          clientManual.classList.add('d-none');
          if (toggleBtn) { toggleBtn.innerHTML = '<i class="fas fa-edit"></i>'; toggleBtn.title = 'تبديل إلى الإدخال اليدوي'; }
        } else {
          clientManual.value = clientName;
          clientManual.classList.remove('d-none');
          clientSelect.classList.add('d-none');
          if (toggleBtn) { toggleBtn.innerHTML = '<i class="fas fa-list"></i>'; toggleBtn.title = 'تبديل إلى الاختيار من القائمة'; }
        }
      }

      var titleEl = modal.querySelector('.modal-title');
      if (titleEl) titleEl.textContent = 'تعديل العمل اليومي';
      var saveBtn = document.getElementById('saveDailyWorkBtn');
      if (saveBtn) saveBtn.textContent = 'تحديث البيانات';

      // fill workers
      if (typeof window.fillMultiSelectWorkers === 'function') window.fillMultiSelectWorkers();
      if (typeof window.fillDriversSelect === 'function') window.fillDriversSelect();
      if (typeof window.fillClientSelects === 'function') window.fillClientSelects();

      try {
        var bsModal = bootstrap.Modal.getOrCreateInstance(modal);
        bsModal.show();
      } catch(e) { console.error('V8 editDailyWork modal:', e); }

      // select workers after modal is shown
      setTimeout(function() {
        var workers = work.workers || (work.worker ? [work.worker] : []);
        workers.forEach(function(workerName) {
          var checkbox = document.querySelector('.multi-select-checkbox[value="' + workerName + '"]');
          if (checkbox) {
            checkbox.checked = true;
            if (checkbox.parentElement) checkbox.parentElement.classList.add('selected');
          }
        });
        if (typeof window.updateSelectedWorkersDisplay === 'function') window.updateSelectedWorkersDisplay();
      }, 300);
    };
  }

  // ========================================================================
  // FIX 8: نظام الفواتير التلقائية
  // ========================================================================
  var INVOICES_KEY = 'superpro_invoices_v8';

  function getInvoices() {
    try {
      var stored = localStorage.getItem(INVOICES_KEY);
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return [];
  }

  function saveInvoices(invoices) {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  }

  function generateInvoiceNumber() {
    var now = new Date();
    var prefix = 'INV-' + now.getFullYear() + '-';
    var invoices = getInvoices();
    var maxNum = 0;
    invoices.forEach(function(inv) {
      var match = (inv.invoiceNumber || '').match(/INV-\d{4}-(\d+)/);
      if (match) maxNum = Math.max(maxNum, parseInt(match[1]));
    });
    return prefix + String(maxNum + 1).padStart(4, '0');
  }

  function createAutoInvoice(data) {
    var invoices = getInvoices();
    var invoice = {
      id: Date.now(),
      invoiceNumber: generateInvoiceNumber(),
      clientName: data.clientName || '',
      date: data.date || new Date().toISOString().split('T')[0],
      amount: parseFloat(data.amount) || 0,
      status: data.paymentStatus === 'مدفوع' ? 'مدفوع' : 'معلق',
      source: data.source || 'عمل يومي',
      description: data.description || '',
      paymentMethod: data.paymentMethod || '',
      workers: data.workers || '',
      area: data.area || '',
      contractNumber: data.contractNumber || '',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      autoGenerated: true
    };
    invoices.push(invoice);
    saveInvoices(invoices);
    console.log('📄 V8: فاتورة تلقائية #' + invoice.invoiceNumber);
    return invoice;
  }

  // Hook into daily work save
  function hookDailyWorkSave() {
    var origSaveData = window.saveData;
    if (!origSaveData || origSaveData._v8hooked) return;

    // We'll patch the daily work save button directly after setup
    var checkInterval = setInterval(function() {
      var saveBtn = document.getElementById('saveDailyWorkBtn');
      if (!saveBtn) return;
      clearInterval(checkInterval);

      var existingHandler = saveBtn.onclick;
      if (!existingHandler || existingHandler._v8patched) return;

      saveBtn.onclick = function() {
        var isEdit = window.editState && window.editState.dailyWork && window.editState.dailyWork.isEditMode;
        var oldLength = ensureArray(window.dailyWork).length;

        // Call original handler
        existingHandler.call(this);

        // If new entry was added (not edit), create invoice
        var newLength = ensureArray(window.dailyWork).length;
        if (!isEdit && newLength > oldLength) {
          var newWork = ensureArray(window.dailyWork)[newLength - 1];
          if (newWork) {
            createAutoInvoice({
              clientName: newWork.client || newWork.clientName,
              date: newWork.date,
              amount: newWork.amount,
              paymentStatus: newWork.paymentStatus,
              source: 'عمل يومي',
              description: 'عمل يومي - ' + safeStr(newWork.area) + ' (' + safeStr(newWork.shift) + ')',
              paymentMethod: newWork.paymentMethod,
              workers: newWork.workers ? newWork.workers.join(', ') : safeStr(newWork.worker),
              area: newWork.area
            });
            if (typeof window.showToast === 'function') {
              window.showToast('📄 تم إنشاء فاتورة تلقائية', 'info');
            }
          }
        }
      };
      saveBtn.onclick._v8patched = true;
    }, 1000);
  }

  // Hook into contract save
  function hookContractSave() {
    var checkInterval = setInterval(function() {
      var saveBtn = document.getElementById('saveContractBtn');
      if (!saveBtn) return;
      clearInterval(checkInterval);

      var existingHandler = saveBtn.onclick;
      if (!existingHandler || existingHandler._v8patched) return;

      saveBtn.onclick = function() {
        var isEdit = window.editState && window.editState.contract && window.editState.contract.isEditMode;
        var oldLength = ensureArray(window.contracts).length;

        existingHandler.call(this);

        var newLength = ensureArray(window.contracts).length;
        if (!isEdit && newLength > oldLength) {
          var newContract = ensureArray(window.contracts)[newLength - 1];
          if (newContract) {
            createAutoInvoice({
              clientName: newContract.client || newContract.clientName,
              date: newContract.startDate || new Date().toISOString().split('T')[0],
              amount: newContract.amount || newContract.value,
              paymentStatus: newContract.paymentStatus,
              source: 'عقد',
              description: 'عقد ' + safeStr(newContract.type) + ' - ' + safeStr(newContract.number),
              paymentMethod: '',
              contractNumber: newContract.number
            });
            if (typeof window.showToast === 'function') {
              window.showToast('📄 تم إنشاء فاتورة تلقائية للعقد', 'info');
            }
          }
        }
      };
      saveBtn.onclick._v8patched = true;
    }, 1000);
  }

  // ========================================================================
  // FIX 9: إعادة كتابة loadInvoices بالكامل مع CRUD
  // ========================================================================
  function overrideLoadInvoices() {
    window.loadInvoices = function() {
      var section = document.getElementById('invoices');
      if (!section) return;

      var invoices = getInvoices();
      var totalInvoices = invoices.length;
      var paidInvoices = invoices.filter(function(i){return i.status==='مدفوع';}).length;
      var pendingInvoices = invoices.filter(function(i){return i.status!=='مدفوع';}).length;
      var totalAmount = invoices.reduce(function(s,i){return s+(parseFloat(i.amount)||0);},0);
      var paidAmount = invoices.filter(function(i){return i.status==='مدفوع';}).reduce(function(s,i){return s+(parseFloat(i.amount)||0);},0);

      section.innerHTML =
        '<div class="row g-3 mb-4">' +
          '<div class="col-md-3"><div class="card stat-card p-3 text-center bg-primary text-white"><i class="fas fa-file-invoice-dollar" style="font-size:28px;"></i><h4>' + totalInvoices + '</h4><p>إجمالي الفواتير</p></div></div>' +
          '<div class="col-md-3"><div class="card stat-card p-3 text-center bg-success text-white"><i class="fas fa-check-circle" style="font-size:28px;"></i><h4>' + paidInvoices + '</h4><p>فواتير مدفوعة</p></div></div>' +
          '<div class="col-md-3"><div class="card stat-card p-3 text-center bg-warning text-white"><i class="fas fa-hourglass-end" style="font-size:28px;"></i><h4>' + pendingInvoices + '</h4><p>فواتير معلقة</p></div></div>' +
          '<div class="col-md-3"><div class="card stat-card p-3 text-center bg-info text-white"><i class="fas fa-money-bill-wave" style="font-size:28px;"></i><h4>' + totalAmount.toLocaleString() + ' ر.ق</h4><p>إجمالي المبلغ</p></div></div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="card-header d-flex justify-content-between align-items-center">' +
            '<h5 class="mb-0"><i class="fas fa-file-invoice me-2"></i>قائمة الفواتير</h5>' +
            '<div>' +
              '<button class="btn btn-outline-info btn-sm me-2" onclick="v8FilterInvoices(\'all\')">الكل</button>' +
              '<button class="btn btn-outline-success btn-sm me-2" onclick="v8FilterInvoices(\'مدفوع\')">مدفوع</button>' +
              '<button class="btn btn-outline-warning btn-sm" onclick="v8FilterInvoices(\'معلق\')">معلق</button>' +
            '</div>' +
          '</div>' +
          '<div class="card-body"><div class="table-responsive"><table class="table table-hover table-striped"><thead class="table-dark"><tr>' +
            '<th>#</th><th>رقم الفاتورة</th><th>العميل</th><th>المصدر</th><th>التاريخ</th><th>الوصف</th><th>المبلغ</th><th>الحالة</th><th>الإجراءات</th>' +
          '</tr></thead><tbody id="v8InvoicesBody"></tbody></table></div></div>' +
        '</div>';

      v8RenderInvoiceRows(invoices);
    };
  }

  window.v8CurrentInvoiceFilter = 'all';

  window.v8FilterInvoices = function(filter) {
    window.v8CurrentInvoiceFilter = filter;
    var invoices = getInvoices();
    if (filter !== 'all') {
      invoices = invoices.filter(function(inv) { return inv.status === filter; });
    }
    v8RenderInvoiceRows(invoices);
  };

  function v8RenderInvoiceRows(invoices) {
    var tbody = document.getElementById('v8InvoicesBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (invoices.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center py-3 text-muted"><i class="fas fa-file-invoice fa-2x mb-2 d-block"></i>لا توجد فواتير</td></tr>';
      return;
    }

    var sorted = invoices.slice().sort(function(a,b) { return (b.id || 0) - (a.id || 0); });
    sorted.forEach(function(inv, idx) {
      var statusBadge = inv.status === 'مدفوع' ? 'bg-success' : 'bg-warning';
      var sourceBadge = inv.source === 'عقد' ? '<span class="badge bg-primary">عقد</span>' : '<span class="badge bg-info">عمل يومي</span>';
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>' + (idx + 1) + '</td>' +
        '<td><strong>' + safeStr(inv.invoiceNumber) + '</strong></td>' +
        '<td>' + safeStr(inv.clientName) + '</td>' +
        '<td>' + sourceBadge + '</td>' +
        '<td>' + safeStr(inv.date) + '</td>' +
        '<td><small>' + safeStr(inv.description || '-') + '</small></td>' +
        '<td class="fw-bold text-success">' + (parseFloat(inv.amount)||0).toLocaleString() + ' ر.ق</td>' +
        '<td><span class="badge ' + statusBadge + '">' + safeStr(inv.status || 'معلق') + '</span></td>' +
        '<td>' +
          '<div class="btn-group btn-group-sm">' +
            '<button class="btn btn-outline-warning" onclick="v8EditInvoice(' + inv.id + ')" title="تعديل"><i class="fas fa-edit"></i></button>' +
            '<button class="btn btn-outline-primary" onclick="v8PrintInvoice(' + inv.id + ')" title="طباعة"><i class="fas fa-print"></i></button>' +
            '<button class="btn btn-outline-danger" onclick="v8DeleteInvoice(' + inv.id + ')" title="حذف"><i class="fas fa-trash"></i></button>' +
          '</div>' +
        '</td>';
      tbody.appendChild(tr);
    });
  }

  // تعديل الفاتورة
  window.v8EditInvoice = function(id) {
    var invoices = getInvoices();
    var inv = invoices.find(function(i) { return i.id === id; });
    if (!inv) return;

    var modalHtml =
      '<div class="modal fade" id="v8EditInvoiceModal" tabindex="-1"><div class="modal-dialog"><div class="modal-content">' +
      '<div class="modal-header bg-warning text-white"><h5 class="modal-title"><i class="fas fa-edit me-2"></i>تعديل الفاتورة ' + safeStr(inv.invoiceNumber) + '</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div>' +
      '<div class="modal-body"><form id="v8EditInvoiceForm" class="row g-3">' +
        '<div class="col-md-6"><label class="form-label">رقم الفاتورة</label><input id="v8InvNum" class="form-control" value="' + safeStr(inv.invoiceNumber) + '" readonly></div>' +
        '<div class="col-md-6"><label class="form-label">العميل</label><input id="v8InvClient" class="form-control" value="' + safeStr(inv.clientName) + '"></div>' +
        '<div class="col-md-6"><label class="form-label">التاريخ</label><input id="v8InvDate" type="date" class="form-control" value="' + safeStr(inv.date) + '"></div>' +
        '<div class="col-md-6"><label class="form-label">المبلغ</label><input id="v8InvAmount" type="number" class="form-control" value="' + (inv.amount||0) + '"></div>' +
        '<div class="col-md-6"><label class="form-label">الحالة</label><select id="v8InvStatus" class="form-select"><option value="معلق"' + (inv.status!=='مدفوع'?' selected':'') + '>معلق</option><option value="مدفوع"' + (inv.status==='مدفوع'?' selected':'') + '>مدفوع</option></select></div>' +
        '<div class="col-md-6"><label class="form-label">طريقة الدفع</label><input id="v8InvPayMethod" class="form-control" value="' + safeStr(inv.paymentMethod) + '"></div>' +
        '<div class="col-12"><label class="form-label">ملاحظات</label><textarea id="v8InvNotes" class="form-control" rows="2">' + safeStr(inv.notes) + '</textarea></div>' +
      '</form></div>' +
      '<div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button><button type="button" class="btn btn-warning" id="v8SaveEditInvoice">حفظ التعديلات</button></div>' +
      '</div></div></div>';

    // Remove old modal if exists
    var old = document.getElementById('v8EditInvoiceModal');
    if (old) old.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    var modalEl = document.getElementById('v8EditInvoiceModal');
    var bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();

    document.getElementById('v8SaveEditInvoice').onclick = function() {
      inv.clientName = document.getElementById('v8InvClient').value;
      inv.date = document.getElementById('v8InvDate').value;
      inv.amount = parseFloat(document.getElementById('v8InvAmount').value) || 0;
      inv.status = document.getElementById('v8InvStatus').value;
      inv.paymentMethod = document.getElementById('v8InvPayMethod').value;
      inv.notes = document.getElementById('v8InvNotes').value;
      inv.updatedAt = new Date().toISOString();

      saveInvoices(invoices);
      bsModal.hide();
      window.loadInvoices();
      if (typeof window.showToast === 'function') window.showToast('تم تحديث الفاتورة بنجاح', 'success');
    };

    modalEl.addEventListener('hidden.bs.modal', function() { modalEl.remove(); });
  };

  // طباعة الفاتورة
  window.v8PrintInvoice = function(id) {
    var invoices = getInvoices();
    var inv = invoices.find(function(i) { return i.id === id; });
    if (!inv) return;

    var printContent =
      '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8">' +
      '<title>فاتورة ' + safeStr(inv.invoiceNumber) + '</title>' +
      '<style>' +
        'body{font-family:Tajawal,Arial,sans-serif;padding:40px;color:#333;direction:rtl;}' +
        '.invoice-header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #2563eb;padding-bottom:20px;margin-bottom:30px;}' +
        '.invoice-header h1{color:#2563eb;font-size:28px;margin:0;}' +
        '.invoice-header .company{text-align:left;}' +
        '.invoice-info{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px;}' +
        '.info-box{background:#f8f9fa;padding:15px;border-radius:8px;border:1px solid #e9ecef;}' +
        '.info-box h4{color:#2563eb;margin-bottom:10px;font-size:16px;}' +
        '.info-box p{margin:5px 0;font-size:14px;}' +
        '.invoice-table{width:100%;border-collapse:collapse;margin-bottom:30px;}' +
        '.invoice-table th{background:#2563eb;color:white;padding:12px;text-align:right;}' +
        '.invoice-table td{padding:12px;border-bottom:1px solid #e9ecef;}' +
        '.total-row{background:#f8f9fa;font-weight:bold;font-size:18px;}' +
        '.status-badge{padding:5px 15px;border-radius:20px;font-size:14px;font-weight:bold;}' +
        '.paid{background:#d4edda;color:#155724;}.pending{background:#fff3cd;color:#856404;}' +
        '.footer{text-align:center;margin-top:40px;padding-top:20px;border-top:2px solid #e9ecef;color:#666;font-size:12px;}' +
        '@media print{body{padding:20px;}}' +
      '</style></head><body>' +
      '<div class="invoice-header"><div><h1>🧾 فاتورة</h1><p style="color:#666;">' + safeStr(inv.invoiceNumber) + '</p></div><div class="company"><h3 style="margin:0;">SuperPro System</h3><p style="color:#666;margin:5px 0;">نظام إدارة متكامل</p></div></div>' +
      '<div class="invoice-info">' +
        '<div class="info-box"><h4>بيانات العميل</h4><p><strong>الاسم:</strong> ' + safeStr(inv.clientName) + '</p>' +
        (inv.area ? '<p><strong>المنطقة:</strong> ' + safeStr(inv.area) + '</p>' : '') +
        '</div>' +
        '<div class="info-box"><h4>تفاصيل الفاتورة</h4><p><strong>التاريخ:</strong> ' + safeStr(inv.date) + '</p>' +
        '<p><strong>المصدر:</strong> ' + safeStr(inv.source) + '</p>' +
        '<p><strong>الحالة:</strong> <span class="status-badge ' + (inv.status==='مدفوع'?'paid':'pending') + '">' + safeStr(inv.status) + '</span></p>' +
        (inv.paymentMethod ? '<p><strong>طريقة الدفع:</strong> ' + safeStr(inv.paymentMethod) + '</p>' : '') +
        '</div>' +
      '</div>' +
      '<table class="invoice-table"><thead><tr><th>الوصف</th><th>التفاصيل</th><th>المبلغ</th></tr></thead><tbody>' +
      '<tr><td>' + safeStr(inv.description || inv.source || 'خدمة') + '</td><td>' + (inv.workers ? 'العمال: ' + safeStr(inv.workers) : safeStr(inv.contractNumber || '-')) + '</td><td>' + (parseFloat(inv.amount)||0).toLocaleString() + ' ر.ق</td></tr>' +
      '<tr class="total-row"><td colspan="2" style="text-align:left;">الإجمالي</td><td>' + (parseFloat(inv.amount)||0).toLocaleString() + ' ر.ق</td></tr>' +
      '</tbody></table>' +
      (inv.notes ? '<div style="background:#f8f9fa;padding:15px;border-radius:8px;margin-bottom:20px;"><strong>ملاحظات:</strong> ' + safeStr(inv.notes) + '</div>' : '') +
      '<div class="footer"><p>تم إنشاء هذه الفاتورة بواسطة SuperPro System</p><p>' + new Date().toLocaleDateString('ar-SA') + '</p></div>' +
      '</body></html>';

    var printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(function() { printWindow.print(); }, 500);
  };

  // حذف الفاتورة
  window.v8DeleteInvoice = function(id) {
    if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return;
    var invoices = getInvoices();
    invoices = invoices.filter(function(i) { return i.id !== id; });
    saveInvoices(invoices);
    window.loadInvoices();
    if (typeof window.showToast === 'function') window.showToast('تم حذف الفاتورة بنجاح', 'success');
  };

  // ========================================================================
  // FIX 10: تنبيهات لوحة التحكم - فقط العقود المنتهية/القريبة + غير المدفوعة
  // ========================================================================
  function fixDashboardAlerts() {
    var alertsCard = document.getElementById('recentAlerts');
    if (!alertsCard) return;
    var existingRow = alertsCard.closest('.row.mt-4');
    if (!existingRow) return;

    var today = new Date();
    var contractsList = ensureArray(window.contracts);
    var employeesList = ensureArray(window.employees);

    // تنبيهات العقود: فقط المنتهية/القريبة + غير المدفوعة
    var contractAlerts = [];
    contractsList.forEach(function(c) {
      if (!c) return;
      if (c.paymentStatus === 'مدفوع') return;
      if (c.endDate) {
        var d = Math.ceil((new Date(c.endDate) - today) / 86400000);
        if (d <= 30 && d > 0) {
          contractAlerts.push({text: 'عقد ' + safeStr(c.number) + ' مع ' + safeStr(c.client || c.clientName) + ' ينتهي خلال ' + d + ' يوم — ' + safeStr(c.paymentStatus || 'غير مدفوع'), level: d <= 7 ? 'danger' : 'warning', icon: 'fas fa-clock'});
        } else if (d <= 0) {
          contractAlerts.push({text: 'عقد ' + safeStr(c.number) + ' مع ' + safeStr(c.client || c.clientName) + ' منتهي منذ ' + Math.abs(d) + ' يوم — ' + safeStr(c.paymentStatus || 'غير مدفوع'), level: 'danger', icon: 'fas fa-exclamation-triangle'});
        }
      }
    });

    // تنبيهات الإقامات
    var residencyAlerts = [];
    employeesList.forEach(function(emp) {
      if (!emp || !emp.residencyExpiry) return;
      var d = Math.ceil((new Date(emp.residencyExpiry) - today) / 86400000);
      if (d <= 30 && d > 0) residencyAlerts.push({text: safeStr(emp.name) + ' — الإقامة تنتهي خلال ' + d + ' يوم', level: d <= 7 ? 'danger' : 'warning', icon: 'fas fa-clock'});
      else if (d <= 0) residencyAlerts.push({text: safeStr(emp.name) + ' — الإقامة منتهية منذ ' + Math.abs(d) + ' يوم', level: 'danger', icon: 'fas fa-exclamation-circle'});
    });

    // مبالغ غير مدفوعة
    var unpaidAlerts = [];
    contractsList.forEach(function(c) {
      if (!c || c.paymentStatus === 'مدفوع') return;
      var remaining = (parseFloat(c.amount)||0) - (parseFloat(c.paidAmount)||0);
      if (remaining > 0) unpaidAlerts.push({text: 'عقد ' + safeStr(c.number) + ' مع ' + safeStr(c.client || c.clientName) + ': ' + remaining.toLocaleString() + ' ر.ق متبقية', level: 'warning', icon: 'fas fa-file-invoice-dollar'});
    });

    function buildAlertList(items) {
      if (items.length === 0) return '<div class="text-center text-muted py-2"><i class="fas fa-check-circle fa-lg mb-1 d-block text-success"></i><small>لا توجد تنبيهات</small></div>';
      var html = '<div style="max-height:200px;overflow-y:auto;">';
      items.forEach(function(item) {
        html += '<div class="alert alert-' + item.level + ' py-2 px-3 mb-2 d-flex align-items-center gap-2" style="font-size:13px;border-radius:8px;"><i class="' + item.icon + '" style="flex-shrink:0;"></i><span style="flex:1;">' + item.text + '</span></div>';
      });
      return html + '</div>';
    }

    // إزالة القديم
    ['v6-dashboard-alerts-row','v7-dashboard-alerts-row','v8-dashboard-alerts-row'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.remove();
    });

    var newRow = document.createElement('div');
    newRow.className = 'row mt-4';
    newRow.id = 'v8-dashboard-alerts-row';
    newRow.innerHTML =
      '<div class="col-md-4"><div class="card h-100" style="border-right:4px solid #e74c3c;"><div class="card-header d-flex justify-content-between align-items-center py-2" style="background:linear-gradient(135deg,#fff5f5,#ffe0e0);"><span><i class="fas fa-file-contract text-danger me-2"></i>تنبيهات العقود</span><span class="badge bg-danger">' + contractAlerts.length + '</span></div><div class="card-body py-2">' + buildAlertList(contractAlerts) + '</div></div></div>' +
      '<div class="col-md-4"><div class="card h-100" style="border-right:4px solid #f39c12;"><div class="card-header d-flex justify-content-between align-items-center py-2" style="background:linear-gradient(135deg,#fffbf0,#fff3cd);"><span><i class="fas fa-id-card text-warning me-2"></i>تنبيهات الإقامات</span><span class="badge bg-warning text-dark">' + residencyAlerts.length + '</span></div><div class="card-body py-2">' + buildAlertList(residencyAlerts) + '</div></div></div>' +
      '<div class="col-md-4"><div class="card h-100" style="border-right:4px solid #3498db;"><div class="card-header d-flex justify-content-between align-items-center py-2" style="background:linear-gradient(135deg,#f0f8ff,#d6eaf8);"><span><i class="fas fa-money-bill-wave text-primary me-2"></i>مبالغ غير مدفوعة</span><span class="badge bg-primary">' + unpaidAlerts.length + '</span></div><div class="card-body py-2">' + buildAlertList(unpaidAlerts) + '</div></div></div>';

    existingRow.parentNode.insertBefore(newRow, existingRow);

    var totalAlerts = contractAlerts.length + residencyAlerts.length + unpaidAlerts.length;
    var alertsCountEl = document.getElementById('alertsCount');
    if (alertsCountEl) alertsCountEl.textContent = totalAlerts;
    alertsCard.innerHTML = '<div class="text-center text-muted py-2"><small>تم نقل التنبيهات لأقسام منفصلة أعلاه ↑</small></div>';
  }

  // ========================================================================
  // FIX 11: نظام الإشعارات - حفظ حالة المقروء
  // ========================================================================
  function fixNotificationBell() {
    var bell = document.getElementById('notificationBell');
    var panel = document.getElementById('notificationPanel');
    var listEl = document.getElementById('notificationList');
    if (!bell || !panel || !listEl) return;

    var READ_KEY = 'superpro_read_notifs_v8';

    function getReadIds() {
      try { return JSON.parse(localStorage.getItem(READ_KEY) || '[]'); } catch(e) { return []; }
    }
    function saveReadIds(ids) { localStorage.setItem(READ_KEY, JSON.stringify(ids)); }
    function markRead(id) {
      var read = getReadIds();
      if (!read.includes(id)) { read.push(id); saveReadIds(read); }
    }

    function stableId(prefix, obj) {
      var key = safeStr(obj.number || obj.client || obj.clientName || obj.name || obj.idNumber || '')
                .replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '');
      return prefix + '_' + (key || 'unknown');
    }

    function gatherNotifs() {
      var notifs = [];
      var today = new Date();
      ensureArray(window.contracts).forEach(function(c) {
        if (!c) return;
        if (c.endDate) {
          var d = Math.ceil((new Date(c.endDate) - today) / 86400000);
          if (d <= 30 && d > 0) notifs.push({id:stableId('c_exp',c),icon:'fas fa-file-contract',color:'warning',title:'عقد يقترب من الانتهاء',text:safeStr(c.client||c.clientName||'عقد')+' — ينتهي بعد '+d+' يوم',time:c.endDate});
          else if (d <= 0) notifs.push({id:stableId('c_ended',c),icon:'fas fa-exclamation-triangle',color:'danger',title:'عقد منتهي',text:safeStr(c.client||c.clientName||'عقد')+' — انتهى منذ '+Math.abs(d)+' يوم',time:c.endDate});
        }
        if (c.paymentStatus === 'غير مدفوع') notifs.push({id:stableId('c_unpaid',c),icon:'fas fa-money-bill-wave',color:'danger',title:'عقد غير مدفوع',text:safeStr(c.client||c.clientName||'عقد')+' — '+(c.amount||0)+' ر.ق',time:c.createdAt||''});
      });
      ensureArray(window.employees).forEach(function(emp) {
        if (!emp || !emp.residencyExpiry) return;
        var d = Math.ceil((new Date(emp.residencyExpiry) - today) / 86400000);
        if (d <= 30 && d > 0) notifs.push({id:stableId('r_exp',emp),icon:'fas fa-passport',color:'warning',title:'إقامة تنتهي قريباً',text:safeStr(emp.name||'موظف')+' — تنتهي بعد '+d+' يوم',time:emp.residencyExpiry});
        else if (d <= 0) notifs.push({id:stableId('r_ended',emp),icon:'fas fa-exclamation-circle',color:'danger',title:'إقامة منتهية',text:safeStr(emp.name||'موظف')+' — انتهت منذ '+Math.abs(d)+' يوم',time:emp.residencyExpiry});
      });
      return notifs;
    }

    function renderNotifs() {
      var all = gatherNotifs();
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
        var eid = n.id.replace(/'/g, "\\'");
        html += '<div class="v6-notif-item d-flex align-items-start gap-2 p-2 border-bottom" style="font-size:13px;" data-notif-id="' + n.id + '">' +
          '<i class="' + n.icon + ' text-' + n.color + ' mt-1" style="font-size:16px;flex-shrink:0;"></i>' +
          '<div style="flex:1;min-width:0;"><div style="font-weight:600;">' + n.title + '</div>' +
          '<div style="color:#666;font-size:12px;">' + n.text + '</div>' +
          (n.time ? '<div style="color:#999;font-size:11px;margin-top:2px;">' + n.time + '</div>' : '') +
          '</div>' +
          '<button class="btn btn-sm btn-outline-success" onclick="v8MarkNotifRead(\'' + eid + '\')" title="تحديد كمقروء" style="flex-shrink:0;padding:2px 6px;font-size:11px;"><i class="fas fa-check"></i></button>' +
          '</div>';
      });
      listEl.innerHTML = html;
    }

    window.v8MarkNotifRead = function(id) {
      markRead(id);
      var item = document.querySelector('[data-notif-id="' + id + '"]');
      if (item) {
        item.style.transition = 'all 0.3s ease';
        item.style.opacity = '0';
        item.style.maxHeight = '0';
        item.style.padding = '0';
        item.style.overflow = 'hidden';
        setTimeout(function() { item.remove(); renderNotifs(); }, 350);
      } else renderNotifs();
    };
    window.v6MarkRead = window.v8MarkNotifRead;
    window.v7MarkRead = window.v8MarkNotifRead;

    var markAllBtn = document.getElementById('markAllReadBtn');
    if (markAllBtn) {
      var newBtn = markAllBtn.cloneNode(true);
      markAllBtn.parentNode.replaceChild(newBtn, markAllBtn);
      newBtn.addEventListener('click', function() {
        gatherNotifs().forEach(function(n) { markRead(n.id); });
        renderNotifs();
        if (typeof window.showToast === 'function') window.showToast('تم تحديد جميع الإشعارات كمقروءة', 'info');
      });
    }

    var newBell = bell.cloneNode(true);
    bell.parentNode.replaceChild(newBell, bell);
    newBell.addEventListener('click', function(e) {
      e.preventDefault(); e.stopPropagation();
      if (panel.style.display === 'block') panel.style.display = 'none';
      else { panel.style.display = 'block'; renderNotifs(); }
    });

    document.addEventListener('click', function(e) {
      if (panel.style.display === 'block' && !panel.contains(e.target) && !newBell.contains(e.target)) {
        panel.style.display = 'none';
      }
    });

    var closeBtn = document.getElementById('closeNotificationPanel');
    if (closeBtn) {
      var newClose = closeBtn.cloneNode(true);
      closeBtn.parentNode.replaceChild(newClose, closeBtn);
      newClose.addEventListener('click', function() { panel.style.display = 'none'; });
    }

    renderNotifs();
    setInterval(renderNotifs, 30000);
  }

  // ========================================================================
  // FIX 12: Patch applyData لضمان التحويل
  // ========================================================================
  function patchApplyData() {
    var orig = window.applyData;
    if (typeof orig !== 'function' || orig._v8patched) return;
    window.applyData = function(data) {
      DATA_KEYS.forEach(function(key) {
        if (data[key] && !Array.isArray(data[key]) && typeof data[key] === 'object') {
          data[key] = Object.values(data[key]).filter(function(v) { return v != null; });
          console.log('🔧 V8: Converted ' + key + ' (' + data[key].length + ' items)');
        }
      });
      orig.call(this, data);
      syncAllData();
    };
    window.applyData._v8patched = true;
    window.applyData._v7patched = true;
    window.applyData._v6patched = true;
  }

  // ========================================================================
  // FIX 13: Patch loadDashboard
  // ========================================================================
  function patchLoadDashboard() {
    var orig = window.loadDashboard;
    if (typeof orig !== 'function' || orig._v8patched) return;
    window.loadDashboard = function() {
      syncAllData();
      orig.call(this);
      setTimeout(fixDashboardAlerts, 200);
    };
    window.loadDashboard._v8patched = true;
    window.loadDashboard._v7patched = true;
    window.loadDashboard._v6patched = true;
  }

  // ========================================================================
  // FIX 14: Navigation hooks
  // ========================================================================
  function fixNavigation() {
    document.querySelectorAll('[data-module]').forEach(function(link) {
      link.addEventListener('click', function() {
        var moduleId = this.getAttribute('data-module');
        setTimeout(function() {
          syncAllData();
          if (moduleId === 'employees') window.loadEmployees();
          else if (moduleId === 'clients') window.loadClients();
          else if (moduleId === 'contracts') window.loadContracts();
          else if (moduleId === 'hr') window.loadHR();
          else if (moduleId === 'invoices') window.loadInvoices();
          else if (moduleId === 'dashboard') { if (typeof window.loadDashboard === 'function') window.loadDashboard(); }
        }, 100);
      });
    });
  }

  // ========================================================================
  // FIX 15: مراقب مستمر للبيانات
  // ========================================================================
  function startDataWatcher() {
    setInterval(function() {
      syncAllData();
      // Check if any visible table is empty but data exists
      var checks = [
        {module: 'employees', tbody: 'employees-table-body', data: 'employees', render: window.renderEmployeesTable},
        {module: 'clients', tbody: 'clients-table-body', data: 'clients', render: window.renderClientsTable},
        {module: 'contracts', tbody: 'contracts-table-body', data: 'contracts', render: window.renderContractsTable}
      ];
      checks.forEach(function(c) {
        var container = document.getElementById(c.module);
        if (!container || container.style.display === 'none') return;
        var tbody = document.getElementById(c.tbody);
        if (!tbody) return;
        var data = ensureArray(window[c.data]);
        var rows = tbody.querySelectorAll('tr');
        var isEmpty = rows.length === 0 || (rows.length === 1 && rows[0].querySelector('td[colspan]'));
        if (isEmpty && data.length > 0 && typeof c.render === 'function') {
          console.log('🔧 V8 Watcher: Re-rendering ' + c.module + ' (' + data.length + ' items)');
          c.render();
        }
      });
    }, 2000);
  }

  // ========================================================================
  // STARTUP
  // ========================================================================
  // Phase 0: Immediate patches (before DOMContentLoaded)
  try { patchApplyData(); } catch(e) { console.warn('V8 patchApplyData:', e); }

  function startV8() {
    console.log('🔧 V8: Starting full override...');

    // Re-patch in case V6/V7 overwrote
    try { patchApplyData(); } catch(e) {}

    // Override all render and load functions
    try { overrideRenderEmployeesTable(); } catch(e) { console.error('V8:', e); }
    try { overrideRenderClientsTable(); } catch(e) { console.error('V8:', e); }
    try { overrideLoadContracts(); } catch(e) { console.error('V8:', e); }
    try { overrideLoadHR(); } catch(e) { console.error('V8:', e); }
    try { overrideLoadFunctions(); } catch(e) { console.error('V8:', e); }
    try { overrideUpdateAllUI(); } catch(e) { console.error('V8:', e); }
    try { overrideLoadInvoices(); } catch(e) { console.error('V8:', e); }
    try { patchLoadDashboard(); } catch(e) { console.error('V8:', e); }

    // Fix daily work edit
    try { fixDailyWorkEdit(); } catch(e) { console.error('V8:', e); }

    // Hook invoice auto-generation
    try { hookDailyWorkSave(); } catch(e) { console.error('V8:', e); }
    try { hookContractSave(); } catch(e) { console.error('V8:', e); }

    // Fix navigation
    try { fixNavigation(); } catch(e) { console.error('V8:', e); }

    // Start data watcher
    startDataWatcher();

    console.log('✅ V8: Phase 1 complete');

    // Phase 2: After all other bugfix files have run
    setTimeout(function() {
      console.log('🔧 V8: Phase 2 - Final overrides...');
      syncAllData();

      // Re-override in case V6/V7 overwrote our overrides
      try { overrideRenderEmployeesTable(); } catch(e) {}
      try { overrideRenderClientsTable(); } catch(e) {}
      try { overrideLoadContracts(); } catch(e) {}
      try { overrideLoadHR(); } catch(e) {}
      try { overrideLoadFunctions(); } catch(e) {}
      try { overrideUpdateAllUI(); } catch(e) {}
      try { overrideLoadInvoices(); } catch(e) {}

      // Force re-render active module
      var activeModule = document.querySelector('.module-container:not([style*="display: none"]):not([style*="display:none"])');
      if (activeModule) {
        var id = activeModule.id;
        if (id === 'employees') window.loadEmployees();
        else if (id === 'clients') window.loadClients();
        else if (id === 'contracts') window.loadContracts();
        else if (id === 'hr') window.loadHR();
        else if (id === 'invoices') window.loadInvoices();
        else if (id === 'dashboard') { if (typeof window.loadDashboard === 'function') window.loadDashboard(); }
      }

      // Notifications and dashboard alerts
      try { fixNotificationBell(); } catch(e) { console.error('V8 notif:', e); }
      try { fixDashboardAlerts(); } catch(e) { console.error('V8 alerts:', e); }

      console.log('✅ V8: Phase 2 complete');
    }, 5000);

    // Phase 3: Extra safety net
    setTimeout(function() {
      syncAllData();
      try { fixNotificationBell(); } catch(e) {}
      try { fixDashboardAlerts(); } catch(e) {}

      // Final check: re-render if tables are empty
      ['employees','clients','contracts'].forEach(function(mod) {
        var tbody = document.getElementById(mod + '-table-body');
        if (!tbody) return;
        var data = ensureArray(window[mod]);
        var rows = tbody.querySelectorAll('tr');
        var isEmpty = rows.length === 0 || (rows.length === 1 && rows[0].querySelector('td[colspan]'));
        if (isEmpty && data.length > 0) {
          if (mod === 'employees') window.renderEmployeesTable();
          else if (mod === 'clients') window.renderClientsTable();
          else if (mod === 'contracts') window.renderContractsTable();
        }
      });

      console.log('✅ V8: Phase 3 complete - All fixes applied');
    }, 10000);
  }

  if (document.readyState === 'complete') {
    startV8();
  } else {
    window.addEventListener('load', startV8);
  }

  console.log('✅ V8: Immediate patches applied');
})();
