/**
 * ===============================================
 * معالجات الأحداث للأنظمة المتقدمة
 * Advanced Event Handlers v2.0 Pro+
 * ===============================================
 */

// ============================================
// 🕐 معالجات نظام الجدولة والمواعيد
// ============================================
function setupSchedulingHandlers() {
    // إضافة موعد جديد
    document.getElementById('schedulingAddBtn')?.addEventListener('click', function() {
        const eventData = {
            title: document.getElementById('scheduleTitle').value,
            date: document.getElementById('scheduleDate').value,
            startTime: document.getElementById('scheduleStartTime').value,
            endTime: document.getElementById('scheduleEndTime').value,
            location: document.getElementById('scheduleLocation').value,
            assignees: getSelectedEmployees('scheduleAssignees'),
            description: document.getElementById('scheduleDescription').value,
            reminders: getSelectedReminders(),
            recurringPattern: document.getElementById('scheduleRecurring').value
        };

        const event = scheduling.addEvent(eventData);

        if (event.conflict) {
            showToast('⚠️ تحذير: هناك تضارب مع مواعيد أخرى', 'warning');
        } else {
            showToast('✅ تم إضافة الموعد بنجاح', 'success');
        }

        // إعادة تحميل التقويم
        loadSchedulingCalendar();
        document.getElementById('scheduleForm').reset();
    });

    // الحصول على التنبيهات المختارة
    function getSelectedReminders() {
        const reminders = [];
        document.querySelectorAll('input[name="reminders"]:checked').forEach(cb => {
            reminders.push(parseInt(cb.value));
        });
        return reminders.length > 0 ? reminders : [24, 1];
    }

    // تحميل التقويم
    function loadSchedulingCalendar() {
        const calendarContainer = document.getElementById('schedulingCalendar');
        if (!calendarContainer) return;

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        let html = `<h5>${currentDate.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}</h5>`;
        html += '<div class="calendar-grid">';

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        for (let i = 0; i < firstDay.getDay(); i++) {
            html += '<div class="calendar-empty"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = scheduling.events.filter(e => e.date === date);

            html += `
                <div class="calendar-day ${dayEvents.length > 0 ? 'has-events' : ''}">
                    <div class="day-number">${day}</div>
                    <div class="day-events">
                        ${dayEvents.slice(0, 2).map(e => `<span class="event-badge">${e.title}</span>`).join('')}
                        ${dayEvents.length > 2 ? `<span class="more-events">+${dayEvents.length - 2}</span>` : ''}
                    </div>
                </div>
            `;
        }

        html += '</div>';
        calendarContainer.innerHTML = html;
    }

    // بدء التنبيهات التلقائية
    setInterval(() => {
        scheduling.sendReminders();
    }, 60000); // كل دقيقة
}

// ============================================
// 📦 معالجات نظام إدارة المخزون
// ============================================
function setupInventoryHandlers() {
    // إضافة صنف مخزون جديد
    document.getElementById('inventoryAddBtn')?.addEventListener('click', function() {
        const itemData = {
            name: document.getElementById('inventoryName').value,
            sku: document.getElementById('inventorySKU').value,
            category: document.getElementById('inventoryCategory').value,
            quantity: parseInt(document.getElementById('inventoryQuantity').value) || 0,
            minLevel: parseInt(document.getElementById('inventoryMinLevel').value) || 5,
            maxLevel: parseInt(document.getElementById('inventoryMaxLevel').value) || 100,
            unitCost: parseFloat(document.getElementById('inventoryUnitCost').value) || 0,
            location: document.getElementById('inventoryLocation').value,
            expiryDate: document.getElementById('inventoryExpiryDate').value,
            supplier: document.getElementById('inventorySupplier').value
        };

        inventory.addItem(itemData);
        showToast('✅ تم إضافة الصنف بنجاح', 'success');

        updateInventoryTable();
        document.getElementById('inventoryForm').reset();
    });

    // تسجيل حركة مخزون
    document.getElementById('recordMovementBtn')?.addEventListener('click', function() {
        const movementData = {
            itemId: document.getElementById('movementItem').value,
            type: document.getElementById('movementType').value,
            quantity: parseInt(document.getElementById('movementQuantity').value),
            reason: document.getElementById('movementReason').value,
            processedBy: document.getElementById('movementBy').value,
            notes: document.getElementById('movementNotes').value
        };

        inventory.recordMovement(movementData);
        showToast('✅ تم تسجيل الحركة بنجاح', 'success');

        updateInventoryTable();
        checkInventoryAlerts();
    });

    // عرض جدول المخزون
    function updateInventoryTable() {
        const tbody = document.getElementById('inventoryTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        inventory.items.forEach((item, index) => {
            const statusClass = item.quantity <= item.minLevel ? 'low-stock' : 'normal-stock';
            const expiryStatus = item.expiryDate && new Date(item.expiryDate) < new Date() ? 'expired' : '';

            tbody.innerHTML += `
                <tr class="${statusClass} ${expiryStatus}">
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.sku}</td>
                    <td>${item.category}</td>
                    <td class="font-weight-bold">${item.quantity}/${item.maxLevel}</td>
                    <td>${item.unitCost} ر.ق</td>
                    <td>${(item.quantity * item.unitCost).toFixed(2)} ر.ق</td>
                    <td>${item.location}</td>
                    <td>${item.expiryDate || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="recordItemMovement('${item.id}')">
                            <i class="fas fa-exchange-alt"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteInventoryItem('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    // التحقق من تنبيهات المخزون
    function checkInventoryAlerts() {
        const alertsContainer = document.getElementById('inventoryAlerts');
        if (!alertsContainer) return;

        const allAlerts = [
            ...inventory.lowStockAlerts,
            ...inventory.checkExpiryDates()
        ];

        alertsContainer.innerHTML = allAlerts.map(alert => `
            <div class="alert alert-${alert.severity === 'critical' ? 'danger' : 'warning'} alert-dismissible">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${alert.itemName}: ${alert.currentQuantity || ''} ${alert.daysRemaining ? `(${alert.daysRemaining} يوم)` : ''}
                <button class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `).join('');
    }

    // تقرير المخزون
    document.getElementById('inventoryReportBtn')?.addEventListener('click', function() {
        const report = inventory.getInventoryReport();
        const exportData = inventory.exportInventory();

        console.log('📊 تقرير المخزون:', report);
        showToast(`📊 إجمالي القيمة: ${(report.totalValue).toFixed(2)} ر.ق`, 'info');

        // تصدير JSON
        downloadJSON(exportData, 'inventory-backup.json');
    });

    // تحميل الجدول عند البدء
    updateInventoryTable();
}

// ============================================
// 💰 معالجات نظام الفواتير والدفع
// ============================================
function setupInvoicingHandlers() {
    // إنشاء فاتورة جديدة
    document.getElementById('createInvoiceBtn')?.addEventListener('click', function() {
        const items = document.querySelectorAll('.invoice-item');
        const invoiceItems = [];

        items.forEach(item => {
            invoiceItems.push({
                description: item.querySelector('.itemDescription').value,
                quantity: parseInt(item.querySelector('.itemQuantity').value),
                unitPrice: parseFloat(item.querySelector('.itemUnitPrice').value),
                discount: parseFloat(item.querySelector('.itemDiscount').value) || 0
            });
        });

        const invoiceData = {
            clientName: document.getElementById('invoiceClientName').value,
            clientEmail: document.getElementById('invoiceClientEmail').value,
            clientPhone: document.getElementById('invoiceClientPhone').value,
            items: invoiceItems,
            dueDate: document.getElementById('invoiceDueDate').value,
            notes: document.getElementById('invoiceNotes').value,
            terms: document.getElementById('invoiceTerms').value
        };

        const invoice = invoicing.createInvoice(invoiceData);
        showToast(`✅ تم إنشاء الفاتورة: ${invoice.invoiceNumber}`, 'success');

        // عرض الفاتورة
        displayInvoicePreview(invoice);
        updateInvoicesTable();
    });

    // معالجة الدفعات
    document.getElementById('recordPaymentBtn')?.addEventListener('click', function() {
        const paymentData = {
            invoiceId: document.getElementById('paymentInvoiceId').value,
            amount: parseFloat(document.getElementById('paymentAmount').value),
            method: document.getElementById('paymentMethod').value,
            reference: document.getElementById('paymentReference').value,
            notes: document.getElementById('paymentNotes').value
        };

        invoicing.recordPayment(paymentData);
        showToast('✅ تم تسجيل الدفعة بنجاح', 'success');

        updateInvoicesTable();
        document.getElementById('paymentForm').reset();
    });

    // إرسال الفاتورة بالبريد
    function sendInvoiceEmail(invoiceId) {
        const invoice = invoicing.invoices.find(i => i.id === invoiceId);
        if (!invoice) return;

        const email = prompt('أدخل البريد الإلكتروني:', invoice.clientEmail);
        if (email) {
            invoicing.sendInvoiceEmail(invoiceId, email);
            showToast(`✅ تم إرسال الفاتورة إلى ${email}`, 'success');
        }
    }

    // عرض معاينة الفاتورة
    function displayInvoicePreview(invoice) {
        const previewHtml = invoicing.generateInvoiceHTML(invoice);
        const previewWindow = window.open('', '', 'width=900,height=600');
        previewWindow.document.write(previewHtml);
        previewWindow.document.close();
    }

    // جدول الفواتير
    function updateInvoicesTable() {
        const tbody = document.getElementById('invoicesTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        invoicing.invoices.slice(-20).reverse().forEach((invoice, index) => {
            const paidAmount = invoicing.getInvoicePaidAmount(invoice.id);
            const remaining = invoice.total - paidAmount;

            tbody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${invoice.invoiceNumber}</td>
                    <td>${invoice.clientName}</td>
                    <td>${invoice.total.toFixed(2)} ر.ق</td>
                    <td class="text-success">${paidAmount.toFixed(2)} ر.ق</td>
                    <td class="text-danger">${remaining.toFixed(2)} ر.ق</td>
                    <td>${invoice.dueDate}</td>
                    <td>
                        <span class="badge bg-${invoice.status === 'paid' ? 'success' : 
                                              invoice.status === 'partially_paid' ? 'warning' : 'danger'}">
                            ${invoice.status}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="displayInvoicePreview(${JSON.stringify(invoice).replace(/"/g, '&quot;')})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="sendInvoiceEmail('${invoice.id}')">
                            <i class="fas fa-envelope"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    // التنبيهات المتأخرة
    function showOverdueAlerts() {
        const overdueList = invoicing.getOverdueInvoices();
        const alertsDiv = document.getElementById('overdueAlerts');

        if (alertsDiv) {
            alertsDiv.innerHTML = overdueList.map(invoice => `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    فاتورة متأخرة: ${invoice.invoiceNumber} للعميل ${invoice.clientName}
                    (${invoice.daysOverdue} يوم، ${invoice.amount.toFixed(2)} ر.ق)
                </div>
            `).join('');
        }
    }

    // تقرير الفواتير
    document.getElementById('invoiceReportBtn')?.addEventListener('click', function() {
        const dateRange = {
            start: new Date(document.getElementById('reportFromDate').value),
            end: new Date(document.getElementById('reportToDate').value)
        };

        const report = invoicing.getInvoiceReport(dateRange);
        console.log('📊 تقرير الفواتير:', report);
        showToast(`📊 الإجمالي المصدر: ${report.totalIssued.toFixed(2)} ر.ق`, 'info');
    });

    updateInvoicesTable();
    showOverdueAlerts();
}

// ============================================
// 👥 معالجات إدارة العملاء المتقدمة
// ============================================
function setupAdvancedCustomerHandlers() {
    // إضافة عميل متقدم
    document.getElementById('addAdvancedCustomerBtn')?.addEventListener('click', function() {
        const customerData = {
            name: document.getElementById('customerName').value,
            email: document.getElementById('customerEmail').value,
            phone: document.getElementById('customerPhone').value,
            company: document.getElementById('customerCompany').value,
            address: document.getElementById('customerAddress').value,
            notes: document.getElementById('customerNotes').value
        };

        const customer = customerMgtAdvanced.addCustomer(customerData);
        showToast('✅ تم إضافة العميل بنجاح', 'success');

        updateCustomersList();
        document.getElementById('customerForm').reset();
    });

    // تسجيل تفاعل مع العميل
    document.getElementById('recordInteractionBtn')?.addEventListener('click', function() {
        const interactionData = {
            customerId: document.getElementById('interactionCustomerId').value,
            type: document.getElementById('interactionType').value,
            notes: document.getElementById('interactionNotes').value,
            duration: document.getElementById('interactionDuration').value,
            outcome: document.getElementById('interactionOutcome').value,
            nextFollowUp: document.getElementById('interactionFollowUp').value
        };

        customerMgtAdvanced.recordInteraction(interactionData);
        showToast('✅ تم تسجيل التفاعل بنجاح', 'success');
    });

    // قائمة العملاء
    function updateCustomersList() {
        const tbody = document.getElementById('customersTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        customerMgtAdvanced.customers.forEach((customer, index) => {
            const segmentBadge = {
                vip: 'danger',
                standard: 'info',
                inactive: 'secondary'
            }[customer.segment];

            tbody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${customer.name}</td>
                    <td>${customer.email}</td>
                    <td>${customer.phone}</td>
                    <td>${customer.company || '-'}</td>
                    <td><span class="badge bg-${segmentBadge}">${customer.segment}</span></td>
                    <td>${customer.lifetimeValue.toFixed(2)} ر.ق</td>
                    <td>${customer.orderCount} طلب</td>
                    <td>
                        <button class="btn btn-sm btn-info" onclick="viewCustomerHistory('${customer.id}')">
                            <i class="fas fa-history"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    // سجل العميل
    function viewCustomerHistory(customerId) {
        const history = customerMgtAdvanced.getCustomerServiceHistory(customerId);
        const customer = customerMgtAdvanced.customers.find(c => c.id === customerId);

        let html = `
            <h5>سجل الخدمات - ${customer.name}</h5>
            <table class="table">
                <thead>
                    <tr>
                        <th>التاريخ</th>
                        <th>نوع الخدمة</th>
                        <th>الملاحظات</th>
                        <th>النتيجة</th>
                    </tr>
                </thead>
                <tbody>
        `;

        history.forEach(interaction => {
            html += `
                <tr>
                    <td>${new Date(interaction.date).toLocaleDateString('ar-SA')}</td>
                    <td>${interaction.type}</td>
                    <td>${interaction.notes}</td>
                    <td>${interaction.outcome}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">سجل الخدمات</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">${html}</div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        new bootstrap.Modal(modal).show();
    }

    // تقرير العملاء
    document.getElementById('customerReportBtn')?.addEventListener('click', function() {
        const report = customerMgtAdvanced.getCustomerReport();
        console.log('👥 تقرير العملاء:', report);
        showToast(`👥 إجمالي القيمة: ${(report.totalValue).toFixed(2)} ر.ق`, 'info');
    });

    updateCustomersList();
}

// ============================================
// 📍 معالجات نظام GPS والتتبع
// ============================================
function setupGPSTrackingHandlers() {
    // تتبع موقع الموظف
    if (navigator.geolocation) {
        const gpsInterval = setInterval(() => {
            navigator.geolocation.getCurrentPosition((position) => {
                const employeeId = document.getElementById('gpsEmployeeSelect').value;

                if (employeeId) {
                    gpsTracking.trackEmployeeLocation(
                        employeeId,
                        position.coords.latitude,
                        position.coords.longitude
                    );

                    // عرض الموقع على الخريطة
                    updateGPSMap(position.coords);
                }
            });
        }, 30000); // كل 30 ثانية
    }

    // تحسين المسار
    document.getElementById('optimizeRouteBtn')?.addEventListener('click', function() {
        const stops = getRouteStops();
        const employeeId = document.getElementById('routeEmployeeSelect').value;

        const optimizedRoute = gpsTracking.optimizeRoute(employeeId, stops);
        showToast(`✅ تم تحسين المسار (${optimizedRoute.totalDistance.toFixed(2)} كم)`, 'success');

        displayRouteInfo(optimizedRoute);
    });

    // عرض خريطة GPS
    function updateGPSMap(coords) {
        const mapDiv = document.getElementById('gpsMap');
        if (!mapDiv) return;

        mapDiv.innerHTML = `
            <div class="map-container">
                <div class="map-center">
                    📍 ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}
                </div>
                <div class="map-info">
                    <p>الدقة: ±${coords.accuracy.toFixed(0)} متر</p>
                    <p>السرعة: ${(coords.speed || 0).toFixed(0)} م/ث</p>
                </div>
            </div>
        `;
    }

    // معلومات المسار
    function displayRouteInfo(route) {
        const infoDiv = document.getElementById('routeInfo');
        if (!infoDiv) return;

        infoDiv.innerHTML = `
            <h6>معلومات المسار</h6>
            <p><strong>المسافة الإجمالية:</strong> ${route.totalDistance.toFixed(2)} كم</p>
            <p><strong>الوقت المقدر:</strong> ${route.estimatedTime} دقيقة</p>
            <p><strong>عدد المحطات:</strong> ${route.stops.length}</p>
            <div class="progress">
                <div class="progress-bar" style="width: 100%">تم التحسين</div>
            </div>
        `;
    }

    // الحصول على محطات المسار
    function getRouteStops() {
        const stops = [];
        document.querySelectorAll('.route-stop').forEach(stop => {
            stops.push({
                name: stop.querySelector('.stopName').textContent,
                latitude: parseFloat(stop.querySelector('.stopLat').value),
                longitude: parseFloat(stop.querySelector('.stopLng').value),
                address: stop.querySelector('.stopAddress').textContent
            });
        });
        return stops;
    }

    // تقرير الحركة
    document.getElementById('movementReportBtn')?.addEventListener('click', function() {
        const employeeId = document.getElementById('gpsEmployeeSelect').value;
        const dateRange = {
            start: new Date(document.getElementById('movementFromDate').value),
            end: new Date(document.getElementById('movementToDate').value)
        };

        const report = gpsTracking.getMovementReport(employeeId, dateRange);
        console.log('📍 تقرير الحركة:', report);
        showToast(`📍 عدد المحطات: ${report.totalStops}`, 'info');
    });
}

// ============================================
// 📄 معالجات نظام المستندات
// ============================================
function setupDocumentHandlers() {
    // رفع مستند
    document.getElementById('uploadDocumentBtn')?.addEventListener('click', function() {
        const fileInput = document.getElementById('documentFile');
        if (!fileInput.files.length) {
            showToast('⚠️ يرجى اختيار ملف', 'warning');
            return;
        }

        const file = fileInput.files[0];
        const docData = {
            name: file.name,
            type: document.getElementById('documentType').value,
            size: file.size,
            fileUrl: URL.createObjectURL(file),
            uploadedBy: document.getElementById('documentUploadedBy').value,
            relatedTo: document.getElementById('documentRelatedTo').value,
            tags: document.getElementById('documentTags').value.split(',').map(t => t.trim())
        };

        const doc = docManagement.uploadDocument(docData);
        showToast('✅ تم رفع المستند بنجاح', 'success');

        updateDocumentsList();
        document.getElementById('documentForm').reset();
    });

    // التوقيع الرقمي
    document.getElementById('signDocumentBtn')?.addEventListener('click', function() {
        const docId = document.getElementById('signDocId').value;
        const signerData = {
            signerName: document.getElementById('signerName').value,
            signerEmail: document.getElementById('signerEmail').value,
            signatureImage: getSignatureImage(),
            ipAddress: getClientIP()
        };

        // الحصول على الموقع الجغرافي للتوقيع
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                signerData.lat = position.coords.latitude;
                signerData.lng = position.coords.longitude;

                const signature = docManagement.signDocument(docId, signerData);
                showToast('✅ تم التوقيع بنجاح', 'success');
            });
        } else {
            const signature = docManagement.signDocument(docId, signerData);
            showToast('✅ تم التوقيع بنجاح', 'success');
        }
    });

    // قائمة المستندات
    function updateDocumentsList() {
        const tbody = document.getElementById('documentsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        docManagement.documents.forEach((doc, index) => {
            const signatureInfo = docManagement.signatures.find(s => s.documentId === doc.id);

            tbody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${doc.name}</td>
                    <td>${doc.type}</td>
                    <td>${(doc.size / 1024).toFixed(2)} KB</td>
                    <td>${new Date(doc.uploadedAt).toLocaleDateString('ar-SA')}</td>
                    <td>${doc.uploadedBy}</td>
                    <td>${signatureInfo ? '✅ موقع' : '⏳ ينتظر'}</td>
                    <td>
                        <a href="${doc.fileUrl}" class="btn btn-sm btn-info" target="_blank">
                            <i class="fas fa-download"></i>
                        </a>
                        <button class="btn btn-sm btn-primary" onclick="prepareSignature('${doc.id}')">
                            <i class="fas fa-pen-fancy"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    updateDocumentsList();
}

// ============================================
// 📊 معالجات التقارير والتحليلات
// ============================================
function setupReportingHandlers() {
    // إنشاء تقرير شامل
    document.getElementById('generateComprehensiveReportBtn')?.addEventListener('click', function() {
        const dateRange = {
            start: new Date(document.getElementById('reportStartDate').value),
            end: new Date(document.getElementById('reportEndDate').value)
        };

        const filters = {
            totalIncome: calculateTotalIncome(dateRange),
            totalExpenses: calculateTotalExpenses(dateRange),
            customerCount: customerMgtAdvanced.customers.length,
            employeeCount: employees?.length || 0,
            newCustomers: customerMgtAdvanced.customers.filter(c => 
                new Date(c.createdAt) >= dateRange.start && new Date(c.createdAt) <= dateRange.end
            ).length
        };

        const report = reporting.generateComprehensiveReport(dateRange, filters);
        displayComprehensiveReport(report);
    });

    // عرض التقرير الشامل
    function displayComprehensiveReport(report) {
        const reportDiv = document.getElementById('reportOutput');
        if (!reportDiv) return;

        let html = `
            <div class="report-section">
                <h4>التقرير الشامل</h4>
                <h5>مؤشرات الأداء الرئيسية (KPIs)</h5>
                <div class="row">
                    <div class="col-md-3">
                        <div class="kpi-card">
                            <h6>إجمالي الإيرادات</h6>
                            <p class="kpi-value">${(report.kpis.totalRevenue || 0).toFixed(0)} ر.ق</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="kpi-card">
                            <h6>رضا العملاء</h6>
                            <p class="kpi-value">${(report.kpis.customerSatisfaction || 0).toFixed(1)}/5</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="kpi-card">
                            <h6>إنتاجية الموظفين</h6>
                            <p class="kpi-value">${(report.kpis.employeeProductivity || 0).toFixed(1)}</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="kpi-card">
                            <h6>الإنجاز في الموعد</h6>
                            <p class="kpi-value">${((report.kpis.onTimeCompletion || 0) * 100).toFixed(0)}%</p>
                        </div>
                    </div>
                </div>

                <h5 class="mt-4">التوصيات</h5>
                <ul>
                    ${(report.recommendations || []).map(rec => `
                        <li class="alert alert-${rec.priority === 'high' ? 'danger' : 'warning'}">
                            ${rec.message}
                        </li>
                    `).join('')}
                </ul>

                <button class="btn btn-primary" onclick="exportReport('${report.format}')">
                    <i class="fas fa-download me-2"></i>تصدير التقرير
                </button>
            </div>
        `;

        reportDiv.innerHTML = html;
    }

    // الدوال المساعدة
    function calculateTotalIncome(dateRange) {
        return (dailyIncome || [])
            .filter(income => {
                const incomeDate = new Date(income.date);
                return incomeDate >= dateRange.start && incomeDate <= dateRange.end;
            })
            .reduce((sum, income) => sum + (parseFloat(income.amount) || 0), 0);
    }

    function calculateTotalExpenses(dateRange) {
        return (dailyExpenses || [])
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= dateRange.start && expenseDate <= dateRange.end;
            })
            .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
    }
}

// ============================================
// 🔧 دوال المساعدة العامة
// ============================================

// تحميل الموظفين في قوائم الاختيار
function populateEmployeeSelects() {
    const selects = document.querySelectorAll('[data-populate="employees"]');
    selects.forEach(select => {
        select.innerHTML = '';
        (employees || []).forEach(emp => {
            const option = document.createElement('option');
            option.value = emp.id;
            option.textContent = emp.name;
            select.appendChild(option);
        });
    });
}

// الحصول على الموظفين المختارين
function getSelectedEmployees(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];

    const selected = [];
    container.querySelectorAll('input:checked').forEach(checkbox => {
        selected.push({
            id: checkbox.value,
            name: checkbox.getAttribute('data-name')
        });
    });
    return selected;
}

// تنزيل JSON
function downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
}

// الحصول على صورة التوقيع
function getSignatureImage() {
    const canvas = document.getElementById('signatureCanvas');
    return canvas ? canvas.toDataURL() : '';
}

// الحصول على عنوان IP
function getClientIP() {
    return 'N/A'; // في التطبيق الحقيقي، يتم الحصول عليه من الخادم
}

// ============================================
// 🚀 تهيئة جميع المعالجات عند تحميل الصفحة
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    setupSchedulingHandlers();
    setupInventoryHandlers();
    setupInvoicingHandlers();
    setupAdvancedCustomerHandlers();
    setupGPSTrackingHandlers();
    setupDocumentHandlers();
    setupReportingHandlers();
    populateEmployeeSelects();

    console.log('✅ تم تحميل جميع معالجات الأنظمة المتقدمة');
});
