// ============================================================================
// BUGFIX V11.0 - إصلاحات إضافية
// 1. ترقيم العقود تلقائياً (إخفاء حقل رقم العقد اليدوي)
// 2. تخزين بيانات المستخدمين في Firebase بدل localStorage
// 3. منع حجز الموظفين المرتبطين بعقود نشطة في العمل اليومي
// ============================================================================
(function() {
  'use strict';
  console.log('🔧 BugFix V11.0: ترقيم العقود + مستخدمين سحابي + منع حجز الموظفين بعقود...');

  // ========================================================================
  // FIX 1: ترقيم العقود تلقائياً
  // ========================================================================
  function generateContractNumber() {
    // Get the contracts array
    var contractsArr = window.contracts || [];
    var maxNum = 0;
    contractsArr.forEach(function(c) {
      var num = c.number || c.contractNumber || '';
      var match = num.match(/(\d+)/);
      if (match) {
        var n = parseInt(match[1]);
        if (n > maxNum) maxNum = n;
      }
    });
    var nextNum = maxNum + 1;
    return 'CON-' + String(nextNum).padStart(3, '0');
  }

  function setupAutoContractNumber() {
    var field = document.getElementById('contractNumber');
    if (!field) return;

    // Hide the contract number field and make it non-required
    var fieldParent = field.closest('.col-md-6');
    if (fieldParent) {
      fieldParent.style.display = 'none';
    }
    field.removeAttribute('required');

    // When the modal opens for NEW contract, auto-generate number
    var contractModal = document.getElementById('contractModal');
    if (contractModal && !contractModal._v11AutoNumSetup) {
      contractModal._v11AutoNumSetup = true;
      contractModal.addEventListener('show.bs.modal', function() {
        setTimeout(function() {
          // Only auto-fill for new contracts, not edits
          if (!window.editState || !window.editState.contract || !window.editState.contract.isEditMode) {
            field.value = generateContractNumber();
          }
        }, 100);
      });
    }

    // Also patch the save button to ensure number is set
    var saveBtn = document.getElementById('saveContractBtn');
    if (saveBtn && !saveBtn._v11Patched) {
      saveBtn._v11Patched = true;
      saveBtn.addEventListener('click', function() {
        if (!field.value || field.value.trim() === '') {
          field.value = generateContractNumber();
        }
      }, true); // capture phase to run before the original handler
    }
  }

  // ========================================================================
  // FIX 2: تخزين بيانات المستخدمين في Firebase بدل localStorage
  // ========================================================================
  var USERS_FB_PATH = 'superpro_users';

  function saveUsersToFirebase(users) {
    try {
      if (typeof firebaseDb !== 'undefined' && firebaseDb && firebaseDb.ref) {
        firebaseDb.ref(USERS_FB_PATH).set(users).then(function() {
          console.log('☁️ تم حفظ بيانات المستخدمين في السحابة');
        }).catch(function(err) {
          console.warn('⚠️ خطأ في حفظ المستخدمين للسحابة:', err);
        });
      }
    } catch(e) {
      console.warn('⚠️ Firebase غير متاح لحفظ المستخدمين');
    }
  }

  function loadUsersFromFirebase(callback) {
    try {
      if (typeof firebaseDb !== 'undefined' && firebaseDb && firebaseDb.ref) {
        firebaseDb.ref(USERS_FB_PATH).once('value', function(snap) {
          var data = snap.val();
          if (data && Array.isArray(data) && data.length > 0) {
            console.log('☁️ تم تحميل بيانات المستخدمين من السحابة');
            // Save to localStorage as backup
            localStorage.setItem('superpro_users', JSON.stringify(data));
            if (callback) callback(data);
          } else {
            // No data in Firebase - push current localStorage data up
            var localUsers = null;
            try {
              var stored = localStorage.getItem('superpro_users');
              localUsers = stored ? JSON.parse(stored) : null;
            } catch(e) {}
            if (localUsers && Array.isArray(localUsers) && localUsers.length > 0) {
              saveUsersToFirebase(localUsers);
            }
            if (callback) callback(null);
          }
        }).catch(function() {
          if (callback) callback(null);
        });
      } else {
        if (callback) callback(null);
      }
    } catch(e) {
      if (callback) callback(null);
    }
  }

  // Override the saveLocalUsers function to also save to Firebase
  var origSaveLocalUsers = window.saveLocalUsers;
  window.saveLocalUsers = function(users) {
    // Still save to localStorage as backup
    localStorage.setItem('superpro_users', JSON.stringify(users));
    // Also save to Firebase
    saveUsersToFirebase(users);
  };

  // Override getLocalUsers to be able to refresh from Firebase
  var origGetLocalUsers = window.getLocalUsers;
  window.getLocalUsers = function() {
    try {
      var stored = localStorage.getItem('superpro_users');
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch(e) {}
    return [
      { username: 'admin', password: '1234', role: 'admin', displayName: 'المدير' },
      { username: 'supervisor', password: '1234', role: 'supervisor', displayName: 'مشرف' },
      { username: 'viewer', password: '1234', role: 'viewer', displayName: 'عرض فقط' }
    ];
  };

  // Load users from Firebase on startup to sync credentials
  function syncUsersFromFirebase() {
    loadUsersFromFirebase(function(cloudUsers) {
      if (cloudUsers) {
        // Update LOCAL_USERS if it exists
        if (window.LOCAL_USERS) {
          window.LOCAL_USERS.length = 0;
          cloudUsers.forEach(function(u) { window.LOCAL_USERS.push(u); });
        }
        localStorage.setItem('superpro_users', JSON.stringify(cloudUsers));
        console.log('✅ بيانات المستخدمين متزامنة من السحابة');
      }
    });
  }

  // ========================================================================
  // FIX 3: منع حجز الموظفين المرتبطين بعقود نشطة في العمل اليومي
  // ========================================================================
  function getEmployeesWithActiveContracts() {
    var contractsArr = window.contracts || [];
    var employeesWithContracts = {};

    contractsArr.forEach(function(contract) {
      // Check if contract is active (not expired/cancelled)
      var status = (contract.status || '').trim();
      var isActive = status === 'نشط' || status === 'active' || status === '';
      
      // Also check if contract hasn't expired by date
      if (contract.endDate) {
        var endDate = new Date(contract.endDate);
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (endDate < today) isActive = false;
      }

      if (isActive) {
        var empName = (contract.employee || '').trim();
        var contractType = (contract.type || '').trim();
        if (empName) {
          employeesWithContracts[empName] = {
            type: contractType,
            contractNumber: contract.number || contract.contractNumber || '',
            client: contract.client || ''
          };
        }
      }
    });

    return employeesWithContracts;
  }

  function patchFillMultiSelectWorkers() {
    var origFill = window.fillMultiSelectWorkers;
    if (!origFill) return;

    window.fillMultiSelectWorkers = function() {
      var container = document.getElementById('workersMultiSelect');
      if (!container) return;
      container.innerHTML = '';

      var employeesArr = window.employees || [];
      var activeEmployees = employeesArr.filter(function(emp) {
        return emp.status === 'نشط';
      });

      if (activeEmployees.length === 0) {
        container.innerHTML = '<div class="text-center text-muted py-3"><i class="fas fa-users fa-2x mb-2"></i><p>لا توجد موظفين نشطين</p></div>';
        return;
      }

      var empWithContracts = getEmployeesWithActiveContracts();

      activeEmployees.forEach(function(employee) {
        var empName = (employee.name || '').trim();
        var contractInfo = empWithContracts[empName];
        var hasContract = !!contractInfo;

        var item = document.createElement('div');
        item.className = 'multi-select-item';

        if (hasContract) {
          item.style.opacity = '0.5';
          item.style.pointerEvents = 'none';
          item.style.backgroundColor = '#f8d7da';
          item.style.borderColor = '#f5c6cb';

          var contractLabel = contractInfo.type === 'جزئي' ? 'عقد جزئي' : 'عقد كامل';
          var clientLabel = contractInfo.client ? ' — ' + contractInfo.client : '';

          item.innerHTML = 
            '<input type="checkbox" class="form-check-input multi-select-checkbox" ' +
            'id="worker_' + empName.replace(/\s+/g, '_') + '" ' +
            'value="' + empName + '" disabled>' +
            '<label class="form-check-label flex-grow-1 me-2" for="worker_' + empName.replace(/\s+/g, '_') + '">' +
            '<strong>' + empName + '</strong> - ' + (employee.job || '') + ' (' + (employee.nationality || '') + ')' +
            '<br><small class="text-danger"><i class="fas fa-ban me-1"></i>مرتبط بـ' + contractLabel + clientLabel + '</small>' +
            '</label>';
        } else {
          item.innerHTML = 
            '<input type="checkbox" class="form-check-input multi-select-checkbox" ' +
            'id="worker_' + empName.replace(/\s+/g, '_') + '" ' +
            'value="' + empName + '">' +
            '<label class="form-check-label flex-grow-1 me-2" for="worker_' + empName.replace(/\s+/g, '_') + '">' +
            '<strong>' + empName + '</strong> - ' + (employee.job || '') + ' (' + (employee.nationality || '') + ')' +
            '</label>';

          var checkbox = item.querySelector('input[type="checkbox"]');
          checkbox.addEventListener('change', function() {
            if (this.checked) {
              item.classList.add('selected');
            } else {
              item.classList.remove('selected');
            }
            if (typeof updateSelectedWorkersDisplay === 'function') {
              updateSelectedWorkersDisplay();
            }
          });
        }

        container.appendChild(item);
      });
    };
  }

  // ========================================================================
  // INITIALIZATION
  // ========================================================================
  function initV11() {
    setupAutoContractNumber();
    patchFillMultiSelectWorkers();
    syncUsersFromFirebase();
    console.log('✅ BugFix V11.0: جميع الإصلاحات مفعّلة');
  }

  // Run immediately and also after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(initV11, 500);
    });
  } else {
    setTimeout(initV11, 500);
  }

  // Re-apply patches after data loads (in case functions are redefined)
  var dataLoadWatcher = setInterval(function() {
    if (window.employees && window.employees.length > 0) {
      clearInterval(dataLoadWatcher);
      setTimeout(function() {
        setupAutoContractNumber();
        patchFillMultiSelectWorkers();
      }, 1000);
    }
  }, 2000);

  // Stop watching after 30 seconds
  setTimeout(function() { clearInterval(dataLoadWatcher); }, 30000);

})();
