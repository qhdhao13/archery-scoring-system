# 🚀 GitHub连接设置完整指南

## 📋 你的GitHub信息
- **用户名**: `qhdhao13`
- **仓库地址**: `https://github.com/qhdhao13/archery-scoring-system.git`

## 🎯 第一步：在GitHub上创建仓库

### 1. 登录GitHub
- 打开浏览器，访问：`https://github.com`
- 使用账号 `qhdhao13` 登录

### 2. 创建新仓库
- 点击右上角 "+" 号
- 选择 "New repository"
- 填写仓库信息：
  - **Repository name**: `archery-scoring-system`
  - **Description**: `射箭靶纸得分统计系统 - 基于AI图像识别的智能评分系统`
  - **Visibility**: 选择 `Public`（公开）
  - **不要勾选** "Add a README file"
  - **不要勾选** "Add .gitignore"
  - **不要勾选** "Choose a license"
- 点击 "Create repository"

## 🔑 第二步：设置身份验证

### 方式一：使用个人访问令牌（推荐）

#### 1. 生成个人访问令牌
- 在GitHub页面，点击右上角头像
- 选择 "Settings"
- 左侧菜单选择 "Developer settings"
- 选择 "Personal access tokens" → "Tokens (classic)"
- 点击 "Generate new token" → "Generate new token (classic)"
- 填写信息：
  - **Note**: `Archery System Access`
  - **Expiration**: 选择 `No expiration` 或设置合适期限
  - **Scopes**: 勾选 `repo`（完整仓库访问权限）
- 点击 "Generate token"
- **重要**：复制生成的令牌（只显示一次！）

#### 2. 在服务器上配置
```bash
# SSH登录服务器
ssh -o StrictHostKeyChecking=no root@49.232.232.27

# 进入项目目录
cd /root/archery-scoring-system

# 配置Git用户信息（如果还没配置）
git config --global user.name "qhdhao13"
git config --global user.email "你的邮箱@example.com"

# 配置个人访问令牌（替换YOUR_TOKEN为实际令牌）
git config --global credential.helper store
echo "https://qhdhao13:YOUR_TOKEN@github.com" > ~/.git-credentials

# 或者使用环境变量
export GITHUB_TOKEN="YOUR_TOKEN"
```

### 方式二：使用SSH密钥

#### 1. 生成SSH密钥
```bash
# 在服务器上生成SSH密钥
ssh-keygen -t ed25519 -C "qhdhao13@github.com"

# 查看公钥
cat ~/.ssh/id_ed25519.pub
```

#### 2. 添加到GitHub
- 复制公钥内容
- 在GitHub页面，点击右上角头像 → "Settings"
- 左侧菜单选择 "SSH and GPG keys"
- 点击 "New SSH key"
- 粘贴公钥内容，点击 "Add SSH key"

#### 3. 修改远程仓库地址
```bash
# 删除HTTPS远程仓库
git remote remove origin

# 添加SSH远程仓库
git remote add origin git@github.com:qhdhao13/archery-scoring-system.git
```

## 🚀 第三步：推送代码到GitHub

### 使用个人访问令牌推送
```bash
# 推送主分支
git push -u origin master

# 推送开发分支
git push origin development

# 推送所有分支
git push --all origin

# 推送所有标签
git push --tags origin
```

### 使用SSH密钥推送
```bash
# 推送主分支
git push -u origin master

# 推送所有分支和标签
git push --all origin
git push --tags origin
```

## 📱 第四步：在GitHub上查看代码

### 1. 访问仓库
- 打开：`https://github.com/qhdhao13/archery-scoring-system`
- 你会看到所有代码文件

### 2. 查看文件结构
- 点击文件夹进入子目录
- 点击文件查看代码内容
- 支持语法高亮显示

### 3. 查看提交历史
- 点击 "commits" 查看所有提交
- 点击提交哈希查看具体变更
- 可以看到每次修改的详细信息

### 4. 查看分支
- 点击分支下拉菜单
- 可以切换不同分支查看代码

### 5. 查看版本
- 点击 "releases" 查看所有版本
- 可以看到版本说明和下载链接

## 🔧 常用GitHub操作

### 在线编辑文件
1. 在GitHub上点击文件
2. 点击编辑按钮（铅笔图标）
3. 修改代码
4. 填写提交信息
5. 选择分支
6. 点击 "Commit changes"

### 创建新文件
1. 点击 "Add file" → "Create new file"
2. 输入文件名和路径
3. 编写代码内容
4. 填写提交信息
5. 选择分支
6. 点击 "Commit new file"

### 查看文件历史
1. 点击文件
2. 点击 "History" 按钮
3. 查看所有版本变更

## 🎉 完成后的效果

### 在GitHub上你可以看到：
- 📁 完整的项目文件结构
- 📝 详细的提交历史
- 🌿 所有分支信息
- 🏷️ 版本标签
- 📊 代码统计信息
- 🔍 搜索和导航功能

### 在手机上：
- 打开浏览器访问GitHub
- 登录账号 `qhdhao13`
- 查看 `archery-scoring-system` 仓库
- 随时随地查看和编辑代码

## 🚨 注意事项

1. **个人访问令牌**：妥善保管，不要泄露
2. **SSH密钥**：如果使用SSH，确保密钥安全
3. **仓库权限**：根据需要设置公开或私有
4. **定期备份**：重要代码建议定期备份

## 🎯 下一步

完成GitHub连接后，你就可以：
- 📱 在手机上通过GitHub查看代码
- 💻 在任何设备上访问项目
- 🤝 与他人协作开发
- 📚 维护项目文档
- 🚀 使用GitHub Actions自动化部署

现在开始设置吧！有任何问题都可以问我。🎯
