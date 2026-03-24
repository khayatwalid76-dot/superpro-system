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
    '#contracts .table-responsive {',
    '  max-height: none !important;',
    '  overflow: auto !important;',
    '}',
    '.module-container {',
    '  overflow-y: auto !important;',
    '  overflow-x: hidden !important;',
    '}'
  ].join('\n');
  document.head.appendChild(scrollFixStyle);
  console.log('✅ V10: Scroll fix applied');

  // ========================================================================
  // FIX 2: إصلاح تكرار جداول التنبيهات في لوحة التحكم
  // المشكلة: v6 وv7 وv8 كلهم ينشئون صفوف تنبيهات منفصلة
  // الحل: إزالة صفوف v6 وv7 والإبقاء فقط على v8
  // ========================================================================
  function cleanDuplicateAlerts() {
    // إزالة صفوف v6 وv7 (نبقي فقط v8)
    ['v6-dashboard-alerts-row', 'v7-dashboard-alerts-row'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) {
        el.remove();
        console.log('🔧 V10: Removed duplicate alert row: ' + id);
      }
    });
  }

  // تشغيل التنظيف بشكل دوري لأن v6 وv7 يعيدون الإنشاء في phases مختلفة
  var alertCleanupInterval = setInterval(cleanDuplicateAlerts, 500);
  // وقف المراقبة بعد 20 ثانية (بعد انتهاء جميع phases)
  setTimeout(function() {
    clearInterval(alertCleanupInterval);
    // تنظيف نهائي
    cleanDuplicateAlerts();
    console.log('✅ V10: Alert cleanup monitoring stopped');
  }, 20000);

  // أيضاً: نعترض دوال v6 وv7 لمنعها من إنشاء صفوف جديدة
  // نعمل patch على loadDashboard ليقوم بالتنظيف بعد كل استدعاء
  function patchLoadDashboardV10() {
    var orig = window.loadDashboard;
    if (typeof orig !== 'function' || orig._v10patched) return;
    window.loadDashboard = function() {
      orig.call(this);
      // تنظيف بعد 150ms (قبل v8 الذي يعمل عند 200ms)
      setTimeout(function() {
        ['v6-dashboard-alerts-row', 'v7-dashboard-alerts-row'].forEach(function(id) {
          var el = document.getElementById(id);
          if (el) el.remove();
        });
      }, 150);
      // تنظيف بعد 300ms (بعد v8)
      setTimeout(function() {
        ['v6-dashboard-alerts-row', 'v7-dashboard-alerts-row'].forEach(function(id) {
          var el = document.getElementById(id);
          if (el) el.remove();
        });
      }, 300);
    };
    window.loadDashboard._v10patched = true;
    // الحفاظ على flags القديمة
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

    var origOnclick = saveBtn.onclick;
    saveBtn.onclick = null;
    saveBtn._v10patched = true;

    saveBtn.addEventListener('click', function() {
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
        idNumber: document.getElementById('employeeIdNumber').value,
        hireDate: document.getElementById('employeeHireDate').value,
        nationality: nationality,
        job: job,
        salary: parseFloat(salary),
        housingAllowance: parseFloat(document.getElementById('employeeHousingAllowance')?.value) || 0,
        transportAllowance: parseFloat(document.getElementById('employeeTransportAllowance')?.value) || 0,
        foodAllowance: parseFloat(document.getElementById('employeeFoodAllowance')?.value) || 0,
        otherAllowance: parseFloat(document.getElementById('employeeOtherAllowance')?.value) || 0,
        phone: document.getElementById('employeePhone').value,
        status: document.getElementById('employeeStatus').value,
        residencyExpiry: document.getElementById('employeeResidencyExpiry').value,
        gender: document.getElementById('employeeGender').value
      };
      // حساب إجمالي الراتب
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
      document.getElementById('employeeForm').reset();
      document.querySelector('#employeeModal .modal-title').textContent = 'إضافة موظف جديد';
      saveBtn.textContent = 'حفظ الموظف';
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
      // بعد فتح النافذة، نملأ حقول البدلات
      setTimeout(function() {
        var emp = window.employees[index];
        if (!emp) return;
        var housingField = document.getElementById('employeeHousingAllowance');
        var transportField = document.getElementById('employeeTransportAllowance');
        var foodField = document.getElementById('employeeFoodAllowance');
        var otherField = document.getElementById('employeeOtherAllowance');
        if (housingField) housingField.value = emp.housingAllowance || '';
        if (transportField) transportField.value = emp.transportAllowance || '';
        if (foodField) foodField.value = emp.foodAllowance || '';
        if (otherField) otherField.value = emp.otherAllowance || '';
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
      // بعد الرسم، نضيف معلومات البدلات لكل صف
      var tbody = document.getElementById('employees-table-body');
      if (!tbody) return;
      var rows = tbody.querySelectorAll('tr.employee-card');
      var employees = window.employees || [];
      rows.forEach(function(row, index) {
        if (index >= employees.length) return;
        var emp = employees[index];
        var salaryCell = row.querySelector('td:nth-child(4)');
        if (!salaryCell) return;

        var housing = parseFloat(emp.housingAllowance) || 0;
        var transport = parseFloat(emp.transportAllowance) || 0;
        var food = parseFloat(emp.foodAllowance) || 0;
        var other = parseFloat(emp.otherAllowance) || 0;
        var totalAllowances = housing + transport + food + other;
        var baseSalary = parseFloat(emp.salary) || 0;
        var totalSalary = baseSalary + totalAllowances;

        var html = '<div class="employee-info-item"><strong>الراتب الأساسي: </strong><span class="text-success">' + baseSalary.toLocaleString() + ' ر.ق</span></div>';
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

  // تعديل حساب كشف الرواتب لاستخدام البدلات من بيانات الموظف
  function patchPayrollCalculation() {
    var origCalc = window.calculatePayroll;
    if (typeof origCalc !== 'function' || origCalc._v10patched) return;

    window.calculatePayroll = function(month) {
      var rows = origCalc.call(this, month);
      if (!Array.isArray(rows)) return rows;

      // تحديث كل صف بالبدلات الفعلية من بيانات الموظف
      rows.forEach(function(row) {
        var emp = (window.employees || []).find(function(e) { return e && e.name === row.employee; });
        if (emp) {
          var housing = parseFloat(emp.housingAllowance) || 0;
          var transport = parseFloat(emp.transportAllowance) || 0;
          var food = parseFloat(emp.foodAllowance) || 0;
          var other = parseFloat(emp.otherAllowance) || 0;
          row.allowances = housing + transport + food + other;
          // إعادة حساب صافي الراتب
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

    // Fix dashboard alerts duplication
    try { patchLoadDashboardV10(); } catch(e) { console.error('V10:', e); }
    try { cleanDuplicateAlerts(); } catch(e) {}

    // Fix employee save/edit with allowances
    try { patchSaveEmployee(); } catch(e) { console.error('V10 save:', e); }
    try { patchEditEmployee(); } catch(e) { console.error('V10 edit:', e); }
    try { patchRenderEmployeesTable(); } catch(e) { console.error('V10 render:', e); }
    try { patchPayrollCalculation(); } catch(e) { console.error('V10 payroll:', e); }
    try { bindAllowanceEvents(); } catch(e) { console.error('V10 events:', e); }

    console.log('✅ V10: Phase 1 complete');

    // Phase 2: بعد تحميل جميع ملفات bugfix الأخرى
    setTimeout(function() {
      console.log('🔧 V10: Phase 2...');
      try { patchLoadDashboardV10(); } catch(e) {}
      try { cleanDuplicateAlerts(); } catch(e) {}
      try { patchSaveEmployee(); } catch(e) {}
      try { patchEditEmployee(); } catch(e) {}
      try { patchRenderEmployeesTable(); } catch(e) {}
      try { patchPayrollCalculation(); } catch(e) {}
      try { bindAllowanceEvents(); } catch(e) {}

      // إعادة رسم جدول الموظفين إذا كان ظاهراً
      var empModule = document.getElementById('employees');
      if (empModule && empModule.style.display !== 'none') {
        if (typeof window.renderEmployeesTable === 'function') window.renderEmployeesTable();
      }

      console.log('✅ V10: Phase 2 complete');
    }, 6000);

    // Phase 3: تأكيد نهائي
    setTimeout(function() {
      try { cleanDuplicateAlerts(); } catch(e) {}
      try { patchSaveEmployee(); } catch(e) {}
      try { patchEditEmployee(); } catch(e) {}
      try { patchRenderEmployeesTable(); } catch(e) {}
      try { patchPayrollCalculation(); } catch(e) {}
      try { bindAllowanceEvents(); } catch(e) {}
      console.log('✅ V10: Phase 3 complete - All V10 fixes applied');
    }, 12000);
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
          // إعادة تعيين حقول البدلات عند الإضافة الجديدة
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
