/**
 * ADVANCED FEATURES FOR SUPER_PRO SYSTEM
 * نظام الميزات المتقدمة الشامل
 * يتضمن: الجدولة، المخزون، الفواتير، إدارة العملاء، GPS، التقارير، والصور والتوقيعات
 */

// ============================================
// 1. نظام الجدولة والمواعيد (Scheduling System)
// ============================================

class SchedulingSystem {
    constructor() {
        this.appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        this.schedules = JSON.parse(localStorage.getItem('schedules')) || [];
    }

    // إضافة موعد جديد
    addAppointment(appointmentData) {
        const appointment = {
            id: Date.now(),
            ...appointmentData,
            createdAt: new Date().toISOString(),
            status: 'مجدول',
            reminders: []
        };
        this.appointments.push(appointment);
        this.save();
        return appointment;
    }

    // تحديث موعد
    updateAppointment(appointmentId, data) {
        const index = this.appointments.findIndex(a => a.id === appointmentId);
        if (index !== -1) {
            this.appointments[index] = { 
                ...this.appointments[index], 
                ...data, 
                updatedAt: new Date().toISOString() 
            };
            this.save();
            return this.appointments[index];
        }
        return null;
    }

    // إعادة جدولة الموعد
    rescheduleAppointment(appointmentId, newDate, newTime) {
        return this.updateAppointment(appointmentId, {
            date: newDate,
            time: newTime,
            rescheduledAt: new Date().toISOString(),
            rescheduledTimes: (this.appointments.find(a => a.id === appointmentId)?.rescheduledTimes || 0) + 1
        });
    }

    // حذف موعد
    deleteAppointment(appointmentId) {
        this.appointments = this.appointments.filter(a => a.id !== appointmentId);
        this.save();
    }

    // الحصول على المواعيد للتاريخ المحدد
    getAppointmentsByDate(date) {
        return this.appointments.filter(a => a.date === date && a.status !== 'ملغى');
    }

    // إرسال تنبيه قبل الخدمة
    sendReminder(appointmentId, hoursBeforeAppointment = 24) {
        const appointment = this.appointments.find(a => a.id === appointmentId);
        if (appointment) {
            const reminder = {
                id: Date.now(),
                appointmentId,
                sentAt: new Date().toISOString(),
                type: 'email',
                status: 'مرسل',
                hoursBeforeAppointment
            };
            if (!appointment.reminders) appointment.reminders = [];
            appointment.reminders.push(reminder);
            this.save();
            return reminder;
        }
        return null;
    }

    // الحصول على التضارب في الجدولة
    getScheduleConflicts() {
        const conflicts = [];
        for (let i = 0; i < this.appointments.length; i++) {
            for (let j = i + 1; j < this.appointments.length; j++) {
                const a1 = this.appointments[i];
                const a2 = this.appointments[j];
                if (a1.date === a2.date && a1.teamId === a2.teamId && a1.status !== 'ملغى' && a2.status !== 'ملغى') {
                    const start1 = new Date(`${a1.date}T${a1.time}`);
                    const end1 = new Date(start1.getTime() + (a1.duration || 120) * 60000);
                    const start2 = new Date(`${a2.date}T${a2.time}`);
                    const end2 = new Date(start2.getTime() + (a2.duration || 120) * 60000);
                    
                    if (start1 < end2 && start2 < end1) {
                        conflicts.push({ appointment1: a1.id, appointment2: a2.id });
                    }
                }
            }
        }
        return conflicts;
    }

    save() {
        localStorage.setItem('appointments', JSON.stringify(this.appointments));
        localStorage.setItem('schedules', JSON.stringify(this.schedules));
    }
}

// ============================================
// 2. نظام إدارة المخزون (Inventory System)
// ============================================

class InventorySystem {
    constructor() {
        this.inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        this.supplies = JSON.parse(localStorage.getItem('supplies')) || [];
        this.purchaseOrders = JSON.parse(localStorage.getItem('purchase_orders')) || [];
    }

    // إضافة مادة للمخزون
    addSupply(supplyData) {
        const supply = {
            id: Date.now(),
            ...supplyData,
            quantity: supplyData.quantity || 0,
            unit: supplyData.unit || 'عبوة',
            reorderLevel: supplyData.reorderLevel || 10,
            expiryDate: supplyData.expiryDate || null,
            createdAt: new Date().toISOString()
        };
        this.supplies.push(supply);
        this.save();
        return supply;
    }

    // تحديث كمية المادة
    updateSupplyQuantity(supplyId, quantity, reason = 'استخدام') {
        const supply = this.supplies.find(s => s.id === supplyId);
        if (supply) {
            const transaction = {
                id: Date.now(),
                supplyId,
                oldQuantity: supply.quantity,
                newQuantity: quantity,
                change: quantity - supply.quantity,
                reason,
                timestamp: new Date().toISOString()
            };
            supply.quantity = quantity;
            supply.lastUpdated = new Date().toISOString();
            this.inventory.push(transaction);
            this.save();
            return transaction;
        }
        return null;
    }

    // التحقق من المخزون المنخفض
    getLowStockItems() {
        return this.supplies.filter(s => s.quantity <= s.reorderLevel);
    }

    // التحقق من المواد المنتهية الصلاحية
    getExpiredItems() {
        const today = new Date().toISOString().split('T')[0];
        return this.supplies.filter(s => s.expiryDate && s.expiryDate <= today);
    }

    // إنشاء طلب شراء
    createPurchaseOrder(orderData) {
        const order = {
            id: Date.now(),
            ...orderData,
            items: orderData.items || [],
            status: 'معلقة',
            totalCost: this.calculateOrderTotal(orderData.items || []),
            createdAt: new Date().toISOString()
        };
        this.purchaseOrders.push(order);
        this.save();
        return order;
    }

    // حساب إجمالي الطلب
    calculateOrderTotal(items) {
        return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
    }

    // تقرير الاستهلاك
    getConsumptionReport(startDate, endDate) {
        return this.inventory.filter(t => {
            const date = t.timestamp.split('T')[0];
            return date >= startDate && date <= endDate;
        });
    }

    save() {
        localStorage.setItem('inventory', JSON.stringify(this.inventory));
        localStorage.setItem('supplies', JSON.stringify(this.supplies));
        localStorage.setItem('purchase_orders', JSON.stringify(this.purchaseOrders));
    }
}

// ============================================
// 3. نظام الفواتير والدفع (Billing System)
// ============================================

class BillingSystem {
    constructor() {
        this.invoices = JSON.parse(localStorage.getItem('invoices')) || [];
        this.payments = JSON.parse(localStorage.getItem('payments')) || [];
        this.paymentMethods = JSON.parse(localStorage.getItem('payment_methods')) || this.initializePaymentMethods();
    }

    // إنشاء فاتورة
    createInvoice(invoiceData) {
        const invoice = {
            id: 'INV-' + Date.now(),
            ...invoiceData,
            items: invoiceData.items || [],
            subtotal: this.calculateSubtotal(invoiceData.items || []),
            tax: 0,
            total: 0,
            status: 'مسودة',
            createdAt: new Date().toISOString(),
            dueDate: invoiceData.dueDate || this.calculateDueDate(30),
            payments: []
        };
        invoice.tax = invoice.subtotal * (invoiceData.taxRate || 0.15);
        invoice.total = invoice.subtotal + invoice.tax;
        this.invoices.push(invoice);
        this.save();
        return invoice;
    }

    // حساب الإجمالي الفرعي
    calculateSubtotal(items) {
        return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
    }

    // حساب تاريخ الاستحقاق
    calculateDueDate(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }

    // تسجيل دفعة
    recordPayment(invoiceId, paymentData) {
        const invoice = this.invoices.find(i => i.id === invoiceId);
        if (!invoice) return null;

        const payment = {
            id: 'PAY-' + Date.now(),
            invoiceId,
            ...paymentData,
            amount: paymentData.amount || 0,
            method: paymentData.method || 'نقد',
            status: 'مقبول',
            date: new Date().toISOString()
        };
        
        this.payments.push(payment);
        if (!invoice.payments) invoice.payments = [];
        invoice.payments.push(payment.id);

        // تحديث حالة الفاتورة
        const paidAmount = invoice.payments.reduce((sum, payId) => {
            const pay = this.payments.find(p => p.id === payId);
            return sum + (pay?.amount || 0);
        }, 0);

        if (paidAmount >= invoice.total) {
            invoice.status = 'مدفوعة';
        } else if (paidAmount > 0) {
            invoice.status = 'مدفوعة جزئياً';
        }

        this.save();
        return payment;
    }

    // الفواتير المتأخرة
    getOverdueInvoices() {
        const today = new Date().toISOString().split('T')[0];
        return this.invoices.filter(i => i.dueDate < today && i.status !== 'مدفوعة');
    }

    // إرسال إشعار الدفع المتأخر
    sendOverdueNotification(invoiceId) {
        const invoice = this.invoices.find(i => i.id === invoiceId);
        if (invoice && invoice.status !== 'مدفوعة') {
            return {
                id: Date.now(),
                invoiceId,
                type: 'تذكير دفع متأخر',
                sentAt: new Date().toISOString(),
                status: 'مرسل'
            };
        }
        return null;
    }

    // تصدير الفاتورة
    exportInvoice(invoiceId, format = 'pdf') {
        const invoice = this.invoices.find(i => i.id === invoiceId);
        if (invoice) {
            return {
                format,
                invoice,
                exportedAt: new Date().toISOString()
            };
        }
        return null;
    }

    // initializePaymentMethods
    initializePaymentMethods() {
        return [
            { id: 1, name: 'نقد', enabled: true },
            { id: 2, name: 'تحويل بنكي', enabled: true },
            { id: 3, name: 'شيك', enabled: true },
            { id: 4, name: 'بطاقة ائتمانية', enabled: false }
        ];
    }

    save() {
        localStorage.setItem('invoices', JSON.stringify(this.invoices));
        localStorage.setItem('payments', JSON.stringify(this.payments));
        localStorage.setItem('payment_methods', JSON.stringify(this.paymentMethods));
    }
}

// ============================================
// 4. نظام إدارة العملاء المتقدم (Advanced Customer Management)
// ============================================

class AdvancedCustomerManagement {
    constructor() {
        this.customers = JSON.parse(localStorage.getItem('advanced_customers')) || [];
        this.serviceHistory = JSON.parse(localStorage.getItem('service_history')) || [];
        this.contracts = JSON.parse(localStorage.getItem('contracts')) || [];
        this.loyaltyPoints = JSON.parse(localStorage.getItem('loyalty_points')) || [];
    }

    // إضافة عميل متقدم
    addCustomer(customerData) {
        const customer = {
            id: 'CUST-' + Date.now(),
            ...customerData,
            phone: customerData.phone || '',
            email: customerData.email || '',
            address: customerData.address || '',
            loyaltyTier: 'فضة',
            totalSpend: 0,
            totalServices: 0,
            createdAt: new Date().toISOString(),
            lastService: null,
            documents: [] // العقود والمستندات
        };
        this.customers.push(customer);
        this.save();
        return customer;
    }

    // تسجيل سجل الخدمات
    recordService(customerId, serviceData) {
        const service = {
            id: Date.now(),
            customerId,
            ...serviceData,
            date: new Date().toISOString()
        };
        this.serviceHistory.push(service);

        const customer = this.customers.find(c => c.id === customerId);
        if (customer) {
            customer.totalServices = (customer.totalServices || 0) + 1;
            customer.totalSpend = (customer.totalSpend || 0) + (serviceData.cost || 0);
            customer.lastService = new Date().toISOString();
            
            // تحديث مستوى الولاء
            this.updateLoyaltyTier(customerId);
        }

        this.save();
        return service;
    }

    // الحصول على سجل الخدمات السابقة
    getServiceHistory(customerId) {
        return this.serviceHistory.filter(s => s.customerId === customerId);
    }

    // إنشاء عقد
    createContract(contractData) {
        const contract = {
            id: 'CON-' + Date.now(),
            ...contractData,
            status: 'نشط',
            createdAt: new Date().toISOString(),
            terms: contractData.terms || []
        };
        this.contracts.push(contract);
        
        const customer = this.customers.find(c => c.id === contractData.customerId);
        if (customer) {
            if (!customer.documents) customer.documents = [];
            customer.documents.push(contract.id);
        }

        this.save();
        return contract;
    }

    // نقاط الولاء
    updateLoyaltyTier(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (!customer) return null;

        if (customer.totalServices >= 50) {
            customer.loyaltyTier = 'ذهب';
        } else if (customer.totalServices >= 25) {
            customer.loyaltyTier = 'فضة';
        } else {
            customer.loyaltyTier = 'برونز';
        }
        this.save();
        return customer.loyaltyTier;
    }

    // إضافة نقاط ولاء
    addLoyaltyPoints(customerId, points, reason) {
        const loyalty = {
            id: Date.now(),
            customerId,
            points,
            reason,
            balance: points,
            createdAt: new Date().toISOString()
        };
        this.loyaltyPoints.push(loyalty);
        this.save();
        return loyalty;
    }

    // الحصول على العملاء حسب المستوى
    getCustomersByTier(tier) {
        return this.customers.filter(c => c.loyaltyTier === tier);
    }

    save() {
        localStorage.setItem('advanced_customers', JSON.stringify(this.customers));
        localStorage.setItem('service_history', JSON.stringify(this.serviceHistory));
        localStorage.setItem('contracts', JSON.stringify(this.contracts));
        localStorage.setItem('loyalty_points', JSON.stringify(this.loyaltyPoints));
    }
}

// ============================================
// 5. نظام تتبع GPS (GPS Tracking System)
// ============================================

class GPSTrackingSystem {
    constructor() {
        this.locations = JSON.parse(localStorage.getItem('gps_locations')) || [];
        this.routes = JSON.parse(localStorage.getItem('routes')) || [];
        this.geofences = JSON.parse(localStorage.getItem('geofences')) || [];
    }

    // تسجيل موقع الفريق
    recordTeamLocation(teamId, latitude, longitude, timestamp = new Date().toISOString()) {
        const location = {
            id: Date.now(),
            teamId,
            latitude,
            longitude,
            timestamp,
            accuracy: null
        };
        this.locations.push(location);
        this.save();
        return location;
    }

    // الحصول على الموقع الحالي للفريق
    getCurrentTeamLocation(teamId) {
        const teamLocations = this.locations.filter(l => l.teamId === teamId);
        return teamLocations.length > 0 ? teamLocations[teamLocations.length - 1] : null;
    }

    // حساب المسافة بين نقطتين (Haversine Formula)
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // نصف قطر الأرض بالكيلومتر
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // إنشاء منطقة جغرافية (Geofence)
    createGeofence(fenceData) {
        const fence = {
            id: Date.now(),
            ...fenceData,
            radius: fenceData.radius || 100, // متر
            createdAt: new Date().toISOString()
        };
        this.geofences.push(fence);
        this.save();
        return fence;
    }

    // التحقق من الانحراف عن المسار
    checkRouteDeviation(teamId, appointmentLocation, tolerance = 500) {
        const currentLocation = this.getCurrentTeamLocation(teamId);
        if (!currentLocation) return null;

        const distance = this.calculateDistance(
            currentLocation.latitude,
            currentLocation.longitude,
            appointmentLocation.latitude,
            appointmentLocation.longitude
        ) * 1000; // تحويل إلى متر

        return {
            teamId,
            distance,
            tolerance,
            isDeviating: distance > tolerance,
            deviation: distance - tolerance
        };
    }

    // تحسين المسارات
    optimizeRoutes(teamId) {
        const teamLocations = this.locations.filter(l => l.teamId === teamId)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        if (teamLocations.length < 2) return [];

        const route = {
            id: Date.now(),
            teamId,
            waypoints: teamLocations,
            distance: 0,
            estimatedTime: 0,
            createdAt: new Date().toISOString()
        };

        // حساب المسافة الكلية
        for (let i = 0; i < teamLocations.length - 1; i++) {
            const distance = this.calculateDistance(
                teamLocations[i].latitude,
                teamLocations[i].longitude,
                teamLocations[i + 1].latitude,
                teamLocations[i + 1].longitude
            );
            route.distance += distance;
        }

        route.estimatedTime = (route.distance / 40) * 60; // بافتراض 40 كم/ساعة
        this.routes.push(route);
        this.save();
        return route;
    }

    save() {
        localStorage.setItem('gps_locations', JSON.stringify(this.locations));
        localStorage.setItem('routes', JSON.stringify(this.routes));
        localStorage.setItem('geofences', JSON.stringify(this.geofences));
    }
}

// ============================================
// 6. نظام التقارير المتقدم (Advanced Reporting)
// ============================================

class AdvancedReporting {
    constructor() {
        this.reports = JSON.parse(localStorage.getItem('reports')) || [];
    }

    // تقرير الأرباح والخسائر
    getProfitLossReport(startDate, endDate) {
        // هذا يحتاج إلى بيانات من BillingSystem و InventorySystem
        return {
            period: `${startDate} إلى ${endDate}`,
            revenue: 0, // سيتم حسابها من الفواتير
            expenses: 0, // سيتم حسابها من المشتريات
            profit: 0,
            profitMargin: 0,
            generatedAt: new Date().toISOString()
        };
    }

    // لوحة قيادة KPI
    getKPIDashboard() {
        return {
            totalRevenue: 0,
            totalExpenses: 0,
            profitMargin: 0,
            customerCount: 0,
            teamCount: 0,
            appointmentCompletion: 0,
            averageServiceRating: 0,
            employeeProductivity: 0,
            generatedAt: new Date().toISOString()
        };
    }

    // تقرير الأداء
    getPerformanceReport(teamId, startDate, endDate) {
        return {
            teamId,
            period: `${startDate} إلى ${endDate}`,
            completedServices: 0,
            totalHours: 0,
            averageRating: 0,
            issues: 0,
            efficiency: 0,
            generatedAt: new Date().toISOString()
        };
    }

    // توقعات الدخل
    incomeForecasting(months = 6) {
        const forecast = [];
        for (let i = 0; i < months; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() + i);
            forecast.push({
                month: date.toISOString().split('T')[0],
                projectedIncome: 0,
                confidence: 0.85,
                trendDirection: 'صعود'
            });
        }
        return forecast;
    }

    // تصدير التقرير
    exportReport(reportType, format = 'pdf', startDate, endDate) {
        return {
            type: reportType,
            format,
            period: `${startDate} إلى ${endDate}`,
            exportedAt: new Date().toISOString(),
            url: null // سيتم إنشاء رابط التحميل
        };
    }

    save() {
        localStorage.setItem('reports', JSON.stringify(this.reports));
    }
}

// ============================================
// 7. نظام الصور والتوقيعات (Photo & Signature System)
// ============================================

class PhotoSignatureSystem {
    constructor() {
        this.photos = JSON.parse(localStorage.getItem('service_photos')) || [];
        this.signatures = JSON.parse(localStorage.getItem('signatures')) || [];
    }

    // إضافة صور قبل وبعد
    addServicePhotos(appointmentId, photosData) {
        const photos = {
            id: Date.now(),
            appointmentId,
            before: photosData.before || [],
            after: photosData.after || [],
            uploadedAt: new Date().toISOString(),
            team: photosData.team
        };
        this.photos.push(photos);
        this.save();
        return photos;
    }

    // الحصول على صور الخدمة
    getServicePhotos(appointmentId) {
        return this.photos.find(p => p.appointmentId === appointmentId);
    }

    // إضافة توقيع رقمي
    addDigitalSignature(appointmentId, signatureData) {
        const signature = {
            id: Date.now(),
            appointmentId,
            signatureCanvas: signatureData.canvas,
            signedBy: signatureData.name,
            signedAt: new Date().toISOString(),
            verified: false
        };
        this.signatures.push(signature);
        this.save();
        return signature;
    }

    // التحقق من التوقيع
    verifySignature(signatureId) {
        const signature = this.signatures.find(s => s.id === signatureId);
        if (signature) {
            signature.verified = true;
            signature.verifiedAt = new Date().toISOString();
            this.save();
            return signature;
        }
        return null;
    }

    save() {
        localStorage.setItem('service_photos', JSON.stringify(this.photos));
        localStorage.setItem('signatures', JSON.stringify(this.signatures));
    }
}

// ============================================
// 8. نظام إدارة الشكاوى (Complaints Management)
// ============================================

class ComplaintsManagement {
    constructor() {
        this.complaints = JSON.parse(localStorage.getItem('complaints')) || [];
        this.resolutions = JSON.parse(localStorage.getItem('resolutions')) || [];
    }

    // تقديم شكوى جديدة
    submitComplaint(complaintData) {
        const complaint = {
            id: 'COMP-' + Date.now(),
            ...complaintData,
            status: 'جديد',
            priority: complaintData.priority || 'عادي',
            submittedAt: new Date().toISOString(),
            updates: []
        };
        this.complaints.push(complaint);
        this.save();
        return complaint;
    }

    // تحديث حالة الشكوى
    updateComplaintStatus(complaintId, status, notes) {
        const complaint = this.complaints.find(c => c.id === complaintId);
        if (complaint) {
            const update = {
                timestamp: new Date().toISOString(),
                oldStatus: complaint.status,
                newStatus: status,
                notes
            };
            complaint.updates.push(update);
            complaint.status = status;
            
            if (status === 'حل') {
                complaint.resolvedAt = new Date().toISOString();
            }
            
            this.save();
            return complaint;
        }
        return null;
    }

    // إنشاء حل
    createResolution(complaintId, resolutionData) {
        const resolution = {
            id: Date.now(),
            complaintId,
            ...resolutionData,
            createdAt: new Date().toISOString(),
            approved: false
        };
        this.resolutions.push(resolution);
        this.updateComplaintStatus(complaintId, 'قيد المراجعة', 'تم إنشاء حل مقترح');
        this.save();
        return resolution;
    }

    // الشكاوى المفتوحة
    getOpenComplaints() {
        return this.complaints.filter(c => c.status !== 'حل');
    }

    // إحصائيات الشكاوى
    getComplaintsStatistics() {
        return {
            total: this.complaints.length,
            open: this.complaints.filter(c => c.status !== 'حل').length,
            closed: this.complaints.filter(c => c.status === 'حل').length,
            avgResolutionTime: 0,
            byPriority: {
                عالي: this.complaints.filter(c => c.priority === 'عالي').length,
                عادي: this.complaints.filter(c => c.priority === 'عادي').length,
                منخفض: this.complaints.filter(c => c.priority === 'منخفض').length
            }
        };
    }

    save() {
        localStorage.setItem('complaints', JSON.stringify(this.complaints));
        localStorage.setItem('resolutions', JSON.stringify(this.resolutions));
    }
}

// ============================================
// 9. نظام إدارة الغياب والإجازات (Attendance Management)
// ============================================

class AttendanceManagement {
    constructor() {
        this.attendance = JSON.parse(localStorage.getItem('attendance')) || [];
        this.leaves = JSON.parse(localStorage.getItem('leaves')) || [];
        this.holidays = JSON.parse(localStorage.getItem('holidays')) || this.initializeHolidays();
    }

    // تسجيل الحضور
    recordAttendance(employeeId, checkInTime, checkOutTime = null) {
        const record = {
            id: Date.now(),
            employeeId,
            date: new Date().toISOString().split('T')[0],
            checkIn: checkInTime || new Date().toISOString(),
            checkOut: checkOutTime,
            status: 'حاضر',
            hoursWorked: 0
        };

        if (checkOutTime) {
            const checkInDate = new Date(checkInTime);
            const checkOutDate = new Date(checkOutTime);
            record.hoursWorked = (checkOutDate - checkInDate) / (1000 * 60 * 60);
        }

        this.attendance.push(record);
        this.save();
        return record;
    }

    // طلب إجازة
    requestLeave(employeeId, leaveData) {
        const leave = {
            id: 'LEAVE-' + Date.now(),
            employeeId,
            ...leaveData,
            status: 'معلقة',
            submittedAt: new Date().toISOString(),
            returnDate: leaveData.returnDate
        };
        this.leaves.push(leave);
        this.save();
        return leave;
    }

    // الموافقة على الإجازة
    approveLeave(leaveId, approverNotes) {
        const leave = this.leaves.find(l => l.id === leaveId);
        if (leave) {
            leave.status = 'موافق عليها';
            leave.approvedAt = new Date().toISOString();
            leave.approverNotes = approverNotes;
            this.save();
            return leave;
        }
        return null;
    }

    // الحضور والغياب الشهري
    getMonthlyAttendance(employeeId, month, year) {
        return this.attendance.filter(a => {
            const date = new Date(a.date);
            return a.employeeId === employeeId && 
                   date.getMonth() === month - 1 && 
                   date.getFullYear() === year;
        });
    }

    // حساب الراتب على أساس الحضور
    calculatePayBasedOnAttendance(employeeId, baseSalary, month, year) {
        const monthlyRecords = this.getMonthlyAttendance(employeeId, month, year);
        const totalHours = monthlyRecords.reduce((sum, r) => sum + r.hoursWorked, 0);
        const expectedHours = 22 * 8; // 22 يوم عمل × 8 ساعات
        
        return {
            employeeId,
            baseSalary,
            totalHours,
            expectedHours,
            percentage: (totalHours / expectedHours) * 100,
            actualSalary: (baseSalary / expectedHours) * totalHours
        };
    }

    // initializeHolidays
    initializeHolidays() {
        return [
            { date: '01-01', name: 'رأس السنة' },
            { date: '05-01', name: 'عيد العمل' },
            // أضف المزيد من العطلات الوطنية
        ];
    }

    save() {
        localStorage.setItem('attendance', JSON.stringify(this.attendance));
        localStorage.setItem('leaves', JSON.stringify(this.leaves));
        localStorage.setItem('holidays', JSON.stringify(this.holidays));
    }
}

// ============================================
// 10. نظام الخصومات والترقيات (Discounts & Promotions)
// ============================================

class DiscountsPromotions {
    constructor() {
        this.discountCodes = JSON.parse(localStorage.getItem('discount_codes')) || [];
        this.promotions = JSON.parse(localStorage.getItem('promotions')) || [];
        this.usedCodes = JSON.parse(localStorage.getItem('used_codes')) || [];
    }

    // إنشاء كود خصم
    createDiscountCode(codeData) {
        const code = {
            id: Date.now(),
            code: codeData.code || this.generateCode(),
            discount: codeData.discount || 0,
            discountType: codeData.discountType || 'نسبة', // نسبة أو مبلغ ثابت
            maxUses: codeData.maxUses || -1,
            currentUses: 0,
            expiryDate: codeData.expiryDate,
            minOrderValue: codeData.minOrderValue || 0,
            applicableServices: codeData.applicableServices || [],
            status: 'نشط',
            createdAt: new Date().toISOString()
        };
        this.discountCodes.push(code);
        this.save();
        return code;
    }

    // تطبيق كود الخصم
    applyDiscountCode(code, orderValue, serviceType = null) {
        const discountCode = this.discountCodes.find(c => c.code === code && c.status === 'نشط');
        
        if (!discountCode) return { valid: false, message: 'الكود غير صالح' };
        
        const expiryDate = new Date(discountCode.expiryDate);
        if (expiryDate < new Date()) return { valid: false, message: 'الكود منتهي الصلاحية' };
        
        if (discountCode.maxUses > 0 && discountCode.currentUses >= discountCode.maxUses) {
            return { valid: false, message: 'انتهى عدد استخدامات الكود' };
        }
        
        if (orderValue < discountCode.minOrderValue) {
            return { valid: false, message: `الحد الأدنى من الطلب ${discountCode.minOrderValue}` };
        }

        if (discountCode.applicableServices.length > 0 && !discountCode.applicableServices.includes(serviceType)) {
            return { valid: false, message: 'الكود غير قابل للتطبيق على هذه الخدمة' };
        }

        let discountAmount = 0;
        if (discountCode.discountType === 'نسبة') {
            discountAmount = (orderValue * discountCode.discount) / 100;
        } else {
            discountAmount = discountCode.discount;
        }

        const usage = {
            id: Date.now(),
            code,
            orderValue,
            discountAmount,
            usedAt: new Date().toISOString()
        };

        this.usedCodes.push(usage);
        discountCode.currentUses += 1;
        this.save();

        return {
            valid: true,
            discount: discountAmount,
            finalPrice: orderValue - discountAmount
        };
    }

    // إنشاء ترقية
    createPromotion(promotionData) {
        const promotion = {
            id: 'PROMO-' + Date.now(),
            ...promotionData,
            title: promotionData.title || '',
            description: promotionData.description || '',
            discountPercentage: promotionData.discountPercentage || 0,
            startDate: promotionData.startDate,
            endDate: promotionData.endDate,
            targetCustomers: promotionData.targetCustomers || 'all',
            status: 'نشطة',
            createdAt: new Date().toISOString()
        };
        this.promotions.push(promotion);
        this.save();
        return promotion;
    }

    // الترقيات النشطة
    getActivePromotions() {
        const today = new Date().toISOString().split('T')[0];
        return this.promotions.filter(p => p.startDate <= today && p.endDate >= today && p.status === 'نشطة');
    }

    // توليد كود عشوائي
    generateCode() {
        return 'PROMO' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    save() {
        localStorage.setItem('discount_codes', JSON.stringify(this.discountCodes));
        localStorage.setItem('promotions', JSON.stringify(this.promotions));
        localStorage.setItem('used_codes', JSON.stringify(this.usedCodes));
    }
}

// ============================================
// 11. نظام سجل التدقيق (Audit Log System)
// ============================================

class AuditLogSystem {
    constructor() {
        this.logs = JSON.parse(localStorage.getItem('audit_logs')) || [];
    }

    // تسجيل إجراء
    logAction(action, userId, details, entityType = null, entityId = null) {
        const log = {
            id: Date.now(),
            action,
            userId,
            entityType,
            entityId,
            details,
            timestamp: new Date().toISOString(),
            ipAddress: null // يمكن إضافته لاحقاً
        };
        this.logs.push(log);
        this.save();
        return log;
    }

    // الحصول على سجل التغييرات لكائن معين
    getEntityChangeHistory(entityType, entityId) {
        return this.logs.filter(l => l.entityType === entityType && l.entityId === entityId);
    }

    // سجل النشاط للمستخدم
    getUserActivity(userId, startDate = null, endDate = null) {
        let userLogs = this.logs.filter(l => l.userId === userId);
        
        if (startDate) {
            userLogs = userLogs.filter(l => new Date(l.timestamp) >= new Date(startDate));
        }
        if (endDate) {
            userLogs = userLogs.filter(l => new Date(l.timestamp) <= new Date(endDate));
        }
        
        return userLogs;
    }

    // إحصائيات النشاط
    getActivityStatistics(startDate, endDate) {
        const logsInPeriod = this.logs.filter(l => {
            const date = new Date(l.timestamp);
            return date >= new Date(startDate) && date <= new Date(endDate);
        });

        const stats = {
            totalActions: logsInPeriod.length,
            actionTypes: {},
            activeUsers: new Set(),
            topActions: []
        };

        logsInPeriod.forEach(log => {
            stats.actionTypes[log.action] = (stats.actionTypes[log.action] || 0) + 1;
            stats.activeUsers.add(log.userId);
        });

        stats.activeUsers = stats.activeUsers.size;
        stats.topActions = Object.entries(stats.actionTypes).sort((a, b) => b[1] - a[1]).slice(0, 5);

        return stats;
    }

    save() {
        localStorage.setItem('audit_logs', JSON.stringify(this.logs));
    }
}

// ============================================
// 12. نظام الإشعارات في الوقت الفعلي (Real-time Notifications)
// ============================================

class NotificationSystem {
    constructor() {
        this.notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        this.notificationPreferences = JSON.parse(localStorage.getItem('notification_preferences')) || {};
    }

    // إرسال إشعار
    sendNotification(notification) {
        const notif = {
            id: Date.now(),
            ...notification,
            status: 'جديد',
            createdAt: new Date().toISOString(),
            readAt: null
        };
        this.notifications.push(notif);
        this.save();
        return notif;
    }

    // وضع علامة على الإشعار كمقروء
    markAsRead(notificationId) {
        const notif = this.notifications.find(n => n.id === notificationId);
        if (notif) {
            notif.status = 'مقروء';
            notif.readAt = new Date().toISOString();
            this.save();
        }
        return notif;
    }

    // إشعارات غير مقروءة
    getUnreadNotifications(userId) {
        return this.notifications.filter(n => n.userId === userId && n.status === 'جديد');
    }

    // تعيين تفضيلات الإشعارات
    setNotificationPreferences(userId, preferences) {
        this.notificationPreferences[userId] = {
            email: preferences.email || true,
            sms: preferences.sms || false,
            inApp: preferences.inApp !== false,
            appointmentReminders: preferences.appointmentReminders !== false,
            paymentReminders: preferences.paymentReminders !== false,
            systemAlerts: preferences.systemAlerts !== false
        };
        this.save();
    }

    // حذف الإشعار
    deleteNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.save();
    }

    save() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
        localStorage.setItem('notification_preferences', JSON.stringify(this.notificationPreferences));
    }
}

// ============================================
// تصدير جميع الفئات
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SchedulingSystem,
        InventorySystem,
        BillingSystem,
        AdvancedCustomerManagement,
        GPSTrackingSystem,
        AdvancedReporting,
        PhotoSignatureSystem,
        ComplaintsManagement,
        AttendanceManagement,
        DiscountsPromotions,
        AuditLogSystem,
        NotificationSystem
    };
}
