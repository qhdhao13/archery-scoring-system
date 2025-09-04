#!/bin/bash

echo "🎯 Git版本发布工具"
echo "=================="

# 显示当前版本
echo "📋 当前标签："
git tag --sort=-version:refname | head -5

# 输入新版本号
read -p "请输入新版本号 (如 v1.3.0): " version
if [ -z "$version" ]; then
    echo "❌ 版本号不能为空"
    exit 1
fi

# 输入版本说明
read -p "请输入版本说明: " description
if [ -z "$description" ]; then
    echo "❌ 版本说明不能为空"
    exit 1
fi

# 创建标签
git tag -a "$version" -m "$description"
echo "✅ 标签创建成功：$version"

# 推送到远程
read -p "是否推送到远程仓库？(y/n): " push_remote
if [ "$push_remote" = "y" ]; then
    git push origin "$version"
    echo "✅ 标签推送成功！"
fi

echo "🎉 版本 $version 发布完成！"
