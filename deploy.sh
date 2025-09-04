#!/bin/bash

# 射箭得分统计系统 - 服务器部署脚本
# 适用于腾讯云轻量应用服务器

echo "🚀 开始部署射箭得分统计系统..."

# 更新系统
echo "📦 更新系统包..."
apt update && apt upgrade -y

# 安装必要软件
echo "🔧 安装必要软件..."
apt install -y python3 python3-pip python3-venv nginx supervisor git curl wget

# 创建项目目录
echo "📁 创建项目目录..."
mkdir -p /root/archery-scoring-system
cd /root/archery-scoring-system

# 复制项目文件
echo "📋 复制项目文件..."
cp -r * /root/archery-scoring-system/

# 创建虚拟环境
echo "🐍 创建Python虚拟环境..."
python3 -m venv venv
source venv/bin/activate

# 安装依赖
echo "📚 安装Python依赖..."
pip install -r backend/requirements.txt

# 创建必要目录
echo "📂 创建必要目录..."
mkdir -p uploads data models logs

# 设置权限
echo "🔐 设置文件权限..."
chmod +x start.sh
chmod +x start_mobile.py

# 配置Nginx
echo "🌐 配置Nginx..."
cp nginx.conf /etc/nginx/sites-available/archery-system
ln -sf /etc/nginx/sites-available/archery-system /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# 测试Nginx配置
nginx -t

# 启动Nginx
systemctl enable nginx
systemctl start nginx

# 配置防火墙
echo "🔥 配置防火墙..."
ufw allow 80
ufw allow 443
ufw allow 5000

# 创建systemd服务
echo "⚙️ 创建系统服务..."
cp archery-system.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable archery-system
systemctl start archery-system

# 检查服务状态
echo "📊 检查服务状态..."
systemctl status archery-system

echo "🎉 部署完成！"
echo "🌐 访问地址: http://49.232.232.27"
echo "📱 手机访问: http://49.232.232.27"
echo ""
echo "📋 常用命令:"
echo "  启动服务: systemctl start archery-system"
echo "  停止服务: systemctl stop archery-system"
echo "  重启服务: systemctl restart archery-system"
echo "  查看状态: systemctl status archery-system"
echo "  查看日志: journalctl -u archery-system -f"
