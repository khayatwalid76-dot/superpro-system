// ============================================================================
// BUGFIX V10.0 - إصلاحات شاملة
// 1. إصلاح التمرير في جداول الموظفين (overflow: hidden → auto)
// 2. إصلاح تكرار جداول التنبيهات في لوحة التحكم
// 3. إضافة حقول بدلات الراتب + ربطها بالحفظ والتعديل وكشف الرواتب
// ============================================================================
(function() {
  'use strict';
  console.log('🔧 BugFix V10.0: بدلات الراتب + إصلاح التمرير + إصلاح التنبيهات...');

  // ========================================================================
  // FIX 1: إصلاح التمرير في الجداول
  // design-enhancements.css يضع overflow: hidden على .table-responsive
  // نحتاج override بـ !important
  // ========================================================================
  var scrollFixStyle = document.createElement('style');
  scrollFixStyle.id = 'v10-scroll-fix';
  scrollFixStyle.textContent = [
    '.table-responsive, .table-container {',
    '  overflow-y: auto !important;',
    '  overflow-x: auto !important;',
    '}',
    '#employees .table-responsive,',
    '#clients .table-responsive,',
    '#contracts .table-responsive,',
    '#dailyWork .table-responsive,',
    '#hr .table-responsive {',
    '  max-height: none !important;',
    '  overflow: auto !important;',
    '}',
    '.module-container {',
    '  overflow-y: auto !important;',
    '  overflow-x: hidden !important;',
    '}',
    '.card-body .table-responsive {',
    '  max-height: none !important;',
    '  overflow: auto !important;',
    '}'
  ].join('\n');
  document.head.appendChild(scrollFixStyle);
  console.log('✅ V10: Scroll fix applied');

  // ========================================================================
  // FIX 2: إصلاح تكرار جداول التنبيهات في لوحة التحكم
  // المشكلة: v6 وv7 وv8 كلهم ينشئون صفوف تنبيهات في أوقات مختلفة
  // v6 ينشئ v6-dashboard-alerts-row (لا يحذف v8)
  // v7 ينشئ v7-dashboard-alerts-row (لا يحذف v8)
  // v8 ينشئ v8-dashboard-alerts-row (يحذف v6 وv7)
  // لكن v6 وv7 يعيدون الإنشاء في phases لاحقة بعد v8
  // الحل: MutationObserver + override renderSeparatedAlerts + تنظيف دوري
  // ========================================================================

  // 1. جعل renderSeparatedAlerts لا تفعل شيئاً (v8 يتولى المهمة)
  function neutralizeRenderSeparatedAlerts() {
    if (typeof window.renderSeparatedAlerts === 'function' && !window.renderSeparatedAlerts._v10neutralized) {
      var orig = window.renderSeparatedAlerts;
      window.renderSeparatedAlerts = function() {
        // لا نفعل شيئاً - v8 يتولى عرض التنبيهات
        console.log('V10: renderSeparatedAlerts neutralized');
      };
      window.renderSeparatedAlerts._v10neutralized = true;
    }
  }

  // 2. تنظيف الصفوف المكررة
  function cleanDuplicateAlerts() {
    // إزالة صفوف v6 وv7 دائماً
    ['v6-dashboard-alerts-row', 'v7-dashboard-alerts-row'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) {
        el.remove();
        console.log('V10: Removed ' + id);
      }
    });

    // التأكد من وجود صف v8 واحد فقط
    var v8Rows = document.querySelectorAll('#v8-dashboard-alerts-row');
    if (v8Rows.length > 1) {
      for (var i = 1; i < v8Rows.length; i++) {
        v8Rows[i].remove();
        console.log('V10: Removed duplicate v8 row');
      }
    }

    // إخفاء بطاقة التنبيهات القديمة التي تقول "تم النقل"
    var recentAlerts = document.getElementById('recentAlerts');
    if (recentAlerts) {
      var cardParent = recentAlerts.closest('.card');
      if (cardParent && recentAlerts.textContent.indexOf('تم نقل التنبيهات') !== -1) {
        cardParent.style.display = 'none';
      }
    }
  }

  // 3. MutationObserver لمراقبة إضافة صفوف جديدة
  function setupAlertObserver() {
    var dashboard = document.getElementById('dashboard');
    if (!dashboard) return;

    var observer = new MutationObserver(function(mutations) {
      var needsCleanup = false;
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) {
            var id = node.id || '';
            if (id === 'v6-dashboard-alerts-row' || id === 'v7-dashboard-alerts-row') {
              needsCleanup = true;
            }
          }
        });
      });
      if (needsCleanup) {
        setTimeout(cleanDuplicateAlerts, 10);
      }
    });

    observer.observe(dashboard, { childList: true, subtree: true });
    console.log('✅ V10: Alert MutationObserver active');
  }

  // 4. Patch loadDashboard لتنظيف بعد كل استدعاء
  function patchLoadDashboardV10() {
    var orig = window.loadDashboard;
    if (typeof orig !== 'function' || orig._v10patched) return;
    window.loadDashboard = function() {
      orig.call(this);
      // تنظيف متعدد المراحل بعد كل استدعاء
      [50, 150, 250, 400, 600, 1000].forEach(function(delay) {
        setTimeout(cleanDuplicateAlerts, delay);
      });
    };
    window.loadDashboard._v10patched = true;
    window.loadDashboard._v8patched = true;
    window.loadDashboard._v7patched = true;
    window.loadDashboard._v6patched = true;
  }

  // ========================================================================
  // FIX 3: حقول بدلات الراتب - تعديل حفظ وتعديل وعرض الموظفين
  // ========================================================================

  // حساب إجمالي الراتب وتحديث الحقل
  function updateTotalSalary() {
    var basic = parseFloat(document.getElementById('employeeSalary')?.value) || 0;
    var housing = parseFloat(document.getElementById('employeeHousingAllowance')?.value) || 0;
    var transport = parseFloat(document.getElementById('employeeTransportAllowance')?.value) || 0;
    var food = parseFloat(document.getElementById('employeeFoodAllowance')?.value) || 0;
    var other = parseFloat(document.getElementById('employeeOtherAllowance')?.value) || 0;
    var total = basic + housing + transport + food + other;
    var totalField = document.getElementById('employeeTotalSalary');
    if (totalField) totalField.value = total;
    return total;
  }

  // ربط أحداث تحديث الإجمالي
  function bindAllowanceEvents() {
    var fields = ['employeeSalary', 'employeeHousingAllowance', 'employeeTransportAllowance', 'employeeFoodAllowance', 'employeeOtherAllowance'];
    fields.forEach(function(id) {
      var el = document.getElementById(id);
      if (el && !el._v10bound) {
        el._v10bound = true;
        el.addEventListener('input', updateTotalSalary);
      }
    });
  }

  // تعديل دالة الحفظ لتشمل البدلات
  function patchSaveEmployee() {
    var saveBtn = document.getElementById('saveEmployeeBtn');
    if (!saveBtn || saveBtn._v10patched) return;

    // إزالة جميع الأحداث القديمة
    var newBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newBtn, saveBtn);
    newBtn._v10patched = true;

    newBtn.addEventListener('click', function() {
      var name = document.getElementById('employeeName').value;
      var nationality = document.getElementById('employeeNationality').value;
      var job = document.getElementById('employeeJob').value;
      var salary = document.getElementById('employeeSalary').value;

      if (!name || !nationality || !job || !salary) {
        if (typeof window.showToast === 'function') window.showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
      }

      var empData = {
        name: name,
        idNumber: document.getElementById('employeeIdNumber')?.value || '',
        hireDate: document.getElementById('employeeHireDate')?.value || '',
        nationality: nationality,
        job: job,
        salary: parseFloat(salary),
        housingAllowance: parseFloat(document.getElementById('employeeHousingAllowance')?.value) || 0,
        transportAllowance: parseFloat(document.getElementById('employeeTransportAllowance')?.value) || 0,
        foodAllowance: parseFloat(document.getElementById('employeeFoodAllowance')?.value) || 0,
        otherAllowance: parseFloat(document.getElementById('employeeOtherAllowance')?.value) || 0,
        phone: document.getElementById('employeePhone')?.value || '',
        status: document.getElementById('employeeStatus')?.value || 'نشط',
        residencyExpiry: document.getElementById('employeeResidencyExpiry')?.value || '',
        gender: document.getElementById('employeeGender')?.value || ''
      };
      empData.totalSalary = empData.salary + empData.housingAllowance + empData.transportAllowance + empData.foodAllowance + empData.otherAllowance;

      if (window.editState && window.editState.employee && window.editState.employee.isEditMode && window.editState.employee.editIndex >= 0) {
        window.employees[window.editState.employee.editIndex] = Object.assign(
          {}, window.employees[window.editState.employee.editIndex], empData,
          { updatedAt: new Date().toISOString() }
        );
        if (typeof window.showToast === 'function') window.showToast('تم تحديث بيانات الموظف بنجاح');
      } else {
        empData.joinDate = new Date().toISOString().split('T')[0];
        window.employees.push(empData);
        if (typeof window.showToast === 'function') window.showToast('تم إضافة الموظف بنجاح');
      }

      if (typeof window.saveData === 'function') window.saveData();

      var employeeModal = document.getElementById('employeeModal');
      try { bootstrap.Modal.getInstance(employeeModal)?.hide(); } catch(e) {}
      try { document.getElementById('employeeForm').reset(); } catch(e) {}
      try {
        document.querySelector('#employeeModal .modal-title').textContent = 'إضافة موظف جديد';
        document.getElementById('saveEmployeeBtn').textContent = 'حفظ الموظف';
      } catch(e) {}
      if (window.editState && window.editState.employee) {
        window.editState.employee.isEditMode = false;
        window.editState.employee.editIndex = -1;
      }
      if (typeof window.updateEmployeeStats === 'function') window.updateEmployeeStats();
      if (typeof window.renderEmployeesTable === 'function') window.renderEmployeesTable();
      if (typeof window.logActivity === 'function') window.logActivity('إدارة الموظفين', name);
    });
  }

  // تعديل دالة التعديل لملء حقول البدلات
  function patchEditEmployee() {
    var origEdit = window.editEmployee;
    if (typeof origEdit !== 'function' || origEdit._v10patched) return;

    window.editEmployee = function(index) {
      origEdit.call(this, index);
      setTimeout(function() {
        var emp = window.employees[index];
        if (!emp) return;
        var fields = {
          'employeeHousingAllowance': emp.housingAllowance,
          'employeeTransportAllowance': emp.transportAllowance,
          'employeeFoodAllowance': emp.foodAllowance,
          'employeeOtherAllowance': emp.otherAllowance
        };
        Object.keys(fields).forEach(function(id) {
          var el = document.getElementById(id);
          if (el) el.value = fields[id] || '';
        });
        updateTotalSalary();
      }, 100);
    };
    window.editEmployee._v10patched = true;
  }

  // تعديل جدول عرض الموظفين لإظهار البدلات
  function patchRenderEmployeesTable() {
    var origRender = window.renderEmployeesTable;
    if (typeof origRender !== 'function' || origRender._v10patched) return;

    window.renderEmployeesTable = function() {
      origRender.call(this);
      var tbody = document.getElementById('employees-table-body');
      if (!tbody) return;
      var rows = tbody.querySelectorAll('tr.employee-card');
      var emps = window.employees || [];
      rows.forEach(function(row, index) {
        if (index >= emps.length) return;
        var emp = emps[index];
        var salaryCell = row.querySelector('td:nth-child(4)');
        if (!salaryCell) return;

        var housing = parseFloat(emp.housingAllowance) || 0;
        var transport = parseFloat(emp.transportAllowance) || 0;
        var food = parseFloat(emp.foodAllowance) || 0;
        var other = parseFloat(emp.otherAllowance) || 0;
        var totalAllowances = housing + transport + food + other;
        var baseSalary = parseFloat(emp.salary) || 0;
        var totalSalary = baseSalary + totalAllowances;

        var html = '<div class="employee-info-item"><strong>الأساسي: </strong><span class="text-success">' + baseSalary.toLocaleString() + ' ر.ق</span></div>';
        if (totalAllowances > 0) {
          html += '<div class="employee-info-item" style="font-size:0.85em; color:#666;">';
          var parts = [];
          if (housing > 0) parts.push('سكن: ' + housing.toLocaleString());
          if (transport > 0) parts.push('مواصلات: ' + transport.toLocaleString());
          if (food > 0) parts.push('طعام: ' + food.toLocaleString());
          if (other > 0) parts.push('أخرى: ' + other.toLocaleString());
          html += '<i class="fas fa-coins me-1"></i>' + parts.join(' | ');
          html += '</div>';
          html += '<div class="employee-info-item"><strong>الإجمالي: </strong><span class="text-primary fw-bold">' + totalSalary.toLocaleString() + ' ر.ق</span></div>';
        }
        salaryCell.innerHTML = html;
      });
    };
    window.renderEmployeesTable._v10patched = true;
  }

  // تعديل حساب كشف الرواتب لاستخدام البدلات
  function patchPayrollCalculation() {
    var origCalc = window.calculatePayroll;
    if (typeof origCalc !== 'function' || origCalc._v10patched) return;

    window.calculatePayroll = function(month) {
      var rows = origCalc.call(this, month);
      if (!Array.isArray(rows)) return rows;

      rows.forEach(function(row) {
        var emp = (window.employees || []).find(function(e) { return e && e.name === row.employee; });
        if (emp) {
          var housing = parseFloat(emp.housingAllowance) || 0;
          var transport = parseFloat(emp.transportAllowance) || 0;
          var food = parseFloat(emp.foodAllowance) || 0;
          var other = parseFloat(emp.otherAllowance) || 0;
          row.allowances = housing + transport + food + other;
          row.net = Math.max(0, Math.round(row.baseSalary + row.overtimeAllowance + row.allowances - row.deductions - row.advances));
        }
      });

      return rows;
    };
    window.calculatePayroll._v10patched = true;
  }

  // ========================================================================
  // STARTUP
  // ========================================================================
  function startV10() {
    console.log('🔧 V10: Starting...');

    // Dashboard alerts fix
    try { neutralizeRenderSeparatedAlerts(); } catch(e) { console.error('V10:', e); }
    try { patchLoadDashboardV10(); } catch(e) { console.error('V10:', e); }
    try { setupAlertObserver(); } catch(e) { console.error('V10:', e); }
    try { cleanDuplicateAlerts(); } catch(e) {}

    // Employee allowances
    try { patchSaveEmployee(); } catch(e) { console.error('V10 save:', e); }
    try { patchEditEmployee(); } catch(e) { console.error('V10 edit:', e); }
    try { patchRenderEmployeesTable(); } catch(e) { console.error('V10 render:', e); }
    try { patchPayrollCalculation(); } catch(e) { console.error('V10 payroll:', e); }
    try { bindAllowanceEvents(); } catch(e) { console.error('V10 events:', e); }

    console.log('✅ V10: Phase 1 complete');

    // Phase 2: بعد تحميل جميع ملفات bugfix الأخرى
    setTimeout(function() {
      console.log('🔧 V10: Phase 2...');
      try { neutralizeRenderSeparatedAlerts(); } catch(e) {}
      try { patchLoadDashboardV10(); } catch(e) {}
      try { cleanDuplicateAlerts(); } catch(e) {}
      try { patchSaveEmployee(); } catch(e) {}
      try { patchEditEmployee(); } catch(e) {}
      try { patchRenderEmployeesTable(); } catch(e) {}
      try { patchPayrollCalculation(); } catch(e) {}
      try { bindAllowanceEvents(); } catch(e) {}

      var empModule = document.getElementById('employees');
      if (empModule && empModule.style.display !== 'none') {
        if (typeof window.renderEmployeesTable === 'function') window.renderEmployeesTable();
      }

      console.log('✅ V10: Phase 2 complete');
    }, 6000);

    // Phase 3: تأكيد نهائي بعد انتهاء جميع phases من v6/v7/v8
    setTimeout(function() {
      try { neutralizeRenderSeparatedAlerts(); } catch(e) {}
      try { cleanDuplicateAlerts(); } catch(e) {}
      try { patchSaveEmployee(); } catch(e) {}
      try { patchEditEmployee(); } catch(e) {}
      try { patchRenderEmployeesTable(); } catch(e) {}
      try { patchPayrollCalculation(); } catch(e) {}
      try { bindAllowanceEvents(); } catch(e) {}
      console.log('✅ V10: Phase 3 complete - All V10 fixes applied');
    }, 12000);

    // Continuous cleanup every 500ms for 30 seconds
    var cleanupCount = 0;
    var cleanupInterval = setInterval(function() {
      cleanDuplicateAlerts();
      cleanupCount++;
      if (cleanupCount >= 60) {
        clearInterval(cleanupInterval);
        console.log('✅ V10: Cleanup monitoring complete');
      }
    }, 500);
  }

  if (document.readyState === 'complete') {
    startV10();
  } else {
    window.addEventListener('load', startV10);
  }

  // ربط الأحداث عند فتح نافذة الموظف
  var employeeModal = document.getElementById('employeeModal');
  if (employeeModal) {
    employeeModal.addEventListener('show.bs.modal', function() {
      setTimeout(function() {
        bindAllowanceEvents();
        if (!window.editState?.employee?.isEditMode) {
          ['employeeHousingAllowance','employeeTransportAllowance','employeeFoodAllowance','employeeOtherAllowance','employeeTotalSalary'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.value = '';
          });
        }
        updateTotalSalary();
      }, 50);
    });
  }

  console.log('✅ V10: Module loaded');
})();
