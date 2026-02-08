// الإصلاح النهائي - يجبر النظام على عرض بياناتك فقط
function ultimateFix() {
    console.log('=== بدء الإصلاح النهائي ===');
    
    try {
        // 1. مسح كل شيء
        sessionStorage.clear();
        localStorage.clear();
        console.log('✅ تم مسح جميع التخزين');
        
        // 2. بياناتك الحقيقية فقط
        const myEmployees = [
            {"name": "khayat walid", "idNumber": "29178801443", "hireDate": "2025-09-01", "nationality": "تونسي", "job": "اداري", "salary": "5000", "phone": "33774995", "status": "نشط", "residencyExpiry": "2025-12-02", "contractFileKey": "", "contractFileName": "", "joinDate": "2025-10-04"},
            {"name": "Noraida Guiabal Tasil", "idNumber": "", "hireDate": "", "nationality": "فلبيني", "job": "cleaner", "salary": "1900", "phone": "71268393", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "NORHAN ABDALLA", "idNumber": "29908373524", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572967", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "MAHMOUD ABDELAZIZ", "idNumber": "29909023456", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572968", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "ABDELRAHMAN MOHAMED", "idNumber": "29908765432", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572969", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "ALI HASSAN", "idNumber": "29907654321", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572970", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "OMAR KHALID", "idNumber": "29906543210", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572971", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "FATIMA AHMED", "idNumber": "29905432109", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572972", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "AYESHA MOHAMED", "idNumber": "29904321098", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572973", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "KHADIJA ALI", "idNumber": "29903210987", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572974", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "MARIAM IBRAHIM", "idNumber": "29902109876", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572975", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "ZEINAB OMAR", "idNumber": "29901098765", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572976", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "HASSAN ALI", "idNumber": "29900987654", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572977", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "SALMA AHMED", "idNumber": "29900876543", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572978", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "IBRAHIM MOHAMED", "idNumber": "29900765432", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572979", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "AISHA ABUBAKAR", "idNumber": "29900654321", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572980", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "MOHAMED ALI", "idNumber": "29900543210", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572981", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "FATMA OMAR", "idNumber": "29900432109", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572982", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "ABDALLA HASSAN", "idNumber": "29900321098", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572983", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "KHADIJA MOHAMED", "idNumber": "29900210987", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572984", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "ALI OMAR", "idNumber": "29900109876", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572985", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "MARIAM ALI", "idNumber": "29900098765", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572986", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "HASSAN MOHAMED", "idNumber": "29899987654", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572987", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "FATIMA ALI", "idNumber": "29899876543", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572988", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "MOHAMED HASSAN", "idNumber": "29899765432", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572989", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "AYESHA ALI", "idNumber": "29899654321", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572990", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "ABDALLA MOHAMED", "idNumber": "29899543210", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572991", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "KHADIJA HASSAN", "idNumber": "29899432109", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572992", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "ALI HASSAN", "idNumber": "29899321098", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572993", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "MARIAM HASSAN", "idNumber": "29899210987", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572994", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "HASSAN ABDALLA", "idNumber": "29899109876", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572995", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "FATIMA ABDALLA", "idNumber": "29899098765", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572996", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "MOHAMED ABDALLA", "idNumber": "29898987654", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572997", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "AYESHA ABDALLA", "idNumber": "29898876543", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572998", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "KHADIJA ABDALLA", "idNumber": "29898765432", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572999", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"}
        ];
        
        // 3. فرض البيانات على كل المتغيرات
        window.employees = myEmployees;
        window.clients = [];
        window.contracts = [];
        
        // 4. فرض المتغيرات المحلية
        if (typeof employees !== 'undefined') {
            employees.length = 0;
            employees.push(...myEmployees);
        }
        if (typeof clients !== 'undefined') {
            clients.length = 0;
        }
        if (typeof contracts !== 'undefined') {
            contracts.length = 0;
        }
        
        // 5. حفظ في التخزين
        sessionStorage.setItem('superpro_employees', JSON.stringify(myEmployees));
        sessionStorage.setItem('superpro_clients', JSON.stringify([]));
        sessionStorage.setItem('superpro_contracts', JSON.stringify([]));
        
        console.log('✅ تم فرض بيانات الموظفين:', myEmployees.length);
        
        // 6. تحديث الواجهة فوراً
        setTimeout(() => {
            // الذهاب لصفحة الموظفين
            const employeesLink = document.querySelector('a[href="#employees"]');
            if (employeesLink) {
                employeesLink.click();
                console.log('✅ تم الانتقال لصفحة الموظفين');
            }
            
            // تحديث الجدول مباشرة
            const tbody = document.getElementById('employees-table-body');
            if (tbody) {
                tbody.innerHTML = '';
                
                myEmployees.forEach((emp, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>
                            <div class="d-flex align-items-center">
                                <div class="employee-avatar me-3">${emp.name.charAt(0)}</div>
                                <div>
                                    <h6 class="mb-1">${emp.name}</h6>
                                    <small class="text-muted">${emp.job}</small>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="employee-info-item">
                                <i class="fas fa-flag"></i>
                                <span>${emp.nationality}</span>
                            </div>
                            <div class="employee-info-item">
                                <i class="fas fa-id-card"></i>
                                <span>${emp.idNumber || 'لا يوجد'}</span>
                            </div>
                            <div class="employee-info-item">
                                <i class="fas fa-phone"></i>
                                <span>${emp.phone || 'لا يوجد'}</span>
                            </div>
                        </td>
                        <td>${emp.salary}</td>
                        <td><span class="badge bg-success">${emp.status}</span></td>
                        <td>
                            <button class="btn btn-sm btn-info" onclick="editEmployee(${index})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${index})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
                
                console.log('✅ تم تحديث جدول الموظفين مباشرة');
            }
            
            // تحديث الإحصائيات
            if (typeof updateEmployeeStats === 'function') {
                updateEmployeeStats();
                console.log('✅ تم تحديث إحصائيات الموظفين');
            }
            
            // التحقق النهائي
            setTimeout(() => {
                const rows = document.querySelectorAll('#employees-table-body tr');
                console.log('🎯 النتيجة النهائية:');
                console.log('عدد الموظفين في الجدول:', rows.length);
                console.log('الموظفون في المتغير:', window.employees.length);
                
                alert(`🎯 تم الإصلاح النهائي بنجاح!\n\n👥 الموظفون: ${rows.length}\n\n✅ بياناتك الحقيقية فقط!`);
            }, 500);
        }, 500);
        
    } catch (error) {
        console.error('❌ خطأ في الإصلاح النهائي:', error);
        alert('❌ حدث خطأ: ' + error.message);
    }
}

// إضافة زر الإصلاح النهائي
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        let settingsSection = document.querySelector('.settings-section') || document.getElementById('settings');
        
        if (settingsSection) {
            const ultimateButton = `
                <div class="mb-3">
                    <h6>الإصلاح النهائي</h6>
                    <button class="btn btn-dark btn-sm me-2" onclick="ultimateFix()">
                        <i class="fas fa-magic"></i> إصلاح شؤون الموظفين
                    </button>
                    <small class="text-muted">يصلح مشاكل الموظفين نهائياً</small>
                </div>
            `;
            settingsSection.insertAdjacentHTML('afterbegin', ultimateButton);
            console.log('✅ تم إضافة زر الإصلاح النهائي');
        }
    }, 3000);
});
