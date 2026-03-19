// ============================================================================
// BUGFIX V6.2 - إصلاح جذري شامل لجميع المشاكل
// يُحمَّل آخر ملف - يعالج الأسباب الحقيقية للمشاكل
// ============================================================================
(function() {
  'use strict';
  console.log('🔧 BugFix V6.2: بدء تحميل الإصلاحات الجذرية...');

  // ========================================================================
  // أدوات مساعدة
  // ========================================================================
  function ensureArray(val) {
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'object') {
      // Firebase يحوّل المصفوفات لكائنات ذات مفاتيح رقمية
      return Object.values(val).filter(function(v) { return v != null; });
    }
    return [];
  }

  function safeStr(val) {
    if (val === undefined || val === null) return '';
    return String(val);
  }

  // ========================================================================
  // إصلاح 1: إصلاح Toast/Alert بالكامل
  // ========================================================================
  function fixToastSystem() {
    // إنشاء حاوية toast جديدة مرئية
    var container = document.createElement('div');
    container.id = 'v6-toast-container';
    container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;display:flex;flex-direction:column-reverse;gap:8px;pointer-events:none;direction:rtl;';
    document.body.appendChild(container);

    // CSS
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

    window.showNotification = function(message, type) {
      window.showToast(message, type || 'info');
    };
  }

  // ========================================================================
  // إصلاح 2: ضمان البيانات كمصفوفات صحيحة
  // ========================================================================
  function fixDataArrays() {
    var keys = ['employees','clients','contracts','dailyWork','dailyIncome','dailyExpenses',
                'attendance','services','tasks','events','monthlyExpenses',
                'financialTransactions','salaryAdvances'];
    keys.forEach(function(key) {
      if (window[key] && !Array.isArray(window[key])) {
        window[key] = ensureArray(window[key]);
        console.log('🔧 V6.2: تحويل ' + key + ' إلى مصفوفة (' + window[key].length + ' عنصر)');
      }
    });

    // مراقبة تغييرات البيانات من applyData
    var origApplyData = window.applyData;
    if (typeof origApplyData === 'function') {
      window.applyData = function(data) {
        // تحويل كل الكائنات لمصفوفات قبل التطبيق
        keys.forEach(function(key) {
          if (data[key] && !Array.isArray(data[key])) {
            data[key] = ensureArray(data[key]);
          }
        });
        origApplyData.call(this, data);
        // بعد التطبيق، جدول القائمة النشطة
        setTimeout(refreshActiveModule, 300);
      };
    }
  }

  // ========================================================================
  // إصلاح 3: عرض العقود - يتجاوز الـ closure
  // ========================================================================
  function renderContractsDirectly() {
    var tbody = document.getElementById('contracts-table-body');
    if (!tbody) return;

    var allContracts = ensureArray(window.contracts);

    // قراءة الفلتر
    var activeFilter = 'all';
    var activeBtn = document.querySelector('#contracts [data-filter].active');
    if (activeBtn) activeFilter = activeBtn.getAttribute('data-filter');

    // قراءة البحث
    var searchInput = document.getElementById('contract-search');
    var searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    var filtered = allContracts.slice();

    // بحث
    if (searchTerm) {
      filtered = filtered.filter(function(c) {
        return [c.number, c.client, c.clientName, c.employee, c.notes]
          .join(' ').toLowerCase().indexOf(searchTerm) !== -1;
      });
    }

    // فلتر
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

    // عرض
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
          '<td>' + (contract.workDays ? contract.workDays.join('، ') : 'غير محدد') + '</td>' +
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
  }

  // ========================================================================
  // إصلاح 4: عرض العملاء - يتجاوز الـ closure
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
  // إصلاح 5: مراقب القائمة النشطة
  // ========================================================================
  function getActiveModuleId() {
    var active = document.querySelector('.module-section.active-module') ||
                 document.querySelector('.module-section[style*="display: block"]') ||
                 document.querySelector('.module-section[style*="display:block"]');
    return active ? active.id : null;
  }

  function refreshActiveModule() {
    var moduleId = getActiveModuleId();
    if (!moduleId) return;

    if (moduleId === 'contracts') {
      renderContractsDirectly();
    } else if (moduleId === 'clients') {
      renderClientsDirectly();
    }
  }

  // مراقب دوري - يتحقق من تطابق الجدول مع البيانات
  function startTableWatcher() {
    setInterval(function() {
      try {
        var moduleId = getActiveModuleId();
        if (!moduleId) return;

        if (moduleId === 'contracts') {
          var tbody = document.getElementById('contracts-table-body');
          var contracts = ensureArray(window.contracts);
          if (tbody && contracts.length > 0) {
            // عدد الصفوف (بدون صف "لا توجد")
            var rows = tbody.querySelectorAll('tr');
            var hasEmptyMsg = rows.length === 1 && rows[0].querySelector('td[colspan]');
            if (hasEmptyMsg || rows.length === 0) {
              console.log('🔧 V6.2: جدول العقود فارغ رغم وجود ' + contracts.length + ' عقد - إعادة عرض');
              renderContractsDirectly();
            }
          }
        } else if (moduleId === 'clients') {
          var tbody = document.getElementById('clients-table-body');
          var clients = ensureArray(window.clients);
          if (tbody && clients.length > 0) {
            var rows = tbody.querySelectorAll('tr');
            var hasEmptyMsg = rows.length === 1 && rows[0].querySelector('td[colspan]');
            if (hasEmptyMsg || rows.length === 0) {
              console.log('🔧 V6.2: جدول العملاء فارغ رغم وجود ' + clients.length + ' عميل - إعادة عرض');
              renderClientsDirectly();
            }
          }
        }
      } catch(e) { /* صامت */ }
    }, 1500);
  }

  // ========================================================================
  // إصلاح 6: فلاتر العقود
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

    // بحث
    var searchInput = document.getElementById('contract-search');
    if (searchInput) {
      var newSearch = searchInput.cloneNode(true);
      searchInput.parentNode.replaceChild(newSearch, searchInput);
      newSearch.addEventListener('input', function() {
        renderContractsDirectly();
      });
    }
  }

  // ========================================================================
  // إصلاح 7: تعديل العمل اليومي
  // ========================================================================
  function fixDailyWorkEdit() {
    window.editDailyWork = function(index) {
      var work = (window.dailyWork || [])[index];
      if (!work) {
        window.showToast('لم يتم العثور على سجل العمل', 'error');
        return;
      }

      console.log('🔧 V6.2 editDailyWork:', index, JSON.stringify(work));

      // 1. تعيين editState أولاً
      if (!window.editState) window.editState = {};
      if (!window.editState.dailyWork) window.editState.dailyWork = {};
      window.editState.dailyWork.isEditMode = true;
      window.editState.dailyWork.editIndex = index;

      // 2. عنوان المودال وزر الحفظ
      var modalTitle = document.querySelector('#dailyWorkModal .modal-title');
      if (modalTitle) modalTitle.textContent = 'تعديل العمل اليومي';
      var saveBtn = document.getElementById('saveDailyWorkBtn');
      if (saveBtn) saveBtn.textContent = 'تحديث البيانات';

      // 3. فتح المودال
      var modalEl = document.getElementById('dailyWorkModal');
      if (!modalEl) return;

      // 4. ملء البيانات بعد أن يفتح المودال (بعد show.bs.modal الذي يعيد بناء القوائم)
      function fillAfterOpen() {
        modalEl.removeEventListener('shown.bs.modal', fillAfterOpen);

        console.log('🔧 V6.2: ملء بيانات التعديل...');
        
        // خريطة الحقول
        var fieldMap = {
          'dailyWorkDate': work.date,
          'dailyWorkClientNumber': work.clientNumber || work.clientId || '',
          'dailyWorkArea': work.area || work.location || '',
          'dailyWorkTotalHours': work.totalHours || 8,
          'dailyWorkShift': work.shift || 'صباحية',
          'dailyWorkAmount': work.amount || '',
          'dailyWorkPaymentStatus': work.paymentStatus || '',
          'dailyWorkPaymentMethod': work.paymentMethod || '',
          'dailyWorkNotes': work.notes || ''
        };

        Object.keys(fieldMap).forEach(function(id) {
          var el = document.getElementById(id);
          if (el && fieldMap[id] !== undefined) {
            el.value = fieldMap[id];
          }
        });

        // العميل
        var clientSelect = document.getElementById('dailyWorkClient');
        var clientManual = document.getElementById('dailyWorkClientManual');
        var toggleBtn = document.getElementById('toggleClientInput');
        var clientName = work.client || work.clientName || '';

        if (clientSelect && clientName) {
          var found = false;
          for (var o = 0; o < clientSelect.options.length; o++) {
            if (clientSelect.options[o].value === clientName || clientSelect.options[o].text === clientName) {
              found = true;
              clientSelect.value = clientSelect.options[o].value;
              break;
            }
          }
          if (found) {
            clientSelect.classList.remove('d-none');
            if (clientManual) clientManual.classList.add('d-none');
            if (toggleBtn) { toggleBtn.innerHTML = '<i class="fas fa-edit"></i>'; toggleBtn.title = 'إدخال يدوي'; }
          } else {
            if (clientManual) { clientManual.value = clientName; clientManual.classList.remove('d-none'); }
            clientSelect.classList.add('d-none');
            if (toggleBtn) { toggleBtn.innerHTML = '<i class="fas fa-list"></i>'; toggleBtn.title = 'اختيار من القائمة'; }
          }
        }

        // السائق
        var driverSelect = document.getElementById('dailyWorkDriver');
        if (driverSelect && work.driver) {
          setTimeout(function() { driverSelect.value = work.driver; }, 50);
        }

        // العمال
        var workers = work.workers || work.employees || (work.worker ? [work.worker] : (work.team ? work.team.split(', ') : []));
        if (workers.length > 0) {
          setTimeout(function() {
            document.querySelectorAll('.multi-select-checkbox').forEach(function(cb) {
              var isWorker = workers.indexOf(cb.value) !== -1;
              cb.checked = isWorker;
              if (cb.parentElement) {
                cb.parentElement.classList.toggle('selected', isWorker);
              }
            });
            if (typeof window.updateSelectedWorkersDisplay === 'function') {
              window.updateSelectedWorkersDisplay();
            }
          }, 100);
        }

        // حالة الدفع
        var payAlert = document.getElementById('paymentAlert');
        if (payAlert) payAlert.classList.toggle('d-none', work.paymentStatus !== 'غير مدفوع');
      }

      modalEl.addEventListener('shown.bs.modal', fillAfterOpen);

      try {
        var existingModal = bootstrap.Modal.getInstance(modalEl);
        if (existingModal) existingModal.show();
        else new bootstrap.Modal(modalEl).show();
      } catch(e) {
        console.error('خطأ فتح المودال:', e);
      }
    };
  }

  // ========================================================================
  // إصلاح 8: نظام الإشعارات الفردي
  // ========================================================================
  function fixNotificationSystem() {
    var bell = document.getElementById('notificationBell');
    var panel = document.getElementById('notificationPanel');
    var listEl = document.getElementById('notificationList');
    if (!bell || !panel || !listEl) return;

    var READ_KEY = 'superpro_read_notifs_v62';

    function getRead() {
      try { return JSON.parse(localStorage.getItem(READ_KEY) || '[]'); } catch(e) { return []; }
    }
    function addRead(id) {
      var r = getRead();
      if (r.indexOf(id) === -1) { r.push(id); localStorage.setItem(READ_KEY, JSON.stringify(r)); }
    }

    function gatherNotifs() {
      var notifs = [];
      var today = new Date();

      ensureArray(window.contracts).forEach(function(c, i) {
        if (c.endDate) {
          var diff = Math.ceil((new Date(c.endDate) - today) / 86400000);
          if (diff > 0 && diff <= 30) {
            notifs.push({ id: 'cx' + i, icon: 'fas fa-file-contract', color: 'warning', title: 'عقد يقترب من الانتهاء', text: safeStr(c.client || c.clientName) + ' — بعد ' + diff + ' يوم' });
          } else if (diff <= 0) {
            notifs.push({ id: 'ce' + i, icon: 'fas fa-exclamation-triangle', color: 'danger', title: 'عقد منتهي', text: safeStr(c.client || c.clientName) + ' — منذ ' + Math.abs(diff) + ' يوم' });
          }
        }
        if (c.paymentStatus === 'غير مدفوع') {
          notifs.push({ id: 'cu' + i, icon: 'fas fa-money-bill-wave', color: 'danger', title: 'عقد غير مدفوع', text: safeStr(c.client || c.clientName) + ' — ' + (c.amount || 0) + ' ر.ق' });
        }
      });

      ensureArray(window.employees).forEach(function(emp, i) {
        if (emp.residencyExpiry) {
          var diff = Math.ceil((new Date(emp.residencyExpiry) - today) / 86400000);
          if (diff > 0 && diff <= 30) {
            notifs.push({ id: 'rx' + i, icon: 'fas fa-passport', color: 'warning', title: 'إقامة تنتهي قريباً', text: safeStr(emp.name) + ' — بعد ' + diff + ' يوم' });
          } else if (diff <= 0) {
            notifs.push({ id: 're' + i, icon: 'fas fa-passport', color: 'danger', title: 'إقامة منتهية', text: safeStr(emp.name) + ' — منذ ' + Math.abs(diff) + ' يوم' });
          }
        }
      });

      var unpaidWork = ensureArray(window.dailyWork).filter(function(w) { return w.paymentStatus === 'غير مدفوع'; });
      if (unpaidWork.length > 0) {
        notifs.push({ id: 'dwu', icon: 'fas fa-hand-holding-usd', color: 'info', title: 'أعمال غير مدفوعة', text: unpaidWork.length + ' سجل بحاجة تحصيل' });
      }
      return notifs;
    }

    function render() {
      var notifs = gatherNotifs();
      var readArr = getRead();
      var unread = notifs.filter(function(n) { return readArr.indexOf(n.id) === -1; });

      var badge = document.getElementById('notificationBadge');
      if (badge) {
        badge.textContent = unread.length;
        badge.style.display = unread.length > 0 ? 'inline-block' : 'none';
      }

      if (unread.length === 0) {
        listEl.innerHTML = '<div class="text-center text-muted p-4"><i class="fas fa-check-circle fa-3x mb-3 text-success d-block"></i><h6>لا توجد إشعارات جديدة</h6></div>';
        return;
      }

      listEl.innerHTML = '';
      unread.forEach(function(n) {
        var item = document.createElement('div');
        item.className = 'v6-notif-item';
        item.setAttribute('data-id', n.id);
        item.style.cssText = 'display:flex;align-items:flex-start;padding:10px 12px;gap:10px;border-bottom:1px solid #eee;transition:all 0.3s ease;';

        item.innerHTML = '<div style="flex-shrink:0;margin-top:3px;"><i class="' + n.icon + ' text-' + n.color + '" style="font-size:1.2rem;"></i></div>' +
          '<div style="flex:1;min-width:0;"><div style="font-weight:600;font-size:13px;margin-bottom:2px;">' + n.title + '</div>' +
          '<div style="font-size:12px;color:#666;">' + n.text + '</div></div>' +
          '<button class="btn btn-sm btn-outline-success v6-mark-read" title="تحديد كمقروء" style="flex-shrink:0;padding:4px 10px;font-size:12px;border-radius:8px;"><i class="fas fa-check"></i></button>';

        listEl.appendChild(item);

        item.querySelector('.v6-mark-read').addEventListener('click', function(e) {
          e.stopPropagation();
          addRead(n.id);
          item.style.opacity = '0';
          item.style.transform = 'translateX(-50px)';
          item.style.maxHeight = item.scrollHeight + 'px';
          setTimeout(function() {
            item.style.maxHeight = '0';
            item.style.padding = '0';
            item.style.margin = '0';
            item.style.borderWidth = '0';
            item.style.overflow = 'hidden';
            setTimeout(function() {
              if (item.parentNode) item.parentNode.removeChild(item);
              var remaining = listEl.querySelectorAll('.v6-notif-item').length;
              if (badge) { badge.textContent = remaining; badge.style.display = remaining > 0 ? 'inline-block' : 'none'; }
              if (remaining === 0) {
                listEl.innerHTML = '<div class="text-center text-muted p-4"><i class="fas fa-check-circle fa-3x mb-3 text-success d-block"></i><h6>لا توجد إشعارات جديدة</h6></div>';
              }
            }, 300);
          }, 300);
          window.showToast('تم تحديد الإشعار كمقروء ✅');
        });
      });
    }

    // إعادة ربط الجرس
    var newBell = bell.cloneNode(true);
    bell.parentNode.replaceChild(newBell, bell);
    newBell.addEventListener('click', function(e) {
      e.stopPropagation();
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      if (panel.style.display === 'block') render();
    });

    // إغلاق
    var closeBtn = document.getElementById('closeNotificationPanel');
    if (closeBtn) {
      var newClose = closeBtn.cloneNode(true);
      closeBtn.parentNode.replaceChild(newClose, closeBtn);
      newClose.addEventListener('click', function() { panel.style.display = 'none'; });
    }

    // تحديد الكل كمقروء
    var markAll = document.getElementById('markAllReadBtn');
    if (markAll) {
      var newMarkAll = markAll.cloneNode(true);
      markAll.parentNode.replaceChild(newMarkAll, markAll);
      newMarkAll.addEventListener('click', function() {
        gatherNotifs().forEach(function(n) { addRead(n.id); });
        render();
        window.showToast('تم تحديد جميع الإشعارات كمقروءة ✅');
      });
    }

    // إغلاق عند النقر خارجاً
    document.addEventListener('click', function(e) {
      if (!panel.contains(e.target) && e.target !== newBell && !newBell.contains(e.target)) {
        panel.style.display = 'none';
      }
    });

    // تحديث العداد عند التحميل
    setTimeout(render, 2500);
  }

  // ========================================================================
  // إصلاح 9: اعتراض التنقل
  // ========================================================================
  function fixNavigation() {
    document.querySelectorAll('.nav-link[data-module]').forEach(function(link) {
      link.addEventListener('click', function() {
        var moduleId = this.getAttribute('data-module');
        setTimeout(function() {
          if (moduleId === 'contracts') {
            renderContractsDirectly();
            fixContractFilters();
          } else if (moduleId === 'clients') {
            renderClientsDirectly();
          }
        }, 300);
      });
    });
  }

  // ========================================================================
  // إصلاح 10: ربط إضافة العقود والعملاء بالعرض المباشر
  // ========================================================================
  function patchSaveOperations() {
    // مراقبة saveData الأصلية - بعد كل حفظ، تحديث الجداول
    var origSaveData = window.saveData;
    if (typeof origSaveData === 'function') {
      window.saveData = function() {
        var result = origSaveData.apply(this, arguments);
        // بعد الحفظ، تحديث الجدول النشط
        setTimeout(refreshActiveModule, 200);
        return result;
      };
    }
  }

  // ========================================================================
  // إصلاح 11: editState
  // ========================================================================
  function fixEditState() {
    if (!window.editState) {
      window.editState = {};
    }
    ['employee','client','contract','service','dailyWork','dailyIncome','dailyExpense'].forEach(function(key) {
      if (!window.editState[key]) {
        window.editState[key] = { isEditMode: false, editIndex: -1 };
      }
    });
  }

  // ========================================================================
  // إصلاح 12: CSS إضافي
  // ========================================================================
  function addExtraStyles() {
    var s = document.createElement('style');
    s.textContent = '.v6-notif-item{transition:all 0.3s ease;overflow:hidden;}.v6-notif-item:hover{background:rgba(0,123,255,0.06);}' +
      '.v6-mark-read{opacity:0.7;transition:all 0.2s;}.v6-mark-read:hover{opacity:1;transform:scale(1.1);}' +
      '#notificationPanel{direction:rtl;max-height:400px;overflow-y:auto;}' +
      '.dark-mode .v6-notif-item:hover{background:rgba(255,255,255,0.06);}' +
      '.dark-mode .v6-notif-item{border-color:#444!important;color:#ddd;}' +
      '.dark-mode .v6-notif-item div[style*="color:#666"]{color:#aaa!important;}';
    document.head.appendChild(s);
  }

  // ========================================================================
  // التشغيل الرئيسي
  // ========================================================================
// (runAllFixes replaced by scheduleStart phases)

// (lateDataSync integrated into scheduleStart phase 3)

  // التشغيل
  function scheduleStart() {
    // المرحلة 1: إصلاحات فورية (toast, editState, dataArrays, saveData)
    setTimeout(function() {
      try { fixToastSystem(); } catch(e) { console.error('V6.2 Toast:', e); }
      try { addExtraStyles(); } catch(e) { console.error('V6.2 CSS:', e); }
      try { fixEditState(); } catch(e) { console.error('V6.2 EditState:', e); }
      try { fixDataArrays(); } catch(e) { console.error('V6.2 DataArrays:', e); }
      try { patchSaveOperations(); } catch(e) { console.error('V6.2 SavePatch:', e); }
      try { fixDailyWorkEdit(); } catch(e) { console.error('V6.2 DailyWork:', e); }
      console.log('✅ V6.2: المرحلة 1 - إصلاحات فورية');
    }, 600);

    // المرحلة 2: إصلاحات بعد تحميل البيانات (جداول + فلاتر + تنقل)
    setTimeout(function() {
      try { fixContractFilters(); } catch(e) { console.error('V6.2 ContractFilters:', e); }
      try { fixNavigation(); } catch(e) { console.error('V6.2 Navigation:', e); }
      try { startTableWatcher(); } catch(e) { console.error('V6.2 Watcher:', e); }
      try { refreshActiveModule(); } catch(e) { console.error('V6.2 Refresh:', e); }
      console.log('✅ V6.2: المرحلة 2 - جداول وفلاتر');
    }, 2000);

    // المرحلة 3: إشعارات (بعد bugfixes.js loadNotifications التي تعمل بعد 2 ثانية)
    setTimeout(function() {
      try { fixNotificationSystem(); } catch(e) { console.error('V6.2 Notifications:', e); }
      try { fixDataArrays(); } catch(e) {}
      try { refreshActiveModule(); } catch(e) {}
      console.log('✅ V6.2: المرحلة 3 - إشعارات + تحديث نهائي');
    }, 3500);
  }

  if (document.readyState === 'complete') {
    scheduleStart();
  } else {
    window.addEventListener('load', scheduleStart);
  }

})();
