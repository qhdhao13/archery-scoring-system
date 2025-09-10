# 手机专用配置文件
import os

class MobileConfig:
    """手机端优化配置"""
    
    # 移动端优化设置
    MOBILE_OPTIMIZATIONS = {
        'image_compression': True,  # 启用图像压缩
        'max_image_size': 8 * 1024 * 1024,  # 8MB限制
        'thumbnail_generation': True,  # 生成缩略图
        'cache_enabled': True,  # 启用缓存
    }
    
    # 图像处理优化
    IMAGE_PROCESSING = {
        'resize_before_processing': True,  # 处理前调整大小
        'max_dimension': 1920,  # 最大尺寸
        'quality_reduction': 0.8,  # 质量降低比例
        'fast_mode': True,  # 快速模式
    }
    
    # 移动端UI优化
    MOBILE_UI = {
        'touch_friendly': True,  # 触摸友好
        'large_buttons': True,  # 大按钮
        'gesture_support': True,  # 手势支持
        'responsive_images': True,  # 响应式图片
    }
    
    # 网络优化
    NETWORK_OPTIMIZATION = {
        'chunked_upload': True,  # 分块上传
        'progress_tracking': True,  # 进度跟踪
        'retry_mechanism': True,  # 重试机制
        'timeout': 30,  # 超时时间（秒）
    }
    
    # 缓存设置
    CACHE_SETTINGS = {
        'max_cache_size': 100 * 1024 * 1024,  # 100MB
        'cache_expiry': 3600,  # 1小时过期
        'cleanup_interval': 300,  # 5分钟清理间隔
    }
    
    # 移动端检测
    MOBILE_USER_AGENTS = [
        'Mobile', 'Android', 'iPhone', 'iPad', 'Windows Phone',
        'BlackBerry', 'Opera Mini', 'IEMobile'
    ]
    
    @classmethod
    def is_mobile_request(cls, user_agent):
        """检测是否为移动端请求"""
        if not user_agent:
            return False
        return any(agent in user_agent for agent in cls.MOBILE_USER_AGENTS)
    
    @classmethod
    def get_optimized_settings(cls, is_mobile=False):
        """获取优化设置"""
        if is_mobile:
            return {
                'image_quality': 0.7,
                'max_dimension': 1280,
                'fast_processing': True,
                'mobile_ui': True
            }
        return {
            'image_quality': 0.9,
            'max_dimension': 1920,
            'fast_processing': False,
            'mobile_ui': False
        }
