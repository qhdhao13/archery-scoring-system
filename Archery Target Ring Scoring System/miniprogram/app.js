// 射箭记分助手 - 小程序主入口
App({
  globalData: {
    userInfo: null,
    targetTypes: [
      { key: '18m', name: '18米', diameter: 40, distance: 18 },
      { key: '30m', name: '30米', diameter: 80, distance: 30 },
      { key: '50m', name: '50米', diameter: 80, distance: 50 },
      { key: '70m', name: '70米', diameter: 122, distance: 70 }
    ],
    currentTargetType: '18m',
    apiBaseUrl: 'https://your-domain.com/api', // 替换为你的服务器地址
    version: '1.0.0'
  },

  onLaunch: function() {
    console.log('射箭记分助手启动');
    
    // 检查更新
    this.checkForUpdate();
    
    // 初始化用户设置
    this.initUserSettings();
    
    // 检查网络状态
    this.checkNetworkStatus();
  },

  onShow: function() {
    console.log('小程序显示');
  },

  onHide: function() {
    console.log('小程序隐藏');
  },

  onError: function(msg) {
    console.error('小程序错误:', msg);
    wx.showToast({
      title: '程序异常，请重启',
      icon: 'none',
      duration: 2000
    });
  },

  // 检查小程序更新
  checkForUpdate: function() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate(function(res) {
        console.log('检查更新结果:', res.hasUpdate);
      });

      updateManager.onUpdateReady(function() {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: function(res) {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });

      updateManager.onUpdateFailed(function() {
        console.log('新版本下载失败');
      });
    }
  },

  // 初始化用户设置
  initUserSettings: function() {
    try {
      const settings = wx.getStorageSync('userSettings');
      if (settings) {
        this.globalData.currentTargetType = settings.targetType || '18m';
      }
    } catch (e) {
      console.error('读取用户设置失败:', e);
    }
  },

  // 保存用户设置
  saveUserSettings: function(settings) {
    try {
      wx.setStorageSync('userSettings', settings);
      this.globalData.currentTargetType = settings.targetType || '18m';
    } catch (e) {
      console.error('保存用户设置失败:', e);
    }
  },

  // 检查网络状态
  checkNetworkStatus: function() {
    wx.getNetworkType({
      success: (res) => {
        console.log('网络类型:', res.networkType);
        if (res.networkType === 'none') {
          wx.showToast({
            title: '网络连接异常',
            icon: 'none'
          });
        }
      }
    });
  },

  // 获取用户信息
  getUserInfo: function() {
    return new Promise((resolve, reject) => {
      if (this.globalData.userInfo) {
        resolve(this.globalData.userInfo);
        return;
      }

      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          this.globalData.userInfo = res.userInfo;
          resolve(res.userInfo);
        },
        fail: (err) => {
          console.error('获取用户信息失败:', err);
          reject(err);
        }
      });
    });
  },

  // 显示加载提示
  showLoading: function(title = '加载中...') {
    wx.showLoading({
      title: title,
      mask: true
    });
  },

  // 隐藏加载提示
  hideLoading: function() {
    wx.hideLoading();
  },

  // 显示成功提示
  showSuccess: function(title) {
    wx.showToast({
      title: title,
      icon: 'success',
      duration: 2000
    });
  },

  // 显示错误提示
  showError: function(title) {
    wx.showToast({
      title: title,
      icon: 'none',
      duration: 3000
    });
  },

  // 网络请求封装
  request: function(options) {
    return new Promise((resolve, reject) => {
      const { url, method = 'GET', data = {}, header = {} } = options;
      
      wx.request({
        url: this.globalData.apiBaseUrl + url,
        method: method,
        data: data,
        header: {
          'Content-Type': 'application/json',
          ...header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          console.error('网络请求失败:', err);
          reject(err);
        }
      });
    });
  },

  // 上传文件
  uploadFile: function(filePath, formData = {}) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: this.globalData.apiBaseUrl + '/upload',
        filePath: filePath,
        name: 'file',
        formData: formData,
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            if (data.success) {
              resolve(data);
            } else {
              reject(new Error(data.error || '上传失败'));
            }
          } catch (e) {
            reject(new Error('数据解析失败'));
          }
        },
        fail: (err) => {
          console.error('文件上传失败:', err);
          reject(err);
        }
      });
    });
  },

  // 保存记录到本地
  saveRecord: function(record) {
    try {
      const records = wx.getStorageSync('archeryRecords') || [];
      record.id = Date.now();
      record.timestamp = new Date().toISOString();
      records.unshift(record);
      
      // 只保留最近100条记录
      if (records.length > 100) {
        records.splice(100);
      }
      
      wx.setStorageSync('archeryRecords', records);
      return record;
    } catch (e) {
      console.error('保存记录失败:', e);
      return null;
    }
  },

  // 获取本地记录
  getRecords: function() {
    try {
      return wx.getStorageSync('archeryRecords') || [];
    } catch (e) {
      console.error('获取记录失败:', e);
      return [];
    }
  },

  // 删除记录
  deleteRecord: function(recordId) {
    try {
      const records = wx.getStorageSync('archeryRecords') || [];
      const filteredRecords = records.filter(record => record.id !== recordId);
      wx.setStorageSync('archeryRecords', filteredRecords);
      return true;
    } catch (e) {
      console.error('删除记录失败:', e);
      return false;
    }
  }
});
