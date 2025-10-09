#!/bin/bash

# Emma CMS - GoDaddy Deployment Script
# This script helps automate the deployment process on GoDaddy VPS/Dedicated servers

set -e  # Exit on any error

echo "=========================================="
echo "Emma CMS - GoDaddy Deployment Automation"
echo "=========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running on server
if [ -z "$1" ]; then
    print_error "Please specify deployment mode: setup or update"
    echo "Usage: ./deploy-godaddy.sh [setup|update]"
    exit 1
fi

MODE=$1

# Configuration
APP_NAME="emma-cms"
APP_DIR="/var/www/emmabykodefast"
NODE_VERSION="18"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Setup Mode - Initial deployment
if [ "$MODE" = "setup" ]; then
    echo "Starting initial setup..."
    echo ""

    # Check Node.js
    if command_exists node; then
        NODE_VER=$(node --version)
        print_success "Node.js is installed: $NODE_VER"
    else
        print_warning "Node.js not found. Installing Node.js $NODE_VERSION..."
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
        sudo apt-get install -y nodejs
        print_success "Node.js installed successfully"
    fi

    # Check npm
    if command_exists npm; then
        NPM_VER=$(npm --version)
        print_success "npm is installed: $NPM_VER"
    fi

    # Install PM2
    if command_exists pm2; then
        print_success "PM2 is already installed"
    else
        print_warning "Installing PM2..."
        sudo npm install -g pm2
        print_success "PM2 installed successfully"
    fi

    # Create application directory
    print_warning "Creating application directory at $APP_DIR..."
    sudo mkdir -p $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
    print_success "Directory created"

    # Install dependencies
    print_warning "Installing Node.js dependencies..."
    cd $APP_DIR
    npm install --production
    print_success "Dependencies installed"

    # Create upload directories
    print_warning "Creating upload directories..."
    mkdir -p uploads/blogs
    mkdir -p uploads/resources
    mkdir -p uploads/casestudies
    mkdir -p uploads/usecases
    mkdir -p uploads/logo
    chmod -R 755 uploads
    print_success "Upload directories created"

    # Check if config.env exists
    if [ ! -f "config.env" ]; then
        print_error "config.env not found! Please create it from config.env.production template"
        exit 1
    fi
    print_success "config.env found"

    # Database setup reminder
    echo ""
    print_warning "=== DATABASE SETUP REQUIRED ==="
    echo "Please ensure you have:"
    echo "1. Created MySQL database: emma_resources_cms"
    echo "2. Created MySQL user with appropriate privileges"
    echo "3. Updated config.env with database credentials"
    echo "4. Imported schema: mysql -u user -p database < cms/database/cms-resources-schema.sql"
    echo ""
    read -p "Have you completed database setup? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Please complete database setup before continuing"
        exit 1
    fi

    # Start application with PM2
    print_warning "Starting application with PM2..."
    pm2 start server.js --name "$APP_NAME"
    pm2 save
    print_success "Application started"

    # Setup PM2 startup script
    print_warning "Configuring PM2 to start on boot..."
    pm2 startup systemd -u $USER --hp $HOME
    print_success "PM2 startup configured"

    # Check Nginx
    if command_exists nginx; then
        print_success "Nginx is installed"
        print_warning "Please configure Nginx reverse proxy manually (see GODADDY-DEPLOYMENT-GUIDE.md)"
    else
        print_warning "Nginx not found. Install it to use as reverse proxy"
    fi

    echo ""
    print_success "=========================================="
    print_success "Initial setup completed successfully!"
    print_success "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Configure Nginx reverse proxy"
    echo "2. Setup SSL certificate with Certbot"
    echo "3. Access your CMS at: http://your-domain.com/cms/admin/"
    echo "4. Change default admin password"
    echo ""
    echo "View logs with: pm2 logs $APP_NAME"
    echo "Check status with: pm2 status"
    echo ""

# Update Mode - Update existing deployment
elif [ "$MODE" = "update" ]; then
    echo "Starting update process..."
    echo ""

    cd $APP_DIR

    # Pull latest changes (if using git)
    if [ -d ".git" ]; then
        print_warning "Pulling latest changes from git..."
        git pull origin main
        print_success "Code updated"
    else
        print_warning "Not a git repository. Please upload files manually"
    fi

    # Install/update dependencies
    print_warning "Updating dependencies..."
    npm install --production
    print_success "Dependencies updated"

    # Restart PM2 application
    print_warning "Restarting application..."
    pm2 restart $APP_NAME
    print_success "Application restarted"

    # Check status
    pm2 status

    echo ""
    print_success "=========================================="
    print_success "Update completed successfully!"
    print_success "=========================================="
    echo ""
    echo "View logs with: pm2 logs $APP_NAME"
    echo ""

else
    print_error "Invalid mode. Use 'setup' or 'update'"
    exit 1
fi

