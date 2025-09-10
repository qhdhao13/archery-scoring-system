#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lambert 个人生活记录网站后端服务
提供API接口用于管理照片、文章、视频等内容
"""

from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import sqlite3
import json
from datetime import datetime
import uuid
from PIL import Image
import hashlib

# 创建Flask应用
app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 配置
app.config['SECRET_KEY'] = 'lambert-personal-website-2024'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB最大文件大小

# 允许的文件扩展名
ALLOWED_EXTENSIONS = {
    'image': {'png', 'jpg', 'jpeg', 'gif', 'webp'},
    'video': {'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'}
}

# 确保上传目录存在
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'images'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'videos'), exist_ok=True)

def init_database():
    """初始化数据库"""
    conn = sqlite3.connect('lambert.db')
    cursor = conn.cursor()
    
    # 创建照片表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            filename TEXT NOT NULL,
            category TEXT DEFAULT 'daily',
            upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            file_size INTEGER,
            file_hash TEXT
        )
    ''')
    
    # 创建文章表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            excerpt TEXT,
            tags TEXT,
            publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            read_time INTEGER DEFAULT 5
        )
    ''')
    
    # 创建视频表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            filename TEXT NOT NULL,
            upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            file_size INTEGER,
            duration INTEGER
        )
    ''')
    
    # 创建统计表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            photos_count INTEGER DEFAULT 0,
            articles_count INTEGER DEFAULT 0,
            videos_count INTEGER DEFAULT 0,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def allowed_file(filename, file_type):
    """检查文件类型是否允许"""
    if '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in ALLOWED_EXTENSIONS.get(file_type, set())

def generate_file_hash(file_path):
    """生成文件哈希值用于去重"""
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def resize_image(image_path, max_size=(800, 600)):
    """调整图片大小"""
    try:
        with Image.open(image_path) as img:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            img.save(image_path, optimize=True, quality=85)
    except Exception as e:
        print(f"图片调整失败: {e}")

@app.route('/')
def index():
    """首页路由"""
    return send_from_directory('.', 'index.html')

@app.route('/legacy')
def legacy():
    """原服务器内容页面"""
    return render_template('legacy.html')

@app.route('/legacy/<path:filename>')
def legacy_files(filename):
    """提供原服务器文件访问"""
    return send_from_directory('/opt/lambert-website/legacy', filename)

@app.route('/api/stats')
def get_stats():
    """获取统计数据"""
    conn = sqlite3.connect('lambert.db')
    cursor = conn.cursor()
    
    # 获取各类型内容数量
    cursor.execute('SELECT COUNT(*) FROM photos')
    photos_count = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM articles')
    articles_count = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM videos')
    videos_count = cursor.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'photos': photos_count,
        'articles': articles_count,
        'videos': videos_count
    })

@app.route('/api/recent')
def get_recent_updates():
    """获取最新动态"""
    conn = sqlite3.connect('lambert.db')
    cursor = conn.cursor()
    
    recent_updates = []
    
    # 获取最新照片
    cursor.execute('''
        SELECT title, description, filename, upload_date, 'photo' as type
        FROM photos 
        ORDER BY upload_date DESC 
        LIMIT 3
    ''')
    photos = cursor.fetchall()
    
    for photo in photos:
        recent_updates.append({
            'title': photo[0],
            'description': photo[1] or '一张美丽的照片',
            'image': f'/uploads/images/{photo[2]}',
            'date': photo[3],
            'type': '照片'
        })
    
    # 获取最新文章
    cursor.execute('''
        SELECT title, excerpt, publish_date, 'article' as type
        FROM articles 
        ORDER BY publish_date DESC 
        LIMIT 2
    ''')
    articles = cursor.fetchall()
    
    for article in articles:
        recent_updates.append({
            'title': article[0],
            'description': article[1] or '一篇精彩的文章',
            'image': 'https://via.placeholder.com/300x200/87CEEB/FFFFFF?text=文章',
            'date': article[2],
            'type': '文章'
        })
    
    # 获取最新视频
    cursor.execute('''
        SELECT title, description, filename, upload_date, 'video' as type
        FROM videos 
        ORDER BY upload_date DESC 
        LIMIT 2
    ''')
    videos = cursor.fetchall()
    
    for video in videos:
        recent_updates.append({
            'title': video[0],
            'description': video[1] or '一个有趣的视频',
            'image': 'https://via.placeholder.com/300x200/98FB98/FFFFFF?text=视频',
            'date': video[3],
            'type': '视频'
        })
    
    conn.close()
    
    # 按日期排序
    recent_updates.sort(key=lambda x: x['date'], reverse=True)
    
    return jsonify(recent_updates[:5])  # 返回最新的5条

@app.route('/api/gallery')
def get_gallery():
    """获取相册数据"""
    conn = sqlite3.connect('lambert.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, title, description, filename, category, upload_date
        FROM photos 
        ORDER BY upload_date DESC
    ''')
    
    photos = cursor.fetchall()
    conn.close()
    
    gallery_data = []
    for photo in photos:
        gallery_data.append({
            'id': photo[0],
            'title': photo[1],
            'description': photo[2],
            'image': f'/uploads/images/{photo[3]}',
            'category': photo[4],
            'date': photo[5]
        })
    
    return jsonify(gallery_data)

@app.route('/api/articles')
def get_articles():
    """获取文章数据"""
    if request.method == 'GET':
        conn = sqlite3.connect('lambert.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, title, content, excerpt, tags, publish_date, read_time
            FROM articles 
            ORDER BY publish_date DESC
        ''')
        
        articles = cursor.fetchall()
        conn.close()
        
        articles_data = []
        for article in articles:
            tags = json.loads(article[4]) if article[4] else []
            articles_data.append({
                'id': article[0],
                'title': article[1],
                'content': article[2],
                'excerpt': article[3],
                'tags': tags,
                'date': article[5],
                'readTime': article[6]
            })
        
        return jsonify(articles_data)
    
    elif request.method == 'POST':
        """发布新文章"""
        data = request.get_json()
        
        # 生成摘要（取前100个字符）
        excerpt = data['content'][:100] + '...' if len(data['content']) > 100 else data['content']
        
        # 估算阅读时间（按每分钟200字计算）
        read_time = max(1, len(data['content']) // 200)
        
        conn = sqlite3.connect('lambert.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO articles (title, content, excerpt, tags, read_time)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data['title'],
            data['content'],
            excerpt,
            json.dumps(data['tags'], ensure_ascii=False),
            read_time
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': '文章发布成功'})

@app.route('/api/videos')
def get_videos():
    """获取视频数据"""
    conn = sqlite3.connect('lambert.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, title, description, filename, upload_date
        FROM videos 
        ORDER BY upload_date DESC
    ''')
    
    videos = cursor.fetchall()
    conn.close()
    
    videos_data = []
    for video in videos:
        videos_data.append({
            'id': video[0],
            'title': video[1],
            'description': video[2],
            'url': f'/uploads/videos/{video[3]}',
            'date': video[4]
        })
    
    return jsonify(videos_data)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """文件上传接口"""
    if 'file' not in request.files:
        return jsonify({'error': '没有选择文件'}), 400
    
    file = request.files['file']
    title = request.form.get('title', '')
    description = request.form.get('description', '')
    category = request.form.get('category', 'daily')
    
    if file.filename == '':
        return jsonify({'error': '没有选择文件'}), 400
    
    if file and allowed_file(file.filename, 'image'):
        # 处理图片上传
        filename = secure_filename(file.filename)
        # 添加时间戳避免重名
        name, ext = os.path.splitext(filename)
        filename = f"{name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{ext}"
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'images', filename)
        file.save(file_path)
        
        # 调整图片大小
        resize_image(file_path)
        
        # 生成文件哈希
        file_hash = generate_file_hash(file_path)
        file_size = os.path.getsize(file_path)
        
        # 保存到数据库
        conn = sqlite3.connect('lambert.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO photos (title, description, filename, category, file_size, file_hash)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (title, description, filename, category, file_size, file_hash))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': '图片上传成功'})
    
    elif file and allowed_file(file.filename, 'video'):
        # 处理视频上传
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        filename = f"{name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}{ext}"
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'videos', filename)
        file.save(file_path)
        
        file_size = os.path.getsize(file_path)
        
        # 保存到数据库
        conn = sqlite3.connect('lambert.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO videos (title, description, filename, file_size)
            VALUES (?, ?, ?, ?)
        ''', (title, description, filename, file_size))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': '视频上传成功'})
    
    else:
        return jsonify({'error': '不支持的文件类型'}), 400

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    """提供上传文件的访问"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.errorhandler(404)
def not_found(error):
    """404错误处理"""
    return jsonify({'error': '页面未找到'}), 404

@app.errorhandler(500)
def internal_error(error):
    """500错误处理"""
    return jsonify({'error': '服务器内部错误'}), 500

if __name__ == '__main__':
    # 初始化数据库
    init_database()
    
    # 启动应用
    app.run(host='0.0.0.0', port=5000, debug=True)
else:
    # 当使用gunicorn启动时也要初始化数据库
    init_database()
