// app.js
App({
  onLaunch: function () {
    this.globalData = {
      // env 参数说明：
      //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
      //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
      //   如不填则使用默认环境（第一个创建的环境）
      env: "cloud1-7gl0swmxf7670058",
      userInfo: null,
      isLoading: false
    };
    
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
    
    // 监听全局未捕获的Promise错误
    wx.onUnhandledRejection(({ reason }) => {
      console.error('未处理的Promise错误:', reason);
      this.showError('操作失败，请稍后重试');
    });
    
    // 监听全局未捕获的普通错误
    wx.onError((error) => {
      console.error('未处理的全局错误:', error);
    });
  },
  
  // 全局方法：显示加载状态
  showLoading: function(title = '加载中') {
    if (!this.globalData.isLoading) {
      this.globalData.isLoading = true;
      wx.showLoading({
        title: title,
        mask: true
      });
    }
  },
  
  // 全局方法：隐藏加载状态
  hideLoading: function() {
    if (this.globalData.isLoading) {
      this.globalData.isLoading = false;
      wx.hideLoading();
    }
  },
  
  // 全局方法：显示错误提示
  showError: function(message) {
    this.hideLoading();
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  },
  
  // 全局方法：显示成功提示
  showSuccess: function(message) {
    this.hideLoading();
    wx.showToast({
      title: message,
      icon: 'success',
      duration: 2000
    });
  }
});