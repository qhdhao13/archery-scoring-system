#!/bin/bash

# Lambert 个人网站部署脚本 - OpenCloudOS DNF版本
# 适配腾讯云轻量应用服务器的OpenCloudOS系统

set -e

# 配置变量
SERVER_IP="49.232.232.27"
SERVER_USER="root"
DOMAIN="qhdhao.cn"
LOCAL_PROJECT_PATH="/Users/mac_qhdhao/github-qhdhao/qhdhao13/qhdhao.cn-web"
REMOTE_PATH="/opt/lambert-website"

echo "🚀 开始部署 Lambert 个人网站到腾讯云服务器 (OpenCloudOS DNF)..."

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
    
    # 检查系统版本
    echo "系统信息："
    cat /etc/os-release
    
    # 安装Docker (OpenCloudOS DNF版本)
    if ! command -v docker &> /dev/null; then
        echo "安装Docker..."
        # 更新包管理器
        dnf update -y
        
        # 安装Docker
        dnf install -y dnf-utils
        dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
        dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        
        # 启动Docker服务
        systemctl start docker
        systemctl enable docker
        
        echo "Docker安装完成"
    fi
    
    # 检查Docker Compose是否安装
    if ! command -v docker-compose &> /dev/null; then
        echo "安装Docker Compose..."
        # 下载Docker Compose
        curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        
        # 创建软链接
        ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
        
        echo "Docker Compose安装完成"
    fi
    
    # 检查Docker服务状态
    systemctl status docker
    
    # 停止现有容器
    docker-compose down || true
    
    # 构建并启动新容器
    echo "构建Docker镜像..."
    docker-compose build --no-cache
    
    echo "启动服务..."
    docker-compose up -d
    
    # 等待服务启动
    echo "等待服务启动..."
    sleep 30
    
    # 检查服务状态
    echo "检查服务状态..."
    docker-compose ps
    
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
echo "2. 设置SSL证书: ./ssl_setup.sh"
echo "3. 测试网站功能"
echo ""
echo "🔧 管理命令："
echo "ssh $SERVER_USER@$SERVER_IP 'cd $REMOTE_PATH && docker-compose logs -f'  # 查看日志"
echo "ssh $SERVER_USER@$SERVER_IP 'cd $REMOTE_PATH && docker-compose restart'  # 重启服务"
