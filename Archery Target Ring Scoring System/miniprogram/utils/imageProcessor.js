/**
 * 图像处理工具类 - 专为微信小程序优化
 * 提供图像预处理、压缩、格式转换等功能
 */

class ImageProcessor {
  constructor() {
    this.maxWidth = 1024;
    this.maxHeight = 1024;
    this.quality = 0.8;
  }

  /**
   * 压缩图片
   * @param {string} filePath 图片路径
   * @param {Object} options 压缩选项
   * @returns {Promise<string>} 压缩后的图片路径
   */
  async compressImage(filePath, options = {}) {
    return new Promise((resolve, reject) => {
      const {
        maxWidth = this.maxWidth,
        maxHeight = this.maxHeight,
        quality = this.quality
      } = options;

      wx.compressImage({
        src: filePath,
        quality: quality,
        success: (res) => {
          console.log('图片压缩成功:', res);
          resolve(res.tempFilePath);
        },
        fail: (err) => {
          console.error('图片压缩失败:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * 获取图片信息
   * @param {string} filePath 图片路径
   * @returns {Promise<Object>} 图片信息
   */
  async getImageInfo(filePath) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: filePath,
        success: (res) => {
          resolve({
            width: res.width,
            height: res.height,
            path: res.path,
            orientation: res.orientation,
            type: res.type
          });
        },
        fail: (err) => {
          console.error('获取图片信息失败:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * 裁剪图片
   * @param {string} filePath 图片路径
   * @param {Object} options 裁剪选项
   * @returns {Promise<string>} 裁剪后的图片路径
   */
  async cropImage(filePath, options = {}) {
    return new Promise((resolve, reject) => {
      const {
        x = 0,
        y = 0,
        width = 0,
        height = 0
      } = options;

      wx.cropImage({
        src: filePath,
        cropRect: {
          x: x,
          y: y,
          width: width,
          height: height
        },
        success: (res) => {
          console.log('图片裁剪成功:', res);
          resolve(res.tempFilePath);
        },
        fail: (err) => {
          console.error('图片裁剪失败:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * 图片转base64
   * @param {string} filePath 图片路径
   * @returns {Promise<string>} base64字符串
   */
  async imageToBase64(filePath) {
    return new Promise((resolve, reject) => {
      const fs = wx.getFileSystemManager();
      
      fs.readFile({
        filePath: filePath,
        encoding: 'base64',
        success: (res) => {
          resolve(res.data);
        },
        fail: (err) => {
          console.error('图片转base64失败:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * base64转图片
   * @param {string} base64 base64字符串
   * @param {string} fileName 文件名
   * @returns {Promise<string>} 图片路径
   */
  async base64ToImage(base64, fileName = 'temp.jpg') {
    return new Promise((resolve, reject) => {
      const fs = wx.getFileSystemManager();
      const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
      
      fs.writeFile({
        filePath: filePath,
        data: base64,
        encoding: 'base64',
        success: () => {
          resolve(filePath);
        },
        fail: (err) => {
          console.error('base64转图片失败:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * 图片预处理 - 为识别做准备
   * @param {string} filePath 图片路径
   * @returns {Promise<string>} 处理后的图片路径
   */
  async preprocessForRecognition(filePath) {
    try {
      // 1. 获取图片信息
      const imageInfo = await this.getImageInfo(filePath);
      console.log('原始图片信息:', imageInfo);

      // 2. 压缩图片（如果太大）
      let processedPath = filePath;
      if (imageInfo.width > this.maxWidth || imageInfo.height > this.maxHeight) {
        processedPath = await this.compressImage(filePath, {
          maxWidth: this.maxWidth,
          maxHeight: this.maxHeight,
          quality: 0.9 // 识别用图片保持较高质量
        });
      }

      // 3. 转换为base64（用于上传）
      const base64 = await this.imageToBase64(processedPath);
      
      return {
        filePath: processedPath,
        base64: base64,
        width: imageInfo.width,
        height: imageInfo.height
      };
    } catch (error) {
      console.error('图片预处理失败:', error);
      throw error;
    }
  }

  /**
   * 保存图片到相册
   * @param {string} filePath 图片路径
   * @returns {Promise<boolean>} 是否保存成功
   */
  async saveToAlbum(filePath) {
    return new Promise((resolve, reject) => {
      wx.saveImageToPhotosAlbum({
        filePath: filePath,
        success: () => {
          console.log('图片保存到相册成功');
          resolve(true);
        },
        fail: (err) => {
          console.error('图片保存到相册失败:', err);
          if (err.errMsg.includes('auth deny')) {
            // 权限被拒绝
            wx.showModal({
              title: '需要相册权限',
              content: '请在设置中开启相册权限',
              showCancel: false
            });
          }
          reject(err);
        }
      });
    });
  }

  /**
   * 从相册选择图片
   * @param {Object} options 选择选项
   * @returns {Promise<Array>} 选择的图片路径数组
   */
  async chooseFromAlbum(options = {}) {
    return new Promise((resolve, reject) => {
      const {
        count = 1,
        sizeType = ['compressed'],
        sourceType = ['album']
      } = options;

      wx.chooseImage({
        count: count,
        sizeType: sizeType,
        sourceType: sourceType,
        success: (res) => {
          console.log('选择图片成功:', res);
          resolve(res.tempFilePaths);
        },
        fail: (err) => {
          console.error('选择图片失败:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * 拍照
   * @param {Object} options 拍照选项
   * @returns {Promise<string>} 拍摄的图片路径
   */
  async takePhoto(options = {}) {
    return new Promise((resolve, reject) => {
      const {
        quality = 'high',
        sourceType = ['camera']
      } = options;

      wx.chooseImage({
        count: 1,
        sizeType: ['original'],
        sourceType: sourceType,
        success: (res) => {
          console.log('拍照成功:', res);
          resolve(res.tempFilePaths[0]);
        },
        fail: (err) => {
          console.error('拍照失败:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * 批量处理图片
   * @param {Array} filePaths 图片路径数组
   * @param {Function} processor 处理函数
   * @returns {Promise<Array>} 处理结果数组
   */
  async batchProcess(filePaths, processor) {
    const results = [];
    
    for (let i = 0; i < filePaths.length; i++) {
      try {
        const result = await processor(filePaths[i]);
        results.push({
          success: true,
          index: i,
          result: result
        });
      } catch (error) {
        results.push({
          success: false,
          index: i,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * 检查图片格式是否支持
   * @param {string} filePath 图片路径
   * @returns {Promise<boolean>} 是否支持
   */
  async isSupportedFormat(filePath) {
    try {
      const imageInfo = await this.getImageInfo(filePath);
      const supportedFormats = ['jpg', 'jpeg', 'png', 'gif'];
      return supportedFormats.includes(imageInfo.type.toLowerCase());
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取图片大小（字节）
   * @param {string} filePath 图片路径
   * @returns {Promise<number>} 图片大小
   */
  async getImageSize(filePath) {
    return new Promise((resolve, reject) => {
      const fs = wx.getFileSystemManager();
      
      fs.stat({
        path: filePath,
        success: (res) => {
          resolve(res.size);
        },
        fail: (err) => {
          console.error('获取图片大小失败:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * 删除临时文件
   * @param {string} filePath 文件路径
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteTempFile(filePath) {
    return new Promise((resolve, reject) => {
      const fs = wx.getFileSystemManager();
      
      fs.unlink({
        filePath: filePath,
        success: () => {
          console.log('临时文件删除成功:', filePath);
          resolve(true);
        },
        fail: (err) => {
          console.error('临时文件删除失败:', err);
          reject(err);
        }
      });
    });
  }
}

// 创建单例实例
const imageProcessor = new ImageProcessor();

module.exports = imageProcessor;
