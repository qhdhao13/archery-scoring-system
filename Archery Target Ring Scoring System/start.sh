#!/bin/bash

# 射箭靶纸得分统计系统启动脚本

echo "================================================"
echo "           射箭靶纸得分统计系统"
echo "================================================"
echo

# 检查Python环境
echo "正在检查Python环境..."
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "❌ 错误: 未找到Python，请先安装Python 3.7+"
        echo "Ubuntu/Debian: sudo apt install python3 python3-pip"
        echo "CentOS/RHEL: sudo yum install python3 python3-pip"
        echo "macOS: brew install python3"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

echo "✅ Python环境检查通过"
echo

# 检查Python版本
PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | awk '{print $2}')
echo "Python版本: $PYTHON_VERSION"
echo

# 启动系统
echo "正在启动系统..."
$PYTHON_CMD run.py
