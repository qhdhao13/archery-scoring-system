#!/bin/bash

# 数据备份脚本

BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="archery_backup_$DATE.tar.gz"

echo "💾 开始备份数据..."

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据
tar -czf $BACKUP_DIR/$BACKUP_NAME data/ uploads/ models/ logs/

# 删除7天前的备份
find $BACKUP_DIR -name "archery_backup_*.tar.gz" -mtime +7 -delete

echo "✅ 备份完成: $BACKUP_DIR/$BACKUP_NAME"
echo "📊 备份大小: $(du -h $BACKUP_DIR/$BACKUP_NAME | cut -f1)"
