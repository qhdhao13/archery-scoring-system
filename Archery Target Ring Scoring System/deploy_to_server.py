#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
射箭靶纸得分统计系统 - 一键部署到腾讯云服务器
支持密码认证
"""

import os
import sys
import subprocess
import tarfile
import time
import pexpect
from pathlib import Path

class ServerDeployer:
    def __init__(self):
        self.server_ip = "49.232.232.27"
        self.server_user = "root"
        self.server_password = "9707131102@hfm"
        self.project_name = "archery-scoring-system"
        self.local_project_dir = Path(__file__).parent
        self.archive_name = f"{self.project_name}.tar.gz"
        
    def check_requirements(self):
        """检查部署要求"""
        print("🔍 检查部署要求...")
        
        # 检查必要文件
        required_files = [
            "backend/app.py",
            "backend/image_processor.py", 
            "backend/scoring.py",
            "backend/production_app.py",
            "frontend/index.html",
            "frontend/style.css",
            "frontend/script.js"
        ]
        
        missing_files = []
        for file_path in required_files:
            if not (self.local_project_dir / file_path).exists():
                missing_files.append(file_path)
        
        if missing_files:
            print(f"❌ 缺少必要文件: {missing_files}")
            return False
        
        print("✅ 文件检查通过")
        return True
    
    def create_archive(self):
        """创建项目压缩包"""
        print("📦 创建项目压缩包...")
        
        try:
            with tarfile.open(self.archive_name, "w:gz") as tar:
                # 添加后端文件
                backend_dir = self.local_project_dir / "backend"
                for file_path in backend_dir.rglob("*"):
                    if file_path.is_file():
                        arcname = f"{self.project_name}/backend/{file_path.relative_to(backend_dir)}"
                        tar.add(file_path, arcname=arcname)
                
                # 添加前端文件
                frontend_dir = self.local_project_dir / "frontend"
                for file_path in frontend_dir.rglob("*"):
                    if file_path.is_file():
                        arcname = f"{self.project_name}/frontend/{file_path.relative_to(frontend_dir)}"
                        tar.add(file_path, arcname=arcname)
                
                # 添加配置文件
                config_files = [
                    "Dockerfile", "docker-compose.yml", "nginx.conf",
                    "archery-system.service", "deploy.sh", "ssl_setup.sh",
                    "monitor.sh", "backup.sh", "SERVER_README.md"
                ]
                
                for config_file in config_files:
                    file_path = self.local_project_dir / config_file
                    if file_path.exists():
                        arcname = f"{self.project_name}/{config_file}"
                        tar.add(file_path, arcname=arcname)
            
            print(f"✅ 压缩包创建完成: {self.archive_name}")
            return True
            
        except Exception as e:
            print(f"❌ 创建压缩包失败: {e}")
            return False
    
    def upload_to_server_with_password(self):
        """使用密码上传到服务器"""
        print(f"🚀 上传到服务器 {self.server_ip}...")
        
        try:
            # 使用scp上传，通过expect处理密码
            upload_cmd = f"scp -o StrictHostKeyChecking=no {self.archive_name} {self.server_user}@{self.server_ip}:/root/"
            
            print(f"执行命令: {upload_cmd}")
            print("正在处理密码认证...")
            
            # 使用pexpect处理密码输入
            child = pexpect.spawn(upload_cmd)
            
            # 等待密码提示
            i = child.expect(['password:', 'Password:', 'root@', pexpect.EOF, pexpect.TIMEOUT], timeout=30)
            
            if i in [0, 1, 2]:  # 密码提示或root@提示
                child.sendline(self.server_password)
                child.expect(pexpect.EOF, timeout=60)
                output = child.before.decode('utf-8', errors='ignore')
                
                # 检查上传是否成功
                if "100%" in output or child.exitstatus == 0 or "archery-scoring-system.tar.gz" in output:
                    print("✅ 文件上传成功")
                    return True
                else:
                    print(f"❌ 上传失败，退出码: {child.exitstatus}")
                    print(f"输出: {output}")
                    return False
            else:
                print("❌ 未收到密码提示")
                return False
                
        except Exception as e:
            print(f"❌ 上传失败: {e}")
            return False
    
    def deploy_on_server_with_password(self):
        """使用密码在服务器上部署"""
        print("⚙️ 在服务器上部署...")
        
        try:
            # 构建部署命令
            deploy_commands = [
                f"cd /root && tar -xzf {self.archive_name}",
                f"cd {self.project_name}",
                "chmod +x deploy.sh",
                "./deploy.sh"
            ]
            
            # 使用SSH连接并执行命令
            ssh_cmd = f"ssh -o StrictHostKeyChecking=no {self.server_user}@{self.server_ip}"
            
            print(f"执行命令: {ssh_cmd}")
            print("⚠️  这可能需要几分钟时间，请耐心等待...")
            
            # 使用pexpect处理SSH连接和密码
            child = pexpect.spawn(ssh_cmd)
            
            # 等待密码提示
            i = child.expect(['password:', 'Password:', 'root@', pexpect.EOF, pexpect.TIMEOUT], timeout=30)
            
            if i in [0, 1, 2]:  # 密码提示或root@提示
                child.sendline(self.server_password)
                
                # 等待登录成功
                i = child.expect(['#', '$', '>', 'root@', pexpect.EOF, pexpect.TIMEOUT], timeout=60)
                
                if i in [0, 1, 2, 3]:  # 登录成功
                    print("✅ SSH登录成功，开始部署...")
                    
                    # 执行部署命令
                    for cmd in deploy_commands:
                        print(f"执行: {cmd}")
                        child.sendline(cmd)
                        
                        # 等待命令完成，增加超时时间
                        try:
                            i = child.expect(['#', '$', '>', 'root@', pexpect.EOF, pexpect.TIMEOUT], timeout=600)  # 10分钟超时
                            
                            # 获取输出
                            output = child.before.decode('utf-8', errors='ignore')
                            print(f"命令输出: {output}")
                            
                            # 检查是否成功
                            if "部署完成" in output or "🎉" in output or "成功" in output or "完成" in output:
                                print("✅ 部署命令执行成功")
                                break
                            elif i == 4:  # EOF
                                print("✅ 命令执行完成")
                                break
                            elif i == 5:  # TIMEOUT
                                print("⚠️  命令执行超时，但可能仍在运行...")
                                # 继续等待一下
                                time.sleep(5)
                                continue
                            
                        except Exception as e:
                            print(f"⚠️  命令执行异常: {e}")
                            continue
                    
                    # 退出SSH
                    child.sendline("exit")
                    child.expect(pexpect.EOF, timeout=30)
                    
                    return True
                else:
                    print("❌ SSH登录失败")
                    return False
            else:
                print("❌ 未收到密码提示")
                return False
                
        except Exception as e:
            print(f"❌ 部署失败: {e}")
            return False
    
    def test_connection_with_password(self):
        """使用密码测试连接"""
        print("🔗 测试服务器连接...")
        
        try:
            # 使用SSH测试连接
            test_cmd = f"ssh -o StrictHostKeyChecking=no {self.server_user}@{self.server_ip} 'echo 连接成功'"
            
            # 使用pexpect处理密码
            child = pexpect.spawn(test_cmd)
            
            # 等待密码提示
            i = child.expect(['password:', 'Password:', 'root@', pexpect.EOF, pexpect.TIMEOUT], timeout=30)
            
            if i in [0, 1, 2]:  # 密码提示或root@提示
                child.sendline(self.server_password)
                child.expect(pexpect.EOF, timeout=30)
                output = child.before.decode('utf-8', errors='ignore')
                
                if "连接成功" in output:
                    print("✅ SSH连接测试成功")
                    return True
                else:
                    print("❌ SSH连接测试失败")
                    return False
            else:
                print("❌ 未收到密码提示")
                return False
                
        except Exception as e:
            print(f"❌ 连接测试失败: {e}")
            return False
    
    def cleanup(self):
        """清理临时文件"""
        print("🧹 清理临时文件...")
        
        try:
            if os.path.exists(self.archive_name):
                os.remove(self.archive_name)
                print(f"✅ 删除临时文件: {self.archive_name}")
        except Exception as e:
            print(f"⚠️  清理临时文件失败: {e}")
    
    def show_deployment_info(self):
        """显示部署信息"""
        print("\n" + "=" * 60)
        print("🎉 部署完成！")
        print("=" * 60)
        print(f"🌐 服务器地址: http://{self.server_ip}")
        print(f"📱 手机访问: http://{self.server_ip}")
        print()
        print("📋 管理命令:")
        print(f"  SSH登录: ssh -o StrictHostKeyChecking=no {self.server_user}@{self.server_ip}")
        print(f"  密码: {self.server_password}")
        print("  查看状态: systemctl status archery-system")
        print("  查看日志: journalctl -u archery-system -f")
        print("  重启服务: systemctl restart archery-system")
        print()
        print("🔧 故障排除:")
        print("  检查服务: ./monitor.sh")
        print("  数据备份: ./backup.sh")
        print("  查看配置: cat nginx.conf")
        print()
        print("📚 详细文档: SERVER_README.md")
        print("=" * 60)
    
    def deploy(self):
        """执行完整部署"""
        print("🎯 射箭靶纸得分统计系统 - 一键部署")
        print("=" * 60)
        print(f"目标服务器: {self.server_ip}")
        print(f"项目名称: {self.project_name}")
        print(f"用户名: {self.server_user}")
        print("=" * 60)
        
        try:
            # 1. 检查要求
            if not self.check_requirements():
                return False
            
            # 2. 测试连接
            if not self.test_connection_with_password():
                print("❌ 无法连接到服务器，请检查:")
                print("   - 服务器IP地址是否正确")
                print("   - 密码是否正确")
                print("   - 网络连接是否正常")
                return False
            
            # 3. 创建压缩包
            if not self.create_archive():
                return False
            
            # 4. 上传到服务器
            if not self.upload_to_server_with_password():
                return False
            
            # 5. 在服务器上部署
            if not self.deploy_on_server_with_password():
                return False
            
            # 6. 显示部署信息
            self.show_deployment_info()
            
            return True
            
        except KeyboardInterrupt:
            print("\n⚠️  部署被用户中断")
            return False
        except Exception as e:
            print(f"❌ 部署过程中发生错误: {e}")
            return False
        finally:
            # 7. 清理临时文件
            self.cleanup()

def main():
    """主函数"""
    deployer = ServerDeployer()
    
    # 检查命令行参数
    if len(sys.argv) > 1:
        if sys.argv[1] == "--help" or sys.argv[1] == "-h":
            print("使用方法:")
            print("  python3 deploy_to_server.py          # 执行部署")
            print("  python3 deploy_to_server.py --help   # 显示帮助")
            return
        
        if sys.argv[1] == "--test":
            print("🧪 仅测试连接...")
            if deployer.test_connection_with_password():
                print("✅ 连接测试成功")
            else:
                print("❌ 连接测试失败")
            return
    
    # 检查pexpect依赖
    try:
        import pexpect
    except ImportError:
        print("❌ 缺少pexpect模块，正在安装...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "pexpect"], check=True)
            print("✅ pexpect安装成功")
        except Exception as e:
            print(f"❌ pexpect安装失败: {e}")
            print("请手动安装: pip install pexpect")
            return
    
    # 执行部署
    success = deployer.deploy()
    
    if success:
        print("\n🎉 部署成功！现在你可以在家里用手机访问系统了！")
        print(f"📱 手机访问地址: http://{deployer.server_ip}")
    else:
        print("\n❌ 部署失败，请检查错误信息并重试")
        sys.exit(1)

if __name__ == '__main__':
    main()
