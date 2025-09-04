#!/bin/bash

# 系统监控脚本

echo "📊 系统状态监控"
echo "=================="

# 检查服务状态
echo "🔍 检查服务状态..."
systemctl status archery-system --no-pager

# 检查端口监听
echo ""
echo "🌐 检查端口监听..."
netstat -tlnp | grep :5000

# 检查磁盘使用
echo ""
echo "💾 检查磁盘使用..."
df -h

# 检查内存使用
echo ""
echo "🧠 检查内存使用..."
free -h

# 检查日志
echo ""
echo "📝 最近日志..."
journalctl -u archery-system --no-pager -n 20
