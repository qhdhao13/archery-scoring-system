# 🚀 服务器部署说明

## 服务器信息
- **IP地址**: 49.232.232.27
- **端口**: 5000
- **项目名称**: archery-scoring-system

## 部署步骤

### 1. 上传文件到服务器
```bash
# 在本地打包项目
tar -czf archery-system.tar.gz Archery\ Target\ Ring\ Scoring\ System/

# 上传到服务器
scp archery-system.tar.gz root@49.232.232.27:/root/

# 登录服务器
ssh root@49.232.232.27
```

### 2. 在服务器上部署
```bash
# 解压项目
cd /root
tar -xzf archery-system.tar.gz
cd archery-scoring-system

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

- **HTTP**: http://49.232.232.27
- **HTTPS**: https://49.232.232.27 (配置SSL后)

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
