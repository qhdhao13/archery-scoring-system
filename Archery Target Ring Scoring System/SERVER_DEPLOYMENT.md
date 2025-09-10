# 🚀 腾讯云服务器部署指南

## 📋 部署概览

本指南将帮助你在腾讯云轻量应用服务器上部署射箭靶纸得分统计系统，实现：
- 🌐 24/7 在线服务
- 📱 手机随时访问
- 🔒 安全可靠运行
- 📊 完整监控和备份

## 🎯 服务器信息

- **IP地址**: 49.232.232.27
- **操作系统**: Ubuntu/CentOS
- **用户**: root
- **端口**: 5000 (应用), 80 (HTTP), 443 (HTTPS)

## 🚀 一键部署（推荐）

### 方法一：自动部署脚本

```bash
# 1. 进入项目目录
cd "Archery Target Ring Scoring System"

# 2. 运行一键部署脚本
python deploy_to_server.py
```

这个脚本会自动：
- ✅ 检查部署要求
- ✅ 测试服务器连接
- ✅ 创建项目压缩包
- ✅ 上传到服务器
- ✅ 执行部署命令
- ✅ 显示访问信息

### 方法二：手动部署

如果自动部署失败，可以手动执行：

```bash
# 1. 创建部署文件
python deploy_server.py

# 2. 打包项目
tar -czf archery-system.tar.gz Archery\ Target\ Ring\ Scoring\ System/

# 3. 上传到服务器
scp archery-system.tar.gz root@49.232.232.27:/root/

# 4. SSH登录服务器
ssh root@49.232.232.27

# 5. 在服务器上部署
cd /root
tar -xzf archery-system.tar.gz
cd archery-scoring-system
chmod +x deploy.sh
./deploy.sh
```

## 🔧 部署前准备

### 1. 本地环境要求
- Python 3.7+
- SSH客户端
- 网络连接正常

### 2. 服务器要求
- 腾讯云轻量应用服务器
- Ubuntu 18.04+ 或 CentOS 7+
- 至少1GB内存
- 至少20GB存储空间

### 3. SSH密钥配置
```bash
# 生成SSH密钥（如果没有）
ssh-keygen -t rsa -b 2048

# 复制公钥到服务器
ssh-copy-id root@49.232.232.27

# 测试连接
ssh root@49.232.232.27
```

## 📱 部署后使用

### 1. 手机访问
部署完成后，在手机浏览器中输入：
```
http://49.232.232.27
```

### 2. 功能验证
- ✅ 拍照上传靶纸
- ✅ 自动识别箭矢
- ✅ 计算得分
- ✅ 查看分析结果

### 3. 性能测试
- 上传图片大小：最大16MB
- 处理时间：通常5-10秒
- 并发用户：支持5-10个同时使用

## 🛠️ 服务器管理

### 1. 服务管理命令
```bash
# 查看服务状态
systemctl status archery-system

# 启动服务
systemctl start archery-system

# 停止服务
systemctl stop archery-system

# 重启服务
systemctl restart archery-system

# 查看日志
journalctl -u archery-system -f
```

### 2. 系统监控
```bash
# 运行监控脚本
./monitor.sh

# 检查端口监听
netstat -tlnp | grep :5000

# 检查系统资源
htop
df -h
free -h
```

### 3. 数据备份
```bash
# 自动备份
./backup.sh

# 手动备份
tar -czf backup_$(date +%Y%m%d).tar.gz data/ uploads/ models/
```

## 🔒 安全配置

### 1. 防火墙设置
```bash
# 查看防火墙状态
ufw status

# 只开放必要端口
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw allow 5000  # 应用端口

# 启用防火墙
ufw enable
```

### 2. SSL证书配置（可选）
```bash
# 安装certbot
apt install -y certbot python3-certbot-nginx

# 申请证书（需要域名）
certbot --nginx -d your-domain.com

# 或者使用standalone模式
certbot certonly --standalone -d your-domain.com
```

### 3. 定期更新
```bash
# 更新系统包
apt update && apt upgrade -y

# 更新Python依赖
pip install --upgrade -r backend/requirements.txt
```

## 📊 性能优化

### 1. 系统优化
```bash
# 调整系统参数
echo 'net.core.somaxconn = 65535' >> /etc/sysctl.conf
echo 'net.ipv4.tcp_max_syn_backlog = 65535' >> /etc/sysctl.conf
sysctl -p
```

### 2. Nginx优化
```bash
# 编辑Nginx配置
nano /etc/nginx/nginx.conf

# 调整worker进程数
worker_processes auto;
worker_connections 1024;
```

### 3. 应用优化
```bash
# 启用Gunicorn（可选）
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 production_app:app
```

## 🔧 故障排除

### 1. 服务无法启动
```bash
# 检查日志
journalctl -u archery-system -f

# 检查端口占用
netstat -tlnp | grep :5000

# 检查依赖
pip list | grep -E "(flask|opencv|numpy)"

# 检查权限
ls -la /root/archery-scoring-system/
```

### 2. 无法访问
```bash
# 检查防火墙
ufw status

# 检查Nginx
systemctl status nginx
nginx -t

# 检查服务状态
systemctl status archery-system

# 检查端口
ss -tlnp | grep :5000
```

### 3. 性能问题
```bash
# 检查系统资源
htop
df -h
free -h

# 检查进程
ps aux | grep python

# 检查网络
netstat -i
```

## 📈 监控和维护

### 1. 日志管理
```bash
# 查看应用日志
tail -f logs/archery_system.log

# 查看系统日志
journalctl -u archery-system -f

# 查看Nginx日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 2. 性能监控
```bash
# 系统资源监控
./monitor.sh

# 应用性能指标
curl http://49.232.232.27/api/metrics
```

### 3. 定期维护
```bash
# 每日检查
./monitor.sh

# 每周备份
./backup.sh

# 每月更新
apt update && apt upgrade -y
```

## 🌐 域名配置（可选）

### 1. 域名解析
在域名管理平台添加A记录：
```
类型: A
主机记录: @
记录值: 49.232.232.27
TTL: 600
```

### 2. SSL证书
```bash
# 申请Let's Encrypt证书
certbot --nginx -d your-domain.com

# 自动续期
crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📞 技术支持

### 1. 常见问题
- **部署失败**: 检查SSH连接和服务器状态
- **无法访问**: 检查防火墙和端口配置
- **识别不准**: 调整拍摄条件和图片质量
- **速度慢**: 优化图片大小和网络设置

### 2. 获取帮助
- 查看日志文件
- 运行监控脚本
- 检查系统状态
- 参考详细文档

### 3. 联系信息
如遇到问题，请提供：
- 错误日志
- 系统状态
- 操作步骤
- 环境信息

## 🎉 部署完成

部署成功后，你就可以：
1. 🌐 在任何地方访问系统
2. 📱 用手机拍照查看成绩
3. 💾 保存所有得分数据
4. 📊 分析训练进度
5. 🔄 24/7 不间断服务

祝你使用愉快，射箭技术更上一层楼！🏹
