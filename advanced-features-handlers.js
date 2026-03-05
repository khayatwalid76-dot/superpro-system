/**
 * ADVANCED FEATURES UI HANDLERS
 * معالجات واجهة المستخدم للميزات المتقدمة
 * يتضمن: الجدولة، المخزون، الفواتير، إدارة العملاء المتقدمة، والمزيد
 */

// ============================================
// إنشاء الكائنات العالمية للأنظمة المتقدمة
// ============================================

let schedulingSystem;
let inventorySystem;
let billingSystem;
let advancedCustomerManagement;
let gpsTrackingSystem;
let advancedReporting;
let photoSignatureSystem;
let complaintsManagement;
let attendanceManagement;
let discountsPromotions;
let auditLogSystem;
let notificationSystem;

// تهيئة جميع الأنظمة
function initializeAdvancedSystems() {
    schedulingSystem = new SchedulingSystem();
    inventorySystem = new InventorySystem();
    billingSystem = new BillingSystem();
    advancedCustomerManagement = new AdvancedCustomerManagement();
    gpsTrackingSystem = new GPSTrackingSystem();
    advancedReporting = new AdvancedReporting();
    photoSignatureSystem = new PhotoSignatureSystem();
    complaintsManagement = new ComplaintsManagement();
    attendanceManagement = new AttendanceManagement();
    discountsPromotions = new DiscountsPromotions();
    auditLogSystem = new AuditLogSystem();
    notificationSystem = new NotificationSystem();
}

// ============================================
// 1. معالجات جدولة المواعيد
// ============================================

function setupSchedulingHandlers() {
    // إضافة موعد جديد
    document.getElementById('addAppointmentBtn')?.addEventListener('click', () => {
        const form = document.getElementById('appointmentForm');
        const formData = new FormData(form);
        
        const appointmentData = {
            customerId: formData.get('customerId'),
            teamId: formData.get('teamId'),
            date: formData.get('appointmentDate'),
            time: formData.get('appointmentTime'),
            duration: parseInt(formData.get('duration')) || 120,
            service: formData.get('service'),
            notes: formData.get('notes'),
            location: {
                latitude: parseFloat(formData.get('latitude')) || 0,
                longitude: parseFloat(formData.get('longitude')) || 0
            }
        };

        const appointment = schedulingSystem.addAppointment(appointmentData);
        showSuccessAlert('تم إضافة الموعد بنجاح', 'تم جدولة الخدمة للتاريخ ' + appointmentData.date);
        updateSchedulingUI();
        form.reset();
        bootstrap.Modal.getInstance(document.getElementById('appointmentModal')).hide();
    });

    // إعادة جدولة موعد
    document.getElementById('rescheduleAppointmentBtn')?.addEventListener('click', () => {
        const appointmentId = document.getElementById('appointmentIdForReschedule').value;
        const newDate = document.getElementById('newAppointmentDate').value;
        const newTime = document.getElementById('newAppointmentTime').value;

        schedulingSystem.rescheduleAppointment(appointmentId, newDate, newTime);
        showSuccessAlert('تم إعادة جدولة الموعد', 'الموعد الجديد: ' + newDate + ' الساعة ' + newTime);
        updateSchedulingUI();
    });

    // عرض التضارب
    document.getElementById('checkConflictsBtn')?.addEventListener('click', () => {
        const conflicts = schedulingSystem.getScheduleConflicts();
        if (conflicts.length > 0) {
            showWarningAlert('تم اكتشاف تضارب في الجدولة', conflicts.length + ' تضارب(ات)');
        } else {
            showSuccessAlert('لا توجد تضاربات', 'الجدولة خالية من التضاربات');
        }
    });
}

function updateSchedulingUI() {
    const appointmentsTable = document.getElementById('appointmentsTable');
    if (!appointmentsTable) return;

    appointmentsTable.innerHTML = '';
    const appointments = schedulingSystem.appointments;

    if (appointments.length === 0) {
        appointmentsTable.innerHTML = '<tr><td colspan="6" class="text-center text-muted">لا توجد مواعيد</td></tr>';
        return;
    }

    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appointment.date}</td>
            <td>${appointment.time}</td>
            <td>${appointment.customerId}</td>
            <td>${appointment.service}</td>
            <td><span class="badge bg-info">${appointment.status}</span></td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editAppointment(${appointment.id})">تعديل</button>
                <button class="btn btn-sm btn-danger" onclick="deleteAppointment(${appointment.id})">حذف</button>
            </td>
        `;
        appointmentsTable.appendChild(row);
    });
}

// ============================================
// 2. معالجات إدارة المخزون
// ============================================

function setupInventoryHandlers() {
    // إضافة مادة للمخزون
    document.getElementById('addSupplyBtn')?.addEventListener('click', () => {
        const form = document.getElementById('supplyForm');
        const formData = new FormData(form);

        const supplyData = {
            name: formData.get('supplyName'),
            quantity: parseInt(formData.get('quantity')),
            unit: formData.get('unit'),
            reorderLevel: parseInt(formData.get('reorderLevel')),
            expiryDate: formData.get('expiryDate'),
            unitCost: parseFloat(formData.get('unitCost')),
            supplier: formData.get('supplier')
        };

        inventorySystem.addSupply(supplyData);
        showSuccessAlert('تمت إضافة المادة', supplyData.name);
        updateInventoryUI();
        form.reset();
        bootstrap.Modal.getInstance(document.getElementById('supplyModal')).hide();
    });

    // التحقق من المخزون المنخفض
    document.getElementById('checkLowStockBtn')?.addEventListener('click', () => {
        const lowStockItems = inventorySystem.getLowStockItems();
        if (lowStockItems.length > 0) {
            showWarningAlert('تنبيه المخزون المنخفض', 'عدد المواد: ' + lowStockItems.length);
        } else {
            showSuccessAlert('المخزون كافٍ', 'جميع المواد بكميات جيدة');
        }
    });

    // التحقق من المواد المنتهية الصلاحية
    document.getElementById('checkExpiredBtn')?.addEventListener('click', () => {
        const expiredItems = inventorySystem.getExpiredItems();
        if (expiredItems.length > 0) {
            showDangerAlert('تحذير الصلاحية', 'توجد ' + expiredItems.length + ' مادة منتهية صلاحية');
        } else {
            showSuccessAlert('لا توجد مواد منتهية الصلاحية', 'جميع المواد سارية الصلاحية');
        }
    });
}

function updateInventoryUI() {
    const inventoryTable = document.getElementById('inventoryTable');
    if (!inventoryTable) return;

    inventoryTable.innerHTML = '';
    const supplies = inventorySystem.supplies;

    supplies.forEach(supply => {
        const row = document.createElement('tr');
        const statusClass = supply.quantity <= supply.reorderLevel ? 'table-danger' : 
                           supply.quantity <= supply.reorderLevel * 1.5 ? 'table-warning' : '';
        
        row.className = statusClass;
        row.innerHTML = `
            <td>${supply.name}</td>
            <td>${supply.quantity} ${supply.unit}</td>
            <td>${supply.reorderLevel}</td>
            <td>${supply.expiryDate || 'بدون تاريخ'}</td>
            <td>${supply.unitCost || '-'}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="editSupply(${supply.id})">تعديل</button>
                <button class="btn btn-sm btn-danger" onclick="deleteSupply(${supply.id})">حذف</button>
            </td>
        `;
        inventoryTable.appendChild(row);
    });

    // تحديث عدد المواد
    document.getElementById('totalSupplies').textContent = supplies.length;
    document.getElementById('lowStockWarnings').textContent = inventorySystem.getLowStockItems().length;
}

// ============================================
// 3. معالجات نظام الفواتير
// ============================================

function setupBillingHandlers() {
    // إنشاء فاتورة
    document.getElementById('createInvoiceBtn')?.addEventListener('click', () => {
        const form = document.getElementById('invoiceForm');
        const formData = new FormData(form);

        const invoiceData = {
            customerId: formData.get('customerId'),
            description: formData.get('description'),
            items: JSON.parse(formData.get('items') || '[]'),
            taxRate: parseFloat(formData.get('taxRate')) || 0.15,
            dueDate: formData.get('dueDate')
        };

        const invoice = billingSystem.createInvoice(invoiceData);
        showSuccessAlert('تم إنشاء الفاتورة', 'رقم الفاتورة: ' + invoice.id);
        updateBillingUI();
        form.reset();
        bootstrap.Modal.getInstance(document.getElementById('invoiceModal')).hide();
    });

    // تسجيل دفعة
    document.getElementById('recordPaymentBtn')?.addEventListener('click', () => {
        const form = document.getElementById('paymentForm');
        const formData = new FormData(form);

        const paymentData = {
            amount: parseFloat(formData.get('paymentAmount')),
            method: formData.get('paymentMethod'),
            notes: formData.get('paymentNotes')
        };

        const invoiceId = formData.get('invoiceId');
        billingSystem.recordPayment(invoiceId, paymentData);
        showSuccessAlert('تم تسجيل الدفعة', 'المبلغ: ' + paymentData.amount);
        updateBillingUI();
        form.reset();
    });

    // التحقق من الفواتير المتأخرة
    document.getElementById('checkOverdueBtn')?.addEventListener('click', () => {
        const overdueInvoices = billingSystem.getOverdueInvoices();
        if (overdueInvoices.length > 0) {
            showDangerAlert('فواتير متأخرة', 'عدد الفواتير: ' + overdueInvoices.length);
        } else {
            showSuccessAlert('لا توجد فواتير متأخرة', 'جميع الفواتير في الموعد');
        }
    });

    // تصدير فاتورة
    document.getElementById('exportInvoiceBtn')?.addEventListener('click', () => {
        const invoiceId = document.getElementById('invoiceIdToExport').value;
        const format = document.getElementById('exportFormat').value;
        billingSystem.exportInvoice(invoiceId, format);
        showSuccessAlert('تم تصدير الفاتورة', 'جاهزة للتحميل');
    });
}

function updateBillingUI() {
    const invoicesTable = document.getElementById('invoicesTable');
    if (!invoicesTable) return;

    invoicesTable.innerHTML = '';
    const invoices = billingSystem.invoices;

    let totalRevenue = 0;
    invoices.forEach(invoice => {
        const row = document.createElement('tr');
        const statusClass = invoice.status === 'مدفوعة' ? 'table-success' : 
                           invoice.status === 'مدفوعة جزئياً' ? 'table-warning' : 'table-danger';
        
        row.className = statusClass;
        row.innerHTML = `
            <td>${invoice.id}</td>
            <td>${invoice.customerId}</td>
            <td>${invoice.total.toFixed(2)}</td>
            <td><span class="badge bg-primary">${invoice.status}</span></td>
            <td>${invoice.dueDate}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewInvoice('${invoice.id}')">عرض</button>
                <button class="btn btn-sm btn-success" onclick="recordPaymentUI('${invoice.id}')">دفع</button>
            </td>
        `;
        invoicesTable.appendChild(row);
        
        if (invoice.status === 'مدفوعة') {
            totalRevenue += invoice.total;
        }
    });

    // تحديث الإحصائيات
    document.getElementById('totalInvoices').textContent = invoices.length;
    document.getElementById('totalRevenue').textContent = totalRevenue.toFixed(2);
    document.getElementById('overdueCount').textContent = billingSystem.getOverdueInvoices().length;
}

// ============================================
// 4. معالجات إدارة العملاء المتقدمة
// ============================================

function setupAdvancedCustomerHandlers() {
    // إضافة عميل
    document.getElementById('addAdvancedCustomerBtn')?.addEventListener('click', () => {
        const form = document.getElementById('advancedCustomerForm');
        const formData = new FormData(form);

        const customerData = {
            name: formData.get('customerName'),
            phone: formData.get('customerPhone'),
            email: formData.get('customerEmail'),
            address: formData.get('customerAddress'),
            commercialRegister: formData.get('commercialRegister')
        };

        advancedCustomerManagement.addCustomer(customerData);
        showSuccessAlert('تم إضافة العميل', customerData.name);
        updateAdvancedCustomerUI();
        form.reset();
        bootstrap.Modal.getInstance(document.getElementById('advancedCustomerModal')).hide();
    });

    // عرض سجل الخدمات
    window.viewCustomerHistory = function(customerId) {
        const history = advancedCustomerManagement.getServiceHistory(customerId);
        const list = history.map(h => `
            <div class="mb-2">
                <strong>${h.service}</strong> - ${h.date.split('T')[0]}
                <span class="badge bg-success">${h.status}</span>
            </div>
        `).join('');
        
        showInfoAlert('سجل الخدمات', list);
    };

    // إضافة عقد
    document.getElementById('createContractBtn')?.addEventListener('click', () => {
        const form = document.getElementById('contractForm');
        const formData = new FormData(form);

        const contractData = {
            customerId: formData.get('customerId'),
            serviceType: formData.get('serviceType'),
            startDate: formData.get('contractStartDate'),
            endDate: formData.get('contractEndDate'),
            monthlyFee: parseFloat(formData.get('monthlyFee')),
            terms: formData.get('contractTerms')
        };

        advancedCustomerManagement.createContract(contractData);
        showSuccessAlert('تم إنشاء العقد', 'العقد نشط');
        updateAdvancedCustomerUI();
        form.reset();
    });
}

function updateAdvancedCustomerUI() {
    const customersTable = document.getElementById('advancedCustomersTable');
    if (!customersTable) return;

    customersTable.innerHTML = '';
    const customers = advancedCustomerManagement.customers;

    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.phone}</td>
            <td>${customer.email}</td>
            <td><span class="badge bg-warning text-dark">${customer.loyaltyTier}</span></td>
            <td>${customer.totalServices}</td>
            <td>${customer.totalSpend.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewCustomerHistory('${customer.id}')">السجل</button>
                <button class="btn btn-sm btn-primary" onclick="editCustomer('${customer.id}')">تعديل</button>
            </td>
        `;
        customersTable.appendChild(row);
    });
}

// ============================================
// 5. معالجات تدقيق الحضور
// ============================================

function setupAttendanceHandlers() {
    // تسجيل الحضور
    document.getElementById('checkInBtn')?.addEventListener('click', () => {
        const employeeId = document.getElementById('employeeSelect').value;
        attendanceManagement.recordAttendance(employeeId, new Date().toISOString());
        showSuccessAlert('تم تسجيل الحضور', 'حضور العامل تم تسجيله');
        updateAttendanceUI();
    });

    // تسجيل المغادرة
    document.getElementById('checkOutBtn')?.addEventListener('click', () => {
        const employeeId = document.getElementById('employeeSelect').value;
        const lastAttendance = attendanceManagement.attendance
            .filter(a => a.employeeId === employeeId && !a.checkOut)
            .pop();
        
        if (lastAttendance) {
            lastAttendance.checkOut = new Date().toISOString();
            lastAttendance.hoursWorked = (new Date(lastAttendance.checkOut) - new Date(lastAttendance.checkIn)) / (1000 * 60 * 60);
        }
        showSuccessAlert('تم تسجيل المغادرة', 'ساعات العمل: ' + (lastAttendance?.hoursWorked || 0).toFixed(2));
        updateAttendanceUI();
    });

    // طلب إجازة
    document.getElementById('requestLeaveBtn')?.addEventListener('click', () => {
        const form = document.getElementById('leaveForm');
        const formData = new FormData(form);

        const leaveData = {
            employeeId: formData.get('employeeId'),
            type: formData.get('leaveType'),
            startDate: formData.get('leaveStartDate'),
            endDate: formData.get('leaveEndDate'),
            reason: formData.get('leaveReason')
        };

        attendanceManagement.requestLeave(leaveData.employeeId, leaveData);
        showSuccessAlert('تم تقديم طلب الإجازة', 'في انتظار الموافقة');
        form.reset();
        bootstrap.Modal.getInstance(document.getElementById('leaveModal')).hide();
    });
}

function updateAttendanceUI() {
    const attendanceTable = document.getElementById('attendanceTable');
    if (!attendanceTable) return;

    attendanceTable.innerHTML = '';
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendanceManagement.attendance.filter(a => a.date === today);

    todayAttendance.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.employeeId}</td>
            <td>${record.checkIn.split('T')[1].slice(0, 5)}</td>
            <td>${record.checkOut ? record.checkOut.split('T')[1].slice(0, 5) : '-'}</td>
            <td>${record.hoursWorked.toFixed(2)}</td>
            <td><span class="badge bg-success">${record.status}</span></td>
        `;
        attendanceTable.appendChild(row);
    });
}

// ============================================
// 6. معالجات إدارة الشكاوى
// ============================================

function setupComplaintsHandlers() {
    // تقديم شكوى
    document.getElementById('submitComplaintBtn')?.addEventListener('click', () => {
        const form = document.getElementById('complaintForm');
        const formData = new FormData(form);

        const complaintData = {
            customerId: formData.get('customerId'),
            appointmentId: formData.get('appointmentId'),
            subject: formData.get('complaintSubject'),
            description: formData.get('complaintDescription'),
            priority: formData.get('complaintPriority'),
            attachments: []
        };

        complaintsManagement.submitComplaint(complaintData);
        showSuccessAlert('تم تقديم الشكوى', 'رقم الشكوى: ' + complaintData.subject);
        updateComplaintsUI();
        form.reset();
        bootstrap.Modal.getInstance(document.getElementById('complaintModal')).hide();
    });

    // تحديث حالة الشكوى
    document.getElementById('updateComplaintStatusBtn')?.addEventListener('click', () => {
        const complaintId = document.getElementById('complaintIdToUpdate').value;
        const newStatus = document.getElementById('newComplaintStatus').value;
        const notes = document.getElementById('statusUpdateNotes').value;

        complaintsManagement.updateComplaintStatus(complaintId, newStatus, notes);
        showSuccessAlert('تم تحديث الشكوى', 'الحالة: ' + newStatus);
        updateComplaintsUI();
    });
}

function updateComplaintsUI() {
    const complaintsTable = document.getElementById('complaintsTable');
    if (!complaintsTable) return;

    complaintsTable.innerHTML = '';
    const complaints = complaintsManagement.complaints;

    complaints.forEach(complaint => {
        const row = document.createElement('tr');
        const priorityColor = complaint.priority === 'عالي' ? 'danger' : 
                             complaint.priority === 'عادي' ? 'warning' : 'info';
        
        row.innerHTML = `
            <td>${complaint.id}</td>
            <td>${complaint.subject}</td>
            <td><span class="badge bg-${priorityColor}">${complaint.priority}</span></td>
            <td><span class="badge bg-secondary">${complaint.status}</span></td>
            <td>${complaint.submittedAt.split('T')[0]}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewComplaint('${complaint.id}')">عرض</button>
            </td>
        `;
        complaintsTable.appendChild(row);
    });
}

// ============================================
// 7. معالجات نظام الخصومات والترقيات
// ============================================

function setupDiscountsHandlers() {
    // إنشاء كود خصم
    document.getElementById('createDiscountCodeBtn')?.addEventListener('click', () => {
        const form = document.getElementById('discountCodeForm');
        const formData = new FormData(form);

        const codeData = {
            code: formData.get('discountCode'),
            discount: parseFloat(formData.get('discountAmount')),
            discountType: formData.get('discountType'),
            maxUses: parseInt(formData.get('maxUses')) || -1,
            expiryDate: formData.get('expiryDate'),
            minOrderValue: parseFloat(formData.get('minOrderValue')) || 0
        };

        discountsPromotions.createDiscountCode(codeData);
        showSuccessAlert('تم إنشاء الكود', 'الكود: ' + codeData.code);
        updateDiscountsUI();
        form.reset();
        bootstrap.Modal.getInstance(document.getElementById('discountModal')).hide();
    });

    // تطبيق الخصم
    document.getElementById('applyDiscountBtn')?.addEventListener('click', () => {
        const code = document.getElementById('discountCodeInput').value;
        const orderValue = parseFloat(document.getElementById('orderValueInput').value);

        const result = discountsPromotions.applyDiscountCode(code, orderValue);
        if (result.valid) {
            showSuccessAlert('تم تطبيق الخصم', 'المبلغ النهائي: ' + result.finalPrice.toFixed(2));
            document.getElementById('discountedPrice').textContent = result.finalPrice.toFixed(2);
        } else {
            showWarningAlert('رسالة', result.message);
        }
    });
}

function updateDiscountsUI() {
    const discountsTable = document.getElementById('discountCodesTable');
    if (!discountsTable) return;

    discountsTable.innerHTML = '';
    const codes = discountsPromotions.discountCodes;

    codes.forEach(code => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${code.code}</td>
            <td>${code.discount} ${code.discountType === 'نسبة' ? '%' : 'ريال'}</td>
            <td>${code.currentUses}/${code.maxUses === -1 ? '∞' : code.maxUses}</td>
            <td>${code.expiryDate || 'بدون نهاية'}</td>
            <td><span class="badge ${code.status === 'نشط' ? 'bg-success' : 'bg-danger'}">${code.status}</span></td>
        `;
        discountsTable.appendChild(row);
    });
}

// ============================================
// 8. معالجات الصور والتوقيعات
// ============================================

function setupPhotoSignatureHandlers() {
    // إضافة صور الخدمة
    document.getElementById('uploadPhotosBtn')?.addEventListener('click', () => {
        const appointmentId = document.getElementById('appointmentIdForPhotos').value;
        const beforePhotos = document.getElementById('beforePhotosInput').files;
        const afterPhotos = document.getElementById('afterPhotosInput').files;

        // محاكاة رفع الصور
        const photosData = {
            before: Array.from(beforePhotos).map(f => f.name),
            after: Array.from(afterPhotos).map(f => f.name),
            team: document.getElementById('teamIdForPhotos').value
        };

        photoSignatureSystem.addServicePhotos(appointmentId, photosData);
        showSuccessAlert('تم رفع الصور', 'عدد الصور: ' + (beforePhotos.length + afterPhotos.length));
    });

    // إضافة التوقيع
    document.getElementById('signAppointmentBtn')?.addEventListener('click', () => {
        const appointmentId = document.getElementById('appointmentIdForSignature').value;
        const signatureName = document.getElementById('signerName').value;

        // محاكاة رسم التوقيع (في التطبيق الفعلي، ستستخدم canvas)
        const signatureData = {
            canvas: 'signature_canvas_data',
            name: signatureName
        };

        photoSignatureSystem.addDigitalSignature(appointmentId, signatureData);
        showSuccessAlert('تم حفظ التوقيع', 'تم توقيع الخدمة من قبل ' + signatureName);
    });
}

// ============================================
// معالجات الإشعارات
// ============================================

function setupNotificationHandlers() {
    // تعيين تفضيلات الإشعارات
    document.getElementById('saveNotificationPreferencesBtn')?.addEventListener('click', () => {
        const userId = document.getElementById('userIdForNotifications').value;
        const preferences = {
            email: document.getElementById('emailNotifications').checked,
            sms: document.getElementById('smsNotifications').checked,
            inApp: document.getElementById('inAppNotifications').checked,
            appointmentReminders: document.getElementById('appointmentReminders').checked,
            paymentReminders: document.getElementById('paymentReminders').checked
        };

        notificationSystem.setNotificationPreferences(userId, preferences);
        showSuccessAlert('تم حفظ التفضيلات', 'تم تحديث إعدادات الإشعارات');
    });
}

// ============================================
// وظائف عامة
// ============================================

function showSuccessAlert(title, message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alert.style.zIndex = '9999';
    alert.innerHTML = `
        <strong>${title}:</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 4000);
}

function showWarningAlert(title, message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-warning alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alert.style.zIndex = '9999';
    alert.innerHTML = `
        <strong>${title}:</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 4000);
}

function showDangerAlert(title, message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alert.style.zIndex = '9999';
    alert.innerHTML = `
        <strong>${title}:</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 4000);
}

function showInfoAlert(title, message) {
    alert(title + '\n' + message);
}

// ============================================
// تهيئة جميع المعالجات عند تحميل الصفحة
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeAdvancedSystems();
    setupSchedulingHandlers();
    setupInventoryHandlers();
    setupBillingHandlers();
    setupAdvancedCustomerHandlers();
    setupAttendanceHandlers();
    setupComplaintsHandlers();
    setupDiscountsHandlers();
    setupPhotoSignatureHandlers();
    setupNotificationHandlers();
    
    // تحديث الواجهات الأولية
    updateSchedulingUI();
    updateInventoryUI();
    updateBillingUI();
    updateAdvancedCustomerUI();
    updateAttendanceUI();
    updateComplaintsUI();
    updateDiscountsUI();
});
