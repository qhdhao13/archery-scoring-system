#!/bin/bash

# SSL证书设置脚本
# 使用Let's Encrypt免费SSL证书

set -e

DOMAIN="qhdhao.cn"
EMAIL="admin@qhdhao.cn"  # 请替换为你的邮箱
SERVER_IP="49.232.232.27"

echo "🔐 开始设置SSL证书..."

# 在服务器上执行SSL证书设置
ssh root@$SERVER_IP << EOF
    set -e
    
    # 安装certbot
    if ! command -v certbot &> /dev/null; then
        echo "安装certbot..."
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    fi
    
    # 停止nginx容器
    cd /opt/lambert-website
    docker-compose stop nginx
    
    # 临时启动nginx进行证书验证
    nginx -t || true
    
    # 获取SSL证书
    echo "获取SSL证书..."
    certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive
    
    # 复制证书到项目目录
    mkdir -p ssl
    cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/qhdhao.cn.crt
    cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/qhdhao.cn.key
    
    # 设置证书权限
    chmod 600 ssl/qhdhao.cn.key
    chmod 644 ssl/qhdhao.cn.crt
    
    # 重启服务
    docker-compose up -d
    
    # 设置自动续期
    echo "设置证书自动续期..."
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --post-hook 'cd /opt/lambert-website && docker-compose restart nginx'") | crontab -
    
    echo "✅ SSL证书设置完成！"
EOF

echo "🎉 SSL证书配置完成！"
echo "🌐 现在可以通过 https://$DOMAIN 访问网站"
