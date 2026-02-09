// نظام المزامنة التلقائية - تحميل وحفظ تلقائي من السحابة فقط

// 1. تحميل البيانات تلقائياً عند فتح الموقع
window.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 بدء تحميل البيانات التلقائي...');
    
    // تحميل البيانات من السحابة فقط
    loadFromCloud();
});

// 2. تحميل البيانات من السحابة
function loadFromCloud() {
    fetch('https://superpro-system-8871f-default-rtdb.asia-southeast1.firebasedatabase.app/data.json')
    .then(response => response.json())
    .then(data => {
        if (data && data.employees) {
            window.employees = data.employees || [];
            window.clients = data.clients || [];
            window.contracts = data.contracts || [];
            
            // حفظ في sessionStorage فقط
            sessionStorage.setItem('superpro_employees', JSON.stringify(window.employees));
            sessionStorage.setItem('superpro_clients', JSON.stringify(window.clients));
            sessionStorage.setItem('superpro_contracts', JSON.stringify(window.contracts));
            
            // تحديث الواجهة
            setTimeout(() => {
                if (typeof loadEmployees === 'function') loadEmployees();
                if (typeof loadClients === 'function') loadClients();
                console.log('✅ تم تحميل البيانات من السحابة');
                console.log(`📊 الموظفون: ${window.employees.length}, العملاء: ${window.clients.length}`);
            }, 500);
        }
    })
    .catch(error => {
        console.log('📭 لا توجد بيانات في السحابة بعد');
    });
}

// 3. حفظ تلقائي بعد أي تعديل
function autoSave() {
    console.log('💾 بدء الحفظ التلقائي...');
    
    const data = {
        employees: window.employees || [],
        clients: window.clients || [],
        contracts: window.contracts || [],
        timestamp: new Date().toISOString()
    };
    
    // حفظ في السحابة فقط
    fetch('https://superpro-system-8871f-default-rtdb.asia-southeast1.firebasedatabase.app/data.json', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        console.log('✅ تم الحفظ التلقائي في السحابة');
    })
    .catch(error => {
        console.error('❌ فشل الحفظ التلقائي:', error);
    });
}

// 4. اعتراض دوال التحديث الأصلية وإضافة الحفظ التلقائي
function setupAutoSave() {
    // اعتراض دالة تحميل الموظفين
    if (typeof window.loadEmployees === 'function') {
        const originalLoadEmployees = window.loadEmployees;
        window.loadEmployees = function() {
            const result = originalLoadEmployees.apply(this, arguments);
            setTimeout(autoSave, 3000); // حفظ بعد 3 ثواني
            return result;
        };
    }
    
    // اعتراض دالة تحميل العملاء
    if (typeof window.loadClients === 'function') {
        const originalLoadClients = window.loadClients;
        window.loadClients = function() {
            const result = originalLoadClients.apply(this, arguments);
            setTimeout(autoSave, 3000); // حفظ بعد 3 ثواني
            return result;
        };
    }
    
    // مراقبة التغييرات في الجداول
    setTimeout(() => {
        const employeeTable = document.getElementById('employees-table-body');
        const clientTable = document.getElementById('clients-table-body');
        
        if (employeeTable) {
            const observer = new MutationObserver(() => {
                clearTimeout(window.autoSaveTimeout);
                window.autoSaveTimeout = setTimeout(autoSave, 5000);
            });
            observer.observe(employeeTable, { childList: true, subtree: true });
        }
        
        if (clientTable) {
            const observer = new MutationObserver(() => {
                clearTimeout(window.autoSaveTimeout);
                window.autoSaveTimeout = setTimeout(autoSave, 5000);
            });
            observer.observe(clientTable, { childList: true, subtree: true });
        }
    }, 2000);
}

// 5. إعداد الحفظ التلقائي بعد تحميل الصفحة
setTimeout(setupAutoSave, 3000);

// 6. حفظ يدوي مع رسالة تأكيد
function saveToCloudManual() {
    autoSave();
    alert('✅ تم حفظ البيانات في السحابة!');
}

// 7. إضافة أزرار التحكم
function addAutoSyncControls() {
    const mainContent = document.querySelector('.container') || document.querySelector('main') || document.querySelector('body');
    if (mainContent && !document.getElementById('auto-sync-controls')) {
        mainContent.insertAdjacentHTML('afterbegin', `
            <div id="auto-sync-controls" style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px; text-align: center; border: 2px solid #2196f3;">
                <h4 style="color: #1976d2;">🔄 المزامنة التلقائية</h4>
                <p style="color: #666; margin: 10px 0;">البيانات تحفظ تلقائياً في السحابة بعد أي تعديل</p>
                <button class="btn btn-primary btn-sm me-2" onclick="saveToCloudManual()" style="background: #2196f3; border: none; padding: 8px 16px;">
                    <i class="fas fa-save"></i> حفظ الآن
                </button>
                <button class="btn btn-secondary btn-sm" onclick="loadFromCloud()" style="background: #6c757d; border: none; padding: 8px 16px;">
                    <i class="fas fa-sync"></i> تحديث الآن
                </button>
            </div>
        `);
    }
}

// إضافة الأزرار بعد تحميل الصفحة
setTimeout(addAutoSyncControls, 2000);

console.log('🚀 تم تحميل نظام المزامنة التلقائية (سحابة فقط)');
