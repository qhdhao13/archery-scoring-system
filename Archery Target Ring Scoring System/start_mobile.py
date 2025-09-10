#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
射箭靶纸得分统计系统 - 手机专用启动脚本
"""

import os
import sys
import socket
import subprocess
import platform
import webbrowser
from pathlib import Path

def get_local_ip():
    """获取本机局域网IP地址"""
    try:
        # 创建一个UDP套接字
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # 连接一个外部地址（不需要真实连接）
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "127.0.0.1"

def check_network_access():
    """检查网络访问性"""
    local_ip = get_local_ip()
    if local_ip == "127.0.0.1":
        print("❌ 无法获取局域网IP地址")
        return False
    
    print(f"✅ 本机局域网IP: {local_ip}")
    return True

def start_mobile_server():
    """启动手机专用服务器"""
    print("🚀 启动手机专用服务器...")
    
    # 切换到backend目录
    backend_dir = Path(__file__).parent / "backend"
    os.chdir(backend_dir)
    
    # 设置环境变量
    os.environ['MOBILE_MODE'] = '1'
    os.environ['HOST'] = '0.0.0.0'  # 允许外部访问
    os.environ['PORT'] = '5000'
    
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

def show_mobile_instructions():
    """显示手机使用说明"""
    local_ip = get_local_ip()
    
    print("\n" + "=" * 60)
    print("📱 手机使用说明")
    print("=" * 60)
    print()
    print("🌐 手机访问地址:")
    print(f"   http://{local_ip}:5000")
    print()
    print("📋 使用步骤:")
    print("   1. 确保手机和电脑连接同一个WiFi")
    print("   2. 在手机浏览器中输入上述地址")
    print("   3. 选择靶纸类型")
    print("   4. 拍照上传靶纸照片")
    print("   5. 等待系统自动识别和计算")
    print("   6. 查看得分结果")
    print()
    print("💡 手机优化提示:")
    print("   • 使用现代浏览器（Chrome、Safari）")
    print("   • 确保光线充足，拍摄清晰")
    print("   • 保持垂直拍摄角度")
    print("   • 关闭HDR，使用标准模式")
    print()
    print("🔧 故障排除:")
    print("   • 无法访问: 检查网络连接")
    print("   • 识别不准: 调整拍摄条件")
    print("   • 速度慢: 降低图片分辨率")
    print()
    print("📱 推荐手机设置:")
    print("   • 分辨率: 1920x1080或更高")
    print("   • 格式: JPG")
    print("   • 对焦: 手动对焦到靶纸中心")
    print("   • 防抖: 开启")
    print()
    print("🎯 靶纸类型支持:")
    print("   • 18米靶纸 (40cm直径) - 室内训练")
    print("   • 30米靶纸 (80cm直径) - 标准训练")
    print("   • 50米靶纸 (80cm直径) - 比赛标准")
    print("   • 70米靶纸 (122cm直径) - 奥运会标准")
    print()
    print("=" * 60)
    print("🎉 系统已启动，请在手机上访问上述地址！")
    print("=" * 60)

def main():
    """主函数"""
    print("🎯 射箭靶纸得分统计系统 - 手机专用版")
    print("=" * 60)
    
    # 检查Python版本
    if sys.version_info < (3, 7):
        print("❌ 错误: 需要Python 3.7或更高版本")
        print(f"当前版本: {sys.version}")
        return
    
    print(f"✅ Python版本检查通过: {sys.version}")
    
    # 检查网络访问
    if not check_network_access():
        print("❌ 网络配置检查失败")
        return
    
    # 显示手机使用说明
    show_mobile_instructions()
    
    # 询问是否自动打开浏览器
    try:
        response = input("\n是否自动打开浏览器？(y/n): ").lower()
        if response == 'y':
            local_ip = get_local_ip()
            url = f"http://{local_ip}:5000"
            print(f"🌐 正在打开浏览器: {url}")
            webbrowser.open(url)
    except KeyboardInterrupt:
        pass
    
    # 启动服务器
    start_mobile_server()

if __name__ == '__main__':
    main()
