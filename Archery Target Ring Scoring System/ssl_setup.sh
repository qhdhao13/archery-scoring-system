#!/bin/bash

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
