#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
射箭靶纸得分统计系统 - 服务器部署脚本
适用于腾讯云轻量应用服务器
"""

import os
import sys
import subprocess
import platform
import json
from pathlib import Path

class ServerDeployer:
    def __init__(self):
        self.server_ip = "49.232.232.27"
        self.server_port = 5000
        self.project_name = "archery-scoring-system"
        
    def create_dockerfile(self):
        """创建Dockerfile"""
        dockerfile_content = """# 射箭得分统计系统 Docker镜像
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \\
    libgl1-mesa-glx \\
    libglib2.0-0 \\
    libsm6 \\
    libxext6 \\
    libxrender-dev \\
    libgomp1 \\
    libgthread-2.0-0 \\
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY backend/requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY backend/ .
COPY frontend/ ./frontend/

# 创建必要的目录
RUN mkdir -p uploads data models

# 设置环境变量
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV HOST=0.0.0.0
ENV PORT=5000

# 暴露端口
EXPOSE 5000

# 启动命令
CMD ["python", "app.py"]
"""
        
        with open("Dockerfile", "w", encoding="utf-8") as f:
            f.write(dockerfile_content)
        print("✅ 创建Dockerfile完成")
    
    def create_docker_compose(self):
        """创建docker-compose.yml"""
        compose_content = f"""version: '3.8'

services:
  archery-system:
    build: .
    container_name: {self.project_name}
    restart: unless-stopped
    ports:
      - "{self.server_port}:5000"
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
      - ./models:/app/models
    environment:
      - FLASK_ENV=production
      - HOST=0.0.0.0
      - PORT=5000
    networks:
      - archery-network

networks:
  archery-network:
    driver: bridge
"""
        
        with open("docker-compose.yml", "w", encoding="utf-8") as f:
            f.write(compose_content)
        print("✅ 创建docker-compose.yml完成")
    
    def create_nginx_config(self):
        """创建Nginx配置文件"""
        nginx_config = f"""server {{
    listen 80;
    server_name {self.server_ip};
    
    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}}

server {{
    listen 443 ssl http2;
    server_name {self.server_ip};
    
    # SSL证书配置（需要先申请证书）
    ssl_certificate /etc/ssl/certs/archery.crt;
    ssl_certificate_key /etc/ssl/private/archery.key;
    
    # SSL配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # 代理到Flask应用
    location / {{
        proxy_pass http://localhost:{self.server_port};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 上传文件大小限制
        client_max_body_size 16M;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }}
    
    # 静态文件缓存
    location ~* \\.(css|js|png|jpg|jpeg|gif|ico|svg)$ {{
        expires 1y;
        add_header Cache-Control "public, immutable";
    }}
}}
"""
        
        with open("nginx.conf", "w", encoding="utf-8") as f:
            f.write(nginx_config)
        print("✅ 创建Nginx配置文件完成")
    
    def create_systemd_service(self):
        """创建systemd服务文件"""
        service_content = f"""[Unit]
Description=Archery Scoring System
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/{self.project_name}
ExecStart=/usr/bin/python3 app.py
Restart=always
RestartSec=10
Environment=FLASK_ENV=production
Environment=HOST=0.0.0.0
Environment=PORT={self.server_port}

[Install]
WantedBy=multi-user.target
"""
        
        with open("archery-system.service", "w", encoding="utf-8") as f:
            f.write(service_content)
        print("✅ 创建systemd服务文件完成")
    
    def create_deploy_script(self):
        """创建部署脚本"""
        deploy_script = f"""#!/bin/bash

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
mkdir -p /root/{self.project_name}
cd /root/{self.project_name}

# 复制项目文件
echo "📋 复制项目文件..."
cp -r * /root/{self.project_name}/

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
ufw allow {self.server_port}

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
echo "🌐 访问地址: http://{self.server_ip}"
echo "📱 手机访问: http://{self.server_ip}"
echo ""
echo "📋 常用命令:"
echo "  启动服务: systemctl start archery-system"
echo "  停止服务: systemctl stop archery-system"
echo "  重启服务: systemctl restart archery-system"
echo "  查看状态: systemctl status archery-system"
echo "  查看日志: journalctl -u archery-system -f"
"""
        
        with open("deploy.sh", "w", encoding="utf-8") as f:
            f.write(deploy_script)
        
        # 设置执行权限
        os.chmod("deploy.sh", 0o755)
        print("✅ 创建部署脚本完成")
    
    def create_ssl_script(self):
        """创建SSL证书申请脚本"""
        ssl_script = """#!/bin/bash

# SSL证书申请脚本（使用Let's Encrypt）

echo "🔐 申请SSL证书..."

# 安装certbot
apt install -y certbot python3-certbot-nginx

# 申请证书（需要先配置域名）
echo "请确保已经配置域名解析到服务器IP"
echo "然后运行以下命令申请证书："
echo ""
echo "certbot --nginx -d your-domain.com"
echo ""
echo "或者使用standalone模式："
echo "certbot certonly --standalone -d your-domain.com"
echo ""
echo "证书申请成功后，需要更新nginx.conf中的证书路径"
"""
        
        with open("ssl_setup.sh", "w", encoding="utf-8") as f:
            f.write(ssl_script)
        
        os.chmod("ssl_setup.sh", 0o755)
        print("✅ 创建SSL证书脚本完成")
    
    def create_monitoring_script(self):
        """创建监控脚本"""
        monitoring_script = """#!/bin/bash

# 系统监控脚本

echo "📊 系统状态监控"
echo "=================="

# 检查服务状态
echo "🔍 检查服务状态..."
systemctl status archery-system --no-pager

# 检查端口监听
echo ""
echo "🌐 检查端口监听..."
netstat -tlnp | grep :5000

# 检查磁盘使用
echo ""
echo "💾 检查磁盘使用..."
df -h

# 检查内存使用
echo ""
echo "🧠 检查内存使用..."
free -h

# 检查日志
echo ""
echo "📝 最近日志..."
journalctl -u archery-system --no-pager -n 20
"""
        
        with open("monitor.sh", "w", encoding="utf-8") as f:
            f.write(monitoring_script)
        
        os.chmod("monitor.sh", 0o755)
        print("✅ 创建监控脚本完成")
    
    def create_backup_script(self):
        """创建备份脚本"""
        backup_script = """#!/bin/bash

# 数据备份脚本

BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="archery_backup_$DATE.tar.gz"

echo "💾 开始备份数据..."

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据
tar -czf $BACKUP_DIR/$BACKUP_NAME data/ uploads/ models/ logs/

# 删除7天前的备份
find $BACKUP_DIR -name "archery_backup_*.tar.gz" -mtime +7 -delete

echo "✅ 备份完成: $BACKUP_DIR/$BACKUP_NAME"
echo "📊 备份大小: $(du -h $BACKUP_DIR/$BACKUP_NAME | cut -f1)"
"""
        
        with open("backup.sh", "w", encoding="utf-8") as f:
            f.write(backup_script)
        
        os.chmod("backup.sh", 0o755)
        print("✅ 创建备份脚本完成")
    
    def create_readme(self):
        """创建服务器部署说明文档"""
        readme_content = f"""# 🚀 服务器部署说明

## 服务器信息
- **IP地址**: {self.server_ip}
- **端口**: {self.server_port}
- **项目名称**: {self.project_name}

## 部署步骤

### 1. 上传文件到服务器
```bash
# 在本地打包项目
tar -czf archery-system.tar.gz Archery\ Target\ Ring\ Scoring\ System/

# 上传到服务器
scp archery-system.tar.gz root@{self.server_ip}:/root/

# 登录服务器
ssh root@{self.server_ip}
```

### 2. 在服务器上部署
```bash
# 解压项目
cd /root
tar -xzf archery-system.tar.gz
cd {self.project_name}

# 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 3. 配置SSL证书（可选）
```bash
# 申请Let's Encrypt证书
./ssl_setup.sh

# 更新nginx配置
nano nginx.conf
systemctl reload nginx
```

## 访问地址

- **HTTP**: http://{self.server_ip}
- **HTTPS**: https://{self.server_ip} (配置SSL后)

## 管理命令

### 服务管理
```bash
# 启动服务
systemctl start archery-system

# 停止服务
systemctl stop archery-system

# 重启服务
systemctl restart archery-system

# 查看状态
systemctl status archery-system

# 查看日志
journalctl -u archery-system -f
```

### 系统监控
```bash
# 运行监控脚本
./monitor.sh

# 检查端口
netstat -tlnp | grep :5000

# 检查进程
ps aux | grep python
```

### 数据备份
```bash
# 运行备份脚本
./backup.sh

# 手动备份
tar -czf backup.tar.gz data/ uploads/ models/
```

## 故障排除

### 服务无法启动
```bash
# 检查日志
journalctl -u archery-system -f

# 检查端口占用
netstat -tlnp | grep :5000

# 检查依赖
pip list | grep -E "(flask|opencv|numpy)"
```

### 无法访问
```bash
# 检查防火墙
ufw status

# 检查Nginx
systemctl status nginx
nginx -t

# 检查服务状态
systemctl status archery-system
```

## 安全建议

1. **更改默认端口**: 修改配置文件中的端口号
2. **配置防火墙**: 只开放必要端口
3. **定期更新**: 保持系统和依赖包最新
4. **数据备份**: 定期备份重要数据
5. **监控日志**: 关注异常访问记录

## 性能优化

1. **启用Gunicorn**: 使用WSGI服务器提升性能
2. **配置Redis**: 添加缓存支持
3. **CDN加速**: 静态资源使用CDN
4. **数据库优化**: 如需要可添加数据库支持

## 联系支持

如遇到问题，请检查：
1. 服务状态和日志
2. 网络和防火墙配置
3. 依赖包安装情况
4. 系统资源使用情况
"""
        
        with open("SERVER_README.md", "w", encoding="utf-8") as f:
            f.write(readme_content)
        print("✅ 创建服务器说明文档完成")
    
    def deploy(self):
        """执行部署"""
        print("🚀 开始创建服务器部署文件...")
        
        # 创建所有必要的文件
        self.create_dockerfile()
        self.create_docker_compose()
        self.create_nginx_config()
        self.create_systemd_service()
        self.create_deploy_script()
        self.create_ssl_script()
        self.create_monitoring_script()
        self.create_backup_script()
        self.create_readme()
        
        print("\n🎉 所有部署文件创建完成！")
        print(f"🌐 服务器IP: {self.server_ip}")
        print(f"📱 手机访问地址: http://{self.server_ip}")
        print("\n📋 下一步操作:")
        print("1. 将项目文件上传到服务器")
        print("2. 在服务器上运行 deploy.sh")
        print("3. 配置域名和SSL证书（可选）")
        print("4. 开始使用系统")

def main():
    """主函数"""
    print("🎯 射箭靶纸得分统计系统 - 服务器部署工具")
    print("=" * 60)
    
    deployer = ServerDeployer()
    deployer.deploy()

if __name__ == '__main__':
    main()
