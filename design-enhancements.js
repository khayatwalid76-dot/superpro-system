/**
 * SUPER_PRO System — Design Enhancements
 * =======================================
 * This file adds visual and UX enhancements on top of the existing system.
 * It runs AFTER all existing JS files and does NOT redefine any existing
 * functions or variables.
 *
 * Features:
 *  1. Collapsible Sidebar Groups
 *  2. Command Palette (Ctrl+K / Cmd+K)
 *  3. Skeleton Loading helpers
 *  4. Staggered Entrance Animations
 *  5. Welcome Section (Dashboard)
 *  6. Bottom Navigation (Mobile)
 *  7. Enhanced Toast Notifications
 *  8. Goals Progress Section
 *  9. Table Enhancements (pagination + sorting)
 * 10. Scroll-to-Top Button
 */

/* =========================================================================
   1. COLLAPSIBLE SIDEBAR GROUPS
   ========================================================================= */

function initCollapsibleSidebar() {
    try {
        const sidebar = document.querySelector('.sidebar .nav.flex-column') ||
                        document.querySelector('.sidebar nav .nav.flex-column') ||
                        document.querySelector('.sidebar ul.nav');
        if (!sidebar) {
            console.warn('[Enhancements] Sidebar nav not found – skipping collapsible groups.');
            return;
        }

        // Define group structure
        const groupDefs = [
            {
                key: 'main',
                title: '📋 القائمة الرئيسية',
                modules: ['dashboard', 'employees']
            },
            {
                key: 'lists',
                title: '📊 القائمات',
                modules: [
                    'attendance', 'clients', 'contracts', 'dailyWork',
                    'dailyIncome', 'dailyExpenses', 'services', 'finance', 'payroll'
                ]
            },
            {
                key: 'advanced',
                title: '🚀 أنظمة متقدمة',
                modules: [
                    'analytics', 'notifications', 'tasks', 'documents',
                    'search', 'security', 'invoices', 'hr', 'calendar',
                    'reports', 'settings', 'activityLog'
                ]
            }
        ];

        // Gather all nav-items from sidebar
        const allItems = Array.from(sidebar.querySelectorAll(':scope > li.nav-item, :scope > .nav-item, :scope > li'));

        // Remove existing section-title dividers so we can re-group
        const sectionTitles = sidebar.querySelectorAll('.section-title');
        sectionTitles.forEach(function (el) {
            if (el.closest('.nav.flex-column') === sidebar) {
                el.remove();
            }
        });

        // Build a map of module → nav-item element
        const moduleMap = {};
        allItems.forEach(function (item) {
            const link = item.querySelector('.nav-link[data-module]');
            if (link) {
                moduleMap[link.getAttribute('data-module')] = item;
            }
        });

        // Load persisted collapsed state
        var savedState = {};
        try {
            var raw = localStorage.getItem('sp_sidebar_state');
            if (raw) savedState = JSON.parse(raw);
        } catch (_e) { /* ignore */ }

        function saveState() {
            try {
                localStorage.setItem('sp_sidebar_state', JSON.stringify(savedState));
            } catch (_e) { /* ignore */ }
        }

        // Clear sidebar contents – we will rebuild
        sidebar.innerHTML = '';

        groupDefs.forEach(function (gDef) {
            // Create group wrapper
            var group = document.createElement('div');
            group.className = 'sidebar-group';
            group.setAttribute('data-group', gDef.key);

            // Header
            var header = document.createElement('div');
            header.className = 'sidebar-group-header';
            header.innerHTML =
                '<span class="group-title">' + gDef.title + '</span>' +
                '<i class="fas fa-chevron-down group-icon"></i>';
            group.appendChild(header);

            // Items container
            var itemsWrap = document.createElement('div');
            itemsWrap.className = 'sidebar-group-items';

            gDef.modules.forEach(function (mod) {
                if (moduleMap[mod]) {
                    itemsWrap.appendChild(moduleMap[mod]);
                }
            });

            group.appendChild(itemsWrap);

            // Apply persisted collapsed state
            if (savedState[gDef.key] === true) {
                group.classList.add('collapsed');
            }

            // Toggle handler
            header.addEventListener('click', function () {
                group.classList.toggle('collapsed');
                savedState[gDef.key] = group.classList.contains('collapsed');
                saveState();
            });

            sidebar.appendChild(group);
        });

        // Append any remaining items that were not in defined groups
        Object.keys(moduleMap).forEach(function (mod) {
            var found = groupDefs.some(function (g) { return g.modules.indexOf(mod) !== -1; });
            if (!found && moduleMap[mod] && !moduleMap[mod].parentNode) {
                sidebar.appendChild(moduleMap[mod]);
            }
        });

        console.log('[Enhancements] Collapsible sidebar initialized.');
    } catch (err) {
        console.error('[Enhancements] initCollapsibleSidebar error:', err);
    }
}


/* =========================================================================
   2. COMMAND PALETTE  (Ctrl+K / Cmd+K)
   ========================================================================= */

function initCommandPalette() {
    try {
        // Build command list from sidebar nav links
        var commands = [];

        var navLinks = document.querySelectorAll('.nav-link[data-module]');
        navLinks.forEach(function (link) {
            var moduleName = link.getAttribute('data-module');
            var text = (link.textContent || '').trim();
            commands.push({
                label: text || moduleName,
                action: function () { navigateToModule(moduleName); }
            });
        });

        // Additional quick-actions
        var extras = [
            {
                label: 'إضافة موظف جديد',
                action: function () { navigateToModule('employees'); openEmployeeModal(); }
            },
            {
                label: 'إضافة عميل جديد',
                action: function () { navigateToModule('clients'); openClientModal(); }
            },
            {
                label: 'إضافة عقد جديد',
                action: function () { navigateToModule('contracts'); openContractModal(); }
            },
            {
                label: 'نسخة احتياطية',
                action: function () {
                    if (typeof backupData === 'function') { backupData(); }
                    else if (typeof createAndDownloadBackup === 'function') { createAndDownloadBackup(); }
                    else { showToast('لا تتوفر وظيفة النسخ الاحتياطي', 'warning'); }
                }
            },
            {
                label: 'الوضع الليلي',
                action: function () {
                    document.body.classList.toggle('dark-mode');
                    try { localStorage.setItem('sp_dark_mode', document.body.classList.contains('dark-mode')); } catch (_e) {}
                }
            },
            {
                label: 'تحديث البيانات',
                action: function () {
                    if (typeof loadCurrentModuleData === 'function') { loadCurrentModuleData(); }
                    else { location.reload(); }
                }
            }
        ];

        commands = commands.concat(extras);

        // Create DOM
        var overlay = document.createElement('div');
        overlay.className = 'command-palette-overlay';
        overlay.id = 'commandPaletteOverlay';

        var palette = document.createElement('div');
        palette.className = 'command-palette';
        palette.id = 'commandPalette';

        palette.innerHTML =
            '<div class="command-palette-header">' +
                '<input type="text" id="commandPaletteInput" class="command-palette-input" placeholder="ابحث عن أمر أو صفحة..." autocomplete="off" />' +
            '</div>' +
            '<div class="command-palette-results" id="commandPaletteResults"></div>' +
            '<div class="command-palette-footer">' +
                '<span><kbd>↑↓</kbd> للتنقل</span>' +
                '<span><kbd>Enter</kbd> لتنفيذ</span>' +
                '<span><kbd>Esc</kbd> للإغلاق</span>' +
            '</div>';

        overlay.appendChild(palette);
        document.body.appendChild(overlay);

        var inputEl = document.getElementById('commandPaletteInput');
        var resultsEl = document.getElementById('commandPaletteResults');
        var selectedIndex = -1;
        var filteredCommands = [];

        function openPalette() {
            overlay.classList.add('active');
            inputEl.value = '';
            selectedIndex = -1;
            renderResults('');
            setTimeout(function () { inputEl.focus(); }, 50);
        }

        function closePalette() {
            overlay.classList.remove('active');
        }

        function renderResults(query) {
            query = (query || '').trim().toLowerCase();
            if (!query) {
                filteredCommands = commands.slice();
            } else {
                filteredCommands = commands.filter(function (c) {
                    return c.label.toLowerCase().indexOf(query) !== -1;
                });
            }
            selectedIndex = filteredCommands.length > 0 ? 0 : -1;
            var html = '';
            filteredCommands.forEach(function (cmd, i) {
                html += '<div class="command-palette-item' + (i === selectedIndex ? ' selected' : '') + '" data-index="' + i + '">' +
                    '<i class="fas fa-angle-left command-item-icon"></i>' +
                    '<span>' + escapeHTML(cmd.label) + '</span>' +
                '</div>';
            });
            if (filteredCommands.length === 0) {
                html = '<div class="command-palette-empty">لا توجد نتائج</div>';
            }
            resultsEl.innerHTML = html;

            // Attach click listeners
            resultsEl.querySelectorAll('.command-palette-item').forEach(function (el) {
                el.addEventListener('click', function () {
                    var idx = parseInt(el.getAttribute('data-index'), 10);
                    executeCommand(idx);
                });
            });
        }

        function updateSelection() {
            var items = resultsEl.querySelectorAll('.command-palette-item');
            items.forEach(function (el, i) {
                el.classList.toggle('selected', i === selectedIndex);
            });
            // Scroll into view
            if (items[selectedIndex]) {
                items[selectedIndex].scrollIntoView({ block: 'nearest' });
            }
        }

        function executeCommand(idx) {
            if (idx >= 0 && idx < filteredCommands.length) {
                closePalette();
                try { filteredCommands[idx].action(); } catch (e) { console.error(e); }
            }
        }

        // Input handler
        inputEl.addEventListener('input', function () {
            renderResults(inputEl.value);
        });

        // Keyboard navigation
        inputEl.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (filteredCommands.length > 0) {
                    selectedIndex = (selectedIndex + 1) % filteredCommands.length;
                    updateSelection();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (filteredCommands.length > 0) {
                    selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
                    updateSelection();
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                executeCommand(selectedIndex);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closePalette();
            }
        });

        // Click overlay to close
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closePalette();
        });

        // Global shortcut Ctrl+K / Cmd+K
        document.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (overlay.classList.contains('active')) {
                    closePalette();
                } else {
                    openPalette();
                }
            }
        });

        console.log('[Enhancements] Command palette initialized (Ctrl+K).');
    } catch (err) {
        console.error('[Enhancements] initCommandPalette error:', err);
    }
}

// HTML escape helper
function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}


/* =========================================================================
   3. SKELETON LOADING
   ========================================================================= */

function showSkeletonLoading(containerId, type, rows) {
    try {
        type = type || 'table';
        rows = rows || 5;
        var container = document.getElementById(containerId);
        if (!container) return;

        // Remove existing skeleton if any
        hideSkeletonLoading(containerId);

        var skeleton = document.createElement('div');
        skeleton.className = 'skeleton-wrapper';
        skeleton.setAttribute('data-skeleton', 'true');

        var html = '';

        if (type === 'table') {
            html += '<div class="skeleton-table">';
            // Header row
            html += '<div class="skeleton-row skeleton-header">';
            for (var c = 0; c < 5; c++) {
                html += '<div class="skeleton-cell skeleton-pulse" style="width:' + (15 + Math.random() * 10) + '%"></div>';
            }
            html += '</div>';
            // Body rows
            for (var r = 0; r < rows; r++) {
                html += '<div class="skeleton-row">';
                for (var c2 = 0; c2 < 5; c2++) {
                    html += '<div class="skeleton-cell skeleton-pulse" style="width:' + (12 + Math.random() * 15) + '%"></div>';
                }
                html += '</div>';
            }
            html += '</div>';
        } else if (type === 'cards') {
            html += '<div class="skeleton-cards">';
            for (var i = 0; i < rows; i++) {
                html += '<div class="skeleton-card">' +
                    '<div class="skeleton-card-icon skeleton-pulse"></div>' +
                    '<div class="skeleton-card-line skeleton-pulse" style="width:60%"></div>' +
                    '<div class="skeleton-card-line skeleton-pulse" style="width:40%"></div>' +
                '</div>';
            }
            html += '</div>';
        } else if (type === 'list') {
            html += '<div class="skeleton-list">';
            for (var j = 0; j < rows; j++) {
                html += '<div class="skeleton-list-item">' +
                    '<div class="skeleton-avatar skeleton-pulse"></div>' +
                    '<div class="skeleton-list-text">' +
                        '<div class="skeleton-line skeleton-pulse" style="width:' + (50 + Math.random() * 30) + '%"></div>' +
                        '<div class="skeleton-line skeleton-pulse" style="width:' + (30 + Math.random() * 20) + '%"></div>' +
                    '</div>' +
                '</div>';
            }
            html += '</div>';
        }

        skeleton.innerHTML = html;
        container.prepend(skeleton);
    } catch (err) {
        console.error('[Enhancements] showSkeletonLoading error:', err);
    }
}

function hideSkeletonLoading(containerId) {
    try {
        var container = document.getElementById(containerId);
        if (!container) return;
        var skeletons = container.querySelectorAll('[data-skeleton="true"]');
        skeletons.forEach(function (s) { s.remove(); });
    } catch (err) {
        console.error('[Enhancements] hideSkeletonLoading error:', err);
    }
}


/* =========================================================================
   4. STAGGERED ENTRANCE ANIMATIONS
   ========================================================================= */

function initEntranceAnimations() {
    try {
        if (!('IntersectionObserver' in window)) {
            console.warn('[Enhancements] IntersectionObserver not supported – skipping entrance animations.');
            return;
        }

        var animatedSelectors = '.card, .stat-card, .stat-card-enhanced, .welcome-section, .goals-section';

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    // Apply staggered delay based on sibling index
                    var parent = el.parentElement;
                    if (parent) {
                        var siblings = Array.from(parent.children);
                        var idx = siblings.indexOf(el);
                        el.style.animationDelay = (idx * 0.07) + 's';
                    }
                    el.classList.add('animate-in');
                    observer.unobserve(el);
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -40px 0px'
        });

        function observeElements() {
            document.querySelectorAll(animatedSelectors).forEach(function (el) {
                if (!el.classList.contains('animate-in')) {
                    observer.observe(el);
                }
            });
        }

        observeElements();

        // Re-observe when modules switch (MutationObserver on main content)
        var mainContent = document.querySelector('.main-content') || document.querySelector('[class*="content"]') || document.body;
        var mutObs = new MutationObserver(function () {
            setTimeout(observeElements, 100);
        });
        mutObs.observe(mainContent, { childList: true, subtree: true });

        console.log('[Enhancements] Entrance animations initialized.');
    } catch (err) {
        console.error('[Enhancements] initEntranceAnimations error:', err);
    }
}


/* =========================================================================
   5. WELCOME SECTION
   ========================================================================= */

function navigateToModule(moduleName) {
    try {
        var link = document.querySelector('.nav-link[data-module="' + moduleName + '"]');
        if (link) link.click();
    } catch (e) {
        console.error('[Enhancements] navigateToModule error:', e);
    }
}

function openEmployeeModal() {
    setTimeout(function () {
        try {
            var modal = document.getElementById('employeeModal');
            if (modal && typeof bootstrap !== 'undefined') {
                new bootstrap.Modal(modal).show();
            }
        } catch (e) { console.error(e); }
    }, 300);
}

function openClientModal() {
    setTimeout(function () {
        try {
            var modal = document.getElementById('clientModal');
            if (modal && typeof bootstrap !== 'undefined') {
                new bootstrap.Modal(modal).show();
            }
        } catch (e) { console.error(e); }
    }, 300);
}

function openContractModal() {
    setTimeout(function () {
        try {
            var modal = document.getElementById('contractModal');
            if (modal && typeof bootstrap !== 'undefined') {
                new bootstrap.Modal(modal).show();
            }
        } catch (e) { console.error(e); }
    }, 300);
}

function initWelcomeSection() {
    try {
        var dashboard = document.getElementById('dashboard');
        if (!dashboard) {
            console.warn('[Enhancements] #dashboard not found – skipping welcome section.');
            return;
        }

        // Avoid duplicates
        if (document.getElementById('welcomeSection')) return;

        // Determine greeting based on time of day
        var hour = new Date().getHours();
        var greetingIcon = '☀️';
        var greetingText = 'صباح الخير';
        if (hour >= 12 && hour < 17) {
            greetingIcon = '🌤️';
            greetingText = 'مساء الخير';
        } else if (hour >= 17 && hour < 21) {
            greetingIcon = '🌆';
            greetingText = 'مساء الخير';
        } else if (hour >= 21 || hour < 5) {
            greetingIcon = '🌙';
            greetingText = 'مساء الخير';
        }

        // Try to get current user name from existing auth
        var userName = 'مدير';
        try {
            if (typeof currentUser !== 'undefined' && currentUser && currentUser.name) {
                userName = currentUser.name;
            } else if (typeof currentUser !== 'undefined' && currentUser && currentUser.displayName) {
                userName = currentUser.displayName;
            }
        } catch (_e) { /* ignore */ }

        var welcomeHTML =
            '<div class="welcome-section animate-in" id="welcomeSection">' +
                '<div class="welcome-text">' +
                    '<h2>' + greetingIcon + ' ' + greetingText + '، <span id="welcomeUserName">' + escapeHTML(userName) + '</span>!</h2>' +
                    '<p>مرحباً بك في نظام SUPER PRO. هذا ملخص يومك.</p>' +
                '</div>' +
                '<div class="quick-actions">' +
                    '<button class="quick-action-btn" onclick="navigateToModule(\'employees\');openEmployeeModal();">' +
                        '<i class="fas fa-user-plus"></i>' +
                        '<span>إضافة موظف</span>' +
                    '</button>' +
                    '<button class="quick-action-btn" onclick="navigateToModule(\'clients\');openClientModal();">' +
                        '<i class="fas fa-user-tie"></i>' +
                        '<span>إضافة عميل</span>' +
                    '</button>' +
                    '<button class="quick-action-btn" onclick="navigateToModule(\'contracts\');openContractModal();">' +
                        '<i class="fas fa-file-contract"></i>' +
                        '<span>عقد جديد</span>' +
                    '</button>' +
                    '<button class="quick-action-btn" onclick="navigateToModule(\'dailyWork\')">' +
                        '<i class="fas fa-calendar-day"></i>' +
                        '<span>عمل يومي</span>' +
                    '</button>' +
                    '<button class="quick-action-btn" onclick="if(typeof createAndDownloadBackup===\'function\') createAndDownloadBackup();">' +
                        '<i class="fas fa-download"></i>' +
                        '<span>نسخة احتياطية</span>' +
                    '</button>' +
                '</div>' +
            '</div>';

        // Insert BEFORE the first child (before existing h2 section-title)
        dashboard.insertAdjacentHTML('afterbegin', welcomeHTML);

        console.log('[Enhancements] Welcome section initialized.');
    } catch (err) {
        console.error('[Enhancements] initWelcomeSection error:', err);
    }
}


/* =========================================================================
   6. BOTTOM NAVIGATION (MOBILE)
   ========================================================================= */

function initBottomNav() {
    try {
        // Avoid duplicates
        if (document.getElementById('bottomNav')) return;

        var navHTML =
            '<nav class="bottom-nav" id="bottomNav">' +
                '<a class="bottom-nav-item active" data-module="dashboard">' +
                    '<i class="fas fa-home"></i>' +
                    '<span>الرئيسية</span>' +
                '</a>' +
                '<a class="bottom-nav-item" data-module="employees">' +
                    '<i class="fas fa-users"></i>' +
                    '<span>الموظفين</span>' +
                '</a>' +
                '<a class="bottom-nav-item" data-module="clients">' +
                    '<i class="fas fa-user-tie"></i>' +
                    '<span>العملاء</span>' +
                '</a>' +
                '<a class="bottom-nav-item" data-module="contracts">' +
                    '<i class="fas fa-file-contract"></i>' +
                    '<span>العقود</span>' +
                '</a>' +
                '<a class="bottom-nav-item" id="bottomNavMore">' +
                    '<i class="fas fa-ellipsis-h"></i>' +
                    '<span>المزيد</span>' +
                '</a>' +
            '</nav>';

        document.body.insertAdjacentHTML('beforeend', navHTML);

        var bottomNav = document.getElementById('bottomNav');
        if (!bottomNav) return;

        // Attach click handlers to nav items
        var items = bottomNav.querySelectorAll('.bottom-nav-item[data-module]');
        items.forEach(function (item) {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                var mod = item.getAttribute('data-module');
                if (mod) {
                    navigateToModule(mod);
                    // Update active state
                    bottomNav.querySelectorAll('.bottom-nav-item').forEach(function (el) {
                        el.classList.remove('active');
                    });
                    item.classList.add('active');
                }
            });
        });

        // "More" button toggles sidebar
        var moreBtn = document.getElementById('bottomNavMore');
        if (moreBtn) {
            moreBtn.addEventListener('click', function (e) {
                e.preventDefault();
                var sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    sidebar.classList.toggle('show');
                    sidebar.classList.toggle('mobile-open');
                }
            });
        }

        // Keep bottom-nav active state in sync with sidebar clicks
        document.addEventListener('click', function (e) {
            var link = e.target.closest('.nav-link[data-module]');
            if (link && bottomNav) {
                var mod = link.getAttribute('data-module');
                bottomNav.querySelectorAll('.bottom-nav-item').forEach(function (el) {
                    el.classList.toggle('active', el.getAttribute('data-module') === mod);
                });
            }
        });

        console.log('[Enhancements] Bottom navigation initialized.');
    } catch (err) {
        console.error('[Enhancements] initBottomNav error:', err);
    }
}


/* =========================================================================
   7. ENHANCED TOAST NOTIFICATIONS
   ========================================================================= */

function showToast(message, type, duration) {
    try {
        type = type || 'info';
        duration = duration || 4000;

        // Ensure container exists
        var container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Icon map
        var icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-times-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        var toast = document.createElement('div');
        toast.className = 'enhanced-toast toast-' + type;
        toast.innerHTML =
            '<div class="toast-icon"><i class="' + (icons[type] || icons.info) + '"></i></div>' +
            '<div class="toast-message">' + escapeHTML(message) + '</div>' +
            '<button class="toast-close" aria-label="إغلاق">&times;</button>';

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', function () {
            removeToast(toast);
        });

        container.appendChild(toast);

        // Trigger entrance animation
        requestAnimationFrame(function () {
            toast.classList.add('toast-visible');
        });

        // Auto remove
        var timer = setTimeout(function () { removeToast(toast); }, duration);

        // Pause on hover
        toast.addEventListener('mouseenter', function () { clearTimeout(timer); });
        toast.addEventListener('mouseleave', function () {
            timer = setTimeout(function () { removeToast(toast); }, 2000);
        });

        function removeToast(el) {
            el.classList.remove('toast-visible');
            el.classList.add('toast-exit');
            setTimeout(function () {
                if (el.parentNode) el.parentNode.removeChild(el);
            }, 400);
        }
    } catch (err) {
        console.error('[Enhancements] showToast error:', err);
    }
}


/* =========================================================================
   8. GOALS PROGRESS SECTION
   ========================================================================= */

function initGoalsSection() {
    try {
        var dashboard = document.getElementById('dashboard');
        if (!dashboard) return;

        // Avoid duplicates
        if (document.getElementById('goalsSection')) return;

        // Try to read real counts from stat cards or data
        var employeeCount = _readStatValue('employees') || 0;
        var clientCount = _readStatValue('clients') || 0;
        var contractCount = _readStatValue('contracts') || 0;

        // Default targets
        var targets = {
            employees: { current: employeeCount, target: 50, label: 'الموظفين' },
            clients: { current: clientCount, target: 100, label: 'العملاء' },
            contracts: { current: contractCount, target: 30, label: 'العقود' }
        };

        var html =
            '<div class="goals-section animate-in" id="goalsSection">' +
                '<h4 class="goals-title"><i class="fas fa-bullseye"></i> الأهداف الشهرية</h4>' +
                '<div class="goals-grid">';

        Object.keys(targets).forEach(function (key) {
            var t = targets[key];
            var pct = t.target > 0 ? Math.min(Math.round((t.current / t.target) * 100), 100) : 0;
            var colorClass = pct >= 80 ? 'goal-success' : (pct >= 50 ? 'goal-warning' : 'goal-danger');
            html +=
                '<div class="goal-card ' + colorClass + '">' +
                    '<div class="goal-info">' +
                        '<span class="goal-label">' + escapeHTML(t.label) + '</span>' +
                        '<span class="goal-numbers">' + t.current + ' / ' + t.target + '</span>' +
                    '</div>' +
                    '<div class="goal-progress-bar">' +
                        '<div class="goal-progress-fill" style="width:' + pct + '%"></div>' +
                    '</div>' +
                    '<span class="goal-pct">' + pct + '%</span>' +
                '</div>';
        });

        html += '</div></div>';

        // Insert after stat cards row
        var statRow = dashboard.querySelector('.row');
        if (statRow) {
            statRow.insertAdjacentHTML('afterend', html);
        } else {
            dashboard.insertAdjacentHTML('beforeend', html);
        }

        console.log('[Enhancements] Goals section initialized.');
    } catch (err) {
        console.error('[Enhancements] initGoalsSection error:', err);
    }
}

/**
 * Helper: try to extract a numeric count from the dashboard for a given key.
 */
function _readStatValue(key) {
    try {
        // Look for stat cards with data attributes or matching text
        var cards = document.querySelectorAll('.stat-card, .stat-card-enhanced, .card');
        for (var i = 0; i < cards.length; i++) {
            var text = cards[i].textContent || '';
            if (text.indexOf(key) !== -1 || text.indexOf(_translateKey(key)) !== -1) {
                var numbers = text.match(/\d+/);
                if (numbers) return parseInt(numbers[0], 10);
            }
        }
        // Fallback: try span/h elements with id containing the key
        var el = document.getElementById(key + 'Count') || document.getElementById('total' + _capitalize(key));
        if (el) {
            var num = parseInt((el.textContent || '').replace(/[^\d]/g, ''), 10);
            if (!isNaN(num)) return num;
        }
    } catch (_e) { /* silent */ }
    return 0;
}

function _translateKey(key) {
    var map = { employees: 'موظف', clients: 'عمي', contracts: 'عقد' };
    return map[key] || key;
}

function _capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}


/* =========================================================================
   9. TABLE ENHANCEMENTS (Pagination & Sorting)
   ========================================================================= */

function enhanceTables() {
    try {
        var tables = document.querySelectorAll('table.table');
        tables.forEach(function (table) {
            // Skip already enhanced tables
            if (table.getAttribute('data-enhanced') === 'true') return;
            table.setAttribute('data-enhanced', 'true');

            _addSorting(table);
            _addPagination(table);
        });

        console.log('[Enhancements] Tables enhanced.');
    } catch (err) {
        console.error('[Enhancements] enhanceTables error:', err);
    }
}

function _addSorting(table) {
    try {
        var headers = table.querySelectorAll('thead th');
        if (!headers.length) return;

        headers.forEach(function (th, colIndex) {
            th.style.cursor = 'pointer';
            th.style.userSelect = 'none';
            th.setAttribute('title', 'اضغط للترتيب');

            // Add sort indicator
            var indicator = document.createElement('span');
            indicator.className = 'sort-indicator';
            indicator.innerHTML = ' <i class="fas fa-sort" style="opacity:0.4;font-size:0.75em"></i>';
            th.appendChild(indicator);

            var ascending = true;
            th.addEventListener('click', function () {
                var tbody = table.querySelector('tbody');
                if (!tbody) return;

                var rows = Array.from(tbody.querySelectorAll('tr'));
                rows.sort(function (a, b) {
                    var aCell = a.cells[colIndex];
                    var bCell = b.cells[colIndex];
                    if (!aCell || !bCell) return 0;
                    var aText = (aCell.textContent || '').trim();
                    var bText = (bCell.textContent || '').trim();

                    // Numeric sort if both are numbers
                    var aNum = parseFloat(aText.replace(/[^\d.-]/g, ''));
                    var bNum = parseFloat(bText.replace(/[^\d.-]/g, ''));
                    if (!isNaN(aNum) && !isNaN(bNum)) {
                        return ascending ? aNum - bNum : bNum - aNum;
                    }
                    // String sort
                    return ascending ? aText.localeCompare(bText, 'ar') : bText.localeCompare(aText, 'ar');
                });

                rows.forEach(function (row) { tbody.appendChild(row); });

                // Update indicator
                headers.forEach(function (h) {
                    var ind = h.querySelector('.sort-indicator i');
                    if (ind) ind.className = 'fas fa-sort';
                    if (ind) ind.style.opacity = '0.4';
                });
                var icon = indicator.querySelector('i');
                if (icon) {
                    icon.className = ascending ? 'fas fa-sort-up' : 'fas fa-sort-down';
                    icon.style.opacity = '1';
                }

                ascending = !ascending;
            });
        });
    } catch (err) {
        console.error('[Enhancements] _addSorting error:', err);
    }
}

function _addPagination(table) {
    try {
        var tbody = table.querySelector('tbody');
        if (!tbody) return;

        var allRows = Array.from(tbody.querySelectorAll('tr'));
        var rowsPerPage = 10;
        if (allRows.length <= rowsPerPage) return; // No pagination needed

        var currentPage = 1;
        var totalPages = Math.ceil(allRows.length / rowsPerPage);

        // Create pagination container
        var paginationWrap = document.createElement('div');
        paginationWrap.className = 'table-pagination';
        table.parentNode.insertBefore(paginationWrap, table.nextSibling);

        function renderPage() {
            var start = (currentPage - 1) * rowsPerPage;
            var end = start + rowsPerPage;

            allRows.forEach(function (row, idx) {
                row.style.display = (idx >= start && idx < end) ? '' : 'none';
            });

            // Render pagination buttons
            var html = '';
            html += '<button class="page-btn" data-page="prev" ' + (currentPage <= 1 ? 'disabled' : '') + '><i class="fas fa-chevron-right"></i></button>';
            for (var p = 1; p <= totalPages; p++) {
                // Show limited range around current page
                if (totalPages <= 7 || Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages) {
                    html += '<button class="page-btn' + (p === currentPage ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
                } else if (p === currentPage - 3 || p === currentPage + 3) {
                    html += '<span class="page-dots">...</span>';
                }
            }
            html += '<button class="page-btn" data-page="next" ' + (currentPage >= totalPages ? 'disabled' : '') + '><i class="fas fa-chevron-left"></i></button>';
            paginationWrap.innerHTML = html;

            // Attach listeners
            paginationWrap.querySelectorAll('.page-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var pg = btn.getAttribute('data-page');
                    if (pg === 'prev' && currentPage > 1) currentPage--;
                    else if (pg === 'next' && currentPage < totalPages) currentPage++;
                    else if (pg !== 'prev' && pg !== 'next') currentPage = parseInt(pg, 10);
                    renderPage();
                });
            });
        }

        renderPage();
    } catch (err) {
        console.error('[Enhancements] _addPagination error:', err);
    }
}


/* =========================================================================
   10. SCROLL-TO-TOP BUTTON
   ========================================================================= */

function initScrollToTop() {
    try {
        // Avoid duplicates
        if (document.getElementById('scrollToTopBtn')) return;

        var btn = document.createElement('button');
        btn.id = 'scrollToTopBtn';
        btn.className = 'scroll-to-top-btn';
        btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        btn.setAttribute('aria-label', 'العودة إلى الأعلى');
        btn.setAttribute('title', 'العودة إلى الأعلى');
        document.body.appendChild(btn);

        // Determine scroll container – could be .main-content or window
        var scrollContainer = document.querySelector('.main-content') || window;
        var scrollElement = scrollContainer === window ? document.documentElement : scrollContainer;

        function handleScroll() {
            var scrollTop = scrollElement.scrollTop || window.pageYOffset || 0;
            if (scrollTop > 300) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }

        (scrollContainer === window ? window : scrollContainer).addEventListener('scroll', handleScroll, { passive: true });
        // Also listen on window in case main-content isn't the scroll container
        if (scrollContainer !== window) {
            window.addEventListener('scroll', handleScroll, { passive: true });
        }

        btn.addEventListener('click', function () {
            // Smooth scroll to top
            if (scrollContainer !== window && scrollContainer.scrollTo) {
                scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        console.log('[Enhancements] Scroll-to-top button initialized.');
    } catch (err) {
        console.error('[Enhancements] initScrollToTop error:', err);
    }
}


/* =========================================================================
   UTILITY: Periodic table enhancement
   ========================================================================= */

/**
 * Re-enhance tables periodically (new data loads may create new tables).
 */
function _startTableEnhancementWatcher() {
    try {
        setInterval(function () {
            try { enhanceTables(); } catch (_e) { /* silent */ }
        }, 5000);
    } catch (_e) { /* silent */ }
}


/* =========================================================================
   UTILITY: Update welcome user name reactively
   ========================================================================= */

function _updateWelcomeUserName() {
    try {
        var el = document.getElementById('welcomeUserName');
        if (!el) return;
        var name = 'مدير';
        if (typeof currentUser !== 'undefined' && currentUser) {
            name = currentUser.name || currentUser.displayName || 'مدير';
        }
        el.textContent = name;
    } catch (_e) { /* silent */ }
}


/* =========================================================================
   UTILITY: Dark mode persistence check
   ========================================================================= */

function _restoreDarkMode() {
    try {
        var dm = localStorage.getItem('sp_dark_mode');
        if (dm === 'true') {
            document.body.classList.add('dark-mode');
        }
    } catch (_e) { /* silent */ }
}


/* =========================================================================
   INITIALIZATION
   ========================================================================= */

document.addEventListener('DOMContentLoaded', function () {
    // Wait for existing scripts to initialize
    setTimeout(function () {
        try {
            _restoreDarkMode();
            initCollapsibleSidebar();
            initCommandPalette();
            initEntranceAnimations();
            initWelcomeSection();
            initBottomNav();
            initGoalsSection();
            initScrollToTop();
            enhanceTables();
            _startTableEnhancementWatcher();
            // Delay user-name update so auth can populate
            setTimeout(_updateWelcomeUserName, 2000);
            console.log('✅ Design enhancements loaded');
        } catch (err) {
            console.error('❌ Design enhancements initialization error:', err);
        }
    }, 500);
});
