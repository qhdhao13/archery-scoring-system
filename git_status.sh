#!/bin/bash

echo "📊 Git状态查看工具"
echo "=================="

echo "🌿 当前分支："
git branch -v

echo "\n📋 当前状态："
git status --short

echo "\n📝 最近提交："
git log --oneline -5

echo "\n🏷️  版本标签："
git tag --sort=-version:refname

echo "\n📈 分支图："
git log --oneline --graph --all -10

echo "\n🔍 工作区差异："
git diff --name-only

echo "\n✅ 暂存区差异："
git diff --cached --name-only
