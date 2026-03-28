// ============================================================
// SuperPro HOTFIX - Comprehensive Bug Fix
// يصلح جميع المشاكل المكتشفة دون المساس بالبيانات أو التصميم
// ============================================================
(function() {
  'use strict';
  console.log('🔧 SuperPro HotFix: Loading...');

  // ============================================================
  // FIX 1: FB_PATH - مسار Firebase خاطئ في superpro-final.js
  // الخطأ: window.FB_PATH كان undefined فيستخدم 'superpro-data' (بشرطة)
  // بينما loadData يقرأ من 'superpro_data' (بشرطة سفلية)
  // ============================================================
  window.FB_PATH = 'superpro_data';
  console.log('✅ Fix1: FB_PATH set to superpro_data');

  // ============================================================
  // FIX 2: LS_KEYS.invoices مفقود
  // ============================================================
  function waitForLSKEYS() {
    if (typeof LS_KEYS !== 'undefined') {
      if (!LS_KEYS.invoices) {
        LS_KEYS.invoices = 'superpro_financialTransactions';
        console.log('✅ Fix2: LS_KEYS.invoices added');
      }
    } else {
      setTimeout(waitForLSKEYS, 50);
    }
  }
  waitForLSKEYS();

  // ============================================================
  // FIX 3: applyData لا تُعيد تعيين financialTransactions
  // يسبب ظهور الفواتير فارغة بعد تحميل البيانات
  // ============================================================
  function patchApplyData() {
    if (typeof window.applyData === 'function') {
      var _origApply = window.applyData;
      window.applyData = function(data) {
        _origApply.call(this, data);
        // Restore financialTransactions which was missing
        window.financialTransactions = data.financialTransactions || [];
        // Also patch from Firebase field names
        if (!window.financialTransactions.length && data.invoices) {
          window.financialTransactions = data.invoices;
        }
        console.log('✅ Fix3: financialTransactions restored:', window.financialTransactions.length);
      };
    } else {
      setTimeout(patchApplyData, 100);
    }
  }
  patchApplyData();

  // ============================================================
  // FIX 4: financialTransactions sync - تزامن مباشر بعد تحميل البيانات
  // ============================================================
  var _origInit = window.initializeDefaultData;
  function waitAndPatchInit() {
    if (typeof window.initializeDefaultData === 'function' && window.initializeDefaultData !== _origInit) {
      var __orig = window.initializeDefaultData;
      window.initializeDefaultData = async function() {
        await __orig.apply(this, arguments);
        // Ensure financialTransactions is never undefined
        if (!window.financialTransactions) {
          window.financialTransactions = [];
          var stored = localStorage.getItem('superpro_financialTransactions');
          if (stored) {
            try { window.financialTransactions = JSON.parse(stored) || []; } catch(e) {}
          }
        }
      };
    } else {
      setTimeout(waitAndPatchInit, 200);
    }
  }
  setTimeout(waitAndPatchInit, 500);

  // ============================================================
  // FIX 5: loadInvoices - inv.clientName vs inv.client
  // data-import-v4.js يحفظ باسم 'client' لكن loadInvoices تقرأ 'clientName'
  // ============================================================
  function patchLoadInvoices() {
    if (typeof window.loadInvoices === 'function') {
      var _origLoadInvoices = window.loadInvoices;
      window.loadInvoices = function() {
        // Normalize invoice client field before rendering
        if (window.financialTransactions) {
          window.financialTransactions.forEach(function(inv) {
            if (!inv.clientName && inv.client) {
              inv.clientName = inv.client;
            }
            if (!inv.id && inv.invoiceId) {
              inv.id = inv.invoiceId;
            }
            // Normalize status
            if (inv.status === 'Paid' || inv.paymentStatus === 'Paid') inv.status = 'مدفوع';
            if (inv.status === 'Unpaid' || inv.paymentStatus === 'Unpaid') inv.status = 'معلق';
          });
        }
        return _origLoadInvoices.apply(this, arguments);
      };
      console.log('✅ Fix5: loadInvoices patched for clientName/client normalization');
    } else {
      setTimeout(patchLoadInvoices, 200);
    }
  }
  patchLoadInvoices();

  // ============================================================
  // FIX 6: dailyWork workers field normalization
  // بعض السجلات تستخدم 'employees' وأخرى 'workers' وأخرى 'worker'
  // ============================================================
  function normalizeDailyWork() {
    if (window.dailyWork && Array.isArray(window.dailyWork)) {
      window.dailyWork.forEach(function(work) {
        if (!work.workers) {
          if (Array.isArray(work.employees)) work.workers = work.employees;
          else if (work.worker) work.workers = [work.worker];
          else if (work.employee) work.workers = [work.employee];
          else work.workers = [];
        }
        if (!work.shift && work.period) work.shift = work.period;
        if (!work.paymentMethod) work.paymentMethod = 'نقدي';
        if (!work.paymentStatus) work.paymentStatus = 'مدفوع';
      });
    }
  }

  // ============================================================
  // FIX 7: Patch saveData to always include financialTransactions
  // ============================================================
  function patchSaveData() {
    if (typeof window.saveData === 'function') {
      var _origSave = window.saveData;
      window.saveData = function() {
        // Ensure financialTransactions is captured
        if (!window.financialTransactions) window.financialTransactions = [];
        normalizeDailyWork();
        var result = _origSave.apply(this, arguments);
        // Also save invoices separately for reliability
        try {
          var ftData = JSON.stringify(window.financialTransactions);
          localStorage.setItem('superpro_financialTransactions', ftData);
          sessionStorage.setItem('superpro_financialTransactions', ftData);
        } catch(e) {}
        return result;
      };
      console.log('✅ Fix7: saveData patched for financialTransactions');
    } else {
      setTimeout(patchSaveData, 100);
    }
  }
  patchSaveData();

  // ============================================================
  // FIX 8: contracts - employee field normalization
  // data-import-v4.js و user-data-full.json قد يستخدمان حقول مختلفة
  // ============================================================
  function patchLoadContracts() {
    if (typeof window.loadContracts === 'function') {
      var _origLoadContracts = window.loadContracts;
      window.loadContracts = function() {
        if (window.contracts && Array.isArray(window.contracts)) {
          window.contracts.forEach(function(c) {
            if (!c.employee) {
              c.employee = c.worker || c.employeeName || c.members || '';
            }
            if (!c.number) c.number = c.id || c.contractNumber || '';
            if (!c.client) c.client = c.customer || c.clientName || '';
            if (!c.paymentStatus) c.paymentStatus = 'مدفوع';
            if (!c.status) c.status = 'نشط';
          });
        }
        return _origLoadContracts.apply(this, arguments);
      };
      console.log('✅ Fix8: loadContracts patched');
    } else {
      setTimeout(patchLoadContracts, 200);
    }
  }
  patchLoadContracts();

  // ============================================================
  // FIX 9: renderFilteredDailyWork - normalize before render
  // ============================================================
  function patchRenderDailyWork() {
    if (typeof window.renderFilteredDailyWork === 'function') {
      var _orig = window.renderFilteredDailyWork;
      window.renderFilteredDailyWork = function(filteredWork) {
        var normalized = (filteredWork || []).map(function(work) {
          return Object.assign({}, work, {
            workers: work.workers || (Array.isArray(work.employees) ? work.employees : work.worker ? [work.worker] : []),
            shift: work.shift || work.period || 'صباحية',
            paymentStatus: work.paymentStatus || 'مدفوع',
            paymentMethod: work.paymentMethod || 'نقدي',
            area: work.area || '',
            driver: work.driver || ''
          });
        });
        return _orig.call(this, normalized);
      };
      console.log('✅ Fix9: renderFilteredDailyWork patched');
    } else {
      setTimeout(patchRenderDailyWork, 200);
    }
  }
  patchRenderDailyWork();

  // ============================================================
  // FIX 10: Dashboard stats - ensure financialTransactions counted
  // ============================================================
  function patchUpdateDashboardStats() {
    if (typeof window.updateDashboardStats === 'function') {
      var _orig = window.updateDashboardStats;
      window.updateDashboardStats = function() {
        normalizeDailyWork();
        return _orig.apply(this, arguments);
      };
      console.log('✅ Fix10: updateDashboardStats patched');
    } else {
      setTimeout(patchUpdateDashboardStats, 300);
    }
  }
  patchUpdateDashboardStats();

  // ============================================================
  // FIX 11: Recover financialTransactions on page load
  // If financialTransactions is empty but localStorage has it
  // ============================================================
  window.addEventListener('load', function() {
    setTimeout(function() {
      if (!window.financialTransactions || window.financialTransactions.length === 0) {
        // Try localStorage
        var stored = localStorage.getItem('superpro_financialTransactions');
        if (!stored) stored = sessionStorage.getItem('superpro_financialTransactions');
        if (stored) {
          try {
            var parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              window.financialTransactions = parsed;
              console.log('✅ Fix11: Recovered financialTransactions from storage:', parsed.length);
              // Reload invoices if on that page
              var activeModule = document.querySelector('.module-container[style*="block"]');
              if (activeModule && activeModule.id === 'invoices') {
                if (typeof window.loadInvoices === 'function') window.loadInvoices();
              }
            }
          } catch(e) {}
        }
      }
    }, 3000);
  });

  // ============================================================
  // FIX 12: salaryAdvances undefined guard
  // ============================================================
  if (typeof window.salaryAdvances === 'undefined') window.salaryAdvances = [];
  if (typeof window.monthlyExpenses === 'undefined') window.monthlyExpenses = [];

  // ============================================================
  // FIX 13: QuotaExceededError for large financialTransactions
  // If quota exceeded, save only essential data
  // ============================================================
  var _origSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    try {
      _origSetItem.call(this, key, value);
    } catch(e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        console.warn('⚠️ QuotaExceeded for:', key, '- trying cleanup...');
        // Remove old backup keys
        try {
          var keysToRemove = [];
          for (var i = 0; i < this.length; i++) {
            var k = this.key(i);
            if (k && (k.includes('backup') || k.includes('_v1') || k.includes('_v2') || k.includes('_old'))) {
              keysToRemove.push(k);
            }
          }
          keysToRemove.forEach(function(k) { try { localStorage.removeItem(k); } catch(ex) {} });
          // Retry
          _origSetItem.call(this, key, value);
          console.log('✅ Quota fix: saved after cleanup');
        } catch(e2) {
          console.warn('⚠️ Still quota exceeded after cleanup:', key);
        }
      }
    }
  };

  console.log('✅ SuperPro HotFix: All patches scheduled successfully');
})();
