// 拍照识别页面逻辑
const app = getApp();

Page({
  data: {
    targetTypes: [],
    currentTargetType: '18m',
    currentTargetName: '',
    currentTargetSpec: '',
    flashMode: 'off',
    showGuide: false,
    loading: false,
    loadingText: '处理中...',
    loadingProgress: '',
    recentPhotos: [],
    previewResult: null
  },

  onLoad: function(options) {
    console.log('拍照页面加载', options);
    this.initPage(options);
  },

  onShow: function() {
    console.log('拍照页面显示');
    this.loadRecentPhotos();
  },

  onUnload: function() {
    console.log('拍照页面卸载');
  },

  // 初始化页面
  initPage: function(options) {
    const targetTypes = app.globalData.targetTypes;
    const currentTargetType = options.targetType || app.globalData.currentTargetType;
    const currentTarget = targetTypes.find(item => item.key === currentTargetType);
    
    this.setData({
      targetTypes: targetTypes,
      currentTargetType: currentTargetType,
      currentTargetName: currentTarget ? currentTarget.name : '18米',
      currentTargetSpec: currentTarget ? `${currentTarget.diameter}cm直径` : '40cm直径'
    });
  },

  // 选择靶纸类型
  selectTargetType: function(e) {
    const targetType = e.currentTarget.dataset.type;
    const target = app.globalData.targetTypes.find(item => item.key === targetType);
    
    this.setData({
      currentTargetType: targetType,
      currentTargetName: target.name,
      currentTargetSpec: `${target.diameter}cm直径`
    });
    
    // 保存设置
    app.saveUserSettings({
      targetType: targetType
    });
    
    // 震动反馈
    wx.vibrateShort();
  },

  // 切换摄像头
  switchCamera: function() {
    // 这里需要重新初始化相机组件
    wx.showToast({
      title: '切换摄像头',
      icon: 'none',
      duration: 1000
    });
    wx.vibrateShort();
  },

  // 切换闪光灯
  toggleFlash: function() {
    const newMode = this.data.flashMode === 'off' ? 'on' : 'off';
    this.setData({
      flashMode: newMode
    });
    wx.vibrateShort();
  },

  // 从相册选择
  selectFromAlbum: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.processImage(tempFilePath);
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        app.showError('选择图片失败');
      }
    });
  },

  // 拍摄照片
  takePhoto: function() {
    const ctx = wx.createCameraContext();
    
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        console.log('拍摄成功:', res);
        this.processImage(res.tempImagePath);
      },
      fail: (err) => {
        console.error('拍摄失败:', err);
        app.showError('拍摄失败，请重试');
      }
    });
    
    // 震动反馈
    wx.vibrateShort();
  },

  // 处理图片
  processImage: function(imagePath) {
    this.setData({
      loading: true,
      loadingText: '正在分析图像...',
      loadingProgress: ''
    });

    // 模拟处理进度
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      this.setData({
        loadingProgress: `${progress}%`
      });
      
      if (progress >= 90) {
        clearInterval(progressInterval);
      }
    }, 200);

    // 上传并处理图片
    const formData = {
      target_type: this.data.currentTargetType
    };

    app.uploadFile(imagePath, formData)
      .then(result => {
        clearInterval(progressInterval);
        this.setData({
          loadingProgress: '100%'
        });
        
        setTimeout(() => {
          this.handleProcessResult(result, imagePath);
        }, 500);
      })
      .catch(error => {
        clearInterval(progressInterval);
        console.error('图片处理失败:', error);
        this.setData({
          loading: false
        });
        app.showError('图片处理失败: ' + error.message);
      });
  },

  // 处理识别结果
  handleProcessResult: function(result, imagePath) {
    this.setData({
      loading: false
    });

    if (result.success) {
      // 显示预览结果
      this.setData({
        previewResult: {
          ...result,
          originalImage: imagePath
        }
      });
      
      // 保存到最近拍摄
      this.saveRecentPhoto(result, imagePath);
    } else {
      app.showError('识别失败: ' + (result.error || '未知错误'));
    }
  },

  // 保存最近拍摄
  saveRecentPhoto: function(result, imagePath) {
    try {
      const recentPhotos = wx.getStorageSync('recentPhotos') || [];
      const photoData = {
        id: Date.now(),
        thumbPath: imagePath,
        totalScore: result.scores.reduce((sum, score) => sum + score, 0),
        arrowCount: result.scores.length,
        time: this.formatTime(new Date()),
        targetType: this.data.currentTargetType,
        result: result
      };
      
      recentPhotos.unshift(photoData);
      
      // 只保留最近10张
      if (recentPhotos.length > 10) {
        recentPhotos.splice(10);
      }
      
      wx.setStorageSync('recentPhotos', recentPhotos);
      this.loadRecentPhotos();
    } catch (error) {
      console.error('保存最近拍摄失败:', error);
    }
  },

  // 加载最近拍摄
  loadRecentPhotos: function() {
    try {
      const recentPhotos = wx.getStorageSync('recentPhotos') || [];
      this.setData({
        recentPhotos: recentPhotos
      });
    } catch (error) {
      console.error('加载最近拍摄失败:', error);
    }
  },

  // 选择最近拍摄的照片
  selectRecentPhoto: function(e) {
    const photo = e.currentTarget.dataset.photo;
    this.setData({
      previewResult: photo.result
    });
  },

  // 清空最近拍摄
  clearRecentPhotos: function() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有最近拍摄的照片吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('recentPhotos');
          this.setData({
            recentPhotos: []
          });
          app.showSuccess('已清空');
        }
      }
    });
  },

  // 确认识别结果
  confirmResult: function() {
    const result = this.data.previewResult;
    
    // 保存记录
    const record = {
      targetType: this.data.currentTargetType,
      scores: result.scores,
      totalScore: result.scores.reduce((sum, score) => sum + score, 0),
      averageScore: (result.scores.reduce((sum, score) => sum + score, 0) / result.scores.length).toFixed(1),
      arrowCount: result.scores.length,
      center: result.center,
      radius: result.radius,
      arrowPositions: result.arrow_positions,
      resultImage: result.result_image,
      analysis: result.analysis
    };
    
    const savedRecord = app.saveRecord(record);
    
    if (savedRecord) {
      // 跳转到结果页面
      wx.navigateTo({
        url: `/pages/result/result?recordId=${savedRecord.id}`
      });
    } else {
      app.showError('保存记录失败');
    }
  },

  // 重新拍摄
  retakePhoto: function() {
    this.setData({
      previewResult: null
    });
  },

  // 关闭预览
  closePreview: function() {
    this.setData({
      previewResult: null
    });
  },

  // 显示拍摄指南
  showTargetGuide: function() {
    this.setData({
      showGuide: true
    });
  },

  // 隐藏拍摄指南
  hideGuide: function() {
    this.setData({
      showGuide: false
    });
  },

  // 格式化时间
  formatTime: function(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return Math.floor(diff / 60000) + '分钟前';
    } else if (diff < 86400000) { // 1天内
      return Math.floor(diff / 3600000) + '小时前';
    } else {
      return date.toLocaleDateString();
    }
  },

  // 跳转到手动输入
  goToManual: function() {
    wx.navigateTo({
      url: '/pages/manual/manual?targetType=' + this.data.currentTargetType
    });
  },

  // 跳转到历史记录
  goToHistory: function() {
    wx.switchTab({
      url: '/pages/history/history'
    });
  },

  // 跳转到设置
  goToSettings: function() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  // 相机错误处理
  onCameraError: function(e) {
    console.error('相机错误:', e);
    app.showError('相机启动失败，请检查权限设置');
  },

  // 相机停止
  onCameraStop: function(e) {
    console.log('相机停止:', e);
  },

  // 扫码事件
  onScanCode: function(e) {
    console.log('扫码结果:', e);
  }
});
