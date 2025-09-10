// 历史记录页面逻辑
const app = getApp();

Page({
  data: {
    allRecords: [],
    filteredRecords: [],
    totalRecords: 0,
    totalShots: 0,
    averageScore: 0,
    bestScore: 0,
    
    // 筛选选项
    targetTypeOptions: [
      { key: 'all', name: '全部类型' },
      { key: '18m', name: '18米' },
      { key: '30m', name: '30米' },
      { key: '50m', name: '50米' },
      { key: '70m', name: '70米' }
    ],
    targetTypeIndex: 0,
    
    sortOptions: [
      { key: 'time_desc', name: '时间降序' },
      { key: 'time_asc', name: '时间升序' },
      { key: 'score_desc', name: '分数降序' },
      { key: 'score_asc', name: '分数升序' }
    ],
    sortIndex: 0,
    
    timeRangeOptions: [
      { key: 'all', name: '全部时间' },
      { key: 'today', name: '今天' },
      { key: 'week', name: '本周' },
      { key: 'month', name: '本月' },
      { key: 'year', name: '今年' }
    ],
    timeRangeIndex: 0,
    
    // 分页
    pageSize: 20,
    currentPage: 1,
    hasMore: true,
    loading: false,
    
    // 删除确认
    showDeleteModal: false,
    deleteRecord: null
  },

  onLoad: function() {
    console.log('历史记录页面加载');
    this.initPage();
  },

  onShow: function() {
    console.log('历史记录页面显示');
    this.loadRecords();
  },

  onPullDownRefresh: function() {
    console.log('下拉刷新');
    this.refreshData();
  },

  onReachBottom: function() {
    console.log('上拉加载更多');
    this.loadMore();
  },

  // 初始化页面
  initPage: function() {
    // 初始化筛选选项
    this.setData({
      targetTypeOptions: [
        { key: 'all', name: '全部类型' },
        ...app.globalData.targetTypes.map(item => ({
          key: item.key,
          name: item.name
        }))
      ]
    });
  },

  // 加载记录
  loadRecords: function() {
    try {
      const records = app.getRecords();
      const formattedRecords = records.map(record => this.formatRecord(record));
      
      this.setData({
        allRecords: formattedRecords
      });
      
      this.calculateStatistics(formattedRecords);
      this.applyFilters();
    } catch (error) {
      console.error('加载记录失败:', error);
      app.showError('加载记录失败');
    }
  },

  // 格式化记录
  formatRecord: function(record) {
    const targetType = app.globalData.targetTypes.find(item => item.key === record.targetType);
    
    return {
      ...record,
      targetType: targetType ? targetType.name : record.targetType,
      date: this.formatDate(record.timestamp),
      time: this.formatTime(record.timestamp),
      performanceGrade: record.analysis ? record.analysis.performance_grade : 'N/A'
    };
  },

  // 计算统计数据
  calculateStatistics: function(records) {
    let totalShots = 0;
    let totalScore = 0;
    let bestScore = 0;
    
    records.forEach(record => {
      if (record.scores && record.scores.length > 0) {
        totalShots += record.scores.length;
        totalScore += record.totalScore;
        bestScore = Math.max(bestScore, record.totalScore);
      }
    });
    
    const averageScore = records.length > 0 ? (totalScore / records.length).toFixed(1) : 0;
    
    this.setData({
      totalRecords: records.length,
      totalShots: totalShots,
      averageScore: averageScore,
      bestScore: bestScore
    });
  },

  // 应用筛选
  applyFilters: function() {
    let filtered = [...this.data.allRecords];
    
    // 按靶纸类型筛选
    const targetTypeFilter = this.data.targetTypeOptions[this.data.targetTypeIndex].key;
    if (targetTypeFilter !== 'all') {
      filtered = filtered.filter(record => record.targetType === targetTypeFilter);
    }
    
    // 按时间范围筛选
    const timeRangeFilter = this.data.timeRangeOptions[this.data.timeRangeIndex].key;
    if (timeRangeFilter !== 'all') {
      const now = new Date();
      const filterDate = this.getFilterDate(now, timeRangeFilter);
      filtered = filtered.filter(record => new Date(record.timestamp) >= filterDate);
    }
    
    // 排序
    const sortKey = this.data.sortOptions[this.data.sortIndex].key;
    filtered = this.sortRecords(filtered, sortKey);
    
    // 分页
    const pageSize = this.data.pageSize;
    const currentPage = 1; // 重置到第一页
    const paginatedRecords = filtered.slice(0, pageSize * currentPage);
    
    this.setData({
      filteredRecords: paginatedRecords,
      currentPage: currentPage,
      hasMore: paginatedRecords.length < filtered.length
    });
  },

  // 获取筛选日期
  getFilterDate: function(now, timeRange) {
    const date = new Date(now);
    
    switch (timeRange) {
      case 'today':
        date.setHours(0, 0, 0, 0);
        break;
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() - 1);
        break;
    }
    
    return date;
  },

  // 排序记录
  sortRecords: function(records, sortKey) {
    return records.sort((a, b) => {
      switch (sortKey) {
        case 'time_desc':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'time_asc':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'score_desc':
          return b.totalScore - a.totalScore;
        case 'score_asc':
          return a.totalScore - b.totalScore;
        default:
          return 0;
      }
    });
  },

  // 靶纸类型筛选变化
  onTargetTypeChange: function(e) {
    this.setData({
      targetTypeIndex: e.detail.value
    });
  },

  // 排序方式变化
  onSortChange: function(e) {
    this.setData({
      sortIndex: e.detail.value
    });
  },

  // 时间范围变化
  onTimeRangeChange: function(e) {
    this.setData({
      timeRangeIndex: e.detail.value
    });
  },

  // 清除筛选
  clearFilters: function() {
    this.setData({
      targetTypeIndex: 0,
      sortIndex: 0,
      timeRangeIndex: 0
    });
  },

  // 加载更多
  loadMore: function() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({
      loading: true
    });
    
    // 模拟加载延迟
    setTimeout(() => {
      const currentPage = this.data.currentPage + 1;
      const pageSize = this.data.pageSize;
      
      // 重新应用筛选并分页
      let filtered = [...this.data.allRecords];
      
      const targetTypeFilter = this.data.targetTypeOptions[this.data.targetTypeIndex].key;
      if (targetTypeFilter !== 'all') {
        filtered = filtered.filter(record => record.targetType === targetTypeFilter);
      }
      
      const timeRangeFilter = this.data.timeRangeOptions[this.data.timeRangeIndex].key;
      if (timeRangeFilter !== 'all') {
        const now = new Date();
        const filterDate = this.getFilterDate(now, timeRangeFilter);
        filtered = filtered.filter(record => new Date(record.timestamp) >= filterDate);
      }
      
      const sortKey = this.data.sortOptions[this.data.sortIndex].key;
      filtered = this.sortRecords(filtered, sortKey);
      
      const paginatedRecords = filtered.slice(0, pageSize * currentPage);
      
      this.setData({
        filteredRecords: paginatedRecords,
        currentPage: currentPage,
        hasMore: paginatedRecords.length < filtered.length,
        loading: false
      });
    }, 500);
  },

  // 刷新数据
  refreshData: function() {
    this.loadRecords();
    wx.stopPullDownRefresh();
  },

  // 查看记录
  viewRecord: function(e) {
    const record = e.currentTarget.dataset.record;
    wx.navigateTo({
      url: '/pages/result/result?recordId=' + record.id
    });
  },

  // 分享记录
  shareRecord: function(e) {
    const record = e.currentTarget.dataset.record;
    // 这里可以实现分享逻辑
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  },

  // 删除记录
  deleteRecord: function(e) {
    const record = e.currentTarget.dataset.record;
    this.setData({
      showDeleteModal: true,
      deleteRecord: record
    });
  },

  // 取消删除
  cancelDelete: function() {
    this.setData({
      showDeleteModal: false,
      deleteRecord: null
    });
  },

  // 确认删除
  confirmDelete: function() {
    const record = this.data.deleteRecord;
    if (!record) return;
    
    const success = app.deleteRecord(record.id);
    if (success) {
      app.showSuccess('删除成功');
      this.loadRecords(); // 重新加载数据
    } else {
      app.showError('删除失败');
    }
    
    this.setData({
      showDeleteModal: false,
      deleteRecord: null
    });
  },

  // 跳转到拍照页面
  goToCamera: function() {
    wx.switchTab({
      url: '/pages/camera/camera'
    });
  },

  // 格式化日期
  formatDate: function(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return Math.floor(diff / 60000) + '分钟前';
    } else if (diff < 86400000) { // 1天内
      return Math.floor(diff / 3600000) + '小时前';
    } else if (diff < 604800000) { // 1周内
      return Math.floor(diff / 86400000) + '天前';
    } else {
      return date.toLocaleDateString();
    }
  },

  // 格式化时间
  formatTime: function(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
});
