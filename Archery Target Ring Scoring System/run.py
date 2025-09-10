#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
射箭靶纸得分统计系统启动脚本
"""

import os
import sys
import subprocess
import platform

def check_python_version():
    """检查Python版本"""
    if sys.version_info < (3, 7):
        print("❌ 错误: 需要Python 3.7或更高版本")
        print(f"当前版本: {sys.version}")
        return False
    print(f"✅ Python版本检查通过: {sys.version}")
    return True

def check_dependencies():
    """检查依赖包"""
    required_packages = [
        'flask', 'flask-cors', 'opencv-python', 
        'pillow', 'numpy', 'matplotlib', 'werkzeug'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ 缺少依赖包: {', '.join(missing_packages)}")
        print("请运行: pip install -r backend/requirements.txt")
        return False
    
    print("✅ 依赖包检查通过")
    return True

def install_dependencies():
    """安装依赖包"""
    print("📦 正在安装依赖包...")
    try:
        subprocess.run([
            sys.executable, '-m', 'pip', 'install', '-r', 'backend/requirements.txt'
        ], check=True)
        print("✅ 依赖包安装完成")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 依赖包安装失败: {e}")
        return False

def create_directories():
    """创建必要的目录"""
    directories = [
        'backend/uploads',
        'data',
        'models'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"📁 创建目录: {directory}")

def start_server():
    """启动服务器"""
    print("🚀 启动射箭得分统计系统...")
    
    # 切换到backend目录
    os.chdir('backend')
    
    try:
        # 启动Flask服务器
        subprocess.run([
            sys.executable, 'app.py'
        ], check=True)
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
    except subprocess.CalledProcessError as e:
        print(f"❌ 服务器启动失败: {e}")
    except FileNotFoundError:
        print("❌ 找不到app.py文件")

def main():
    """主函数"""
    print("🎯 射箭靶纸得分统计系统")
    print("=" * 50)
    
    # 检查Python版本
    if not check_python_version():
        return
    
    # 检查依赖包
    if not check_dependencies():
        print("\n是否自动安装依赖包? (y/n): ", end="")
        if input().lower() == 'y':
            if not install_dependencies():
                return
        else:
            return
    
    # 创建目录
    create_directories()
    
    print("\n" + "=" * 50)
    print("🎉 系统准备就绪！")
    print("📱 支持功能:")
    print("   • 拍照上传靶纸自动识别")
    print("   • 智能箭矢位置检测")
    print("   • 精确得分计算")
    print("   • 性能分析和建议")
    print("   • 批量处理支持")
    print("   • 手动得分输入")
    print("\n🌐 启动后访问: http://localhost:5000")
    print("=" * 50)
    
    # 启动服务器
    start_server()

if __name__ == '__main__':
    main()
