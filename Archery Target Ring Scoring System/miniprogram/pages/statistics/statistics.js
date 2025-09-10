// 统计分析页面逻辑
const app = getApp();

Page({
  data: {
    // 基础统计
    totalRecords: 0,
    totalShots: 0,
    averageScore: 0,
    bestScore: 0,
    consistency: 'N/A',
    
    // 趋势数据
    trends: {},
    
    // 时间周期选项
    periodOptions: [
      { key: 'week', name: '最近一周' },
      { key: 'month', name: '最近一月' },
      { key: 'quarter', name: '最近三月' },
      { key: 'year', name: '最近一年' }
    ],
    periodIndex: 1, // 默认选择最近一月
    
    // 图表数据
    trendData: [],
    distributionData: [],
    
    // 分布统计
    distributionStats: {
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      highPercent: 0,
      mediumPercent: 0,
      lowPercent: 0
    },
    
    // 靶纸类型统计
    targetStats: [],
    
    // 进步分析
    recentPerformance: {
      averageScore: 0,
      trend: 'stable',
      trendText: '稳定'
    },
    bestPerformance: {
      totalScore: 0,
      date: ''
    },
    trainingFrequency: {
      weekly: 0,
      trend: 'stable',
      trendText: '稳定'
    },
    
    // 智能洞察
    insights: [],
    
    // 图表加载状态
    chartLoading: false
  },

  onLoad: function() {
    console.log('统计页面加载');
    this.initPage();
  },

  onShow: function() {
    console.log('统计页面显示');
    this.loadStatistics();
  },

  onReady: function() {
    console.log('统计页面准备完成');
    // 延迟绘制图表，确保页面渲染完成
    setTimeout(() => {
      this.drawCharts();
    }, 500);
  },

  // 初始化页面
  initPage: function() {
    // 初始化图表
    this.initCharts();
  },

  // 加载统计数据
  loadStatistics: function() {
    try {
      const records = app.getRecords();
      if (records.length === 0) {
        this.setData({
          totalRecords: 0,
          totalShots: 0,
          averageScore: 0,
          bestScore: 0,
          consistency: 'N/A'
        });
        return;
      }

      // 计算基础统计
      this.calculateBasicStats(records);
      
      // 计算趋势数据
      this.calculateTrends(records);
      
      // 计算分布统计
      this.calculateDistribution(records);
      
      // 计算靶纸类型统计
      this.calculateTargetStats(records);
      
      // 计算进步分析
      this.calculateProgress(records);
      
      // 生成智能洞察
      this.generateInsights(records);
      
      // 准备图表数据
      this.prepareChartData(records);
      
    } catch (error) {
      console.error('加载统计数据失败:', error);
      app.showError('加载统计数据失败');
    }
  },

  // 计算基础统计
  calculateBasicStats: function(records) {
    let totalShots = 0;
    let totalScore = 0;
    let bestScore = 0;
    let allScores = [];
    
    records.forEach(record => {
      if (record.scores && record.scores.length > 0) {
        totalShots += record.scores.length;
        totalScore += record.totalScore;
        bestScore = Math.max(bestScore, record.totalScore);
        allScores = allScores.concat(record.scores);
      }
    });
    
    const averageScore = records.length > 0 ? (totalScore / records.length).toFixed(1) : 0;
    const consistency = this.calculateConsistency(allScores);
    
    this.setData({
      totalRecords: records.length,
      totalShots: totalShots,
      averageScore: averageScore,
      bestScore: bestScore,
      consistency: consistency
    });
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

  // 计算趋势数据
  calculateTrends: function(records) {
    // 这里可以实现更复杂的趋势计算
    // 暂时返回模拟数据
    this.setData({
      trends: {
        totalShots: 5,
        averageScore: 0.3,
        bestScore: 2,
        consistency: 1
      }
    });
  },

  // 计算分布统计
  calculateDistribution: function(records) {
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let totalCount = 0;
    
    records.forEach(record => {
      if (record.scores) {
        record.scores.forEach(score => {
          totalCount++;
          if (score >= 8) {
            highCount++;
          } else if (score >= 6) {
            mediumCount++;
          } else {
            lowCount++;
          }
        });
      }
    });
    
    const highPercent = totalCount > 0 ? ((highCount / totalCount) * 100).toFixed(1) : 0;
    const mediumPercent = totalCount > 0 ? ((mediumCount / totalCount) * 100).toFixed(1) : 0;
    const lowPercent = totalCount > 0 ? ((lowCount / totalCount) * 100).toFixed(1) : 0;
    
    this.setData({
      distributionStats: {
        highCount: highCount,
        mediumCount: mediumCount,
        lowCount: lowCount,
        highPercent: highPercent,
        mediumPercent: mediumPercent,
        lowPercent: lowPercent
      }
    });
  },

  // 计算靶纸类型统计
  calculateTargetStats: function(records) {
    const targetStats = {};
    
    records.forEach(record => {
      const targetType = record.targetType;
      if (!targetStats[targetType]) {
        targetStats[targetType] = {
          type: targetType,
          name: this.getTargetTypeName(targetType),
          count: 0,
          totalScore: 0,
          scores: []
        };
      }
      
      targetStats[targetType].count++;
      targetStats[targetType].totalScore += record.totalScore;
      if (record.scores) {
        targetStats[targetType].scores = targetStats[targetType].scores.concat(record.scores);
      }
    });
    
    const targetStatsArray = Object.values(targetStats).map(stat => {
      const averageScore = stat.count > 0 ? (stat.totalScore / stat.count).toFixed(1) : 0;
      const maxCount = Math.max(...Object.values(targetStats).map(s => s.count));
      const progress = maxCount > 0 ? (stat.count / maxCount) * 100 : 0;
      
      return {
        ...stat,
        averageScore: averageScore,
        progress: progress
      };
    });
    
    this.setData({
      targetStats: targetStatsArray
    });
  },

  // 计算进步分析
  calculateProgress: function(records) {
    // 最近表现
    const recentRecords = records.slice(0, 10);
    const recentAverage = recentRecords.length > 0 ? 
      (recentRecords.reduce((sum, r) => sum + r.totalScore, 0) / recentRecords.length).toFixed(1) : 0;
    
    // 最佳表现
    const bestRecord = records.reduce((best, record) => 
      record.totalScore > best.totalScore ? record : best, records[0] || {});
    
    // 训练频率
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weeklyCount = records.filter(record => 
      new Date(record.timestamp) >= weekStart).length;
    
    this.setData({
      recentPerformance: {
        averageScore: recentAverage,
        trend: 'stable',
        trendText: '稳定'
      },
      bestPerformance: {
        totalScore: bestRecord.totalScore || 0,
        date: bestRecord.timestamp ? this.formatDate(bestRecord.timestamp) : ''
      },
      trainingFrequency: {
        weekly: weeklyCount,
        trend: 'stable',
        trendText: '稳定'
      }
    });
  },

  // 生成智能洞察
  generateInsights: function(records) {
    const insights = [];
    
    // 基于数据生成洞察
    if (records.length < 5) {
      insights.push({
        icon: '📈',
        title: '增加训练频率',
        description: '建议增加训练次数，积累更多数据以获得更准确的分析',
        priority: 'medium',
        priorityText: '中等'
      });
    }
    
    if (this.data.averageScore < 6) {
      insights.push({
        icon: '🎯',
        title: '提高基础技能',
        description: '平均分较低，建议加强基础训练，提高瞄准精度',
        priority: 'high',
        priorityText: '高'
      });
    }
    
    if (this.data.consistency === '需改进') {
      insights.push({
        icon: '⚖️',
        title: '提高稳定性',
        description: '得分波动较大，建议练习一致性训练，减少得分波动',
        priority: 'high',
        priorityText: '高'
      });
    }
    
    if (this.data.distributionStats.highPercent > 50) {
      insights.push({
        icon: '🏆',
        title: '表现优秀',
        description: '高分比例很高，继续保持当前训练方法',
        priority: 'low',
        priorityText: '低'
      });
    }
    
    this.setData({
      insights: insights
    });
  },

  // 准备图表数据
  prepareChartData: function(records) {
    // 准备趋势数据
    const period = this.data.periodOptions[this.data.periodIndex].key;
    const trendData = this.generateTrendData(records, period);
    
    // 准备分布数据
    const distributionData = this.generateDistributionData(records);
    
    this.setData({
      trendData: trendData,
      distributionData: distributionData
    });
  },

  // 生成趋势数据
  generateTrendData: function(records, period) {
    // 根据周期生成数据点
    const now = new Date();
    const dataPoints = [];
    
    // 简化实现，返回模拟数据
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dataPoints.push({
        date: this.formatDate(date),
        score: Math.random() * 20 + 60 // 模拟分数
      });
    }
    
    return dataPoints;
  },

  // 生成分布数据
  generateDistributionData: function(records) {
    const distribution = {};
    
    // 统计每个分数的出现次数
    records.forEach(record => {
      if (record.scores) {
        record.scores.forEach(score => {
          distribution[score] = (distribution[score] || 0) + 1;
        });
      }
    });
    
    // 转换为数组格式
    const data = [];
    for (let i = 1; i <= 10; i++) {
      data.push({
        score: i,
        count: distribution[i] || 0
      });
    }
    
    return data;
  },

  // 初始化图表
  initCharts: function() {
    // 这里可以初始化图表库
    console.log('初始化图表');
  },

  // 绘制图表
  drawCharts: function() {
    this.setData({
      chartLoading: true
    });
    
    // 模拟图表绘制
    setTimeout(() => {
      this.drawTrendChart();
      this.drawDistributionChart();
      this.setData({
        chartLoading: false
      });
    }, 1000);
  },

  // 绘制趋势图表
  drawTrendChart: function() {
    const ctx = wx.createCanvasContext('trendChart');
    const data = this.data.trendData;
    
    if (data.length === 0) return;
    
    // 简化的图表绘制
    ctx.setFillStyle('#667eea');
    ctx.fillRect(50, 50, 200, 100);
    ctx.draw();
  },

  // 绘制分布图表
  drawDistributionChart: function() {
    const ctx = wx.createCanvasContext('distributionChart');
    const data = this.data.distributionData;
    
    if (data.length === 0) return;
    
    // 简化的图表绘制
    ctx.setFillStyle('#764ba2');
    ctx.fillRect(50, 50, 200, 100);
    ctx.draw();
  },

  // 时间周期变化
  onPeriodChange: function(e) {
    this.setData({
      periodIndex: e.detail.value
    });
    this.loadStatistics();
    this.drawCharts();
  },

  // 导出数据
  exportData: function(e) {
    const type = e.currentTarget.dataset.type;
    
    switch (type) {
      case 'summary':
        this.exportSummary();
        break;
      case 'records':
        this.exportRecords();
        break;
      case 'chart':
        this.exportCharts();
        break;
    }
  },

  // 导出统计报告
  exportSummary: function() {
    const summary = {
      totalRecords: this.data.totalRecords,
      totalShots: this.data.totalShots,
      averageScore: this.data.averageScore,
      bestScore: this.data.bestScore,
      consistency: this.data.consistency,
      exportTime: new Date().toISOString()
    };
    
    // 这里可以实现导出逻辑
    wx.showModal({
      title: '导出成功',
      content: '统计报告已生成，功能开发中...',
      showCancel: false
    });
  },

  // 导出详细记录
  exportRecords: function() {
    const records = app.getRecords();
    wx.showModal({
      title: '导出成功',
      content: `已导出${records.length}条记录，功能开发中...`,
      showCancel: false
    });
  },

  // 导出图表
  exportCharts: function() {
    wx.showModal({
      title: '导出成功',
      content: '图表已导出，功能开发中...',
      showCancel: false
    });
  },

  // 获取靶纸类型名称
  getTargetTypeName: function(key) {
    const targetType = app.globalData.targetTypes.find(item => item.key === key);
    return targetType ? targetType.name : key;
  },

  // 格式化日期
  formatDate: function(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN');
  }
});
