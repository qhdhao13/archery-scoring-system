# 射箭记分助手 - 部署指南

## 部署概述

本指南将帮助你将射箭记分助手微信小程序部署到生产环境。

## 前置要求

### 1. 开发环境
- 微信开发者工具 (最新版本)
- Node.js (v14+)
- Git

### 2. 账号准备
- 微信小程序账号
- 服务器账号 (用于后端API)
- 域名和SSL证书

## 部署步骤

### 第一步：准备小程序账号

1. **注册小程序账号**
   - 访问 [微信公众平台](https://mp.weixin.qq.com/)
   - 注册小程序账号
   - 完成认证流程

2. **获取AppID**
   - 在开发设置中获取AppID
   - 更新 `project.config.json` 中的 `appid` 字段

3. **配置服务器域名**
   - 在开发设置中添加服务器域名
   - 确保域名支持HTTPS

### 第二步：配置项目

1. **更新配置文件**
   ```json
   // project.config.json
   {
     "appid": "your-app-id-here",
     "projectname": "射箭记分助手"
   }
   ```

2. **配置API地址**
   ```javascript
   // app.js
   globalData: {
     apiBaseUrl: 'https://your-domain.com/api'
   }
   ```

3. **更新权限配置**
   ```json
   // app.json
   "permission": {
     "scope.camera": {
       "desc": "用于拍摄靶纸照片进行得分识别"
     },
     "scope.writePhotosAlbum": {
       "desc": "用于保存识别结果图片"
     }
   }
   ```

### 第三步：后端服务部署

1. **服务器环境**
   ```bash
   # 安装Python 3.8+
   sudo apt update
   sudo apt install python3 python3-pip
   
   # 安装依赖
   pip3 install -r requirements.txt
   ```

2. **配置Nginx**
   ```nginx
   server {
       listen 443 ssl;
       server_name your-domain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       location /api/ {
           proxy_pass http://localhost:5000/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. **启动服务**
   ```bash
   # 使用systemd管理服务
   sudo systemctl enable archery-api
   sudo systemctl start archery-api
   ```

### 第四步：小程序发布

1. **代码上传**
   - 在微信开发者工具中点击"上传"
   - 填写版本号和项目备注
   - 上传代码到微信服务器

2. **提交审核**
   - 在微信公众平台提交审核
   - 填写功能页面和测试账号
   - 等待审核结果

3. **发布上线**
   - 审核通过后点击"发布"
   - 小程序正式上线

## 配置说明

### 环境变量配置

```bash
# 生产环境配置
export FLASK_ENV=production
export SECRET_KEY=your-secret-key
export DATABASE_URL=your-database-url
export UPLOAD_FOLDER=/path/to/uploads
```

### 数据库配置

```python
# config.py
class ProductionConfig:
    DATABASE_URL = 'postgresql://user:pass@localhost/archery_db'
    REDIS_URL = 'redis://localhost:6379/0'
    CELERY_BROKER_URL = 'redis://localhost:6379/0'
```

### 缓存配置

```python
# 配置Redis缓存
CACHE_TYPE = 'redis'
CACHE_REDIS_URL = 'redis://localhost:6379/0'
CACHE_DEFAULT_TIMEOUT = 300
```

## 性能优化

### 1. 服务器优化

```python
# 使用Gunicorn部署
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### 2. 数据库优化

```sql
-- 创建索引
CREATE INDEX idx_records_timestamp ON records(timestamp);
CREATE INDEX idx_records_user_id ON records(user_id);
```

### 3. 缓存策略

```python
# 使用Redis缓存
@cache.memoize(timeout=300)
def get_user_records(user_id):
    # 缓存用户记录
    pass
```

## 监控和日志

### 1. 日志配置

```python
# logging.conf
[loggers]
keys=root,app

[handlers]
keys=fileHandler,consoleHandler

[formatters]
keys=simpleFormatter

[logger_root]
level=INFO
handlers=consoleHandler

[logger_app]
level=INFO
handlers=fileHandler,consoleHandler
qualname=app
propagate=0
```

### 2. 监控配置

```python
# 使用Prometheus监控
from prometheus_client import Counter, Histogram

REQUEST_COUNT = Counter('app_requests_total', 'Total requests')
REQUEST_LATENCY = Histogram('app_request_duration_seconds', 'Request latency')
```

### 3. 错误追踪

```python
# 使用Sentry错误追踪
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FlaskIntegration()],
    traces_sample_rate=1.0
)
```

## 安全配置

### 1. HTTPS配置

```nginx
# 强制HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 2. 安全头配置

```python
# 添加安全头
from flask_talisman import Talisman

Talisman(app, force_https=True)
```

### 3. 输入验证

```python
# 使用WTForms验证
from wtforms import Form, StringField, validators

class UploadForm(Form):
    file = FileField('File', validators=[FileRequired()])
    target_type = StringField('Target Type', validators=[DataRequired()])
```

## 备份策略

### 1. 数据库备份

```bash
# 每日备份
pg_dump archery_db > backup_$(date +%Y%m%d).sql
```

### 2. 文件备份

```bash
# 备份上传文件
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /path/to/uploads/
```

### 3. 配置备份

```bash
# 备份配置文件
cp -r /etc/nginx/sites-available/ /backup/nginx/
cp -r /etc/systemd/system/ /backup/systemd/
```

## 故障排除

### 常见问题

1. **小程序无法连接服务器**
   - 检查域名配置
   - 确认HTTPS证书有效
   - 检查防火墙设置

2. **图像识别失败**
   - 检查OpenCV依赖
   - 确认图像格式支持
   - 查看服务器日志

3. **性能问题**
   - 检查服务器资源使用
   - 优化数据库查询
   - 启用缓存

### 日志查看

```bash
# 查看应用日志
tail -f /var/log/archery/app.log

# 查看Nginx日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# 查看系统日志
journalctl -u archery-api -f
```

## 更新部署

### 1. 代码更新

```bash
# 拉取最新代码
git pull origin main

# 更新依赖
pip3 install -r requirements.txt

# 重启服务
sudo systemctl restart archery-api
```

### 2. 数据库迁移

```bash
# 运行数据库迁移
flask db upgrade
```

### 3. 缓存清理

```bash
# 清理Redis缓存
redis-cli FLUSHDB
```

## 维护计划

### 日常维护
- 监控服务器状态
- 检查日志文件
- 备份重要数据

### 定期维护
- 更新依赖包
- 清理临时文件
- 优化数据库

### 应急响应
- 建立监控告警
- 准备回滚方案
- 制定应急预案

## 联系支持

如遇到部署问题，请通过以下方式联系：

- 技术支持邮箱：support@example.com
- 紧急联系电话：+86-xxx-xxxx-xxxx
- 在线文档：https://docs.example.com

---

**部署完成后，记得测试所有功能确保正常运行！**
