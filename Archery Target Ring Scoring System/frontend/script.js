/**
 * 射箭靶纸得分统计系统 - 前端逻辑
 */
class ArcheryScoringApp {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.shots = [];
        this.currentFile = null;
        this.batchFiles = [];
        this.apiBaseUrl = ''; // 相对路径，使用当前域名
    }

    /**
     * 初始化DOM元素
     */
    initializeElements() {
        // 上传相关元素
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.targetType = document.getElementById('targetType');
        
        // 结果相关元素
        this.resultSection = document.getElementById('resultSection');
        this.totalScoreDisplay = document.getElementById('totalScoreDisplay');
        this.avgScoreDisplay = document.getElementById('avgScoreDisplay');
        this.arrowCountDisplay = document.getElementById('arrowCountDisplay');
        this.gradeDisplay = document.getElementById('gradeDisplay');
        this.detailedScores = document.getElementById('detailedScores');
        this.resultImage = document.getElementById('resultImage');
        this.analysisSection = document.getElementById('analysisSection');
        this.analysisContent = document.getElementById('analysisContent');
        
        // 手动得分相关元素
        this.manualTargetType = document.getElementById('manualTargetType');
        this.shotsList = document.getElementById('shotsList');
        this.addShotBtn = document.getElementById('addShotBtn');
        this.calculateBtn = document.getElementById('calculateBtn');
        
        // 批量处理相关元素
        this.batchTargetType = document.getElementById('batchTargetType');
        this.batchUploadArea = document.getElementById('batchUploadArea');
        this.batchFileInput = document.getElementById('batchFileInput');
        this.batchProcessBtn = document.getElementById('batchProcessBtn');
        this.batchResults = document.getElementById('batchResults');
        this.batchResultsContent = document.getElementById('batchResultsContent');
        
        // 通用元素
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.loadingText = document.getElementById('loadingText');
        this.notification = document.getElementById('notification');
        this.notificationText = document.getElementById('notificationText');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 文件上传事件
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.uploadBtn.addEventListener('click', () => this.uploadFile());
        
        // 手动得分事件
        this.addShotBtn.addEventListener('click', () => this.addShot());
        this.calculateBtn.addEventListener('click', () => this.calculateScores());
        
        // 批量处理事件
        this.batchUploadArea.addEventListener('click', () => this.batchFileInput.click());
        this.batchFileInput.addEventListener('change', (e) => this.handleBatchFileSelect(e));
        this.batchProcessBtn.addEventListener('click', () => this.processBatch());
        
        // 通知关闭事件
        document.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification();
        });
        
        // 页面加载完成后的初始化
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeApp();
        });
    }

    /**
     * 应用初始化
     */
    async initializeApp() {
        try {
            // 检查服务器健康状态
            const response = await fetch('/api/health');
            if (response.ok) {
                console.log('服务器连接正常');
            } else {
                this.showNotification('服务器连接异常', 'error');
            }
        } catch (error) {
            console.warn('无法连接到服务器:', error);
        }
        
        // 添加第一支箭
        this.addShot();
    }

    /**
     * 处理单文件选择
     */
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.currentFile = file;
            this.uploadBtn.disabled = false;
            
            // 预览图片
            const reader = new FileReader();
            reader.onload = (e) => {
                this.uploadArea.innerHTML = `
                    <img src="${e.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 8px;">
                    <p style="margin-top: 10px; color: #666;">已选择: ${file.name}</p>
                    <button class="btn btn-secondary" onclick="app.resetUploadArea()">
                        <i class="fas fa-undo"></i> 重新选择
                    </button>
                `;
            };
            reader.readAsDataURL(file);
        }
    }

    /**
     * 处理批量文件选择
     */
    handleBatchFileSelect(event) {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            this.batchFiles = files;
            this.batchProcessBtn.disabled = false;
            
            // 显示选择的文件
            this.batchUploadArea.innerHTML = `
                <div style="text-align: left;">
                    <h4>已选择 ${files.length} 个文件:</h4>
                    ${files.map(file => `<p>• ${file.name}</p>`).join('')}
                    <button class="btn btn-secondary" onclick="app.resetBatchUploadArea()">
                        <i class="fas fa-undo"></i> 重新选择
                    </button>
                </div>
            `;
        }
    }

    /**
     * 重置上传区域
     */
    resetUploadArea() {
        this.currentFile = null;
        this.uploadBtn.disabled = true;
        this.uploadArea.innerHTML = `
            <input type="file" id="fileInput" accept="image/*" capture="camera">
            <div class="upload-content">
                <div class="camera-icon"><i class="fas fa-camera"></i></div>
                <p>点击拍照或选择照片</p>
                <p class="upload-hint">支持 JPG、PNG 格式，最大16MB</p>
            </div>
        `;
        // 重新绑定事件
        this.fileInput = document.getElementById('fileInput');
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    /**
     * 重置批量上传区域
     */
    resetBatchUploadArea() {
        this.batchFiles = [];
        this.batchProcessBtn.disabled = true;
        this.batchUploadArea.innerHTML = `
            <input type="file" id="batchFileInput" multiple accept="image/*">
            <div class="upload-content">
                <div class="camera-icon"><i class="fas fa-images"></i></div>
                <p>选择多个照片进行批量处理</p>
                <p class="upload-hint">支持同时选择多张照片</p>
            </div>
        `;
        // 重新绑定事件
        this.batchFileInput = document.getElementById('batchFileInput');
        this.batchFileInput.addEventListener('change', (e) => this.handleBatchFileSelect(e));
    }

    /**
     * 上传文件并分析
     */
    async uploadFile() {
        if (!this.currentFile) return;

        const formData = new FormData();
        formData.append('file', this.currentFile);
        formData.append('target_type', this.targetType.value);

        try {
            this.showLoading('正在分析图像...');
            this.uploadBtn.disabled = true;

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.displayResult(result);
                this.showNotification('图像分析完成！', 'success');
            } else {
                this.showNotification('分析失败: ' + result.error, 'error');
            }
        } catch (error) {
            this.showNotification('上传失败: ' + error.message, 'error');
        } finally {
            this.hideLoading();
            this.uploadBtn.disabled = false;
        }
    }

    /**
     * 显示分析结果
     */
    displayResult(result) {
        // 显示基本统计
        const totalScore = result.scores.reduce((sum, score) => sum + score, 0);
        const avgScore = result.scores.length > 0 ? (totalScore / result.scores.length).toFixed(1) : 0;
        
        this.totalScoreDisplay.textContent = totalScore;
        this.avgScoreDisplay.textContent = avgScore;
        this.arrowCountDisplay.textContent = result.scores.length;
        
        // 显示表现评级
        if (result.analysis && result.analysis.performance_grade) {
            this.gradeDisplay.textContent = result.analysis.performance_grade;
        } else {
            this.gradeDisplay.textContent = '-';
        }
        
        // 显示详细得分
        this.displayDetailedScores(result.scores);
        
        // 显示结果图像
        if (result.result_image) {
            this.resultImage.src = 'data:image/jpeg;base64,' + result.result_image;
        }
        
        // 显示性能分析
        if (result.analysis) {
            this.displayAnalysis(result.analysis);
        }
        
        // 显示结果区域
        this.resultSection.style.display = 'block';
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * 显示详细得分
     */
    displayDetailedScores(scores) {
        this.detailedScores.innerHTML = '';
        
        scores.forEach((score, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';
            
            // 根据得分设置样式类
            if (score >= 8) {
                scoreItem.classList.add('high-score');
            } else if (score >= 6) {
                scoreItem.classList.add('medium-score');
            } else {
                scoreItem.classList.add('low-score');
            }
            
            scoreItem.textContent = `第${index + 1}箭: ${score}环`;
            this.detailedScores.appendChild(scoreItem);
        });
    }

    /**
     * 显示性能分析
     */
    displayAnalysis(analysis) {
        this.analysisContent.innerHTML = '';
        
        // 基础统计
        if (analysis.basic_stats) {
            const basicStats = document.createElement('div');
            basicStats.className = 'analysis-item';
            basicStats.innerHTML = `
                <h4>基础统计</h4>
                <p>最高分: ${analysis.basic_stats.max_score}</p>
                <p>最低分: ${analysis.basic_stats.min_score}</p>
                <p>标准差: ${analysis.basic_stats.std_deviation}</p>
            `;
            this.analysisContent.appendChild(basicStats);
        }
        
        // 一致性分析
        if (analysis.consistency) {
            const consistency = document.createElement('div');
            consistency.className = 'analysis-item';
            consistency.innerHTML = `
                <h4>一致性分析</h4>
                <p>一致性评分: ${analysis.consistency.consistency_score}</p>
                <p>趋势: ${this.getTrendText(analysis.consistency.trend)}</p>
            `;
            this.analysisContent.appendChild(consistency);
        }
        
        // 改进建议
        if (analysis.recommendations && analysis.recommendations.length > 0) {
            const recommendations = document.createElement('div');
            recommendations.className = 'analysis-item';
            recommendations.innerHTML = `
                <h4>改进建议</h4>
                ${analysis.recommendations.map(rec => `<p>• ${rec}</p>`).join('')}
            `;
            this.analysisContent.appendChild(recommendations);
        }
        
        this.analysisSection.style.display = 'block';
    }

    /**
     * 获取趋势文本
     */
    getTrendText(trend) {
        const trendMap = {
            'improving': '上升趋势',
            'declining': '下降趋势',
            'stable': '稳定'
        };
        return trendMap[trend] || trend;
    }

    /**
     * 添加箭矢
     */
    addShot() {
        const shotId = Date.now();
        const shotItem = document.createElement('div');
        shotItem.className = 'shot-item';
        shotItem.innerHTML = `
            <input type="number" step="0.1" placeholder="X坐标" class="shot-x" data-id="${shotId}">
            <input type="number" step="0.1" placeholder="Y坐标" class="shot-y" data-id="${shotId}">
            <input type="number" step="0.1" placeholder="距离(cm)" class="shot-distance" data-id="${shotId}">
            <button class="remove-shot" onclick="app.removeShot(${shotId})">×</button>
        `;
        
        this.shotsList.appendChild(shotItem);
        this.shots.push({ id: shotId, x: 0, y: 0, distance: 0 });
    }

    /**
     * 移除箭矢
     */
    removeShot(shotId) {
        this.shots = this.shots.filter(shot => shot.id !== shotId);
        const shotElement = document.querySelector(`[data-id="${shotId}"]`).parentElement;
        shotElement.remove();
    }

    /**
     * 计算手动得分
     */
    async calculateScores() {
        // 收集所有箭矢数据
        const shotInputs = this.shotsList.querySelectorAll('.shot-item');
        const shotsData = [];

        shotInputs.forEach(shotItem => {
            const x = parseFloat(shotItem.querySelector('.shot-x').value) || 0;
            const y = parseFloat(shotItem.querySelector('.shot-y').value) || 0;
            const distance = parseFloat(shotItem.querySelector('.shot-distance').value) || 0;
            
            if (x !== 0 || y !== 0 || distance !== 0) {
                shotsData.push({
                    x: x,
                    y: y,
                    distance: distance,
                    target_diameter: this.getTargetDiameter(this.manualTargetType.value)
                });
            }
        });

        if (shotsData.length === 0) {
            this.showNotification('请至少添加一支箭的数据', 'warning');
            return;
        }

        try {
            this.showLoading('正在计算得分...');
            this.calculateBtn.disabled = true;

            const response = await fetch('/api/calculate_score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    shots: shotsData,
                    target_type: this.manualTargetType.value
                })
            });

            const result = await response.json();

            if (result.success) {
                this.displayManualResults(result);
                this.showNotification('得分计算完成！', 'success');
            } else {
                this.showNotification('计算失败: ' + result.error, 'error');
            }
        } catch (error) {
            this.showNotification('计算失败: ' + error.message, 'error');
        } finally {
            this.hideLoading();
            this.calculateBtn.disabled = false;
        }
    }

    /**
     * 显示手动计算结果
     */
    displayManualResults(result) {
        const totalStats = result.total_stats;
        const groupStats = result.group_stats;
        const analysis = result.analysis;
        
        // 创建结果展示
        let resultHtml = `
            <div class="result-grid">
                <div class="result-card">
                    <h3>总得分</h3>
                    <div class="score-display">${totalStats.total_score}</div>
                </div>
                <div class="result-card">
                    <h3>平均分</h3>
                    <div class="score-display">${totalStats.average_score}</div>
                </div>
                <div class="result-card">
                    <h3>箭矢数量</h3>
                    <div class="score-display">${totalStats.shot_count}</div>
                </div>
                <div class="result-card">
                    <h3>表现评级</h3>
                    <div class="score-display">${analysis.performance_grade || 'N/A'}</div>
                </div>
            </div>
        `;
        
        // 添加组射信息
        if (groupStats.group_size > 0) {
            resultHtml += `
                <div class="analysis-item">
                    <h4>组射分析</h4>
                    <p>组射大小: ${groupStats.group_size}cm</p>
                    <p>组射得分: ${groupStats.group_score}</p>
                </div>
            `;
        }
        
        // 显示结果
        this.resultSection.innerHTML = `
            <h2><i class="fas fa-chart-bar"></i> 手动计算结果</h2>
            ${resultHtml}
        `;
        this.resultSection.style.display = 'block';
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * 批量处理
     */
    async processBatch() {
        if (this.batchFiles.length === 0) return;

        const formData = new FormData();
        this.batchFiles.forEach(file => {
            formData.append('files[]', file);
        });
        formData.append('target_type', this.batchTargetType.value);

        try {
            this.showLoading(`正在处理 ${this.batchFiles.length} 个文件...`);
            this.batchProcessBtn.disabled = true;

            const response = await fetch('/api/process_batch', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.displayBatchResults(result);
                this.showNotification(`批量处理完成！共处理 ${result.total_processed} 个文件`, 'success');
            } else {
                this.showNotification('批量处理失败: ' + result.error, 'error');
            }
        } catch (error) {
            this.showNotification('批量处理失败: ' + error.message, 'error');
        } finally {
            this.hideLoading();
            this.batchProcessBtn.disabled = false;
        }
    }

    /**
     * 显示批量处理结果
     */
    displayBatchResults(result) {
        this.batchResultsContent.innerHTML = '';
        
        result.results.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = `batch-result-item ${item.success ? 'success' : 'error'}`;
            
            if (item.success) {
                const totalScore = item.scores.reduce((sum, score) => sum + score, 0);
                resultItem.innerHTML = `
                    <h4>${item.filename}</h4>
                    <p>得分: ${item.scores.join(', ')}</p>
                    <p>总分: ${totalScore}</p>
                    <p>箭矢数量: ${item.scores.length}</p>
                `;
            } else {
                resultItem.innerHTML = `
                    <h4>${item.filename}</h4>
                    <p class="error">处理失败: ${item.error}</p>
                `;
            }
            
            this.batchResultsContent.appendChild(resultItem);
        });
        
        this.batchResults.style.display = 'block';
    }

    /**
     * 获取靶纸直径
     */
    getTargetDiameter(targetType) {
        const diameters = {
            '18m': 40,
            '30m': 80,
            '50m': 80,
            '70m': 122
        };
        return diameters[targetType] || 40;
    }

    /**
     * 显示加载提示
     */
    showLoading(text = '正在处理中...') {
        this.loadingText.textContent = text;
        this.loadingOverlay.style.display = 'flex';
    }

    /**
     * 隐藏加载提示
     */
    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        this.notificationText.textContent = message;
        this.notification.className = `notification ${type}`;
        this.notification.style.display = 'flex';
        
        // 自动隐藏
        setTimeout(() => {
            this.hideNotification();
        }, 5000);
    }

    /**
     * 隐藏通知
     */
    hideNotification() {
        this.notification.style.display = 'none';
    }
}

// 初始化应用
const app = new ArcheryScoringApp();

// 全局错误处理
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
    app.showNotification('发生未知错误，请刷新页面重试', 'error');
});

// 未处理的Promise拒绝
window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
    app.showNotification('网络请求失败，请检查网络连接', 'error');
});
