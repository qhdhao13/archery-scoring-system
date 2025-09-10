# Lambert 个人生活记录网站

一个简洁优雅的个人生活记录网站，用于发布和管理照片、文章、视频等内容。

## 功能特性

- 📸 **相册管理** - 上传、分类、展示照片
- 📝 **文章发布** - 发布和编辑个人文章
- 🎥 **视频分享** - 上传和展示视频内容
- 📊 **数据统计** - 显示内容统计信息
- 📱 **响应式设计** - 支持移动端和桌面端
- 🔒 **安全访问** - HTTPS加密访问
- 🎨 **优雅界面** - 参考汇丰银行风格的简洁设计

## 技术栈

### 前端
- HTML5 + CSS3 + JavaScript
- 响应式设计
- 现代浏览器兼容

### 后端
- Python Flask
- SQLite数据库
- RESTful API设计

### 部署
- Docker容器化
- Nginx反向代理
- Let's Encrypt SSL证书

## 项目结构

```
qhdhao.cn-web/
├── app.py                 # Flask后端应用
├── requirements.txt       # Python依赖
├── index.html            # 主页面
├── css/
│   └── style.css         # 样式文件
├── js/
│   └── script.js         # 前端脚本
├── templates/
│   └── legacy.html       # 原服务器内容页面
├── uploads/              # 上传文件目录
│   ├── images/          # 图片文件
│   └── videos/          # 视频文件
├── Dockerfile           # Docker镜像配置
├── docker-compose.yml   # Docker编排配置
├── nginx.conf           # Nginx配置
├── deploy.sh            # 部署脚本
├── ssl_setup.sh         # SSL证书设置脚本
└── README.md            # 项目说明
```

## 快速开始

### 本地开发

1. **安装依赖**
   ```bash
   pip install -r requirements.txt
   ```

2. **启动应用**
   ```bash
   python app.py
   ```

3. **访问网站**
   打开浏览器访问 `http://localhost:5000`

### 服务器部署

1. **执行部署脚本**
   ```bash
   ./deploy.sh
   ```

2. **设置SSL证书**
   ```bash
   ./ssl_setup.sh
   ```

3. **访问网站**
   打开浏览器访问 `https://qhdhao.cn`

## API接口

### 统计数据
- `GET /api/stats` - 获取内容统计

### 相册管理
- `GET /api/gallery` - 获取相册列表
- `POST /api/upload` - 上传照片

### 文章管理
- `GET /api/articles` - 获取文章列表
- `POST /api/articles` - 发布新文章

### 视频管理
- `GET /api/videos` - 获取视频列表
- `POST /api/upload` - 上传视频

### 最新动态
- `GET /api/recent` - 获取最新动态

## 配置说明

### 服务器配置
- 服务器IP: `49.232.232.27`
- 域名: `qhdhao.cn`
- 端口: `80` (HTTP), `443` (HTTPS)

### 数据库
- 使用SQLite数据库
- 自动创建表结构
- 支持数据持久化

### 文件上传
- 支持图片格式: PNG, JPG, JPEG, GIF, WebP
- 支持视频格式: MP4, AVI, MOV, WMV, FLV, WebM
- 最大文件大小: 50MB
- 自动图片压缩和优化

## 维护管理

### 查看日志
```bash
ssh root@49.232.232.27 'cd /opt/lambert-website && docker-compose logs -f'
```

### 重启服务
```bash
ssh root@49.232.232.27 'cd /opt/lambert-website && docker-compose restart'
```

### 备份数据
```bash
ssh root@49.232.232.27 'cd /opt/lambert-website && tar -czf backup-$(date +%Y%m%d).tar.gz lambert.db uploads/'
```

### 更新代码
```bash
./deploy.sh
```

## 安全特性

- HTTPS加密传输
- 文件类型验证
- 文件大小限制
- SQL注入防护
- XSS攻击防护
- 安全头设置

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 许可证

MIT License

## 联系方式

- 网站: https://qhdhao.cn
- 邮箱: contact@qhdhao.cn

---

**Lambert** - 记录生活的美好瞬间 ✨
