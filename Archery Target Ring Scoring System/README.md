# 射箭靶纸拍照得分统计系统

## 项目简介
这是一个基于计算机视觉技术的射箭靶纸得分统计系统，用户只需用手机拍照上传靶纸照片，系统就能自动识别箭矢位置并计算得分。

## 核心功能
- 🎯 自动靶纸边缘检测
- 🏹 智能箭矢位置识别
- 📊 精确得分计算
- 📱 手机拍照支持
- 🔢 手动得分输入
- 📈 统计分析功能

## 技术架构
- **后端**: Python Flask + OpenCV
- **前端**: HTML5 + CSS3 + JavaScript
- **图像处理**: OpenCV + NumPy
- **得分算法**: 基于距离的环数计算

## 安装说明

### 1. 安装依赖
```bash
pip install -r requirements.txt
```

### 2. 运行后端服务
```bash
cd backend
python app.py
```

### 3. 访问前端界面
打开浏览器访问: http://localhost:5000

## 使用方法

### 拍照模式
1. 点击拍照区域选择照片
2. 系统自动识别靶纸和箭矢
3. 显示得分和标记结果

### 手动模式
1. 选择靶纸类型
2. 输入箭矢坐标或距离
3. 点击计算得分

## 支持靶纸规格
- 18米靶纸 (40cm直径)
- 30米靶纸 (80cm直径)
- 50米靶纸 (80cm直径)
- 70米靶纸 (122cm直径)

## 项目结构
```
Archery Target Ring Scoring System/
├── backend/                 # 后端服务
├── frontend/               # 前端界面
├── models/                 # 预训练模型
├── data/                   # 测试数据
└── README.md              # 项目说明
```

## 开发团队
- 图像处理算法: OpenCV + 自定义算法
- 得分计算: 传统射箭评分规则
- 用户界面: 响应式设计

## 许可证
MIT License
9a4pyquigciTlAs7H8xTUS5nePSuaQ3xquk0

ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKZT+77im9UAmZuta7CMG2w6eXKX2neFojBVlyRhmWBp qhdhao13@github.com