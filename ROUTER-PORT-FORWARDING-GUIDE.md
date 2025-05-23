# Router Port Forwarding Guide

## Quick Setup Steps

### 1. Run the Setup Script
```bash
cd /home/master/vagrant-labs/my-apps/purpose-planner-app/purpose-planner-services
sudo ./setup-direct-port-forwarding.sh
```

### 2. Get Your Network Information
After running the script, note these values:
- **Your Public IP**: (shown by script)
- **Your Internal IP**: 192.168.254.181
- **Router Gateway**: 192.168.254.1 (typical)

### 3. Router Configuration Steps

#### Step 1: Access Your Router
1. Open web browser
2. Navigate to: `http://192.168.254.1`
3. Login with admin credentials
   - Common defaults: admin/admin, admin/password
   - Check router label for credentials

#### Step 2: Find Port Forwarding Section
Look for one of these menu items:
- **Port Forwarding**
- **Virtual Servers**
- **NAT / PAT**
- **Applications & Gaming**
- **Advanced Settings**

#### Step 3: Create Port Forwarding Rule

##### For HTTP Access (Port 80):
```
┌─────────────────────────────────────────┐
│ Service Name:    Purpose Planner        │
│ Protocol:        TCP                    │
│ External Port:   80                     │
│ Internal IP:     192.168.254.181        │
│ Internal Port:   80                     │
│ Status:          Enabled ✓              │
└─────────────────────────────────────────┘
```

##### For HTTPS Access (Port 443) - Optional:
```
┌─────────────────────────────────────────┐
│ Service Name:    Purpose Planner HTTPS  │
│ Protocol:        TCP                    │
│ External Port:   443                    │
│ Internal IP:     192.168.254.181        │
│ Internal Port:   443                    │
│ Status:          Enabled ✓              │
└─────────────────────────────────────────┘
```

### 4. Router-Specific Instructions

#### Linksys Routers
1. Navigate to: **Apps & Gaming** > **Single Port Forwarding**
2. Fill in:
   - Application Name: `Purpose Planner`
   - External Port: `80`
   - Internal Port: `80`
   - Protocol: `TCP`
   - Device IP: `192.168.254.181`
   - Enabled: `Check`

#### ASUS Routers
1. Navigate to: **WAN** > **Virtual Server / Port Forwarding**
2. Click **Add profile**
3. Fill in:
   - Service Name: `Purpose Planner`
   - Protocol: `TCP`
   - External Port: `80`
   - Internal IP: `192.168.254.181`
   - Internal Port: `80`
   - Source IP: `Leave blank`

#### Netgear Routers
1. Navigate to: **Dynamic DNS** > **Port Forwarding**
2. Click **Add Custom Service**
3. Fill in:
   - Service Name: `Purpose Planner`
   - Protocol: `TCP`
   - Starting Port: `80`
   - Ending Port: `80`
   - Server IP Address: `192.168.254.181`

#### TP-Link Routers
1. Navigate to: **Advanced** > **NAT Forwarding** > **Virtual Servers**
2. Click **Add**
3. Fill in:
   - Service Type: `HTTP`
   - External Port: `80`
   - Internal IP: `192.168.254.181`
   - Internal Port: `80`
   - Protocol: `TCP`
   - Status: `Enabled`

#### D-Link Routers
1. Navigate to: **Advanced** > **Port Forwarding Rules**
2. Fill in:
   - Name: `Purpose Planner`
   - IP Address: `192.168.254.181`
   - TCP: `80`
   - UDP: `Leave blank`
   - Schedule: `Always`

### 5. Save and Test

#### Save Configuration
1. Click **Save** or **Apply**
2. Router may reboot (wait 1-2 minutes)

#### Test External Access
From a device NOT on your local network (e.g., mobile phone on cellular):
```bash
# Test with your public IP
curl http://YOUR_PUBLIC_IP/health

# Or in browser
http://YOUR_PUBLIC_IP
```

### 6. Troubleshooting

#### If External Access Doesn't Work:

1. **Check Firewall on Host Machine**:
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   sudo ufw reload
   ```

2. **Verify nginx is Running**:
   ```bash
   sudo systemctl status nginx
   curl http://localhost/health
   ```

3. **Check ISP Restrictions**:
   - Some ISPs block port 80/443
   - Try alternative ports: 8080, 8443
   - Contact ISP to unblock ports

4. **Double-Check Router Settings**:
   - Ensure rule is enabled
   - Verify internal IP is correct
   - Check if router needs reboot

5. **Test Port Forwarding**:
   Use online tools like:
   - https://canyouseeme.org/
   - https://www.portchecker.co/
   - Enter your public IP and port 80

### 7. Security Recommendations

1. **Add SSL Certificate** (after domain setup):
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

2. **Set Up Basic Authentication**:
   ```bash
   sudo apt-get install apache2-utils
   sudo htpasswd -c /etc/nginx/.htpasswd admin
   ```

3. **Add to nginx config**:
   ```nginx
   location / {
       auth_basic "Restricted Access";
       auth_basic_user_file /etc/nginx/.htpasswd;
       proxy_pass http://192.168.100.10:30000;
   }
   ```

### 8. Domain Setup (Optional)

1. Purchase domain from registrar
2. Point A record to your public IP
3. Update nginx server_name:
   ```bash
   sudo nano /etc/nginx/sites-available/purpose-planner-direct
   # Change server_name _; to server_name yourdomain.com;
   sudo nginx -s reload
   ```

### 9. Dynamic DNS (If No Static IP)

If your ISP changes your public IP:

1. Sign up for Dynamic DNS service:
   - No-IP (free)
   - DuckDNS (free)
   - DynDNS

2. Configure in router's DDNS section
3. Use DDNS hostname instead of IP

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Connection refused | Check nginx is running: `sudo systemctl start nginx` |
| Timeout | Check firewall and router settings |
| 404 Not Found | Verify nginx proxy_pass configuration |
| ISP blocking | Use alternative ports (8080, 8443) |
| Dynamic IP | Set up Dynamic DNS service |

### Final Testing

Once configured, test from multiple sources:

1. **Internal Network**:
   ```bash
   curl http://192.168.254.181/health
   ```

2. **External Network** (mobile data):
   ```bash
   curl http://YOUR_PUBLIC_IP/health
   ```

3. **Web Browser**:
   - Internal: http://192.168.254.181
   - External: http://YOUR_PUBLIC_IP

Your Purpose Planner application is now accessible from anywhere on the internet!