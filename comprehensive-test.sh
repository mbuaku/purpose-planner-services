#!/bin/bash

echo "Comprehensive Network and Service Test"
echo "====================================="
echo ""

# Function to print section headers
print_section() {
    echo ""
    echo "--- $1 ---"
}

# Get system info
print_section "System Information"
echo "Hostname: $(hostname)"
echo "Date: $(date)"
echo ""

# Test 1: Check network interfaces
print_section "Network Interfaces"
ip addr show | grep -E "inet |state UP" | grep -v "127.0.0.1"

# Test 2: Check what's listening on ports
print_section "Listening Ports"
sudo netstat -tlnp | grep -E ":80|:443|:8080|:9090|:30000" || echo "No relevant ports listening"

# Test 3: Test Kubernetes service directly
print_section "Direct Kubernetes Service Test"
echo "Testing 192.168.100.10:30000..."
if curl -s --connect-timeout 5 http://192.168.100.10:30000/health; then
    echo -e "\n✓ Kubernetes service is accessible"
else
    echo -e "\n✗ Kubernetes service is NOT accessible"
fi

# Test 4: Check nginx status
print_section "Nginx Status"
sudo systemctl status nginx --no-pager | grep -E "Active:|Main PID:" || echo "Nginx not running"

# Test 5: Check nginx configuration
print_section "Nginx Configuration"
sudo nginx -t 2>&1
echo ""
echo "Enabled sites:"
ls -la /etc/nginx/sites-enabled/

# Test 6: Test localhost access
print_section "Localhost Tests"
echo "Testing http://localhost..."
curl -s --connect-timeout 5 http://localhost/health || echo "Failed: localhost"
echo ""
echo "Testing http://127.0.0.1..."
curl -s --connect-timeout 5 http://127.0.0.1/health || echo "Failed: 127.0.0.1"
echo ""
echo "Testing http://192.168.254.181..."
curl -s --connect-timeout 5 http://192.168.254.181/health || echo "Failed: 192.168.254.181"

# Test 7: Check for nginx errors
print_section "Nginx Error Logs"
sudo tail -n 10 /var/log/nginx/error.log

# Test 8: Check processes
print_section "Running Processes"
ps aux | grep -E "nginx|socat|kubectl|docker" | grep -v grep

# Test 9: Firewall status
print_section "Firewall Status"
sudo ufw status | grep -E "80|443|8080|9090|30000"

# Test 10: Port availability
print_section "Port Availability"
for port in 80 443 8080 9090; do
    echo -n "Port $port: "
    if sudo lsof -i :$port >/dev/null 2>&1; then
        echo "IN USE by $(sudo lsof -i :$port | grep LISTEN | awk '{print $1}')"
    else
        echo "AVAILABLE"
    fi
done

# Test 11: Routing
print_section "Routing Information"
echo "Default route:"
ip route | grep default
echo ""
echo "IP forwarding:"
cat /proc/sys/net/ipv4/ip_forward

# Test 12: DNS resolution
print_section "DNS Resolution"
echo "Resolving localhost:"
host localhost
echo "Resolving Kubernetes service IP:"
host 192.168.100.10

# Test 13: Kubernetes connectivity from host
print_section "Kubernetes Connectivity"
echo "Can we reach the Kubernetes network?"
ping -c 2 192.168.100.10 || echo "Cannot ping Kubernetes network"

# Summary
print_section "SUMMARY"
echo "1. Kubernetes service status: $(curl -s http://192.168.100.10:30000/health >/dev/null 2>&1 && echo "UP" || echo "DOWN")"
echo "2. Nginx status: $(systemctl is-active nginx)"
echo "3. Port 80 status: $(sudo lsof -i :80 >/dev/null 2>&1 && echo "IN USE" || echo "AVAILABLE")"
echo "4. Firewall port 80: $(sudo ufw status | grep -q "80/tcp" && echo "ALLOWED" || echo "NOT CONFIGURED")"
echo "5. Local access works: $(curl -s http://localhost/health 2>/dev/null | grep -q "healthy" && echo "YES" || echo "NO")"

echo ""
echo "Test complete. Check results above for issues."