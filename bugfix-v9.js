// ============================================================================
// BUGFIX V9.0 - إصلاح مشكلة عدم ظهور جميع البيانات
// ============================================================================
// المشكلة: Firebase يحتوي على بيانات قديمة/ناقصة، والنظام يثق بـ Firebase أولاً
//          مما يتجاهل البيانات الأحدث في localStorage و user-data-full.json
// الحل: مقارنة جميع مصادر البيانات واستخدام الأكمل منها لكل نوع
// ============================================================================
(function() {
  'use strict';
  console.log('🔧 BugFix V9.0: إصلاح تحميل البيانات الشامل...');

  var FB_PATH = 'superpro_data';
  var DATA_KEYS = ['employees','clients','contracts','dailyWork','dailyIncome','dailyExpenses',
    'attendance','services','tasks','events','monthlyExpenses',
    'financialTransactions','salaryAdvances'];

  function ensureArray(val) {
    if (Array.isArray(val)) return val.filter(function(v) { return v != null; });
    if (val && typeof val === 'object') {
      return Object.values(val).filter(function(v) { return v != null; });
    }
    return [];
  }

  function countItems(data) {
    if (!data || typeof data !== 'object') return 0;
    var total = 0;
    DATA_KEYS.forEach(function(key) {
      total += ensureArray(data[key]).length;
    });
    return total;
  }

  function normalizeData(data) {
    if (!data || typeof data !== 'object') return null;
    var normalized = {};
    DATA_KEYS.forEach(function(key) {
      normalized[key] = ensureArray(data[key]);
    });
    if (data.settings) normalized.settings = data.settings;
    return normalized;
  }

  // Merge: for each key, pick the source with the most items
  function mergeDataSources(sources) {
    var merged = {};
    DATA_KEYS.forEach(function(key) {
      var best = [];
      sources.forEach(function(src) {
        if (!src) return;
        var arr = ensureArray(src[key]);
        if (arr.length > best.length) {
          best = arr;
        }
      });
      merged[key] = best;
    });
    // Merge settings from any source that has it
    sources.forEach(function(src) {
      if (src && src.settings && typeof src.settings === 'object' && Object.keys(src.settings).length > 0) {
        merged.settings = src.settings;
      }
    });
    return merged;
  }

  function tryParseJSON(str) {
    try { return JSON.parse(str); } catch(e) { return null; }
  }

  // Fetch user-data-full.json and convert to app schema
  function fetchOriginalData() {
    return fetch('user-data-full.json')
      .then(function(response) { return response.json(); })
      .then(function(fullData) {
        return {
          employees: (fullData.الموظفون || []).map(function(emp, index) {
            return {
              id: index + 1, name: emp.name,
              position: emp.job === "اداري" ? "مدير" : emp.job === "supervisor" ? "مشرف" : emp.job === "driver" ? "سائق" : "منظفة",
              phone: emp.phone, email: (emp.name || '').toLowerCase().replace(/\s+/g, '') + '@gmail.com',
              salary: parseInt(emp.salary) || 0, hireDate: emp.hireDate || "2026-01-11",
              joinDate: emp.joinDate, status: emp.status, job: emp.job,
              nationality: emp.nationality, idNumber: emp.idNumber, residencyExpiry: emp.residencyExpiry
            };
          }),
          clients: (fullData.العملاء || []).map(function(client, index) {
            return {
              id: index + 1, name: client.name, phone: client.phone, email: client.email,
              address: client.address || client.area || "الدوحة", area: client.area || client.address || "الدوحة",
              service: client.service, joinDate: client.joinDate, status: "active", type: "شركة"
            };
          }),
          contracts: (fullData.العقود || []).map(function(contract, index) {
            return {
              id: index + 1, number: contract.number || ('عقد-' + (index + 1)),
              clientId: index + 1, client: contract.client, clientName: contract.client,
              employee: contract.worker || contract.employee,
              title: 'عقد ' + (contract.contractType || ''),
              type: contract.contractType, amount: parseInt(contract.amount) || 0,
              value: parseInt(contract.amount) || 0, startDate: contract.startDate,
              endDate: contract.endDate,
              status: contract.paymentStatus === "مدفوع" ? "مدفوع" : "غير مدفوع",
              services: ["تنظيف"], paymentStatus: contract.paymentStatus,
              paidAmount: parseInt(contract.paidAmount || 0), paymentDate: contract.paymentDate
            };
          }),
          dailyWork: (fullData.العمل_اليومي || []).map(function(work, index) {
            return {
              id: work.id || index + 1, date: work.date, clientId: index + 1,
              clientName: work.client, serviceId: 1, serviceName: "تنظيف منزل بدون مواد تنظيف",
              team: work.workers ? work.workers.join(", ") : work.worker,
              employees: work.workers || [work.worker], status: "completed",
              startTime: "08:00", endTime: "13:00", location: work.area, notes: work.notes,
              progress: 100, totalHours: work.totalHours || 5, driver: work.driver,
              amount: work.amount, paymentStatus: work.paymentStatus, paymentMethod: work.paymentMethod
            };
          }),
          dailyIncome: (fullData.المدخولات || []).map(function(income, index) {
            return {
              id: income.id || index + 1, date: income.date, clientId: index + 1,
              clientName: income.source, amount: income.amount, type: income.type,
              paymentMethod: income.paymentMethod, status: income.status,
              invoiceNumber: "INC-2026-" + String(index + 1).padStart(3, '0'), notes: income.description
            };
          }),
          dailyExpenses: (fullData.المصروفات || []).map(function(expense, index) {
            return {
              id: expense.id || index + 1, date: expense.date, category: expense.type,
              description: expense.description, amount: expense.amount, supplier: expense.employee,
              paymentMethod: expense.paymentMethod, status: "paid",
              receiptNumber: "EXP-2026-" + String(index + 1).padStart(3, '0')
            };
          }),
          attendance: (fullData.الحضور || []).map(function(att, index) {
            return {
              id: index + 1, employeeId: index + 1, employeeName: att.employee,
              date: att.date, checkIn: "10:20", checkOut: "", status: att.status,
              hours: att.hours, autoGenerated: att.autoGenerated, timestamp: att.timestamp
            };
          }),
          services: [
            { id: 1, name: "تنظيف منزل بدون مواد تنظيف", type: "تنظيف", price: 100, duration: "5", createdAt: "2026-01-12" },
            { id: 2, name: "تنظيف منزل بدون مواد تنظيف", type: "تنظيف", price: 120, duration: "6", createdAt: "2026-01-14" },
            { id: 3, name: "تنظيف منزل بدون مواد تنظيف", type: "تنظيف", price: 20, duration: "1", createdAt: "2026-01-14" },
            { id: 4, name: "تنظيف منزل بدون مواد تنظيف", type: "تنظيف", price: 200, duration: "10", createdAt: "2026-01-14" },
            { id: 5, name: "تنظيف منزل بدون مواد تنظيف", type: "تنظيف", price: 150, duration: "5", createdAt: "2026-01-14" },
            { id: 6, name: "تنظيف منزل مع مواد تنظيف", type: "تنظيف", price: 150, duration: "5", createdAt: "2026-01-14" }
          ]
        };
      })
      .catch(function(e) {
        console.warn('V9: Could not fetch user-data-full.json:', e);
        return null;
      });
  }

  // Main fix: run after all other initialization is complete
  async function v9FixDataLoading() {
    console.log('🔧 V9: Comparing all data sources...');

    // Source 1: Current window data (loaded by initializeDefaultData from Firebase or other)
    var currentData = {};
    DATA_KEYS.forEach(function(key) {
      currentData[key] = ensureArray(window[key]);
    });

    // Source 2: localStorage superpro_data
    var localStorageData = normalizeData(tryParseJSON(localStorage.getItem('superpro_data')));

    // Source 3: localStorage superproDB
    var superproDBData = normalizeData(tryParseJSON(localStorage.getItem('superproDB')));

    // Source 4: sessionStorage superpro_data
    var sessionData = normalizeData(tryParseJSON(sessionStorage.getItem('superpro_data')));

    // Source 5: user-data-full.json (the original complete data file)
    var fileData = await fetchOriginalData();

    // Log counts for debugging
    var sources = [
      {name: 'Current (window)', data: currentData},
      {name: 'localStorage', data: localStorageData},
      {name: 'superproDB', data: superproDBData},
      {name: 'sessionStorage', data: sessionData},
      {name: 'user-data-full.json', data: fileData}
    ];

    console.log('📊 V9: Data source comparison:');
    sources.forEach(function(src) {
      if (!src.data) {
        console.log('  ' + src.name + ': (no data)');
        return;
      }
      var emp = ensureArray(src.data.employees).length;
      var cli = ensureArray(src.data.clients).length;
      var con = ensureArray(src.data.contracts).length;
      var total = countItems(src.data);
      console.log('  ' + src.name + ': ' + emp + ' employees, ' + cli + ' clients, ' + con + ' contracts (total: ' + total + ')');
    });

    // Merge: for each key, use the source with the most items
    var merged = mergeDataSources([currentData, localStorageData, superproDBData, sessionData, fileData]);

    var currentTotal = countItems(currentData);
    var mergedTotal = countItems(merged);

    if (mergedTotal > currentTotal) {
      console.log('🔧 V9: Found more complete data! Current: ' + currentTotal + ' items → Merged: ' + mergedTotal + ' items');
      console.log('🔧 V9: Applying merged data...');

      // Apply the merged data
      if (typeof window.applyData === 'function') {
        window.applyData(merged);
      } else {
        // Fallback: set globals directly
        DATA_KEYS.forEach(function(key) {
          window[key] = merged[key] || [];
        });
      }

      // Save the complete data to all storage backends
      if (typeof window.saveData === 'function') {
        window.saveData();
        console.log('✅ V9: Saved merged data to all backends');
      }

      // Force re-render all UI
      if (typeof window.updateAllUI === 'function') {
        window.updateAllUI();
      }

      var empCount = ensureArray(window.employees).length;
      var cliCount = ensureArray(window.clients).length;
      var conCount = ensureArray(window.contracts).length;
      console.log('✅ V9: Data restored! ' + empCount + ' employees, ' + cliCount + ' clients, ' + conCount + ' contracts');

      if (typeof window.showToast === 'function') {
        window.showToast('✅ تم استعادة جميع البيانات: ' + empCount + ' موظف، ' + cliCount + ' عميل، ' + conCount + ' عقد', 'success');
      }
    } else {
      console.log('✅ V9: Current data is already complete (' + currentTotal + ' items)');
    }
  }

  // Also patch saveData to log Firebase errors instead of silently ignoring them
  function patchSaveDataFirebaseLogging() {
    var origSaveData = window.saveData;
    if (!origSaveData || origSaveData._v9patched) return;

    window.saveData = function() {
      // Call original
      origSaveData.call(this);

      // Now verify Firebase write with retry
      if (typeof firebaseDb !== 'undefined' && firebaseDb && firebaseDb.ref) {
        try {
          var data = {};
          DATA_KEYS.forEach(function(key) {
            data[key] = ensureArray(window[key]);
          });
          if (window.settings) data.settings = window.settings;

          firebaseDb.ref(FB_PATH).set(data)
            .then(function() {
              console.log('✅ V9: Firebase write confirmed');
            })
            .catch(function(err) {
              console.error('❌ V9: Firebase write FAILED:', err.message || err);
              // Data is still safe in localStorage, but warn about cloud sync
              if (typeof window.showToast === 'function') {
                window.showToast('⚠️ تعذر حفظ البيانات على السحابة. البيانات محفوظة محلياً.', 'warning');
              }
            });
        } catch(e) {
          console.error('V9: Firebase save error:', e);
        }
      }
    };
    window.saveData._v9patched = true;
    console.log('✅ V9: saveData patched with Firebase error logging');
  }

  // Run the fix after everything else has loaded
  function startV9() {
    console.log('🔧 V9: Starting...');

    // Patch saveData immediately
    try { patchSaveDataFirebaseLogging(); } catch(e) { console.error('V9 patch error:', e); }

    // Wait for initializeDefaultData to complete, then fix data
    // Phase 1: Quick check after 3 seconds
    setTimeout(function() {
      v9FixDataLoading().then(function() {
        console.log('✅ V9: Phase 1 complete');
      });
    }, 3000);

    // Phase 2: Re-check after 8 seconds (after V8 phases complete)
    setTimeout(function() {
      v9FixDataLoading().then(function() {
        console.log('✅ V9: Phase 2 complete');
        // Re-patch saveData in case V8 overwrote it
        try { patchSaveDataFirebaseLogging(); } catch(e) {}
      });
    }, 8000);

    // Phase 3: Final safety check after 15 seconds
    setTimeout(function() {
      v9FixDataLoading().then(function() {
        console.log('✅ V9: Phase 3 (final) complete');
      });
    }, 15000);
  }

  if (document.readyState === 'complete') {
    startV9();
  } else {
    window.addEventListener('load', startV9);
  }

  console.log('✅ V9: Module loaded');
})();
