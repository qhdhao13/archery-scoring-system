# 生产环境配置文件
import os

class ProductionConfig:
    """生产环境配置"""
    
    # Flask配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'archery-scoring-production-key-2024'
    DEBUG = False
    TESTING = False
    
    # 服务器配置
    HOST = '0.0.0.0'  # 允许外部访问
    PORT = int(os.environ.get('PORT', 5000))
    
    # 文件上传配置
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    
    # 图像处理配置
    TARGET_DETECTION_MIN_RADIUS = 50
    TARGET_DETECTION_MAX_RADIUS = 300
    ARROW_DETECTION_THRESHOLD = 30
    
    # 靶纸规格配置 (单位: cm)
    TARGET_SPECS = {
        '18m': {'diameter': 40, 'rings': 10, 'distance': 18},
        '30m': {'diameter': 80, 'rings': 10, 'distance': 30},
        '50m': {'diameter': 80, 'rings': 10, 'distance': 50},
        '70m': {'diameter': 122, 'rings': 10, 'distance': 70}
    }
    
    # 得分计算配置
    SCORING_ALGORITHM = 'distance_based'
    
    # 日志配置
    LOG_LEVEL = 'INFO'
    LOG_FILE = 'logs/archery_system.log'
    LOG_MAX_SIZE = 10 * 1024 * 1024  # 10MB
    LOG_BACKUP_COUNT = 5
    
    # 缓存配置
    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 300
    
    # 安全配置
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # 性能配置
    MAX_WORKERS = 4
    WORKER_TIMEOUT = 60
    
    # 监控配置
    ENABLE_MONITORING = True
    METRICS_ENDPOINT = '/metrics'
    
    # 备份配置
    BACKUP_ENABLED = True
    BACKUP_INTERVAL = 24 * 60 * 60  # 24小时
    BACKUP_RETENTION_DAYS = 7
    
    # 邮件通知配置（可选）
    MAIL_SERVER = os.environ.get('MAIL_SERVER')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    
    # 数据库配置（可选）
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///archery_scores.db'
    
    # Redis配置（可选）
    REDIS_URL = os.environ.get('REDIS_URL')
    
    @classmethod
    def init_app(cls, app):
        """初始化应用配置"""
        # 创建日志目录
        log_dir = os.path.dirname(cls.LOG_FILE)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir)
        
        # 创建上传目录
        if not os.path.exists(cls.UPLOAD_FOLDER):
            os.makedirs(cls.UPLOAD_FOLDER)
        
        # 创建数据目录
        for directory in ['data', 'models', 'logs']:
            if not os.path.exists(directory):
                os.makedirs(directory)
