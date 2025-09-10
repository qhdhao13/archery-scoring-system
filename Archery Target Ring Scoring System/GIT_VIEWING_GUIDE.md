# 🔍 Git查看代码和版本完整指南

## 📋 快速查看命令

### 🚀 一键查看所有信息
```bash
# 使用我们创建的脚本查看完整状态
./git_status.sh
```

## 📊 1. 查看当前状态

### 基本状态
```bash
# 查看工作区状态
git status

# 查看简短状态
git status --short

# 查看忽略的文件
git status --ignored
```

### 示例输出
```
🌿 当前分支：
* development c2ff617 📋 新增：Git状态查看脚本
  master      3a2d3eb 🎯 初始版本：射箭得分统计系统 v1.0.0

📝 最近提交：
c2ff617 📋 新增：Git状态查看脚本
3a2d3eb 🎯 初始版本：射箭得分统计系统 v1.0.0

🏷️ 版本标签：
v1.0.0
```

## 📝 2. 查看提交历史

### 查看所有提交
```bash
# 查看完整提交历史
git log

# 查看简洁提交历史
git log --oneline

# 查看图形化提交历史
git log --oneline --graph --all

# 查看最近5次提交
git log --oneline -5
```

### 示例输出
```
* c2ff617 📋 新增：Git状态查看脚本
* 3a2d3eb 🎯 初始版本：射箭得分统计系统 v1.0.0
```

### 查看特定提交详情
```bash
# 查看最新提交详情
git show HEAD

# 查看特定提交详情
git show 3a2d3eb

# 查看提交统计信息
git show --stat 3a2d3eb
```

## 🌿 3. 查看分支信息

### 分支列表
```bash
# 查看本地分支
git branch

# 查看所有分支（包括远程）
git branch -a

# 查看分支详细信息
git branch -v

# 查看分支关系图
git branch --graph
```

### 示例输出
```
* development c2ff617 📋 新增：Git状态查看脚本
  master      3a2d3eb 🎯 初始版本：射箭得分统计系统 v1.0.0
```

### 分支切换
```bash
# 切换到主分支
git checkout master

# 切换到开发分支
git checkout development

# 查看当前分支
git branch --show-current
```

## 🏷️ 4. 查看版本标签

### 标签列表
```bash
# 查看所有标签
git tag

# 查看标签详细信息
git tag -l -n

# 查看特定标签
git show v1.0.0
```

### 示例输出
```
v1.0.0

tag v1.0.0
Tagger: Archery System <admin@archery.com>
Date:   Thu Sep 4 09:42:16 2025 +0800

🎉 第一个正式版本
```

### 标签操作
```bash
# 切换到特定版本
git checkout v1.0.0

# 回到最新版本
git checkout development

# 查看标签差异
git diff v1.0.0 HEAD
```

## 📁 5. 查看文件信息

### 文件状态
```bash
# 查看已跟踪文件
git ls-files

# 查看特定目录文件
git ls-files backend/

# 查看文件大小
git ls-files --stage
```

### 文件历史
```bash
# 查看文件修改历史
git log --follow backend/production_app.py

# 查看文件变更统计
git log --stat backend/production_app.py

# 查看文件具体变更
git log -p backend/production_app.py
```

### 文件内容
```bash
# 查看最新版本文件
git show HEAD:backend/production_app.py

# 查看特定版本文件
git show v1.0.0:backend/production_app.py

# 查看文件差异
git diff HEAD~1 HEAD backend/production_app.py
```

## 🔍 6. 查看差异信息

### 工作区差异
```bash
# 查看未暂存的修改
git diff

# 查看特定文件差异
git diff backend/production_app.py

# 查看已暂存的修改
git diff --cached
```

### 提交间差异
```bash
# 查看最新提交与上一个提交的差异
git diff HEAD~1 HEAD

# 查看两个版本间的差异
git diff v1.0.0 HEAD

# 查看分支间差异
git diff master development
```

## 📈 7. 高级查看技巧

### 图形化显示
```bash
# 提交历史图
git log --oneline --graph --all --decorate

# 分支关系图
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

# 文件变更图
git log --graph --oneline --all -- backend/
```

### 统计信息
```bash
# 查看提交统计
git shortlog

# 查看文件变更统计
git diff --stat HEAD~5 HEAD

# 查看贡献者统计
git shortlog -sn
```

### 搜索功能
```bash
# 搜索提交信息
git log --grep="修复"

# 搜索作者
git log --author="Archery"

# 搜索文件内容
git grep "def process_image"
```

## 🎯 8. 常用查看组合

### 快速概览
```bash
# 一键查看所有重要信息
echo "=== Git状态概览 ===" && \
echo "当前分支:" && git branch --show-current && \
echo "最近提交:" && git log --oneline -3 && \
echo "版本标签:" && git tag && \
echo "工作区状态:" && git status --short
```

### 开发状态检查
```bash
# 检查开发状态
echo "=== 开发状态检查 ===" && \
echo "当前分支:" && git branch --show-current && \
echo "未提交的修改:" && git status --porcelain && \
echo "最近提交:" && git log --oneline -1
```

### 版本对比
```bash
# 对比两个版本
echo "=== 版本对比 ===" && \
echo "当前版本:" && git describe --tags && \
echo "文件变更:" && git diff --stat v1.0.0 HEAD
```

## 🚀 9. 使用我们的脚本

### git_status.sh - 状态查看
```bash
# 查看完整状态
./git_status.sh
```

### git_commit.sh - 快速提交
```bash
# 快速提交代码
./git_commit.sh
```

### git_release.sh - 版本发布
```bash
# 发布新版本
./git_release.sh
```

## 📱 10. 移动端查看建议

### 通过SSH客户端
```bash
# 使用手机SSH客户端连接服务器
ssh -o StrictHostKeyChecking=no root@49.232.232.27

# 进入项目目录
cd /root/archery-scoring-system

# 使用脚本查看
./git_status.sh
```

### 常用移动端命令
```bash
# 查看状态（简洁）
git status --short

# 查看最近提交
git log --oneline -5

# 查看当前分支
git branch --show-current
```

## 🎉 总结

现在你可以通过以下方式查看Git信息：

1. **一键查看**: `./git_status.sh`
2. **状态查看**: `git status`
3. **历史查看**: `git log --oneline`
4. **分支查看**: `git branch -v`
5. **标签查看**: `git tag`
6. **文件查看**: `git show HEAD:文件名`

记住：`./git_status.sh` 是最方便的查看方式，它会显示所有重要信息！

开始享受Git的强大查看功能吧！🎯
