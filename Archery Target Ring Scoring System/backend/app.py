from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from image_processor import ArcheryTargetProcessor
from scoring import ArcheryScoring
from config import Config
import cv2
import base64
import logging
from datetime import datetime
import json

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, 
            template_folder='../frontend',
            static_folder='../frontend')
CORS(app)

# 加载配置
config = Config()
app.config.from_object(config)

# 确保上传文件夹存在
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    """检查文件类型是否允许"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

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
        'version': '1.0.0'
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
                    
                    response_data = {
                        'success': True,
                        'scores': result['scores'],
                        'center': result['center'],
                        'radius': result['radius'],
                        'arrow_positions': result['arrow_positions'],
                        'result_image': img_base64,
                        'target_type': target_type,
                        'analysis': analysis
                    }
                    
                    # 清理上传的文件
                    os.remove(filepath)
                    
                    return jsonify(response_data)
                else:
                    # 清理上传的文件
                    os.remove(filepath)
                    return jsonify({'error': result.get('error', '图像处理失败')}), 500
                    
            except Exception as e:
                # 清理上传的文件
                if os.path.exists(filepath):
                    os.remove(filepath)
                logger.error(f"图像处理错误: {str(e)}")
                return jsonify({'error': f'处理图像时出错: {str(e)}'}), 500
        
        return jsonify({'error': '不支持的文件类型'}), 400
        
    except Exception as e:
        logger.error(f"上传接口错误: {str(e)}")
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
        
        return jsonify({
            'success': True,
            'individual_scores': scores,
            'total_stats': total_stats,
            'group_stats': group_stats,
            'analysis': analysis
        })
        
    except Exception as e:
        logger.error(f"得分计算错误: {str(e)}")
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
            'analysis': analysis
        })
        
    except Exception as e:
        logger.error(f"性能分析错误: {str(e)}")
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
            'format': format_type
        })
        
    except Exception as e:
        logger.error(f"结果导出错误: {str(e)}")
        return jsonify({'error': f'导出失败: {str(e)}'}), 500

@app.route('/api/target_specs')
def get_target_specs():
    """获取靶纸规格接口"""
    return jsonify({
        'success': True,
        'target_specs': config.TARGET_SPECS
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
                    logger.error(f"处理文件 {filename} 时出错: {str(e)}")
                    if os.path.exists(filepath):
                        os.remove(filepath)
                    results.append({
                        'success': False,
                        'filename': filename,
                        'error': str(e)
                    })
        
        return jsonify({
            'success': True,
            'results': results,
            'total_processed': len(results)
        })
        
    except Exception as e:
        logger.error(f"批量处理错误: {str(e)}")
        return jsonify({'error': f'批量处理失败: {str(e)}'}), 500

@app.errorhandler(404)
def not_found(error):
    """404错误处理"""
    return jsonify({'error': '接口不存在'}), 404

@app.errorhandler(500)
def internal_error(error):
    """500错误处理"""
    logger.error(f"服务器内部错误: {str(error)}")
    return jsonify({'error': '服务器内部错误'}), 500

if __name__ == '__main__':
    logger.info(f"启动射箭得分统计系统服务器...")
    logger.info(f"服务器地址: http://{config.HOST}:{config.PORT}")
    logger.info(f"上传文件夹: {config.UPLOAD_FOLDER}")
    
    app.run(
        debug=config.DEBUG, 
        host=config.HOST, 
        port=config.PORT
    )
