#!/bin/bash

# Emma CMS - Automated Backup Script for GoDaddy
# This script backs up the database and uploads directory

# Configuration
APP_DIR="/var/www/emmabykodefast"
BACKUP_DIR="/var/backups/emma-cms"
DB_USER="emma_user"
DB_NAME="emma_resources_cms"
RETENTION_DAYS=30

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp
DATE=$(date +%Y%m%d_%H%M%S)

echo -e "${YELLOW}Emma CMS Backup Starting...${NC}"
echo "Timestamp: $DATE"
echo ""

# Backup Database
echo -e "${YELLOW}Backing up database...${NC}"
DB_BACKUP_FILE="$BACKUP_DIR/db_$DATE.sql"

# Prompt for database password (or use environment variable)
if [ -z "$DB_PASSWORD" ]; then
    mysqldump -u "$DB_USER" -p "$DB_NAME" > "$DB_BACKUP_FILE" 2>/dev/null
else
    mysqldump -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$DB_BACKUP_FILE" 2>/dev/null
fi

if [ $? -eq 0 ]; then
    # Compress database backup
    gzip "$DB_BACKUP_FILE"
    echo -e "${GREEN}✓ Database backup completed: db_$DATE.sql.gz${NC}"
else
    echo -e "${RED}✗ Database backup failed!${NC}"
    exit 1
fi

# Backup Uploads Directory
echo -e "${YELLOW}Backing up uploads directory...${NC}"
UPLOADS_BACKUP_FILE="$BACKUP_DIR/uploads_$DATE.tar.gz"

tar -czf "$UPLOADS_BACKUP_FILE" -C "$APP_DIR" uploads 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Uploads backup completed: uploads_$DATE.tar.gz${NC}"
else
    echo -e "${RED}✗ Uploads backup failed!${NC}"
fi

# Backup Configuration Files
echo -e "${YELLOW}Backing up configuration...${NC}"
CONFIG_BACKUP_FILE="$BACKUP_DIR/config_$DATE.tar.gz"

tar -czf "$CONFIG_BACKUP_FILE" -C "$APP_DIR" config.env package.json 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Configuration backup completed: config_$DATE.tar.gz${NC}"
else
    echo -e "${YELLOW}⚠ Configuration backup failed (may not exist)${NC}"
fi

# Clean up old backups
echo ""
echo -e "${YELLOW}Cleaning up old backups (older than $RETENTION_DAYS days)...${NC}"
find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null
echo -e "${GREEN}✓ Old backups cleaned${NC}"

# Calculate backup sizes
echo ""
echo -e "${GREEN}Backup Summary:${NC}"
echo "-----------------------------------"
ls -lh "$BACKUP_DIR" | grep "$DATE"
echo "-----------------------------------"

# Calculate total backup size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "Total backup directory size: $TOTAL_SIZE"

echo ""
echo -e "${GREEN}✓ Backup completed successfully!${NC}"
echo "Backup location: $BACKUP_DIR"
echo ""

# Optional: Send notification (uncomment if you have mail configured)
# echo "Emma CMS backup completed on $(hostname) at $(date)" | mail -s "Backup Success" admin@yourdomain.com

exit 0

