// 结果展示页面逻辑
const app = getApp();

Page({
  data: {
    record: null,
    recordId: null,
    imageLoading: true,
    showImagePreview: false,
    showShareModal: false,
    relatedRecords: []
  },

  onLoad: function(options) {
    console.log('结果页面加载', options);
    this.initPage(options);
  },

  onShow: function() {
    console.log('结果页面显示');
  },

  onReady: function() {
    console.log('结果页面准备完成');
  },

  // 初始化页面
  initPage: function(options) {
    const recordId = options.recordId;
    if (recordId) {
      this.loadRecord(recordId);
    } else {
      // 如果没有recordId，可能是从拍照页面直接跳转过来的
      // 尝试从全局数据获取最新记录
      this.loadLatestRecord();
    }
  },

  // 加载记录
  loadRecord: function(recordId) {
    try {
      const records = app.getRecords();
      const record = records.find(r => r.id == recordId);
      
      if (record) {
        this.setData({
          record: this.formatRecord(record),
          recordId: recordId
        });
        this.loadRelatedRecords(record);
      } else {
        app.showError('记录不存在');
        wx.navigateBack();
      }
    } catch (error) {
      console.error('加载记录失败:', error);
      app.showError('加载记录失败');
      wx.navigateBack();
    }
  },

  // 加载最新记录
  loadLatestRecord: function() {
    try {
      const records = app.getRecords();
      if (records.length > 0) {
        const latestRecord = records[0];
        this.setData({
          record: this.formatRecord(latestRecord),
          recordId: latestRecord.id
        });
        this.loadRelatedRecords(latestRecord);
      } else {
        app.showError('没有找到记录');
        wx.navigateBack();
      }
    } catch (error) {
      console.error('加载最新记录失败:', error);
      app.showError('加载记录失败');
      wx.navigateBack();
    }
  },

  // 格式化记录数据
  formatRecord: function(record) {
    const targetType = app.globalData.targetTypes.find(item => item.key === record.targetType);
    
    return {
      ...record,
      targetType: targetType ? targetType.name : record.targetType,
      date: this.formatDate(record.timestamp),
      performanceGrade: record.analysis ? record.analysis.performance_grade : 'N/A'
    };
  },

  // 加载相关记录
  loadRelatedRecords: function(currentRecord) {
    try {
      const records = app.getRecords();
      const relatedRecords = records
        .filter(record => 
          record.id !== currentRecord.id && 
          record.targetType === currentRecord.targetType
        )
        .slice(0, 3)
        .map(record => this.formatRecord(record));
      
      this.setData({
        relatedRecords: relatedRecords
      });
    } catch (error) {
      console.error('加载相关记录失败:', error);
    }
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

  // 获取趋势文本
  getTrendText: function(trend) {
    const trendMap = {
      'improving': '上升趋势',
      'declining': '下降趋势',
      'stable': '稳定'
    };
    return trendMap[trend] || trend;
  },

  // 图片加载完成
  onImageLoad: function() {
    this.setData({
      imageLoading: false
    });
  },

  // 图片加载错误
  onImageError: function() {
    this.setData({
      imageLoading: false
    });
    app.showError('图片加载失败');
  },

  // 预览图片
  previewImage: function() {
    this.setData({
      showImagePreview: true
    });
  },

  // 隐藏图片预览
  hideImagePreview: function() {
    this.setData({
      showImagePreview: false
    });
  },

  // 分享结果
  shareResult: function() {
    this.setData({
      showShareModal: true
    });
  },

  // 隐藏分享弹窗
  hideShareModal: function() {
    this.setData({
      showShareModal: false
    });
  },

  // 保存图片
  saveImage: function() {
    if (!this.data.record || !this.data.record.resultImage) {
      app.showError('没有可保存的图片');
      return;
    }

    app.showLoading('保存中...');
    
    // 将base64图片保存到相册
    const fs = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/temp_result.jpg`;
    
    // 将base64转换为文件
    fs.writeFile({
      filePath: filePath,
      data: this.data.record.resultImage,
      encoding: 'base64',
      success: () => {
        // 保存到相册
        wx.saveImageToPhotosAlbum({
          filePath: filePath,
          success: () => {
            app.hideLoading();
            app.showSuccess('保存成功');
          },
          fail: (err) => {
            app.hideLoading();
            if (err.errMsg.includes('auth deny')) {
              wx.showModal({
                title: '需要相册权限',
                content: '请在设置中开启相册权限',
                showCancel: false
              });
            } else {
              app.showError('保存失败');
            }
          }
        });
      },
      fail: (err) => {
        app.hideLoading();
        console.error('写入文件失败:', err);
        app.showError('保存失败');
      }
    });
  },

  // 保存到相册
  saveToAlbum: function() {
    this.saveImage();
    this.hideShareModal();
  },

  // 重新拍摄
  retakePhoto: function() {
    wx.navigateTo({
      url: '/pages/camera/camera?targetType=' + this.data.record.targetType
    });
  },

  // 保存记录
  saveRecord: function() {
    // 记录已经保存了，这里可以做一些额外的操作
    app.showSuccess('记录已保存');
  },

  // 查看记录
  viewRecord: function(e) {
    const record = e.currentTarget.dataset.record;
    wx.redirectTo({
      url: '/pages/result/result?recordId=' + record.id
    });
  },

  // 跳转到历史记录
  goToHistory: function() {
    wx.switchTab({
      url: '/pages/history/history'
    });
  },

  // 分享给朋友
  onShareAppMessage: function() {
    const record = this.data.record;
    if (!record) return {};
    
    return {
      title: `射箭记分 - ${record.totalScore}分 (${record.arrowCount}箭)`,
      path: `/pages/result/result?recordId=${record.id}`,
      imageUrl: record.resultImage
    };
  },

  // 分享到朋友圈
  onShareTimeline: function() {
    const record = this.data.record;
    if (!record) return {};
    
    return {
      title: `射箭记分 - ${record.totalScore}分 (${record.arrowCount}箭)`,
      imageUrl: record.resultImage
    };
  }
});
