#!/bin/bash

# Lambert 个人网站部署脚本 - Python直接运行版本
# 不使用Docker，直接在服务器上运行Python应用

set -e

# 配置变量
SERVER_IP="49.232.232.27"
SERVER_USER="root"
DOMAIN="qhdhao.cn"
LOCAL_PROJECT_PATH="/Users/mac_qhdhao/github-qhdhao/qhdhao13/qhdhao.cn-web"
REMOTE_PATH="/opt/lambert-website"

echo "🚀 开始部署 Lambert 个人网站到腾讯云服务器 (Python直接运行)..."

# 检查本地文件是否存在
if [ ! -d "$LOCAL_PROJECT_PATH" ]; then
    echo "❌ 错误：本地项目路径不存在: $LOCAL_PROJECT_PATH"
    exit 1
fi

# 同步文件到服务器
echo "📤 同步文件到服务器..."
rsync -avz --delete \
    --exclude='.git' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.DS_Store' \
    --exclude='uploads' \
    --exclude='lambert.db' \
    "$LOCAL_PROJECT_PATH/" $SERVER_USER@$SERVER_IP:$REMOTE_PATH/

# 在服务器上执行部署
echo "🔧 在服务器上执行部署..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
    set -e
    
    cd /opt/lambert-website
    
    # 创建必要的目录
    mkdir -p uploads/images uploads/videos ssl
    
    # 检查Python版本
    echo "Python版本："
    python3 --version
    
    # 安装Python依赖
    echo "安装Python依赖..."
        pip3 install Flask==2.3.3 Flask-CORS==4.0.0 Pillow==10.0.1 Werkzeug==2.3.7 gunicorn==21.2.0
    
    # 停止现有服务
    pkill -f "python.*app.py" || true
    pkill -f "gunicorn.*app:app" || true
    
    # 启动服务
    echo "启动服务..."
    nohup gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 app:app > app.log 2>&1 &
    
    # 等待服务启动
    echo "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    echo "检查服务状态..."
    ps aux | grep gunicorn | grep -v grep
    
    # 检查端口是否监听
    netstat -tlnp | grep :5000 || echo "端口5000未监听"
    
    # 测试服务
    curl -f http://localhost:5000/api/stats || echo "API测试失败"
    
    echo "✅ 部署完成！"
EOF

echo "🎉 部署完成！"
echo "🌐 网站地址: http://$SERVER_IP:5000"
echo "📊 服务器状态: http://$SERVER_IP:5000/api/stats"
echo ""
echo "📝 后续步骤："
echo "1. 配置域名解析指向 $SERVER_IP"
echo "2. 设置Nginx反向代理"
echo "3. 设置SSL证书"
echo "4. 测试网站功能"
echo ""
echo "🔧 管理命令："
echo "ssh $SERVER_USER@$SERVER_IP 'cd $REMOTE_PATH && tail -f app.log'  # 查看日志"
echo "ssh $SERVER_USER@$SERVER_IP 'cd $REMOTE_PATH && pkill -f gunicorn && nohup gunicorn --bind 0.0.0.0:5000 --workers 4 app:app > app.log 2>&1 &'  # 重启服务"
