# 配置文件
import os

class Config:
    # Flask配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'archery-scoring-secret-key-2024'
    DEBUG = True
    
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
    SCORING_ALGORITHM = 'distance_based'  # distance_based 或 area_based
    
    # 服务器配置
    HOST = '0.0.0.0'
    PORT = 5000
    
    # 数据库配置 (可选)
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///archery_scores.db'
