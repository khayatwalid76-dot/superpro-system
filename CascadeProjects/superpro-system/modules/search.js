// ============= محرك البحث المتقدم =============

class AdvancedSearchEngine {
  constructor() {
    this.index = {};
    this.favorites = [];
    this.recentSearches = [];
  }

  // بناء الفهرس
  buildIndex(data) {
    this.index = {
      employees: data.employees || [],
      clients: data.clients || [],
      contracts: data.contracts || [],
      tasks: data.tasks || [],
      documents: data.documents || []
    };

    console.log('✅ تم بناء الفهرس');
  }

  // بحث شامل
  search(query, filters = {}) {
    if(!query || query.length < 2) return [];

    const queryLower = query.toLowerCase();
    const results = [];

    // البحث في الموظفين
    if(!filters.category || filters.category === 'employees') {
      this.index.employees.forEach(emp => {
        if(this.matchSearch(emp, queryLower, ['name', 'job', 'phone', 'email'])) {
          results.push({
            type: 'employee',
            id: emp.id,
            title: emp.name,
            description: `${emp.job} - ${emp.nationality}`,
            score: this.calculateScore(emp, queryLower, 'employees')
          });
        }
      });
    }

    // البحث في العملاء
    if(!filters.category || filters.category === 'clients') {
      this.index.clients.forEach(client => {
        if(this.matchSearch(client, queryLower, ['name', 'phone', 'area'])) {
          results.push({
            type: 'client',
            id: client.id,
            title: client.name,
            description: `${client.area} - ${client.phone}`,
            score: this.calculateScore(client, queryLower, 'clients')
          });
        }
      });
    }

    // البحث في العقود
    if(!filters.category || filters.category === 'contracts') {
      this.index.contracts.forEach(contract => {
        if(this.matchSearch(contract, queryLower, ['number', 'clientName', 'description'])) {
          results.push({
            type: 'contract',
            id: contract.id,
            title: `عقد ${contract.number}`,
            description: contract.description || 'بدون وصف',
            score: this.calculateScore(contract, queryLower, 'contracts')
          });
        }
      });
    }

    // البحث في المهام
    if(!filters.category || filters.category === 'tasks') {
      this.index.tasks.forEach(task => {
        if(this.matchSearch(task, queryLower, ['title', 'description', 'assignee'])) {
          results.push({
            type: 'task',
            id: task.id,
            title: task.title,
            description: task.description,
            score: this.calculateScore(task, queryLower, 'tasks')
          });
        }
      });
    }

    // ترتيب النتائج حسب الدرجة
    results.sort((a, b) => b.score - a.score);

    // حفظ في البحوث الحديثة
    this.addToRecentSearches(query);

    return results.slice(0, 10); // إرجاع أفضل 10 نتائج
  }

  // البحث مع التصفية المتقدمة
  advancedSearch(filters) {
    let results = [];

    // البحث حسب النوع
    if(filters.type === 'employee') {
      results = this.searchEmployees(filters);
    } else if(filters.type === 'client') {
      results = this.searchClients(filters);
    } else if(filters.type === 'contract') {
      results = this.searchContracts(filters);
    }

    // تطبيق الفلاتر الإضافية
    if(filters.status) {
      results = results.filter(r => r.status === filters.status);
    }

    if(filters.dateFrom) {
      results = results.filter(r => new Date(r.date) >= new Date(filters.dateFrom));
    }

    if(filters.dateTo) {
      results = results.filter(r => new Date(r.date) <= new Date(filters.dateTo));
    }

    return results;
  }

  // بحث متقدم عن الموظفين
  searchEmployees(filters) {
    let results = this.index.employees;

    if(filters.department) {
      results = results.filter(e => e.department === filters.department);
    }

    if(filters.salary) {
      const [min, max] = filters.salary;
      results = results.filter(e => e.salary >= min && e.salary <= max);
    }

    if(filters.nationality) {
      results = results.filter(e => e.nationality === filters.nationality);
    }

    if(filters.status) {
      results = results.filter(e => e.status === filters.status);
    }

    return results;
  }

  // بحث متقدم عن العملاء
  searchClients(filters) {
    let results = this.index.clients;

    if(filters.area) {
      results = results.filter(c => c.area === filters.area);
    }

    if(filters.hasContracts !== undefined) {
      results = results.filter(c => {
        const hasContracts = this.index.contracts.some(ct => ct.clientId === c.id);
        return hasContracts === filters.hasContracts;
      });
    }

    return results;
  }

  // بحث متقدم عن العقود
  searchContracts(filters) {
    let results = this.index.contracts;

    if(filters.status) {
      results = results.filter(c => c.status === filters.status);
    }

    if(filters.minAmount) {
      results = results.filter(c => c.amount >= filters.minAmount);
    }

    if(filters.maxAmount) {
      results = results.filter(c => c.amount <= filters.maxAmount);
    }

    return results;
  }

  // التحقق من تطابق البحث
  matchSearch(item, queryLower, fields) {
    return fields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(queryLower);
    });
  }

  // حساب درجة التطابق
  calculateScore(item, queryLower, category) {
    let score = 0;

    Object.values(item).forEach(value => {
      if(value && value.toString().toLowerCase().includes(queryLower)) {
        score += 10;
        if(value.toString().toLowerCase().startsWith(queryLower)) {
          score += 20;
        }
      }
    });

    return score;
  }

  // البحث عن المفضلات
  addToFavorites(result) {
    if(!this.favorites.find(f => f.id === result.id && f.type === result.type)) {
      this.favorites.push(result);
      this.saveFavorites();
    }
  }

  getFavorites() {
    return this.favorites;
  }

  // البحوث الحديثة
  addToRecentSearches(query) {
    this.recentSearches.unshift(query);
    this.recentSearches = [...new Set(this.recentSearches)].slice(0, 10);
    this.saveRecentSearches();
  }

  getRecentSearches() {
    return this.recentSearches;
  }

  // إنشاء مرشح (Filter) مخصص
  saveFilter(filterName, filterConfig) {
    const filters = JSON.parse(localStorage.getItem('superpro_filters') || '{}');
    filters[filterName] = filterConfig;
    localStorage.setItem('superpro_filters', JSON.stringify(filters));
  }

  getSavedFilters() {
    return JSON.parse(localStorage.getItem('superpro_filters') || '{}');
  }

  // حفظ واسترجاع
  saveFavorites() {
    localStorage.setItem('superpro_favorites', JSON.stringify(this.favorites));
  }

  saveRecentSearches() {
    localStorage.setItem('superpro_recentSearches', JSON.stringify(this.recentSearches));
  }

  load() {
    const favorites = localStorage.getItem('superpro_favorites');
    const recent = localStorage.getItem('superpro_recentSearches');

    if(favorites) this.favorites = JSON.parse(favorites);
    if(recent) this.recentSearches = JSON.parse(recent);
  }
}

// إنشاء instance عام
const searchEngine = new AdvancedSearchEngine();
searchEngine.load();
console.log('✅ تم تحميل محرك البحث المتقدم');
