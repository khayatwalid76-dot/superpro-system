/**
 * CLEANING SYSTEM UI HANDLERS
 * معالجات الواجهة للأقسام الجديدة وتكامل النظام
 */

// ============================================
// 1. تهيئة الأقسام الجديدة عند التحميل
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // تهيئة عند تحميل الصفحة
    if (window.cleaningSystem) {
        console.log('✅ نظام التنظيفات المتقدم محمل بنجاح');
        
        // تحديث البيانات الأولية
        updateTeamsUI();
        updateLocationsUI();
        updateRatingsUI();
        updatePackagesUI();
    }

    // إضافة معالجات النقر على الأقسام الجديدة
    setupNewModuleHandlers();
});

// ============================================
// 2. معالجات القوائم الجانبية للأقسام الجديدة
// ============================================

function setupNewModuleHandlers() {
    const moduleLinks = document.querySelectorAll('a[data-module]');
    
    moduleLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const moduleName = this.getAttribute('data-module');
            
            // إخفاء جميع الأقسام
            document.querySelectorAll('.module-container').forEach(el => {
                el.style.display = 'none';
            });
            
            // إزالة الفئة النشطة من جميع الروابط
            moduleLinks.forEach(l => l.classList.remove('active'));
            
            // إظهار القسم المحدد
            const moduleElement = document.getElementById(moduleName);
            if (moduleElement) {
                moduleElement.style.display = 'block';
                this.classList.add('active');
                
                // تنفيذ دوال التحديث حسب القسم
                loadModuleData(moduleName);
            }
        });
    });
}

function loadModuleData(moduleName) {
    switch(moduleName) {
        case 'teams':
            loadTeamsData();
            break;
        case 'locations':
            loadLocationsData();
            break;
        case 'ratings':
            loadRatingsData();
            break;
        case 'packages':
            loadPackagesData();
            break;
    }
}

// ============================================
// 3. إدارة الفرق
// ============================================

function updateTeamsUI() {
    const teams = window.cleaningSystem?.teams?.teams || [];
    const totalTeams = teams.length;
    const activeTeams = teams.filter(t => t.status === 'نشط').length;
    const totalMembers = teams.reduce((sum, t) => sum + (t.members?.length || 0), 0);
    
    document.getElementById('totalTeamsCount').textContent = totalTeams;
    document.getElementById('activeTeamsCount').textContent = activeTeams;
    document.getElementById('totalTeamMembersCount').textContent = totalMembers;
}

function loadTeamsData() {
    const teams = window.cleaningSystem?.teams?.teams || [];
    renderTeamsTable(teams);
}

function renderTeamsTable(teams) {
    const tbody = document.getElementById('teams-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (teams.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">لا توجد فرق مسجلة</td></tr>';
        return;
    }
    
    teams.forEach((team, index) => {
        const row = document.createElement('tr');
        const performance = calculateTeamPerformance(team.id);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${team.name || 'غير محدد'}</strong></td>
            <td>${team.leader || 'غير محدد'}</td>
            <td><span class="badge bg-info">${team.members?.length || 0}</span></td>
            <td>${team.specialty || 'عام'}</td>
            <td>
                <span class="badge ${team.status === 'نشط' ? 'bg-success' : 'bg-warning'}">
                    ${team.status}
                </span>
            </td>
            <td>
                <small><i class="fas fa-star"></i> ${performance.avg}</small>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-warning" onclick="editTeam(${team.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTeam(${team.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function calculateTeamPerformance(teamId) {
    // سيتم حسابها من analytics
    return { avg: '4.5', completed: 0 };
}

function editTeam(teamId) {
    alert('سيتم فتح نموذج التعديل للفريق');
}

function deleteTeam(teamId) {
    if (confirm('هل أنت متأكد من حذف هذا الفريق؟')) {
        window.cleaningSystem.teams.deleteTeam(teamId);
        updateTeamsUI();
        loadTeamsData();
    }
}

// ============================================
// 4. إدارة المواقع
// ============================================

function updateLocationsUI() {
    const locations = window.cleaningSystem?.teams?.locations || [];
    const totalLocations = locations.length;
    const activeLocations = locations.filter(l => l.status === 'نشط').length;
    
    document.getElementById('totalLocationsCount').textContent = totalLocations;
    document.getElementById('activeLocationsCount').textContent = activeLocations;
}

function loadLocationsData() {
    const locations = window.cleaningSystem?.teams?.locations || [];
    renderLocationsTable(locations);
}

function renderLocationsTable(locations) {
    const tbody = document.getElementById('locations-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (locations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">لا توجد مواقع مسجلة</td></tr>';
        return;
    }
    
    locations.forEach((location, index) => {
        const row = document.createElement('tr');
        const rating = getLocationRating(location.id);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${location.area || 'غير محددة'}</td>
            <td><strong>${location.clientName || 'غير محدد'}</strong></td>
            <td>${location.phone || '-'}</td>
            <td>${location.type || 'عام'}</td>
            <td>
                <span class="text-warning">
                    ${'⭐'.repeat(Math.round(rating || 0))}
                </span>
            </td>
            <td>
                <span class="badge bg-success">نشط</span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-warning" onclick="editLocation(${location.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteLocation(${location.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getLocationRating(locationId) {
    // سيتم جلبها من نظام التقييمات
    return 4.5;
}

function editLocation(locationId) {
    alert('سيتم فتح نموذج التعديل للموقع');
}

function deleteLocation(locationId) {
    if (confirm('هل أنت متأكد من حذف هذا الموقع؟')) {
        window.cleaningSystem.teams.locations = 
            window.cleaningSystem.teams.locations.filter(l => l.id !== locationId);
        window.cleaningSystem.teams.save();
        updateLocationsUI();
        loadLocationsData();
    }
}

// ============================================
// 5. إدارة التقييمات
// ============================================

function updateRatingsUI() {
    const ratings = window.cleaningSystem?.ratings?.ratings || [];
    const stats = window.cleaningSystem?.ratings?.getRatingStats?.() || {};
    
    const avgRating = stats.average || 0;
    const totalRatings = stats.total || 0;
    const negativeRatings = (stats.distribution?.[1]?.count || 0) + 
                            (stats.distribution?.[2]?.count || 0);
    
    document.getElementById('avgRatingScore').textContent = avgRating;
    document.getElementById('totalRatingsCount').textContent = totalRatings;
    document.getElementById('negativeRatingsCount').textContent = negativeRatings;
    
    // تحديث توزيع التقييمات
    if (stats.distribution) {
        for (let i = 1; i <= 5; i++) {
            const countElement = document.getElementById(`rating${i}Count`);
            if (countElement) {
                countElement.textContent = stats.distribution[i]?.count || 0;
            }
        }
    }
}

function loadRatingsData() {
    const ratings = window.cleaningSystem?.ratings?.ratings || [];
    renderRatingsTable(ratings);
}

function renderRatingsTable(ratings) {
    const tbody = document.getElementById('ratings-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (ratings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">لا توجد تقييمات</td></tr>';
        return;
    }
    
    const sortedRatings = [...ratings].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    ).slice(0, 10);
    
    sortedRatings.forEach((rating, index) => {
        const row = document.createElement('tr');
        const stars = '⭐'.repeat(rating.rating || 0);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${rating.clientName || 'غير محدد'}</td>
            <td>${rating.service || 'عام'}</td>
            <td>
                <span class="text-warning">${stars}</span>
            </td>
            <td>${new Date(rating.date).toLocaleDateString('ar-SA')}</td>
            <td><small>${rating.comment || '-'}</small></td>
            <td>
                <span class="badge bg-${rating.status === 'جديد' ? 'info' : 'success'}">
                    ${rating.status || 'جديد'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteRating(${rating.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteRating(ratingId) {
    if (confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
        window.cleaningSystem.ratings.ratings = 
            window.cleaningSystem.ratings.ratings.filter(r => r.id !== ratingId);
        window.cleaningSystem.ratings.save();
        updateRatingsUI();
        loadRatingsData();
    }
}

// ============================================
// 6. إدارة الحزم والخدمات
// ============================================

function updatePackagesUI() {
    const packages = window.cleaningSystem?.services?.packages || [];
    const services = window.cleaningSystem?.services?.services || [];
    
    document.getElementById('totalPackagesCount').textContent = packages.length;
    document.getElementById('activePackagesCount').textContent = 
        packages.filter(p => p.status !== 'معطل').length;
    document.getElementById('totalServicesCount').textContent = services.length;
}

function loadPackagesData() {
    const packages = window.cleaningSystem?.services?.packages || [];
    const services = window.cleaningSystem?.services?.services || [];
    
    renderPackagesGrid(packages);
    renderServicesTable(services);
}

function renderPackagesGrid(packages) {
    const grid = document.getElementById('packages-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (packages.length === 0) {
        grid.innerHTML = '<div class="col-12"><p class="text-center text-muted">لا توجد حزم مسجلة</p></div>';
        return;
    }
    
    packages.forEach(pkg => {
        const card = document.createElement('div');
        card.className = 'col-md-4';
        
        const services = pkg.services?.map(s => {
            const service = window.cleaningSystem?.services?.services?.find(sv => sv.id === s);
            return service?.name || 'خدمة غير محددة';
        }).join(', ') || 'لا توجد خدمات';
        
        card.innerHTML = `
            <div class="card h-100 shadow-sm">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">${pkg.name}</h5>
                </div>
                <div class="card-body">
                    <p><strong>النوع:</strong> ${pkg.type}</p>
                    <p><strong>السعر الأساسي:</strong> ${pkg.price} ر.ق</p>
                    ${pkg.discount > 0 ? `<p><strong>الخصم:</strong> ${pkg.discount}%</p>` : ''}
                    <p><strong>السعر النهائي:</strong> <span class="text-success fw-bold">${pkg.finalPrice} ر.ق</span></p>
                    <p><small>${pkg.description || ''}</small></p>
                    <hr>
                    <small><strong>الخدمات:</strong><br>${services}</small>
                </div>
                <div class="card-footer bg-light">
                    <button class="btn btn-sm btn-outline-primary" onclick="editPackage(${pkg.id})">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deletePackage(${pkg.id})">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderServicesTable(services) {
    const tbody = document.getElementById('services-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (services.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">لا توجد خدمات مسجلة</td></tr>';
        return;
    }
    
    services.forEach((service, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${service.name}</strong></td>
            <td>${service.category || 'عام'}</td>
            <td>${service.basePrice} ر.ق</td>
            <td><small>${service.description || '-'}</small></td>
            <td><span class="badge bg-success">نشط</span></td>
            <td>
                <button class="btn btn-sm btn-outline-warning" onclick="editService(${service.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteService(${service.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editPackage(packageId) {
    alert('سيتم فتح نموذج التعديل للحزمة');
}

function deletePackage(packageId) {
    if (confirm('هل أنت متأكد من حذف هذه الحزمة؟')) {
        window.cleaningSystem.services.packages = 
            window.cleaningSystem.services.packages.filter(p => p.id !== packageId);
        window.cleaningSystem.services.save();
        updatePackagesUI();
        loadPackagesData();
    }
}

function editService(serviceId) {
    alert('سيتم فتح نموذج التعديل للخدمة');
}

function deleteService(serviceId) {
    if (confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
        window.cleaningSystem.services.services = 
            window.cleaningSystem.services.services.filter(s => s.id !== serviceId);
        window.cleaningSystem.services.save();
        updatePackagesUI();
        loadPackagesData();
    }
}

// ============================================
// 7. وظائف عملية إضافية
// ============================================

function addTeam(teamData) {
    const team = window.cleaningSystem.teams.addTeam(teamData);
    updateTeamsUI();
    loadTeamsData();
    return team;
}

function addLocation(locationData) {
    const location = window.cleaningSystem.teams.addLocation(locationData);
    updateLocationsUI();
    loadLocationsData();
    return location;
}

function addRating(ratingData) {
    const rating = window.cleaningSystem.ratings.addRating(ratingData);
    updateRatingsUI();
    loadRatingsData();
    return rating;
}

function addPackage(packageData) {
    const pkg = window.cleaningSystem.services.addPackage(packageData);
    updatePackagesUI();
    loadPackagesData();
    return pkg;
}

function addService(serviceData) {
    const service = window.cleaningSystem.services.addService(serviceData);
    updatePackagesUI();
    loadPackagesData();
    return service;
}

// تصدير الدوال للاستخدام العام
if (typeof window !== 'undefined') {
    window.cleaningUI = {
        addTeam,
        addLocation,
        addRating,
        addPackage,
        addService,
        loadTeamsData,
        loadLocationsData,
        loadRatingsData,
        loadPackagesData
    };
}
