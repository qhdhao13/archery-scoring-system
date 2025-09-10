// 首页逻辑
const app = getApp();

Page({
  data: {
    targetTypes: [],
    currentTargetType: '18m',
    recentRecords: [],
    statistics: null,
    loading: false,
    loadingText: '加载中...'
  },

  onLoad: function() {
    console.log('首页加载');
    this.initPage();
  },

  onShow: function() {
    console.log('首页显示');
    this.loadRecentRecords();
    this.loadStatistics();
  },

  onPullDownRefresh: function() {
    console.log('下拉刷新');
    this.refreshData();
  },

  onReachBottom: function() {
    console.log('上拉加载更多');
  },

  // 初始化页面
  initPage: function() {
    this.setData({
      targetTypes: app.globalData.targetTypes,
      currentTargetType: app.globalData.currentTargetType
    });
  },

  // 选择靶纸类型
  selectTargetType: function(e) {
    const targetType = e.currentTarget.dataset.type;
    this.setData({
      currentTargetType: targetType
    });
    
    // 保存到全局设置
    app.saveUserSettings({
      targetType: targetType
    });
    
    // 显示选择反馈
    wx.showToast({
      title: `已选择${this.getTargetTypeName(targetType)}`,
      icon: 'success',
      duration: 1500
    });
  },

  // 获取靶纸类型名称
  getTargetTypeName: function(key) {
    const targetType = app.globalData.targetTypes.find(item => item.key === key);
    return targetType ? targetType.name : key;
  },

  // 加载最近记录
  loadRecentRecords: function() {
    try {
      const records = app.getRecords();
      const recentRecords = records.slice(0, 3).map(record => ({
        ...record,
        date: this.formatDate(record.timestamp),
        targetType: this.getTargetTypeName(record.targetType)
      }));
      
      this.setData({
        recentRecords: recentRecords
      });
    } catch (error) {
      console.error('加载最近记录失败:', error);
    }
  },

  // 加载统计数据
  loadStatistics: function() {
    try {
      const records = app.getRecords();
      if (records.length === 0) {
        this.setData({
          statistics: null
        });
        return;
      }

      const statistics = this.calculateStatistics(records);
      this.setData({
        statistics: statistics
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  },

  // 计算统计数据
  calculateStatistics: function(records) {
    let totalShots = 0;
    let totalScore = 0;
    let bestScore = 0;
    let allScores = [];

    records.forEach(record => {
      if (record.scores && record.scores.length > 0) {
        totalShots += record.scores.length;
        const recordTotal = record.scores.reduce((sum, score) => sum + score, 0);
        totalScore += recordTotal;
        bestScore = Math.max(bestScore, recordTotal);
        allScores = allScores.concat(record.scores);
      }
    });

    const averageScore = totalShots > 0 ? (totalScore / records.length).toFixed(1) : 0;
    const consistency = this.calculateConsistency(allScores);

    return {
      totalShots: totalShots,
      averageScore: averageScore,
      bestScore: bestScore,
      consistency: consistency
    };
  },

  // 计算一致性
  calculateConsistency: function(scores) {
    if (scores.length < 2) return 'N/A';
    
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev <= 1) return '优秀';
    if (stdDev <= 2) return '良好';
    if (stdDev <= 3) return '一般';
    return '需改进';
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

  // 刷新数据
  refreshData: function() {
    this.setData({
      loading: true,
      loadingText: '刷新中...'
    });

    setTimeout(() => {
      this.loadRecentRecords();
      this.loadStatistics();
      this.setData({
        loading: false
      });
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 跳转到拍照页面
  goToCamera: function() {
    wx.navigateTo({
      url: '/pages/camera/camera?targetType=' + this.data.currentTargetType
    });
  },

  // 跳转到手动输入页面
  goToManual: function() {
    wx.navigateTo({
      url: '/pages/manual/manual?targetType=' + this.data.currentTargetType
    });
  },

  // 跳转到历史记录页面
  goToHistory: function() {
    wx.switchTab({
      url: '/pages/history/history'
    });
  },

  // 跳转到设置页面
  goToSettings: function() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  // 跳转到教程页面
  goToTutorial: function() {
    wx.navigateTo({
      url: '/pages/tutorial/tutorial'
    });
  },

  // 查看记录详情
  viewRecord: function(e) {
    const record = e.currentTarget.dataset.record;
    wx.navigateTo({
      url: '/pages/result/result?recordId=' + record.id
    });
  },

  // 分享应用
  shareApp: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 分享给朋友
  onShareAppMessage: function() {
    return {
      title: '射箭记分助手 - 智能识别，精准记分',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.jpg'
    };
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    return {
      title: '射箭记分助手 - 智能识别，精准记分',
      imageUrl: '/images/share-cover.jpg'
    };
  }
});
