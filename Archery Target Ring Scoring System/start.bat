@echo off
chcp 65001 >nul
title 射箭靶纸得分统计系统

echo.
echo ================================================
echo           射箭靶纸得分统计系统
echo ================================================
echo.

echo 正在检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Python，请先安装Python 3.7+
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python环境检查通过
echo.

echo 正在启动系统...
python run.py

pause
