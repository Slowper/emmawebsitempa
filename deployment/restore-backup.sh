#!/bin/bash

# Emma CMS - Restore from Backup Script
# This script restores the database and uploads from a backup

# Configuration
APP_DIR="/var/www/emmabykodefast"
BACKUP_DIR="/var/backups/emma-cms"
DB_USER="emma_user"
DB_NAME="emma_resources_cms"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Emma CMS - Restore from Backup${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}✗ Backup directory not found: $BACKUP_DIR${NC}"
    exit 1
fi

# List available backups
echo -e "${YELLOW}Available backups:${NC}"
echo ""
ls -lht "$BACKUP_DIR" | grep -E '\.sql\.gz|\.tar\.gz'
echo ""

# Prompt for backup date
read -p "Enter backup timestamp (YYYYMMDD_HHMMSS): " BACKUP_DATE

# Validate input
if [ -z "$BACKUP_DATE" ]; then
    echo -e "${RED}✗ No timestamp provided!${NC}"
    exit 1
fi

# Check if backup files exist
DB_BACKUP="$BACKUP_DIR/db_${BACKUP_DATE}.sql.gz"
UPLOADS_BACKUP="$BACKUP_DIR/uploads_${BACKUP_DATE}.tar.gz"

if [ ! -f "$DB_BACKUP" ]; then
    echo -e "${RED}✗ Database backup not found: $DB_BACKUP${NC}"
    exit 1
fi

if [ ! -f "$UPLOADS_BACKUP" ]; then
    echo -e "${YELLOW}⚠ Uploads backup not found: $UPLOADS_BACKUP${NC}"
    echo "Continuing with database restore only..."
fi

# Confirmation
echo ""
echo -e "${RED}WARNING: This will overwrite current data!${NC}"
read -p "Are you sure you want to restore from backup $BACKUP_DATE? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Restore cancelled.${NC}"
    exit 0
fi

# Stop the application
echo ""
echo -e "${YELLOW}Stopping application...${NC}"
pm2 stop emma-cms 2>/dev/null
echo -e "${GREEN}✓ Application stopped${NC}"

# Restore Database
echo ""
echo -e "${YELLOW}Restoring database...${NC}"

# Decompress and restore
if [ -z "$DB_PASSWORD" ]; then
    gunzip < "$DB_BACKUP" | mysql -u "$DB_USER" -p "$DB_NAME"
else
    gunzip < "$DB_BACKUP" | mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database restored successfully${NC}"
else
    echo -e "${RED}✗ Database restore failed!${NC}"
    pm2 start emma-cms
    exit 1
fi

# Restore Uploads
if [ -f "$UPLOADS_BACKUP" ]; then
    echo ""
    echo -e "${YELLOW}Restoring uploads...${NC}"
    
    # Backup current uploads first
    if [ -d "$APP_DIR/uploads" ]; then
        CURRENT_BACKUP="$APP_DIR/uploads_before_restore_$(date +%Y%m%d_%H%M%S)"
        mv "$APP_DIR/uploads" "$CURRENT_BACKUP"
        echo -e "${YELLOW}Current uploads backed up to: $CURRENT_BACKUP${NC}"
    fi
    
    # Extract uploads
    tar -xzf "$UPLOADS_BACKUP" -C "$APP_DIR"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Uploads restored successfully${NC}"
        
        # Set proper permissions
        chmod -R 755 "$APP_DIR/uploads"
        sudo chown -R www-data:www-data "$APP_DIR/uploads" 2>/dev/null
    else
        echo -e "${RED}✗ Uploads restore failed!${NC}"
    fi
fi

# Restart the application
echo ""
echo -e "${YELLOW}Starting application...${NC}"
pm2 start emma-cms
echo -e "${GREEN}✓ Application started${NC}"

# Check status
echo ""
pm2 status emma-cms

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Restore completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Restored from backup: $BACKUP_DATE"
echo ""

exit 0

