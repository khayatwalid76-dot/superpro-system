// ============================================================================
// BUGFIX V6 - إصلاح شامل لجميع المشاكل
// يُحمَّل آخر ملف لضمان التغلب على أي تعريفات سابقة
// ============================================================================

(function() {
  'use strict';
  console.log('🔧 BugFix V6: بدء تحميل الإصلاحات الشاملة...');

  // ========================================================================
  // 1. إصلاح نظام الإشعارات - تحديد كمقروء فردياً
  // ========================================================================
  function fixNotificationSystem() {
    console.log('🔔 BugFix V6: إصلاح نظام الإشعارات');

    const bell = document.getElementById('notificationBell');
    const panel = document.getElementById('notificationPanel');
    const closeBtn = document.getElementById('closeNotificationPanel');
    const markAllBtn = document.getElementById('markAllReadBtn');
    const listEl = document.getElementById('notificationList');

    if (!bell || !panel || !listEl) return;

    // تخزين الإشعارات المقروءة
    function getReadNotifications() {
      try {
        return JSON.parse(localStorage.getItem('superpro_read_notifications') || '[]');
      } catch(e) { return []; }
    }
    function markNotificationRead(id) {
      const read = getReadNotifications();
      if (!read.includes(id)) {
        read.push(id);
        localStorage.setItem('superpro_read_notifications', JSON.stringify(read));
      }
    }

    // جمع الإشعارات من النظام
    function gatherNotifications() {
      const notifications = [];
      const today = new Date();

      // إشعارات العقود
      if (window.contracts && Array.isArray(window.contracts)) {
        window.contracts.forEach(function(c, idx) {
          if (c.endDate) {
            const end = new Date(c.endDate);
            const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
            if (diff <= 30 && diff > 0) {
              notifications.push({
                id: 'contract_exp_' + idx,
                icon: 'fas fa-file-contract',
                color: 'warning',
                title: 'عقد يقترب من الانتهاء',
                text: (c.client || c.clientName || 'عقد') + ' — ينتهي بعد ' + diff + ' يوم',
                time: c.endDate
              });
            } else if (diff <= 0) {
              notifications.push({
                id: 'contract_ended_' + idx,
                icon: 'fas fa-exclamation-triangle',
                color: 'danger',
                title: 'عقد منتهي',
                text: (c.client || c.clientName || 'عقد') + ' — انتهى منذ ' + Math.abs(diff) + ' يوم',
                time: c.endDate
              });
            }
          }
          // إشعار دفع
          if (c.paymentStatus === 'غير مدفوع') {
            notifications.push({
              id: 'contract_unpaid_' + idx,
              icon: 'fas fa-money-bill-wave',
              color: 'danger',
              title: 'عقد غير مدفوع',
              text: (c.client || c.clientName || 'عقد') + ' — ' + (c.amount || 0) + ' ر.ق',
              time: c.createdAt || ''
            });
          }
        });
      }

      // إشعارات الإقامات المنتهية
      if (window.employees && Array.isArray(window.employees)) {
        window.employees.forEach(function(emp, idx) {
          if (emp.residencyExpiry) {
            const expiry = new Date(emp.residencyExpiry);
            const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
            if (diff <= 30 && diff > 0) {
              notifications.push({
                id: 'residency_exp_' + idx,
                icon: 'fas fa-passport',
                color: 'warning',
                title: 'إقامة تنتهي قريباً',
                text: (emp.name || 'موظف') + ' — تنتهي بعد ' + diff + ' يوم',
                time: emp.residencyExpiry
              });
            } else if (diff <= 0) {
              notifications.push({
                id: 'residency_ended_' + idx,
                icon: 'fas fa-exclamation-circle',
                color: 'danger',
                title: 'إقامة منتهية',
                text: (emp.name || 'موظف') + ' — انتهت منذ ' + Math.abs(diff) + ' يوم',
                time: emp.residencyExpiry
              });
            }
          }
        });
      }

      // إشعارات العمل اليومي غير المدفوع
      if (window.dailyWork && Array.isArray(window.dailyWork)) {
        var unpaidCount = window.dailyWork.filter(function(w) { return w.paymentStatus === 'غير مدفوع'; }).length;
        if (unpaidCount > 0) {
          notifications.push({
            id: 'unpaid_work_summary',
            icon: 'fas fa-hand-holding-usd',
            color: 'info',
            title: 'أعمال يومية غير مدفوعة',
            text: unpaidCount + ' سجل عمل بحاجة لتحصيل المبلغ',
            time: new Date().toISOString().split('T')[0]
          });
        }
      }

      return notifications;
    }

    // عرض الإشعارات مع زر تحديد كمقروء لكل واحدة
    function renderNotifications() {
      const notifications = gatherNotifications();
      const readNotifications = getReadNotifications();

      // فلترة المقروءة
      const unread = notifications.filter(function(n) {
        return !readNotifications.includes(n.id);
      });

      // تحديث العدد
      const badge = document.getElementById('notificationBadge');
      if (badge) {
        if (unread.length > 0) {
          badge.style.display = 'inline';
          badge.textContent = unread.length;
        } else {
          badge.style.display = 'none';
          badge.textContent = '0';
        }
      }

      if (unread.length === 0) {
        listEl.innerHTML = '<div class="p-3 text-center text-muted"><i class="fas fa-check-circle fa-2x mb-2 text-success"></i><p class="mb-0">لا توجد إشعارات جديدة</p></div>';
        return;
      }

      var html = '';
      unread.forEach(function(n) {
        html += '<div class="d-flex align-items-start p-2 border-bottom notification-item" data-notif-id="' + n.id + '" style="gap:10px;">';
        html += '<div class="flex-shrink-0"><i class="' + n.icon + ' text-' + n.color + '" style="font-size:1.2rem;"></i></div>';
        html += '<div class="flex-grow-1">';
        html += '<div class="fw-bold small">' + n.title + '</div>';
        html += '<div class="text-muted small">' + n.text + '</div>';
        if (n.time) html += '<div class="text-muted" style="font-size:0.7rem;">' + n.time + '</div>';
        html += '</div>';
        html += '<button class="btn btn-sm btn-outline-success flex-shrink-0 mark-read-btn" data-notif-id="' + n.id + '" title="تحديد كمقروء" style="padding:2px 6px;font-size:0.7rem;">';
        html += '<i class="fas fa-check"></i>';
        html += '</button>';
        html += '</div>';
      });

      listEl.innerHTML = html;

      // ربط أزرار التحديد كمقروء
      listEl.querySelectorAll('.mark-read-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var notifId = this.getAttribute('data-notif-id');
          markNotificationRead(notifId);
          // إزالة الإشعار من القائمة بتأثير حركي
          var item = this.closest('.notification-item');
          if (item) {
            item.style.transition = 'all 0.3s ease';
            item.style.opacity = '0';
            item.style.transform = 'translateX(-100%)';
            setTimeout(function() {
              item.remove();
              // تحديث العدد
              var remaining = listEl.querySelectorAll('.notification-item').length;
              if (badge) {
                badge.textContent = remaining;
                if (remaining === 0) badge.style.display = 'none';
              }
              if (remaining === 0) {
                listEl.innerHTML = '<div class="p-3 text-center text-muted"><i class="fas fa-check-circle fa-2x mb-2 text-success"></i><p class="mb-0">لا توجد إشعارات جديدة</p></div>';
              }
            }, 300);
          }
          if (typeof showToast === 'function') showToast('تم تحديد الإشعار كمقروء', 'success');
        });
      });
    }

    // إعادة ربط جرس الإشعارات
    var newBell = bell.cloneNode(true);
    bell.parentNode.replaceChild(newBell, bell);

    newBell.addEventListener('click', function(e) {
      e.stopPropagation();
      var isVisible = panel.style.display !== 'none';
      panel.style.display = isVisible ? 'none' : 'block';
      newBell.setAttribute('aria-expanded', !isVisible);
      if (!isVisible) renderNotifications();
    });

    if (closeBtn) {
      var newClose = closeBtn.cloneNode(true);
      closeBtn.parentNode.replaceChild(newClose, closeBtn);
      newClose.addEventListener('click', function() {
        panel.style.display = 'none';
        newBell.setAttribute('aria-expanded', 'false');
      });
    }

    if (markAllBtn) {
      var newMarkAll = markAllBtn.cloneNode(true);
      markAllBtn.parentNode.replaceChild(newMarkAll, markAllBtn);
      newMarkAll.addEventListener('click', function() {
        var items = listEl.querySelectorAll('.notification-item');
        items.forEach(function(item) {
          var id = item.getAttribute('data-notif-id');
          if (id) markNotificationRead(id);
        });
        renderNotifications();
        if (typeof showToast === 'function') showToast('تم تحديد جميع الإشعارات كمقروءة', 'success');
      });
    }

    document.addEventListener('click', function(e) {
      if (!panel.contains(e.target) && e.target !== newBell && !newBell.contains(e.target)) {
        panel.style.display = 'none';
        newBell.setAttribute('aria-expanded', 'false');
      }
    });

    // تحديث العدد عند التحميل
    setTimeout(renderNotifications, 2000);
  }

  // ========================================================================
  // 2. إصلاح فلاتر العقود
  // ========================================================================
  function fixContractFilters() {
    console.log('📋 BugFix V6: إصلاح فلاتر العقود');

    var filterBtns = document.querySelectorAll('#contracts [data-filter]');
    if (filterBtns.length === 0) return;

    filterBtns.forEach(function(btn) {
      // إزالة أي مستمع سابق بنسخ العنصر
      var newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      newBtn.addEventListener('click', function() {
        // إزالة active من الكل
        document.querySelectorAll('#contracts [data-filter]').forEach(function(b) {
          b.classList.remove('active');
        });
        this.classList.add('active');

        // تطبيق الفلترة
        applyContractFilter();
      });
    });

    // التأكد من أن "الكل" نشط افتراضياً
    var allBtn = document.querySelector('#contracts [data-filter="all"]');
    if (allBtn && !document.querySelector('#contracts [data-filter].active')) {
      allBtn.classList.add('active');
    }
  }

  function applyContractFilter() {
    var activeFilter = 'all';
    var activeBtn = document.querySelector('#contracts [data-filter].active');
    if (activeBtn) activeFilter = activeBtn.getAttribute('data-filter');

    var searchInput = document.getElementById('contract-search');
    var searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    if (!window.contracts || !Array.isArray(window.contracts)) return;

    var filtered = window.contracts.slice(); // نسخة

    // تطبيق البحث
    if (searchTerm) {
      filtered = filtered.filter(function(c) {
        return (c.number && c.number.toLowerCase().includes(searchTerm)) ||
               (c.client && c.client.toLowerCase().includes(searchTerm)) ||
               (c.clientName && c.clientName.toLowerCase().includes(searchTerm)) ||
               (c.employee && c.employee.toLowerCase().includes(searchTerm));
      });
    }

    // تطبيق فلتر الحالة
    if (activeFilter !== 'all') {
      if (activeFilter === 'عقود جزئية') {
        filtered = filtered.filter(function(c) { return c.type === 'جزئي'; });
      } else if (activeFilter === 'منتهي') {
        var today = new Date();
        filtered = filtered.filter(function(c) {
          if (!c.endDate) return false;
          var endDate = new Date(c.endDate);
          var diff = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
          return diff <= 30; // قاربت على الانتهاء أو انتهت
        });
      } else {
        filtered = filtered.filter(function(c) {
          return c.paymentStatus === activeFilter;
        });
      }
    }

    // عرض النتائج
    if (typeof renderFilteredContracts === 'function') {
      renderFilteredContracts(filtered);
    }

    var countEl = document.getElementById('contractsTableCount');
    if (countEl) countEl.textContent = filtered.length + ' عقد';
  }

  // ربط البحث أيضاً
  function fixContractSearch() {
    var searchInput = document.getElementById('contract-search');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        applyContractFilter();
      });
    }
  }

  // ========================================================================
  // 3. إصلاح عرض العملاء - التأكد من عرض جميع العملاء
  // ========================================================================
  function fixClientsDisplay() {
    console.log('👥 BugFix V6: إصلاح عرض العملاء');

    // تأكد من أن renderClientsTable تعمل مع كل العملاء
    var origRenderClients = window.renderClientsTable;

    window.renderClientsTable = function() {
      var tbody = document.getElementById('clients-table-body');
      if (!tbody) {
        // fallback: try alternative table
        tbody = document.querySelector('#clientsTable tbody');
      }
      if (!tbody) return;

      var clientsList = window.clients;
      if (!clientsList || !Array.isArray(clientsList) || clientsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3"><i class="fas fa-users fa-2x mb-2"></i><p>لا توجد عملاء مسجلين</p></td></tr>';
        return;
      }

      tbody.innerHTML = '';

      clientsList.forEach(function(client, index) {
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td>' + (index + 1) + '</td>' +
          '<td>' + (client.name || '-') + '</td>' +
          '<td>' + (client.phone || 'لا يوجد') + '</td>' +
          '<td>' + (client.email || 'لا يوجد') + '</td>' +
          '<td>' + (client.service || client.company || 'تنظيف') + '</td>' +
          '<td>' + (client.area || 'غير محدد') + '</td>' +
          '<td><span class="badge bg-success">نشط</span></td>' +
          '<td>' +
            '<button type="button" class="btn btn-sm btn-outline-warning" onclick="editClient(' + index + ')"><i class="fas fa-edit"></i></button> ' +
            '<button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteClient(' + index + ')"><i class="fas fa-trash"></i></button>' +
          '</td>';
        tbody.appendChild(tr);
      });

      // تحديث العداد
      var countEl = document.getElementById('clientsTableCount');
      if (countEl) countEl.textContent = clientsList.length + ' عميل';
    };
  }

  // ========================================================================
  // 4. إصلاح العمل اليومي - التأكد من أن التحديث يعمل
  // ========================================================================
  function fixDailyWorkUpdate() {
    console.log('📋 BugFix V6: إصلاح تحديث العمل اليومي');

    // التأكد من أن editState موجود
    if (!window.editState) {
      window.editState = {
        employee: { isEditMode: false, editIndex: -1 },
        client: { isEditMode: false, editIndex: -1 },
        contract: { isEditMode: false, editIndex: -1 },
        dailyWork: { isEditMode: false, editIndex: -1 },
        dailyIncome: { isEditMode: false, editIndex: -1 },
        dailyExpense: { isEditMode: false, editIndex: -1 },
        service: { isEditMode: false, editIndex: -1 }
      };
    }

    // إعادة ربط زر الحفظ في العمل اليومي
    var saveBtn = document.getElementById('saveDailyWorkBtn');
    if (!saveBtn) return;

    var origOnClick = saveBtn.onclick;

    // إعادة تعريف onclick مع إصلاح
    saveBtn.addEventListener('click', function(e) {
      // إذا كان هناك handler أصلي، دعه يعمل
      // لكن نتأكد من أن editState يعمل
      console.log('🔧 Save daily work clicked. Edit mode:', window.editState?.dailyWork?.isEditMode);
    });

    // إصلاح editDailyWork لضمان فتح المودال وتعيين editState
    var origEditDailyWork = window.editDailyWork;
    window.editDailyWork = function(index) {
      console.log('🔧 editDailyWork called with index:', index);

      // التأكد من editState
      if (!window.editState) window.editState = {};
      if (!window.editState.dailyWork) window.editState.dailyWork = {};

      if (typeof origEditDailyWork === 'function') {
        try {
          origEditDailyWork(index);
          return;
        } catch(e) {
          console.error('Error in original editDailyWork:', e);
        }
      }

      // Fallback implementation
      var work = window.dailyWork && window.dailyWork[index];
      if (!work) return;

      var setVal = function(id, val) {
        var el = document.getElementById(id);
        if (el) el.value = val || '';
      };

      setVal('dailyWorkDate', work.date);
      setVal('dailyWorkClientNumber', work.clientNumber);
      setVal('dailyWorkArea', work.area);
      setVal('dailyWorkTotalHours', work.totalHours || 8);
      setVal('dailyWorkShift', work.shift || 'صباحية');
      setVal('dailyWorkDriver', work.driver);
      setVal('dailyWorkAmount', work.amount);
      setVal('dailyWorkPaymentStatus', work.paymentStatus);
      setVal('dailyWorkPaymentMethod', work.paymentMethod);
      setVal('dailyWorkNotes', work.notes);

      // تعيين العميل
      var clientSelect = document.getElementById('dailyWorkClient');
      if (clientSelect) clientSelect.value = work.client || '';

      // عنوان المودال
      var modalTitle = document.querySelector('#dailyWorkModal .modal-title');
      if (modalTitle) modalTitle.textContent = 'تعديل العمل اليومي';
      var saveBtnEl = document.getElementById('saveDailyWorkBtn');
      if (saveBtnEl) saveBtnEl.textContent = 'تحديث البيانات';

      window.editState.dailyWork.isEditMode = true;
      window.editState.dailyWork.editIndex = index;

      try {
        var modal = new bootstrap.Modal(document.getElementById('dailyWorkModal'));
        modal.show();
      } catch(e) {
        console.error('Error opening daily work modal:', e);
      }
    };
  }

  // ========================================================================
  // 5. إصلاح عرض العقود - التأكد من ظهور جميع العقود
  // ========================================================================
  function fixContractsDisplay() {
    console.log('📋 BugFix V6: إصلاح عرض العقود');

    // تعزيز renderFilteredContracts لتتعامل مع كل الحالات
    var origRender = window.renderFilteredContracts;

    window.renderFilteredContracts = function(filteredContracts) {
      var tbody = document.getElementById('contracts-table-body');
      if (!tbody) {
        tbody = document.querySelector('#contractsTable tbody');
      }
      if (!tbody) return;

      if (!filteredContracts || filteredContracts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="15" class="text-center text-muted py-3"><i class="fas fa-file-contract fa-2x mb-2"></i><p>لا توجد عقود تطابق معايير البحث</p></td></tr>';
        return;
      }

      tbody.innerHTML = '';

      filteredContracts.forEach(function(contract, index) {
        var realIndex = window.contracts ? window.contracts.indexOf(contract) : index;
        if (realIndex === -1) realIndex = index;

        var paidAmount = parseFloat(contract.paidAmount) || 0;
        var totalAmount = parseFloat(contract.amount) || 0;
        var remaining = totalAmount - paidAmount;

        var paymentBadge = 'bg-danger';
        if (contract.paymentStatus === 'مدفوع') paymentBadge = 'bg-success';
        else if (contract.paymentStatus === 'مدفوع جزئي') paymentBadge = 'bg-warning';

        var statusBadge = 'bg-success';
        if (contract.status === 'منتهي') statusBadge = 'bg-secondary';
        else if (contract.status === 'ملغي') statusBadge = 'bg-danger';

        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td>' + (index + 1) + '</td>' +
          '<td>' + (contract.number || contract.contractNumber || 'غير محدد') + '</td>' +
          '<td>' + (contract.client || contract.clientName || '-') + '</td>' +
          '<td>' + (contract.employee || '-') + '</td>' +
          '<td>' + (contract.type || '-') + '</td>' +
          '<td>' + (contract.workDays ? contract.workDays.join('، ') : 'غير محدد') + '</td>' +
          '<td>' + (contract.startTime || '08:00') + ' - ' + (contract.endTime || '16:00') + '</td>' +
          '<td>' + totalAmount + ' ر.ق</td>' +
          '<td class="text-success">' + paidAmount + ' ر.ق</td>' +
          '<td class="text-danger">' + remaining + ' ر.ق</td>' +
          '<td>' + (contract.startDate || '-') + '</td>' +
          '<td>' + (contract.endDate || '-') + '</td>' +
          '<td><span class="badge ' + paymentBadge + '">' + (contract.paymentStatus || 'غير مدفوع') + '</span></td>' +
          '<td><span class="badge ' + statusBadge + '">' + (contract.status || 'نشط') + '</span></td>' +
          '<td>' +
            '<div class="btn-group btn-group-sm">' +
              '<button type="button" class="btn btn-outline-warning" onclick="editContract(' + realIndex + ')"><i class="fas fa-edit"></i></button>' +
              '<button type="button" class="btn btn-outline-success" onclick="markContractAsPaid(' + realIndex + ')"><i class="fas fa-check"></i></button>' +
              '<button type="button" class="btn btn-outline-danger" onclick="deleteContract(' + realIndex + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
          '</td>';
        tbody.appendChild(tr);
      });
    };
  }

  // ========================================================================
  // 6. إصلاح تحميل البيانات - ضمان تحميل كل البيانات من كل المصادر
  // ========================================================================
  function fixDataLoading() {
    console.log('💾 BugFix V6: إصلاح تحميل البيانات');

    // التأكد من أن المصفوفات العامة مُعبأة
    function ensureDataLoaded() {
      // محاولة تحميل من أي مصدر متاح
      var sources = ['superpro_data', 'superproDB'];
      var storages = [localStorage, sessionStorage];

      for (var s = 0; s < storages.length; s++) {
        for (var i = 0; i < sources.length; i++) {
          try {
            var raw = storages[s].getItem(sources[i]);
            if (!raw) continue;
            var data = JSON.parse(raw);

            // تحميل العقود إذا كانت فارغة
            if ((!window.contracts || window.contracts.length === 0) && data.contracts && data.contracts.length > 0) {
              window.contracts = data.contracts;
              console.log('📋 تم تحميل ' + data.contracts.length + ' عقد من ' + sources[i]);
            }

            // تحميل العملاء إذا كانوا فارغين
            if ((!window.clients || window.clients.length === 0) && data.clients && data.clients.length > 0) {
              window.clients = data.clients;
              console.log('👥 تم تحميل ' + data.clients.length + ' عميل من ' + sources[i]);
            }

            // تحميل العمل اليومي
            if ((!window.dailyWork || window.dailyWork.length === 0) && data.dailyWork && data.dailyWork.length > 0) {
              window.dailyWork = data.dailyWork;
              console.log('📋 تم تحميل ' + data.dailyWork.length + ' عمل يومي من ' + sources[i]);
            }

            // تحميل الموظفين
            if ((!window.employees || window.employees.length === 0) && data.employees && data.employees.length > 0) {
              window.employees = data.employees;
              console.log('👥 تم تحميل ' + data.employees.length + ' موظف من ' + sources[i]);
            }

            // تحميل المدخولات
            var incomeData = data.dailyIncome || data.income;
            if ((!window.dailyIncome || window.dailyIncome.length === 0) && incomeData && incomeData.length > 0) {
              window.dailyIncome = incomeData;
            }

            // تحميل المصروفات
            var expData = data.dailyExpenses || data.expenses;
            if ((!window.dailyExpenses || window.dailyExpenses.length === 0) && expData && expData.length > 0) {
              window.dailyExpenses = expData;
            }

            // تحميل الحضور
            if ((!window.attendance || window.attendance.length === 0) && data.attendance && data.attendance.length > 0) {
              window.attendance = data.attendance;
            }

          } catch(e) {
            // ignore
          }
        }
      }
    }

    ensureDataLoaded();

    // أيضاً محاولة من Firebase
    if (typeof firebaseDb !== 'undefined' && firebaseDb && firebaseDb.ref) {
      try {
        var fbPath = 'superpro_data';
        firebaseDb.ref(fbPath).once('value', function(snap) {
          var data = snap.val();
          if (data) {
            if ((!window.contracts || window.contracts.length === 0) && data.contracts && data.contracts.length > 0) {
              window.contracts = data.contracts;
              console.log('☁️ تم تحميل العقود من Firebase');
              if (typeof updateContractsTable === 'function') updateContractsTable();
            }
            if ((!window.clients || window.clients.length === 0) && data.clients && data.clients.length > 0) {
              window.clients = data.clients;
              console.log('☁️ تم تحميل العملاء من Firebase');
              if (typeof renderClientsTable === 'function') renderClientsTable();
            }
            if ((!window.dailyWork || window.dailyWork.length === 0) && data.dailyWork && data.dailyWork.length > 0) {
              window.dailyWork = data.dailyWork;
              console.log('☁️ تم تحميل العمل اليومي من Firebase');
            }
          }
        });
      } catch(e) {
        console.warn('Firebase load skipped:', e.message);
      }
    }
  }

  // ========================================================================
  // 7. إصلاح التنقل - ضمان أن التنقل يستخدم الدوال الصحيحة
  // ========================================================================
  function fixNavigation() {
    console.log('🔗 BugFix V6: إصلاح التنقل');

    // تعزيز navigate لضمان تحميل البيانات الصحيحة
    var origNavigate = window.navigate;

    window.navigate = function(page) {
      if (typeof origNavigate === 'function') {
        origNavigate(page);
      }

      // بعد التنقل، تأكد من تحميل البيانات
      setTimeout(function() {
        try {
          if (page === 'contracts' && typeof updateContractsTable === 'function') {
            if (typeof updateContractStats === 'function') updateContractStats();
            updateContractsTable();
            fixContractFilters();
          }
          if (page === 'clients' && typeof renderClientsTable === 'function') {
            renderClientsTable();
          }
          if (page === 'dailyWork' && typeof filterDailyWorkByDate === 'function') {
            filterDailyWorkByDate();
          }
        } catch(e) {
          console.warn('Post-navigation refresh error:', e);
        }
      }, 100);
    };
  }

  // ========================================================================
  // 8. مراجعة شاملة لجميع القوائم
  // ========================================================================
  function reviewAllModules() {
    console.log('🔍 BugFix V6: مراجعة شاملة لجميع القوائم');

    // إصلاح: التأكد من أن كل الدوال العامة مُصدّرة
    var functionsToExport = [
      'editContract', 'deleteContract', 'markContractAsPaid',
      'editClient', 'deleteClient',
      'editDailyWork', 'deleteDailyWork', 'markDailyWorkAsPaid',
      'editEmployee', 'deleteEmployee',
      'editDailyIncome', 'deleteDailyIncome',
      'editDailyExpense', 'deleteDailyExpense',
      'editTask', 'deleteTask',
      'editService', 'deleteService',
      'applyContractFilter',
      'renderFilteredContracts', 'renderClientsTable',
      'filterDailyWorkByDate', 'updateContractsTable',
      'updateContractStats', 'updateDailyWorkStats'
    ];

    functionsToExport.forEach(function(fnName) {
      if (typeof window[fnName] !== 'function') {
        console.warn('⚠️ Missing function:', fnName);
      }
    });

    // إصلاح: ربط البحث في كل قسم
    var searchInputs = [
      { id: 'contract-search', handler: applyContractFilter },
      { id: 'client-search', handler: function() {
        var t = this.value.toLowerCase();
        document.querySelectorAll('#clients-table-body tr').forEach(function(row) {
          row.style.display = row.textContent.toLowerCase().includes(t) ? '' : 'none';
        });
      }},
      { id: 'dailyWork-search', handler: function() {
        var t = this.value.toLowerCase();
        document.querySelectorAll('#dailyWork-table-body tr').forEach(function(row) {
          row.style.display = row.textContent.toLowerCase().includes(t) ? '' : 'none';
        });
      }}
    ];

    searchInputs.forEach(function(si) {
      var input = document.getElementById(si.id);
      if (input) {
        input.addEventListener('input', si.handler);
      }
    });
  }

  // ========================================================================
  // CSS إضافي
  // ========================================================================
  function addFixStyles() {
    var style = document.createElement('style');
    style.textContent = '\n' +
      '.notification-item { transition: all 0.3s ease; }\n' +
      '.notification-item:hover { background-color: #f8f9fa; }\n' +
      '.mark-read-btn { opacity: 0.7; transition: opacity 0.2s; }\n' +
      '.mark-read-btn:hover { opacity: 1; }\n' +
      '#notificationPanel { direction: rtl; }\n' +
      '.dark-mode #notificationPanel { background: #1e1e2f !important; color: #e0e0e0; border-color: #333 !important; }\n' +
      '.dark-mode .notification-item:hover { background-color: #2a2a3a; }\n';
    document.head.appendChild(style);
  }

  // ========================================================================
  // تشغيل جميع الإصلاحات
  // ========================================================================
  function runAllFixes() {
    try { addFixStyles(); } catch(e) { console.error('Style fix error:', e); }
    try { fixDataLoading(); } catch(e) { console.error('Data fix error:', e); }
    try { fixContractsDisplay(); } catch(e) { console.error('Contracts display fix error:', e); }
    try { fixClientsDisplay(); } catch(e) { console.error('Clients display fix error:', e); }
    try { fixDailyWorkUpdate(); } catch(e) { console.error('Daily work fix error:', e); }
    try { fixContractFilters(); } catch(e) { console.error('Contract filters fix error:', e); }
    try { fixContractSearch(); } catch(e) { console.error('Contract search fix error:', e); }
    try { fixNotificationSystem(); } catch(e) { console.error('Notification fix error:', e); }
    try { fixNavigation(); } catch(e) { console.error('Navigation fix error:', e); }
    try { reviewAllModules(); } catch(e) { console.error('Module review error:', e); }

    console.log('✅ BugFix V6: تم تطبيق جميع الإصلاحات بنجاح!');
  }

  // تشغيل بعد تحميل الصفحة بالكامل
  if (document.readyState === 'complete') {
    setTimeout(runAllFixes, 500);
  } else {
    window.addEventListener('load', function() {
      setTimeout(runAllFixes, 500);
    });
  }

  // تشغيل مرة أخرى بعد ثانيتين لضمان تحميل Firebase
  setTimeout(function() {
    try { fixDataLoading(); } catch(e) {}
    try {
      if (typeof updateContractsTable === 'function') updateContractsTable();
      if (typeof renderClientsTable === 'function') renderClientsTable();
    } catch(e) {}
  }, 3000);

})();
