#!/bin/bash

# Lambert 个人网站部署脚本
# 用于部署到腾讯云轻量应用服务器

set -e  # 遇到错误立即退出

# 配置变量
SERVER_IP="49.232.232.27"
SERVER_USER="root"
DOMAIN="qhdhao.cn"
PROJECT_NAME="lambert-website"
LOCAL_PROJECT_PATH="/Users/mac_qhdhao/github-qhdhao/qhdhao13/qhdhao.cn-web"

echo "🚀 开始部署 Lambert 个人网站到腾讯云服务器..."

# 检查本地文件是否存在
if [ ! -d "$LOCAL_PROJECT_PATH" ]; then
    echo "❌ 错误：本地项目路径不存在: $LOCAL_PROJECT_PATH"
    exit 1
fi

# 创建部署包
echo "📦 创建部署包..."
cd "$LOCAL_PROJECT_PATH"
tar -czf lambert-website.tar.gz \
    --exclude='.git' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.DS_Store' \
    --exclude='uploads' \
    --exclude='lambert-website.tar.gz' \
    .

# 上传到服务器
echo "📤 上传文件到服务器..."
scp lambert-website.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# 在服务器上执行部署
echo "🔧 在服务器上执行部署..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
    set -e
    
    # 创建项目目录
    mkdir -p /opt/lambert-website
    cd /opt/lambert-website
    
    # 解压文件
    tar -xzf /tmp/lambert-website.tar.gz
    
    # 创建必要的目录
    mkdir -p uploads/images uploads/videos ssl
    
    # 安装Docker和Docker Compose（如果未安装）
    if ! command -v docker &> /dev/null; then
        echo "安装Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        systemctl start docker
        systemctl enable docker
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "安装Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    # 停止现有容器
    docker-compose down || true
    
    # 构建并启动新容器
    docker-compose up -d --build
    
    # 等待服务启动
    echo "等待服务启动..."
    sleep 30
    
    # 检查服务状态
    if docker-compose ps | grep -q "Up"; then
        echo "✅ 服务启动成功！"
    else
        echo "❌ 服务启动失败！"
        docker-compose logs
        exit 1
    fi
    
    # 清理临时文件
    rm -f /tmp/lambert-website.tar.gz
EOF

# 清理本地临时文件
rm -f lambert-website.tar.gz

echo "🎉 部署完成！"
echo "🌐 网站地址: https://$DOMAIN"
echo "📊 服务器状态: https://$DOMAIN/api/stats"
echo ""
echo "📝 后续步骤："
echo "1. 配置SSL证书（如果还没有）"
echo "2. 设置域名解析"
echo "3. 测试网站功能"
echo ""
echo "🔧 管理命令："
echo "ssh $SERVER_USER@$SERVER_IP 'cd /opt/lambert-website && docker-compose logs -f'  # 查看日志"
echo "ssh $SERVER_USER@$SERVER_IP 'cd /opt/lambert-website && docker-compose restart'  # 重启服务"
