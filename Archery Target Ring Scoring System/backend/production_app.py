#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
射箭靶纸得分统计系统 - 生产环境启动脚本
适用于腾讯云轻量应用服务器
"""

import os
import sys
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from image_processor import ArcheryTargetProcessor
from scoring import ArcheryScoring
from production_config import ProductionConfig
import cv2
import base64
from datetime import datetime
import json
import signal
import atexit

# 配置日志
def setup_logging(app):
    """设置日志配置"""
    if not app.debug and not app.testing:
        # 文件日志
        file_handler = RotatingFileHandler(
            ProductionConfig.LOG_FILE,
            maxBytes=ProductionConfig.LOG_MAX_SIZE,
            backupCount=ProductionConfig.LOG_BACKUP_COUNT
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        
        # 控制台日志
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s'
        ))
        app.logger.addHandler(console_handler)
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('射箭得分统计系统启动')

def create_app():
    """创建Flask应用"""
    app = Flask(__name__, 
                template_folder='../frontend',
                static_folder='../frontend',
                static_url_path='')
    
    # 加载配置
    app.config.from_object(ProductionConfig)
    ProductionConfig.init_app(app)
    
    # 设置CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # 设置日志
    setup_logging(app)
    
    # 确保上传文件夹存在
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # 添加静态文件路由
    @app.route('/<path:filename>')
    def static_files(filename):
        return send_from_directory('../frontend', filename)
    
    return app

app = create_app()

def allowed_file(filename):
    """检查文件类型是否允许"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def cleanup_on_exit():
    """退出时清理资源"""
    app.logger.info("正在关闭射箭得分统计系统...")
    # 清理临时文件
    import shutil
    if os.path.exists(app.config['UPLOAD_FOLDER']):
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
            except Exception as e:
                app.logger.error(f"清理文件失败: {e}")

# 注册退出处理函数
atexit.register(cleanup_on_exit)

# 信号处理
def signal_handler(signum, frame):
    """处理系统信号"""
    app.logger.info(f"收到信号 {signum}，正在关闭...")
    cleanup_on_exit()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

@app.route('/')
def index():
    """主页面"""
    return render_template('index.html')

@app.route('/api/health')
def health_check():
    """健康检查接口"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'environment': 'production',
        'server_ip': request.remote_addr
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """文件上传接口"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': '没有文件上传'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': '没有选择文件'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # 获取靶纸类型参数
            target_type = request.form.get('target_type', '18m')
            
            try:
                # 处理图像
                processor = ArcheryTargetProcessor()
                result = processor.process_image(filepath, target_type)
                
                if result['success']:
                    # 将结果图像编码为base64
                    _, buffer = cv2.imencode('.jpg', result['result_image'])
                    img_base64 = base64.b64encode(buffer).decode('utf-8')
                    
                    # 计算详细统计
                    scoring = ArcheryScoring()
                    if result['scores']:
                        analysis = scoring.analyze_performance(result['scores'], target_type)
                    else:
                        analysis = {}
                    
                    # 转换NumPy类型为Python原生类型
                    def convert_numpy_types(obj):
                        """递归转换NumPy类型为Python原生类型"""
                        if hasattr(obj, 'item'):  # NumPy标量
                            return obj.item()
                        elif isinstance(obj, list):
                            return [convert_numpy_types(item) for item in obj]
                        elif isinstance(obj, tuple):
                            return tuple(convert_numpy_types(item) for item in obj)
                        elif isinstance(obj, dict):
                            return {key: convert_numpy_types(value) for key, value in obj.items()}
                        else:
                            return obj
                    
                    response_data = {
                        'success': True,
                        'scores': convert_numpy_types(result['scores']),
                        'center': convert_numpy_types(result['center']),
                        'radius': convert_numpy_types(result['radius']),
                        'arrow_positions': convert_numpy_types(result['arrow_positions']),
                        'result_image': img_base64,
                        'target_type': target_type,
                        'analysis': convert_numpy_types(analysis),
                        'server_timestamp': datetime.now().isoformat()
                    }
                    
                    # 记录访问日志
                    app.logger.info(f"用户 {request.remote_addr} 上传文件 {filename}，得分: {result['scores']}")
                    
                    # 清理上传的文件
                    os.remove(filepath)
                    
                    return jsonify(response_data)
                else:
                    # 清理上传的文件
                    os.remove(filepath)
                    app.logger.warning(f"图像处理失败: {result.get('error', '未知错误')}")
                    return jsonify({'error': result.get('error', '图像处理失败')}), 500
                    
            except Exception as e:
                # 清理上传的文件
                if os.path.exists(filepath):
                    os.remove(filepath)
                app.logger.error(f"图像处理错误: {str(e)}")
                return jsonify({'error': f'处理图像时出错: {str(e)}'}), 500
        
        return jsonify({'error': '不支持的文件类型'}), 400
        
    except Exception as e:
        app.logger.error(f"上传接口错误: {str(e)}")
        return jsonify({'error': f'服务器错误: {str(e)}'}), 500

@app.route('/api/calculate_score', methods=['POST'])
def calculate_score():
    """手动计算得分接口"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': '没有提供数据'}), 400
        
        shots = data.get('shots', [])
        target_type = data.get('target_type', '18m')
        
        if not shots:
            return jsonify({'error': '没有提供箭矢数据'}), 400
        
        scoring = ArcheryScoring()
        
        # 计算每箭得分
        scores = []
        for shot in shots:
            distance = shot.get('distance', 0)
            if distance > 0:
                score = scoring.calculate_precision_score(distance, target_type)
                scores.append(score)
            else:
                # 如果有坐标，计算到中心的距离
                x = shot.get('x', 0)
                y = shot.get('y', 0)
                if x != 0 or y != 0:
                    # 这里需要靶纸中心信息，暂时使用默认值
                    scores.append(0)
                else:
                    scores.append(0)
        
        # 计算总分和统计
        total_stats = scoring.calculate_total_score(scores)
        
        # 计算组射得分
        shot_positions = [(shot.get('x', 0), shot.get('y', 0)) for shot in shots]
        group_stats = scoring.calculate_group_score(shot_positions)
        
        # 综合分析
        analysis = scoring.analyze_performance(scores, target_type)
        
        # 记录访问日志
        app.logger.info(f"用户 {request.remote_addr} 手动计算得分，靶纸类型: {target_type}，得分: {scores}")
        
        return jsonify({
            'success': True,
            'individual_scores': scores,
            'total_stats': total_stats,
            'group_stats': group_stats,
            'analysis': analysis,
            'server_timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        app.logger.error(f"得分计算错误: {str(e)}")
        return jsonify({'error': f'计算失败: {str(e)}'}), 500

@app.route('/api/analyze_performance', methods=['POST'])
def analyze_performance():
    """性能分析接口"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': '没有提供数据'}), 400
        
        scores = data.get('scores', [])
        target_type = data.get('target_type', '18m')
        
        if not scores:
            return jsonify({'error': '没有提供得分数据'}), 400
        
        scoring = ArcheryScoring()
        analysis = scoring.analyze_performance(scores, target_type)
        
        return jsonify({
            'success': True,
            'analysis': analysis,
            'server_timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        app.logger.error(f"性能分析错误: {str(e)}")
        return jsonify({'error': f'分析失败: {str(e)}'}), 500

@app.route('/api/export_results', methods=['POST'])
def export_results():
    """导出结果接口"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': '没有提供数据'}), 400
        
        results = data.get('results', {})
        format_type = data.get('format', 'json')
        
        scoring = ArcheryScoring()
        exported_data = scoring.export_results(results, format_type)
        
        return jsonify({
            'success': True,
            'data': exported_data,
            'format': format_type,
            'server_timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        app.logger.error(f"结果导出错误: {str(e)}")
        return jsonify({'error': f'导出失败: {str(e)}'}), 500

@app.route('/api/target_specs')
def get_target_specs():
    """获取靶纸规格接口"""
    return jsonify({
        'success': True,
        'target_specs': app.config['TARGET_SPECS']
    })

@app.route('/api/process_batch', methods=['POST'])
def process_batch():
    """批量处理接口"""
    try:
        if 'files[]' not in request.files:
            return jsonify({'error': '没有文件上传'}), 400
        
        files = request.files.getlist('files[]')
        target_type = request.form.get('target_type', '18m')
        
        if not files:
            return jsonify({'error': '没有选择文件'}), 400
        
        results = []
        processor = ArcheryTargetProcessor()
        
        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                
                try:
                    result = processor.process_image(filepath, target_type)
                    if result['success']:
                        # 编码图像
                        _, buffer = cv2.imencode('.jpg', result['result_image'])
                        img_base64 = base64.b64encode(buffer).decode('utf-8')
                        result['result_image'] = img_base64
                        result['filename'] = filename
                        results.append(result)
                    
                    # 清理文件
                    os.remove(filepath)
                    
                except Exception as e:
                    app.logger.error(f"处理文件 {filename} 时出错: {str(e)}")
                    if os.path.exists(filepath):
                        os.remove(filepath)
                    results.append({
                        'success': False,
                        'filename': filename,
                        'error': str(e)
                    })
        
        # 记录批量处理日志
        app.logger.info(f"用户 {request.remote_addr} 批量处理 {len(files)} 个文件，靶纸类型: {target_type}")
        
        return jsonify({
            'success': True,
            'results': results,
            'total_processed': len(results),
            'server_timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        app.logger.error(f"批量处理错误: {str(e)}")
        return jsonify({'error': f'批量处理失败: {str(e)}'}), 500

@app.route('/api/metrics')
def metrics():
    """系统监控指标接口"""
    try:
        import psutil
        
        # 系统资源使用情况
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # 应用状态
        app_status = {
            'status': 'running',
            'uptime': datetime.now().isoformat(),
            'version': '1.0.0'
        }
        
        # 系统资源
        system_metrics = {
            'cpu_percent': cpu_percent,
            'memory_percent': memory.percent,
            'memory_available': memory.available,
            'disk_percent': disk.percent,
            'disk_free': disk.free
        }
        
        return jsonify({
            'success': True,
            'app_status': app_status,
            'system_metrics': system_metrics,
            'timestamp': datetime.now().isoformat()
        })
        
    except ImportError:
        return jsonify({
            'success': False,
            'error': 'psutil模块未安装，无法获取系统指标'
        }), 500
    except Exception as e:
        app.logger.error(f"获取系统指标失败: {str(e)}")
        return jsonify({'error': f'获取指标失败: {str(e)}'}), 500

@app.errorhandler(404)
def not_found(error):
    """404错误处理"""
    app.logger.warning(f"404错误: {request.url}")
    return jsonify({'error': '接口不存在'}), 404

@app.errorhandler(500)
def internal_error(error):
    """500错误处理"""
    app.logger.error(f"服务器内部错误: {str(error)}")
    return jsonify({'error': '服务器内部错误'}), 500

@app.before_request
def log_request():
    """记录请求日志"""
    app.logger.info(f"请求: {request.method} {request.url} 来自 {request.remote_addr}")

@app.after_request
def log_response(response):
    """记录响应日志"""
    try:
        if hasattr(response, 'get_data'):
            response_size = len(response.get_data())
        else:
            response_size = 0
        app.logger.info(f"响应: {response.status_code} 大小: {response_size} bytes")
    except Exception as e:
        app.logger.warning(f"记录响应日志失败: {e}")
    return response

if __name__ == '__main__':
    app.logger.info(f"启动射箭得分统计系统生产服务器...")
    app.logger.info(f"服务器地址: {ProductionConfig.HOST}:{ProductionConfig.PORT}")
    app.logger.info(f"上传文件夹: {ProductionConfig.UPLOAD_FOLDER}")
    app.logger.info(f"日志文件: {ProductionConfig.LOG_FILE}")
    
    try:
        app.run(
            host=ProductionConfig.HOST,
            port=ProductionConfig.PORT,
            debug=False,
            threaded=True
        )
    except KeyboardInterrupt:
        app.logger.info("收到中断信号，正在关闭服务器...")
    except Exception as e:
        app.logger.error(f"服务器启动失败: {str(e)}")
    finally:
        cleanup_on_exit()
