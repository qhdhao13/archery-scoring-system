#!/bin/bash

echo "🚀 Git快速提交工具"
echo "=================="

# 显示当前状态
echo "📊 当前状态："
git status --short

# 询问是否添加所有文件
read -p "是否添加所有文件？(y/n): " add_all
if [ "$add_all" = "y" ]; then
    git add .
    echo "✅ 已添加所有文件"
else
    echo "请手动添加文件：git add <文件名>"
    exit 1
fi

# 输入提交信息
read -p "请输入提交信息: " commit_msg
if [ -n "$commit_msg" ]; then
    git commit -m "$commit_msg"
    echo "✅ 提交成功！"
else
    echo "❌ 提交信息不能为空"
    exit 1
fi

# 询问是否推送到远程
read -p "是否推送到远程仓库？(y/n): " push_remote
if [ "$push_remote" = "y" ]; then
    git push origin master
    echo "✅ 推送成功！"
fi

echo "🎉 操作完成！"
