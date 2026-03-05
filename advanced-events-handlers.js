/**
 * ===============================================
 * 🎯 SUPER_PRO SYSTEM - Advanced Events & Handlers
 * معالجات الأحداث المتقدمة v2.0 Pro+
 * ===============================================
 */

// ============================================
// 📅 فعاليات نظام الجدولة المتقدم
// ============================================

function initAdvancedScheduling() {
    // إضافة موعد جديد
    document.getElementById('saveEventBtn')?.addEventListener('click', function() {
        const eventData = {
            title: document.getElementById('eventTitle').value,
            date: document.getElementById('eventDate').value,
            startTime: document.getElementById('eventStartTime').value,
            endTime: document.getElementById('eventEndTime').value,
            location: document.getElementById('eventLocation')?.value,
            description: document.getElementById('eventDescription').value,
            assignees: getSelectedAssignees()
        };

        if (!eventData.title || !eventData.date) {
            showToast('يرجى ملء جميع الحقول المطلوبة', 'warning');
            return;
        }

        const newEvent = scheduling.addEvent(eventData);

        if (newEvent.conflict) {
            showToast(`⚠️ تحذير: هناك تضارب في الجدولة مع ${newEvent.conflictsWith.length} موعد آخر`, 'warning');
        } else {
            showToast('تم إضافة الموعد بنجاح', 'success');
        }

        // حفظ البيانات
        sessionStorage.setItem('scheduling_events', JSON.stringify(scheduling.events));
        const modal = bootstrap.Modal.getInstance(document.getElementById('eventModal'));
        modal?.hide();
        document.getElementById('eventForm').reset();
        loadScheduleData();
    });

    // تحميل بيانات الجدول
    loadScheduleData();

    // إرسال التنبيهات كل دقيقة
    setInterval(() => scheduling.sendReminders(), 60000);
}

function loadScheduleData() {
    const scheduleContainer = document.getElementById('scheduleContainer') || createScheduleContainer();
    scheduleContainer.innerHTML = '<div class="alert alert-info">جارٍ تحميل الجدول...</div>';

    const upcomingEvents = scheduling.events
        .filter(e => new Date(`${e.date}T${e.startTime}`) >= new Date())
        .sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`))
        .slice(0, 10);

    if (upcomingEvents.length === 0) {
        scheduleContainer.innerHTML = '<div class="alert alert-secondary">لا توجد مواعيد قادمة</div>';
        return;
    }

    let html = '<div class="list-group">';
    upcomingEvents.forEach(event => {
        const conflictClass = event.conflict ? 'border-warning' : '';
        const conflictBadge = event.conflict ? '<span class="badge bg-warning">تضارب</span>' : '';
        
        html += `
            <div class="list-group-item ${conflictClass}">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="mb-1">
                            <i class="fas fa-calendar-alt text-primary"></i> ${event.title}
                            ${conflictBadge}
                        </h6>
                        <p class="mb-1 text-muted">
                            <i class="fas fa-clock"></i> ${event.date} من ${event.startTime} إلى ${event.endTime}
                        </p>
                        ${event.location ? `<p class="mb-1 text-muted"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>` : ''}
                        <p class="mb-0 small">${event.description}</p>
                    </div>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editEvent('${event.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteEvent('${event.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    scheduleContainer.innerHTML = html;
}

function createScheduleContainer() {
    const container = document.createElement('div');
    container.id = 'scheduleContainer';
    container.className = 'card';
    container.innerHTML = '<div class="card-header">الجدول الزمني القادم</div><div class="card-body" id="scheduleContent"></div>';
    
    const calendar = document.getElementById('calendar');
    if (calendar) {
        calendar.appendChild(container);
    }
    return container;
}

function editEvent(eventId) {
    const event = scheduling.events.find(e => e.id === eventId);
    if (!event) return;

    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventStartTime').value = event.startTime;
    document.getElementById('eventEndTime').value = event.endTime;
    document.getElementById('eventDescription').value = event.description;

    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
}

function deleteEvent(eventId) {
    if (confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
        scheduling.events = scheduling.events.filter(e => e.id !== eventId);
        sessionStorage.setItem('scheduling_events', JSON.stringify(scheduling.events));
        loadScheduleData();
        showToast('تم حذف الموعد بنجاح', 'success');
    }
}

// ============================================
// 📦 فعاليات نظام إدارة المخزون
// ============================================

function initInventoryManagement() {
    // إضافة صنف مخزون
    document.getElementById('addInventoryItemBtn')?.addEventListener('click', function() {
        const itemData = {
            name: document.getElementById('inventoryItemName')?.value,
            sku: document.getElementById('inventorySKU')?.value,
            category: document.getElementById('inventoryCategory')?.value,
            quantity: parseFloat(document.getElementById('inventoryQuantity')?.value) || 0,
            minLevel: parseFloat(document.getElementById('inventoryMinLevel')?.value) || 5,
            maxLevel: parseFloat(document.getElementById('inventoryMaxLevel')?.value) || 100,
            unitCost: parseFloat(document.getElementById('inventoryUnitCost')?.value) || 0,
            location: document.getElementById('inventoryLocation')?.value,
            expiryDate: document.getElementById('inventoryExpiryDate')?.value,
            supplier: document.getElementById('inventorySupplier')?.value
        };

        if (!itemData.name || !itemData.sku) {
            showToast('يرجى ملء الحقول المطلوبة', 'warning');
            return;
        }

        const newItem = inventory.addItem(itemData);
        showToast('تم إضافة الصنف بنجاح. الباركود: ' + newItem.barcode, 'success');
        
        sessionStorage.setItem('inventory_items', JSON.stringify(inventory.items));
        document.getElementById('inventoryForm')?.reset();
        loadInventoryTable();
        checkInventoryAlerts();
    });

    // تسجيل حركة مخزون
    document.getElementById('recordMovementBtn')?.addEventListener('click', function() {
        const movementData = {
            itemId: document.getElementById('movementItem')?.value,
            type: document.getElementById('movementType')?.value,
            quantity: parseFloat(document.getElementById('movementQuantity')?.value),
            reason: document.getElementById('movementReason')?.value,
            processedBy: document.getElementById('movementProcessedBy')?.value,
            notes: document.getElementById('movementNotes')?.value
        };

        if (!movementData.itemId || !movementData.quantity) {
            showToast('يرجى ملء جميع الحقول', 'warning');
            return;
        }

        const movement = inventory.recordMovement(movementData);
        showToast('تم تسجيل الحركة بنجاح', 'success');
        
        sessionStorage.setItem('inventory_movements', JSON.stringify(inventory.movements));
        document.getElementById('movementForm')?.reset();
        loadInventoryTable();
        checkInventoryAlerts();
    });

    loadInventoryTable();
    checkInventoryAlerts();
}

function loadInventoryTable() {
    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (inventory.items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">لا توجد أصناف مخزون</td></tr>';
        return;
    }

    inventory.items.forEach((item, index) => {
        const statusClass = item.quantity <= item.minLevel ? 'table-danger' : 
                           item.quantity >= item.maxLevel ? 'table-warning' : 'table-success';
        
        const tr = document.createElement('tr');
        tr.className = statusClass;
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td><code>${item.barcode}</code></td>
            <td>${item.quantity}</td>
            <td>${item.minLevel}-${item.maxLevel}</td>
            <td>${item.unitCost} ر.ق</td>
            <td>${item.expiryDate || 'بلا تاريخ'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="showMovementForm('${item.id}')">
                    <i class="fas fa-arrows-alt-v"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteInventoryItem('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function checkInventoryAlerts() {
    const lowStockAlert = document.getElementById('lowStockAlert');
    const expiryAlert = document.getElementById('expiryAlert');

    if (lowStockAlert) {
        lowStockAlert.innerHTML = '';
        inventory.lowStockAlerts.forEach(alert => {
            lowStockAlert.innerHTML += `
                <div class="alert alert-${alert.severity === 'critical' ? 'danger' : 'warning'} alert-dismissible fade show">
                    <i class="fas fa-box"></i> ${alert.itemName}: ${alert.currentQuantity} (الحد الأدنى: ${alert.minLevel})
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
        });
    }

    if (expiryAlert) {
        const expiryAlerts = inventory.checkExpiryDates();
        expiryAlert.innerHTML = '';
        expiryAlerts.forEach(alert => {
            expiryAlert.innerHTML += `
                <div class="alert alert-${alert.severity === 'critical' ? 'danger' : 'warning'} alert-dismissible fade show">
                    <i class="fas fa-calendar-times"></i> ${alert.itemName}: ينتهي خلال ${alert.daysRemaining} يوم
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
        });
    }
}

function deleteInventoryItem(itemId) {
    if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
        inventory.items = inventory.items.filter(i => i.id !== itemId);
        sessionStorage.setItem('inventory_items', JSON.stringify(inventory.items));
        loadInventoryTable();
        showToast('تم حذف الصنف بنجاح', 'success');
    }
}

// ============================================
// 💰 فعاليات نظام الفواتير والدفع
// ============================================

function initInvoicing() {
    // إنشاء فاتورة
    document.getElementById('createInvoiceBtn')?.addEventListener('click', function() {
        const invoiceData = {
            clientName: document.getElementById('invoiceClientName')?.value,
            clientEmail: document.getElementById('invoiceClientEmail')?.value,
            clientPhone: document.getElementById('invoiceClientPhone')?.value,
            items: getInvoiceItems(),
            dueDate: document.getElementById('invoiceDueDate')?.value,
            notes: document.getElementById('invoiceNotes')?.value,
            terms: document.getElementById('invoiceTerms')?.value
        };

        if (!invoiceData.clientName || invoiceData.items.length === 0) {
            showToast('يرجى ملء البيانات الأساسية وإضافة عناصر', 'warning');
            return;
        }

        const invoice = invoicing.createInvoice(invoiceData);
        showToast(`تم إنشاء الفاتورة: ${invoice.invoiceNumber}`, 'success');
        
        sessionStorage.setItem('invoices', JSON.stringify(invoicing.invoices));
        document.getElementById('invoiceForm')?.reset();
        loadInvoectTable();
    });

    // تسجيل دفعة
    document.getElementById('recordPaymentBtn')?.addEventListener('click', function() {
        const paymentData = {
            invoiceId: document.getElementById('paymentInvoiceId')?.value,
            amount: parseFloat(document.getElementById('paymentAmount')?.value),
            method: document.getElementById('paymentMethod')?.value,
            reference: document.getElementById('paymentReference')?.value,
            notes: document.getElementById('paymentNotes')?.value
        };

        if (!paymentData.invoiceId || !paymentData.amount) {
            showToast('يرجى ملء جميع الحقول', 'warning');
            return;
        }

        const payment = invoicing.recordPayment(paymentData);
        showToast('تم تسجيل الدفعة بنجاح', 'success');
        
        sessionStorage.setItem('payments', JSON.stringify(invoicing.payments));
        document.getElementById('paymentForm')?.reset();
        loadInvoectTable();
    });

    loadInvoectTable();
    updateOverdueInvoices();
}

function getInvoiceItems() {
    const items = [];
    const itemRows = document.querySelectorAll('.invoice-item-row');
    
    itemRows.forEach(row => {
        const item = {
            description: row.querySelector('.item-description')?.value,
            quantity: parseFloat(row.querySelector('.item-quantity')?.value) || 0,
            unitPrice: parseFloat(row.querySelector('.item-unit-price')?.value) || 0,
            discount: parseFloat(row.querySelector('.item-discount')?.value) || 0
        };
        if (item.description && item.quantity) {
            items.push(item);
        }
    });

    return items;
}

function loadInvoectTable() {
    const tbody = document.getElementById('invoices-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (invoicing.invoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">لا توجد فواتير</td></tr>';
        return;
    }

    invoicing.invoices.forEach((invoice, index) => {
        const paidAmount = invoicing.getInvoicePaidAmount(invoice.id);
        const remaining = invoice.total - paidAmount;
        
        let statusColor = 'success';
        if (invoice.status === 'overdue') statusColor = 'danger';
        else if (invoice.status === 'partially_paid') statusColor = 'warning';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${invoice.invoiceNumber}</strong></td>
            <td>${invoice.clientName}</td>
            <td>${invoice.total} ر.ق</td>
            <td class="text-success">${paidAmount} ر.ق</td>
            <td class="text-danger">${remaining} ر.ق</td>
            <td>
                <span class="badge bg-${statusColor}">${invoice.status}</span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="sendInvoiceEmail('${invoice.id}')">
                    <i class="fas fa-envelope"></i>
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="printInvoice('${invoice.id}')">
                    <i class="fas fa-print"></i>
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="viewInvoice('${invoice.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function sendInvoiceEmail(invoiceId) {
    const invoice = invoicing.invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    const emailData = invoicing.sendInvoiceEmail(invoiceId, invoice.clientEmail);
    showToast(`تم إرسال الفاتورة إلى ${invoice.clientEmail}`, 'success');
    sessionStorage.setItem('invoices', JSON.stringify(invoicing.invoices));
}

function printInvoice(invoiceId) {
    const invoice = invoicing.invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    const html = invoicing.generateInvoiceHTML(invoice);
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>طباعة الفاتورة</title>');
    printWindow.document.write('<style>body { font-family: Arial, sans-serif; direction: rtl; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(html);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

function updateOverdueInvoices() {
    const overdueContainer = document.getElementById('overdueInvoices');
    if (!overdueContainer) return;

    const overdueList = invoicing.getOverdueInvoices();
    overdueContainer.innerHTML = '';

    if (overdueList.length === 0) {
        overdueContainer.innerHTML = '<div class="alert alert-success">لا توجد فواتير متأخرة</div>';
        return;
    }

    overdueList.forEach(invoice => {
        overdueContainer.innerHTML += `
            <div class="alert alert-danger alert-dismissible fade show">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>${invoice.invoiceNumber}</strong> - ${invoice.clientName}
                متأخرة منذ ${invoice.daysOverdue} يوم - ${invoice.amount} ر.ق
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    });
}

// ============================================
// 📍 فعاليات نظام GPS والتتبع
// ============================================

function initGPSTracking() {
    // بدء تتبع الموظف
    document.getElementById('startGPSTrackingBtn')?.addEventListener('click', function() {
        const employeeId = document.getElementById('trackingEmployeeId')?.value;

        if (!employeeId) {
            showToast('يرجى اختيار موظف', 'warning');
            return;
        }

        // طلب إذن الموقع
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition((position) => {
                const { latitude, longitude } = position.coords;
                const location = gpsTracking.trackEmployeeLocation(employeeId, latitude, longitude);
                
                // تحديث الخريطة
                updateMapLocation(latitude, longitude, employeeId);
                
                sessionStorage.setItem('gps_locations', JSON.stringify(gpsTracking.locations));
            }, (error) => {
                showToast('خطأ في الحصول على الموقع: ' + error.message, 'error');
            });
        } else {
            showToast('المتصفح لا يدعم GPS', 'warning');
        }
    });

    // تحسين التوجيه
    document.getElementById('optimizeRouteBtn')?.addEventListener('click', function() {
        const employeeId = document.getElementById('routeEmployeeId')?.value;
        const stops = getRouteStops();

        if (!employeeId || stops.length < 2) {
            showToast('يرجى اختيار موظف وإضافة الأقل محطتين', 'warning');
            return;
        }

        const optimizedRoute = gpsTracking.optimizeRoute(employeeId, stops);
        showToast(`تم تحسين المسار: ${optimizedRoute.totalDistance.toFixed(2)} كم، ${optimizedRoute.estimatedTime} دقيقة`, 'success');
        
        sessionStorage.setItem('gps_routes', JSON.stringify(gpsTracking.routes));
        displayOptimizedRoute(optimizedRoute);
    });

    // إنشاء جيوفنس
    document.getElementById('createGeofenceBtn')?.addEventListener('click', function() {
        const geofenceData = {
            name: document.getElementById('geofenceName')?.value,
            latitude: parseFloat(document.getElementById('geofenceLatitude')?.value),
            longitude: parseFloat(document.getElementById('geofenceLongitude')?.value),
            radius: parseFloat(document.getElementById('geofenceRadius')?.value) || 100
        };

        if (!geofenceData.name || !geofenceData.latitude || !geofenceData.longitude) {
            showToast('يرجى ملء جميع البيانات', 'warning');
            return;
        }

        const geofence = gpsTracking.createGeofence(geofenceData);
        showToast('تم إنشاء الحد الجغرافي بنجاح', 'success');
        
        sessionStorage.setItem('gps_geofences', JSON.stringify(gpsTracking.geofences));
        loadGeofencesMap();
    });

    loadGeofencesMap();
}

function updateMapLocation(latitude, longitude, employeeId) {
    // يمكن استخدام خريطة مثل Google Maps أو Leaflet
    const mapContainer = document.getElementById('gpsMap');
    if (mapContainer) {
        mapContainer.innerHTML += `
            <div class="alert alert-info">
                📍 موقع الموظف: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}
            </div>
        `;
    }
}

function displayOptimizedRoute(route) {
    const routeContainer = document.getElementById('optimizedRouteContainer');
    if (!routeContainer) return;

    let html = `
        <div class="card">
            <div class="card-header">المسار المحسّن</div>
            <div class="card-body">
                <p><strong>المسافة الكلية:</strong> ${route.totalDistance.toFixed(2)} كم</p>
                <p><strong>الوقت المقدر:</strong> ${route.estimatedTime} دقيقة</p>
                <h6>التوقفات بالترتيب:</h6>
                <ol>
    `;

    route.stops.forEach((stop, index) => {
        html += `<li>${stop.name} - ${stop.latitude.toFixed(4)}, ${stop.longitude.toFixed(4)}</li>`;
    });

    html += '</ol></div></div>';
    routeContainer.innerHTML = html;
}

function loadGeofencesMap() {
    const geofenceList = document.getElementById('geofencesList');
    if (!geofenceList) return;

    geofenceList.innerHTML = '';

    if (gpsTracking.geofences.length === 0) {
        geofenceList.innerHTML = '<div class="alert alert-secondary">لا توجد حدود جغرافية</div>';
        return;
    }

    gpsTracking.geofences.forEach(geo => {
        geofenceList.innerHTML += `
            <div class="card mb-2">
                <div class="card-body">
                    <h6>${geo.name}</h6>
                    <p class="small text-muted mb-0">
                        📍 ${geo.latitude.toFixed(4)}, ${geo.longitude.toFixed(4)} - نطاق: ${geo.radius}م
                    </p>
                </div>
            </div>
        `;
    });
}

// ============================================
// 📄 فعاليات نظام إدارة المستندات
// ============================================

function initDocumentManagement() {
    // رفع مستند
    document.getElementById('uploadDocumentBtn')?.addEventListener('click', function() {
        const fileInput = document.getElementById('documentFile');
        const file = fileInput?.files[0];

        if (!file) {
            showToast('يرجى اختيار ملف', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const docData = {
                name: file.name,
                type: document.getElementById('documentType')?.value,
                size: file.size,
                fileUrl: e.target.result,
                uploadedBy: document.getElementById('documentUploadedBy')?.value,
                relatedTo: document.getElementById('documentRelatedTo')?.value,
                tags: (document.getElementById('documentTags')?.value || '').split(',')
            };

            const doc = docManagement.uploadDocument(docData);
            showToast('تم رفع المستند بنجاح', 'success');
            
            sessionStorage.setItem('documents', JSON.stringify(docManagement.documents));
            fileInput.value = '';
            loadDocumentsTable();
        };
        reader.readAsDataURL(file);
    });

    // التوقيع الرقمي
    document.getElementById('signDocumentBtn')?.addEventListener('click', function() {
        const docId = document.getElementById('signatureDocId')?.value;
        const signerName = document.getElementById('signerName')?.value;
        const signerEmail = document.getElementById('signerEmail')?.value;

        if (!docId || !signerName) {
            showToast('يرجى ملء البيانات المطلوبة', 'warning');
            return;
        }

        // الحصول على الموقع الحالي
        navigator.geolocation.getCurrentPosition((position) => {
            const signerData = {
                signerName,
                signerEmail,
                signatureImage: getSignatureCanvas(),
                ipAddress: 'N/A',
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            const signature = docManagement.signDocument(docId, signerData);
            showToast('تم التوقيع على المستند بنجاح', 'success');
            
            sessionStorage.setItem('signatures', JSON.stringify(docManagement.signatures));
            loadDocumentsTable();
        });
    });

    loadDocumentsTable();
}

function loadDocumentsTable() {
    const tbody = document.getElementById('documents-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (docManagement.documents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">لا توجد مستندات</td></tr>';
        return;
    }

    docManagement.documents.forEach((doc, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${doc.name}</td>
            <td><span class="badge bg-info">${doc.type}</span></td>
            <td>${doc.uploadedBy}</td>
            <td>${doc.signed ? '<span class="badge bg-success">موقع</span>' : '<span class="badge bg-warning">قيد الانتظار</span>'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="downloadDocument('${doc.id}')">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="viewDocument('${doc.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getSignatureCanvas() {
    // يمكن استخدام مكتبة signature_pad
    return 'signature_data_base64';
}

function downloadDocument(docId) {
    const doc = docManagement.documents.find(d => d.id === docId);
    if (!doc) return;

    const a = document.createElement('a');
    a.href = doc.fileUrl;
    a.download = doc.name;
    a.click();
}

// ============================================
// 📊 فعاليات نظام التقارير والتحليلات
// ============================================

function initAdvancedReporting() {
    // تحديث التقارير
    document.getElementById('updateReportBtn')?.addEventListener('click', function() {
        const dateRange = {
            start: new Date(document.getElementById('reportStartDate')?.value),
            end: new Date(document.getElementById('reportEndDate')?.value)
        };

        const filterData = {
            totalIncome: calculateTotalIncome(dateRange),
            totalExpenses: calculateTotalExpenses(dateRange),
            currentMonthIncome: calculateMonthlyIncome(new Date().getMonth()),
            previousMonthIncome: calculateMonthlyIncome(new Date().getMonth() - 1),
            newCustomers: customers.filter(c => isInDateRange(c.createdAt, dateRange)).length,
            totalCustomers: customers.length,
            returnCustomers: 0, // يتم حسابه من البيانات
            avgRating: calculateAverageRating(),
            totalWork: dailyWork.length,
            employeeCount: employees.length,
            departedEmployees: 0,
            totalEmployees: employees.length,
            completedOnTime: contracts.filter(c => c.status === 'منتهي').length,
            totalJobs: contracts.length,
            totalJobHours: calculateTotalJobHours(),
            totalCost: calculateTotalCost()
        };

        const kpis = reporting.calculateKPIs(filterData);
        const report = reporting.generateComprehensiveReport(dateRange, filterData);

        displayKPIs(kpis);
        displayComprehensiveReport(report);

        showToast('تم تحديث التقرير بنجاح', 'success');
    });

    // تصدير التقرير
    document.getElementById('exportReportBtn')?.addEventListener('click', function() {
        const format = document.getElementById('reportFormat')?.value || 'json';
        const report = reporting.reports[reporting.reports.length - 1];

        if (!report) {
            showToast('يرجى إنشاء تقرير أولاً', 'warning');
            return;
        }

        const exported = reporting.exportReport(report, format);
        downloadReport(exported, format);
        showToast('تم تصدير التقرير بنجاح', 'success');
    });
}

function displayKPIs(kpis) {
    const container = document.getElementById('kpisContainer');
    if (!container) return;

    let html = '<div class="row g-3">';
    
    html += createKPICard('الإيرادات الكلية', kpis.totalRevenue, 'money-bill-wave', 'success');
    html += createKPICard('نمو الإيرادات', kpis.revenueGrowth + '%', 'arrow-up', kpis.revenueGrowth > 0 ? 'success' : 'danger');
    html += createKPICard('استحواذ العملاء', kpis.customerAcquisition, 'user-plus', 'info');
    html += createKPICard('الاحتفاظ بالعملاء', kpis.customerRetention + '%', 'users', 'primary');
    html += createKPICard('رضا العملاء', kpis.customerSatisfaction + '/5', 'star', 'warning');
    html += createKPICard('إنتاجية الموظفين', kpis.employeeProductivity, 'chart-line', 'info');
    html += createKPICard('الإنجاز في الموعد', (kpis.onTimeCompletion * 100).toFixed(1) + '%', 'clock', 'success');
    html += createKPICard('كفاءة التكاليف', kpis.costEfficiency.toFixed(2), 'piggy-bank', 'info');
    
    html += '</div>';
    container.innerHTML = html;
}

function createKPICard(title, value, icon, color) {
    return `
        <div class="col-md-3">
            <div class="card bg-light">
                <div class="card-body text-center">
                    <i class="fas fa-${icon} fa-2x text-${color} mb-3"></i>
                    <h6 class="card-title text-muted">${title}</h6>
                    <h3 class="text-${color}">${value}</h3>
                </div>
            </div>
        </div>
    `;
}

function displayComprehensiveReport(report) {
    const container = document.getElementById('reportContainer');
    if (!container) return;

    let html = '<div class="card"><div class="card-body">';
    html += '<h5>التقرير الشامل</h5>';
    html += '<h6 class="mt-3">التوصيات:</h6>';
    html += '<ul>';
    
    report.recommendations.forEach(rec => {
        const priorityColor = rec.priority === 'high' ? 'danger' : rec.priority === 'medium' ? 'warning' : 'info';
        html += `
            <li class="alert alert-${priorityColor} mb-2">
                <strong>${rec.category}</strong>: ${rec.message}
            </li>
        `;
    });
    
    html += '</ul></div></div>';
    container.innerHTML = html;
}

function downloadReport(exported, format) {
    let content, filename;

    if (format === 'json') {
        content = JSON.stringify(exported, null, 2);
        filename = 'report.json';
    } else if (format === 'csv') {
        content = convertToCSV(exported);
        filename = 'report.csv';
    } else {
        content = JSON.stringify(exported);
        filename = 'report.txt';
    }

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// ============================================
// 🔧 دوال مساعدة
// ============================================

function getSelectedAssignees() {
    const selected = document.querySelectorAll('.assignee-checkbox:checked');
    const assignees = [];
    selected.forEach(checkbox => {
        assignees.push({
            id: checkbox.value,
            name: checkbox.dataset.name
        });
    });
    return assignees;
}

function getRouteStops() {
    const stops = [];
    document.querySelectorAll('.route-stop-row').forEach(row => {
        const stop = {
            name: row.querySelector('.stop-name')?.value,
            latitude: parseFloat(row.querySelector('.stop-latitude')?.value),
            longitude: parseFloat(row.querySelector('.stop-longitude')?.value)
        };
        if (stop.name && stop.latitude && stop.longitude) {
            stops.push(stop);
        }
    });
    return stops;
}

function calculateTotalIncome(dateRange) {
    return dailyIncome
        .filter(i => isInDateRange(i.date, dateRange))
        .reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
}

function calculateTotalExpenses(dateRange) {
    return dailyExpenses
        .filter(e => isInDateRange(e.date, dateRange))
        .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
}

function calculateMonthlyIncome(month) {
    const now = new Date();
    return dailyIncome
        .filter(i => {
            const incomeMonth = new Date(i.date).getMonth();
            return incomeMonth === month;
        })
        .reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
}

function calculateAverageRating() {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((total, r) => total + (parseFloat(r.score) || 0), 0);
    return (sum / ratings.length).toFixed(1);
}

function calculateTotalJobHours() {
    return dailyWork.reduce((sum, work) => sum + (parseFloat(work.totalHours) || 0), 0);
}

function calculateTotalCost() {
    return dailyExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
}

function isInDateRange(dateStr, range) {
    const date = new Date(dateStr);
    return date >= range.start && date <= range.end;
}

function convertToCSV(data) {
    return JSON.stringify(data).split('},{').join('}\n{');
}

// ============================================
// ⚙️ تهيئة جميع الأنظمة عند تحميل الصفحة
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // استعادة البيانات من sessionStorage
    scheduling.events = JSON.parse(sessionStorage.getItem('scheduling_events') || '[]');
    inventory.items = JSON.parse(sessionStorage.getItem('inventory_items') || '[]');
    inventory.movements = JSON.parse(sessionStorage.getItem('inventory_movements') || '[]');
    invoicing.invoices = JSON.parse(sessionStorage.getItem('invoices') || '[]');
    invoicing.payments = JSON.parse(sessionStorage.getItem('payments') || '[]');
    gpsTracking.locations = JSON.parse(sessionStorage.getItem('gps_locations') || '[]');
    gpsTracking.routes = JSON.parse(sessionStorage.getItem('gps_routes') || '[]');
    gpsTracking.geofences = JSON.parse(sessionStorage.getItem('gps_geofences') || '[]');
    docManagement.documents = JSON.parse(sessionStorage.getItem('documents') || '[]');
    docManagement.signatures = JSON.parse(sessionStorage.getItem('signatures') || '[]');

    // تهيئة الأنظمة
    if (document.getElementById('eventModal')) {
        initAdvancedScheduling();
    }
    if (document.getElementById('inventoryForm')) {
        initInventoryManagement();
    }
    if (document.getElementById('invoiceForm')) {
        initInvoicing();
    }
    if (document.getElementById('gpsMap')) {
        initGPSTracking();
    }
    if (document.getElementById('documentFile')) {
        initDocumentManagement();
    }
    if (document.getElementById('kpisContainer')) {
        initAdvancedReporting();
    }
});
