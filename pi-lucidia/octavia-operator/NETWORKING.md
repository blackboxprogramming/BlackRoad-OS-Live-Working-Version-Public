# NETWORKING.md - Network Configuration Guide

> **BlackRoad OS** - Your AI. Your Hardware. Your Rules.
>
> Secure, scalable networking for distributed AI infrastructure.

---

## Table of Contents

1. [Overview](#overview)
2. [Network Topology](#network-topology)
3. [Service Mesh](#service-mesh)
4. [Load Balancing](#load-balancing)
5. [DNS Configuration](#dns-configuration)
6. [Firewall Rules](#firewall-rules)
7. [TLS/SSL](#tlsssl)
8. [VPN & Tunnels](#vpn--tunnels)
9. [Edge Networking](#edge-networking)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### Network Requirements

| Component | Ports | Protocol | Notes |
|-----------|-------|----------|-------|
| API Gateway | 443 | HTTPS | Public |
| WebSocket | 443 | WSS | Public |
| Agent Mesh | 7946 | TCP/UDP | Internal |
| Redis | 6379 | TCP | Internal |
| PostgreSQL | 5432 | TCP | Internal |
| Ollama | 11434 | HTTP | Internal |
| Prometheus | 9090 | HTTP | Internal |

### Network Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BlackRoad Network Architecture                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INTERNET                                                        │
│      │                                                           │
│      ▼                                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    CDN / Edge                             │   │
│  │              Cloudflare (16 zones)                        │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │                   Load Balancer                           │   │
│  │           (nginx / HAProxy / Cloudflare LB)              │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │                    API Gateway                            │   │
│  │              Auth │ Rate Limit │ Routing                 │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │                   Service Mesh                            │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │   │
│  │  │ Agent   │  │ Memory  │  │ Task    │  │ Monitor │     │   │
│  │  │ Service │  │ Service │  │ Service │  │ Service │     │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼───────────────────────────────┐   │
│  │                    Data Layer                             │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │   │
│  │  │ Redis   │  │Postgres │  │Pinecone │  │   R2    │     │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Network Topology

### Multi-Region Setup

```yaml
# config/network.yaml
regions:
  us-west:
    vpc_cidr: 10.0.0.0/16
    subnets:
      public:
        - 10.0.1.0/24
        - 10.0.2.0/24
      private:
        - 10.0.10.0/24
        - 10.0.11.0/24
      database:
        - 10.0.20.0/24
    availability_zones:
      - us-west-2a
      - us-west-2b

  eu-west:
    vpc_cidr: 10.1.0.0/16
    subnets:
      public:
        - 10.1.1.0/24
        - 10.1.2.0/24
      private:
        - 10.1.10.0/24
        - 10.1.11.0/24

  edge-home:
    network: 192.168.4.0/24
    nodes:
      lucidia: 192.168.4.38
      blackroad-pi: 192.168.4.64
      lucidia-alt: 192.168.4.99
```

### VPC Peering

```python
# blackroad/network/peering.py
from dataclasses import dataclass
from typing import List

@dataclass
class VPCPeering:
    """VPC peering connection."""
    id: str
    source_vpc: str
    target_vpc: str
    source_cidr: str
    target_cidr: str
    status: str

class NetworkManager:
    """Manage network peering and routing."""

    def __init__(self, cloud_provider):
        self.provider = cloud_provider

    async def create_peering(
        self,
        source_vpc: str,
        target_vpc: str
    ) -> VPCPeering:
        """Create VPC peering connection."""
        peering = await self.provider.create_vpc_peering(
            source_vpc=source_vpc,
            target_vpc=target_vpc
        )

        # Update route tables
        await self.update_routes(peering)

        return peering

    async def update_routes(self, peering: VPCPeering):
        """Update route tables for peering."""
        # Add route in source VPC
        await self.provider.add_route(
            vpc=peering.source_vpc,
            destination=peering.target_cidr,
            target=peering.id
        )

        # Add route in target VPC
        await self.provider.add_route(
            vpc=peering.target_vpc,
            destination=peering.source_cidr,
            target=peering.id
        )
```

---

## Service Mesh

### Mesh Configuration

```yaml
# config/mesh.yaml
mesh:
  name: blackroad-mesh
  protocol: grpc

  services:
    - name: agent-service
      port: 8080
      health_check: /health
      load_balancing: round_robin

    - name: memory-service
      port: 8081
      health_check: /health
      load_balancing: least_connections

    - name: task-service
      port: 8082
      health_check: /health
      load_balancing: round_robin

  mtls:
    enabled: true
    cert_rotation: 24h

  traffic_policy:
    connection_pool:
      tcp:
        max_connections: 1000
      http:
        h2_upgrade_policy: UPGRADE
        max_requests_per_connection: 100

    retry:
      attempts: 3
      per_try_timeout: 5s
      retry_on: "5xx,reset,connect-failure"
```

### Service Discovery

```python
# blackroad/network/discovery.py
import consul
from typing import List, Optional
from dataclasses import dataclass

@dataclass
class ServiceInstance:
    """Service instance info."""
    id: str
    name: str
    address: str
    port: int
    tags: List[str]
    healthy: bool

class ServiceDiscovery:
    """Consul-based service discovery."""

    def __init__(self, consul_host: str = "localhost"):
        self.consul = consul.Consul(host=consul_host)

    def register(
        self,
        name: str,
        address: str,
        port: int,
        tags: List[str] = None,
        health_check: str = None
    ) -> str:
        """Register service instance."""
        service_id = f"{name}-{address}-{port}"

        check = None
        if health_check:
            check = consul.Check.http(
                f"http://{address}:{port}{health_check}",
                interval="10s",
                timeout="5s"
            )

        self.consul.agent.service.register(
            name=name,
            service_id=service_id,
            address=address,
            port=port,
            tags=tags or [],
            check=check
        )

        return service_id

    def deregister(self, service_id: str):
        """Deregister service instance."""
        self.consul.agent.service.deregister(service_id)

    def discover(self, name: str, healthy_only: bool = True) -> List[ServiceInstance]:
        """Discover service instances."""
        _, services = self.consul.health.service(name, passing=healthy_only)

        return [
            ServiceInstance(
                id=svc["Service"]["ID"],
                name=svc["Service"]["Service"],
                address=svc["Service"]["Address"],
                port=svc["Service"]["Port"],
                tags=svc["Service"]["Tags"],
                healthy=all(c["Status"] == "passing" for c in svc["Checks"])
            )
            for svc in services
        ]

    def get_address(self, name: str) -> Optional[str]:
        """Get single healthy service address."""
        instances = self.discover(name, healthy_only=True)
        if instances:
            inst = instances[0]
            return f"{inst.address}:{inst.port}"
        return None
```

---

## Load Balancing

### nginx Configuration

```nginx
# /etc/nginx/nginx.conf

upstream blackroad_api {
    least_conn;

    server 10.0.10.1:8080 weight=5;
    server 10.0.10.2:8080 weight=5;
    server 10.0.10.3:8080 weight=5;

    keepalive 32;
}

upstream blackroad_websocket {
    ip_hash;  # Sticky sessions for WebSocket

    server 10.0.10.1:8081;
    server 10.0.10.2:8081;
    server 10.0.10.3:8081;
}

server {
    listen 443 ssl http2;
    server_name api.blackroad.io;

    ssl_certificate /etc/ssl/blackroad.crt;
    ssl_certificate_key /etc/ssl/blackroad.key;

    # API routes
    location /api/ {
        proxy_pass http://blackroad_api;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # Timeouts
        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;
        proxy_read_timeout 300s;
    }

    # WebSocket routes
    location /ws/ {
        proxy_pass http://blackroad_websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;

        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

### HAProxy Configuration

```haproxy
# /etc/haproxy/haproxy.cfg

global
    maxconn 50000
    log stdout format raw local0

defaults
    mode http
    timeout connect 5s
    timeout client 50s
    timeout server 50s

frontend http_front
    bind *:443 ssl crt /etc/ssl/blackroad.pem
    default_backend api_servers

    # Route based on path
    acl is_websocket hdr(Upgrade) -i websocket
    acl is_api path_beg /api

    use_backend websocket_servers if is_websocket
    use_backend api_servers if is_api

backend api_servers
    balance leastconn
    option httpchk GET /health

    server api1 10.0.10.1:8080 check weight 100
    server api2 10.0.10.2:8080 check weight 100
    server api3 10.0.10.3:8080 check weight 100

backend websocket_servers
    balance source  # Sticky sessions
    option httpchk GET /health

    server ws1 10.0.10.1:8081 check
    server ws2 10.0.10.2:8081 check
    server ws3 10.0.10.3:8081 check
```

---

## DNS Configuration

### Cloudflare DNS

```yaml
# dns/cloudflare.yaml
zones:
  blackroad.io:
    records:
      # API endpoint
      - name: api
        type: A
        proxied: true
        content: 104.21.x.x  # Cloudflare proxy

      # WebSocket (needs direct connection)
      - name: ws
        type: A
        proxied: false
        content: 159.65.43.12

      # Edge devices
      - name: lucidia
        type: A
        proxied: false
        content: 192.168.4.38

      # Mail
      - name: "@"
        type: MX
        priority: 10
        content: mail.blackroad.io

      # SPF
      - name: "@"
        type: TXT
        content: "v=spf1 include:_spf.google.com ~all"
```

### Internal DNS

```yaml
# dns/internal.yaml
zones:
  blackroad.internal:
    records:
      # Services
      - name: redis
        type: A
        content: 10.0.10.50

      - name: postgres
        type: A
        content: 10.0.20.10

      - name: vault
        type: A
        content: 10.0.10.100

      # Service discovery CNAMEs
      - name: agent-service
        type: CNAME
        content: agent-service.consul

      - name: memory-service
        type: CNAME
        content: memory-service.consul
```

---

## Firewall Rules

### Security Groups

```yaml
# security/firewall.yaml
security_groups:
  # Public-facing services
  public:
    ingress:
      - port: 443
        protocol: tcp
        source: 0.0.0.0/0
        description: HTTPS

      - port: 80
        protocol: tcp
        source: 0.0.0.0/0
        description: HTTP (redirect to HTTPS)

    egress:
      - port: all
        protocol: all
        destination: 0.0.0.0/0

  # Internal services
  internal:
    ingress:
      - port: 8080-8090
        protocol: tcp
        source: 10.0.0.0/8
        description: Internal services

      - port: 7946
        protocol: tcp
        source: 10.0.0.0/8
        description: Mesh gossip

      - port: 7946
        protocol: udp
        source: 10.0.0.0/8
        description: Mesh gossip UDP

    egress:
      - port: all
        protocol: all
        destination: 10.0.0.0/8

  # Database
  database:
    ingress:
      - port: 5432
        protocol: tcp
        source: sg-internal
        description: PostgreSQL

      - port: 6379
        protocol: tcp
        source: sg-internal
        description: Redis
```

### iptables Rules

```bash
#!/bin/bash
# scripts/firewall.sh

# Flush existing rules
iptables -F
iptables -X

# Default policies
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow SSH (rate limited)
iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set
iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 -j DROP
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow HTTPS
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow internal network
iptables -A INPUT -s 10.0.0.0/8 -j ACCEPT
iptables -A INPUT -s 192.168.0.0/16 -j ACCEPT

# Drop everything else
iptables -A INPUT -j DROP

# Save rules
iptables-save > /etc/iptables/rules.v4
```

---

## TLS/SSL

### Certificate Management

```python
# blackroad/network/tls.py
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from datetime import datetime, timedelta

class CertificateManager:
    """Manage TLS certificates."""

    def __init__(self, ca_cert_path: str, ca_key_path: str):
        with open(ca_cert_path, "rb") as f:
            self.ca_cert = x509.load_pem_x509_certificate(f.read())
        with open(ca_key_path, "rb") as f:
            self.ca_key = serialization.load_pem_private_key(f.read(), password=None)

    def issue_certificate(
        self,
        common_name: str,
        san_names: list = None,
        validity_days: int = 365
    ) -> tuple[bytes, bytes]:
        """Issue new certificate."""

        # Generate key
        key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )

        # Build certificate
        subject = x509.Name([
            x509.NameAttribute(NameOID.COMMON_NAME, common_name),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "BlackRoad"),
        ])

        builder = x509.CertificateBuilder()
        builder = builder.subject_name(subject)
        builder = builder.issuer_name(self.ca_cert.subject)
        builder = builder.public_key(key.public_key())
        builder = builder.serial_number(x509.random_serial_number())
        builder = builder.not_valid_before(datetime.utcnow())
        builder = builder.not_valid_after(datetime.utcnow() + timedelta(days=validity_days))

        # Add SANs
        if san_names:
            san_list = [x509.DNSName(name) for name in san_names]
            builder = builder.add_extension(
                x509.SubjectAlternativeName(san_list),
                critical=False
            )

        # Sign
        cert = builder.sign(self.ca_key, hashes.SHA256())

        # Serialize
        cert_pem = cert.public_bytes(serialization.Encoding.PEM)
        key_pem = key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption()
        )

        return cert_pem, key_pem
```

### Let's Encrypt with Certbot

```bash
#!/bin/bash
# scripts/certbot-renew.sh

# Issue certificate
certbot certonly \
    --dns-cloudflare \
    --dns-cloudflare-credentials /etc/cloudflare.ini \
    -d blackroad.io \
    -d "*.blackroad.io" \
    --non-interactive \
    --agree-tos \
    --email admin@blackroad.io

# Deploy to services
cp /etc/letsencrypt/live/blackroad.io/fullchain.pem /etc/ssl/blackroad.crt
cp /etc/letsencrypt/live/blackroad.io/privkey.pem /etc/ssl/blackroad.key

# Reload nginx
systemctl reload nginx
```

---

## VPN & Tunnels

### WireGuard Configuration

```ini
# /etc/wireguard/wg0.conf

[Interface]
PrivateKey = <server-private-key>
Address = 10.200.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT

# Edge device: lucidia
[Peer]
PublicKey = <lucidia-public-key>
AllowedIPs = 10.200.0.10/32, 192.168.4.0/24
PersistentKeepalive = 25

# Edge device: blackroad-pi
[Peer]
PublicKey = <blackroad-pi-public-key>
AllowedIPs = 10.200.0.11/32
PersistentKeepalive = 25
```

### Cloudflare Tunnel

```yaml
# cloudflared/config.yaml
tunnel: blackroad-tunnel
credentials-file: /etc/cloudflared/credentials.json

ingress:
  - hostname: api.blackroad.io
    service: http://localhost:8080

  - hostname: dashboard.blackroad.io
    service: http://localhost:3000

  - hostname: grafana.blackroad.io
    service: http://localhost:3001

  # Catch-all
  - service: http_status:404
```

---

## Edge Networking

### Raspberry Pi Network Setup

```bash
#!/bin/bash
# scripts/pi-network.sh

# Static IP configuration
cat > /etc/dhcpcd.conf << 'EOF'
interface eth0
static ip_address=192.168.4.38/24
static routers=192.168.4.1
static domain_name_servers=1.1.1.1 8.8.8.8
EOF

# Enable IP forwarding
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
sysctl -p

# Setup WireGuard
apt-get install -y wireguard

cat > /etc/wireguard/wg0.conf << 'EOF'
[Interface]
PrivateKey = <pi-private-key>
Address = 10.200.0.10/24

[Peer]
PublicKey = <server-public-key>
Endpoint = vpn.blackroad.io:51820
AllowedIPs = 10.0.0.0/8, 10.200.0.0/24
PersistentKeepalive = 25
EOF

systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0
```

### Home Network Diagram

```
┌──────────────────────────────────────────────────────────┐
│                   Home Network                            │
│                  192.168.4.0/24                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐       │
│  │  Router  │──────│  Switch  │──────│  WiFi AP │       │
│  │ .1       │      │          │      │          │       │
│  └──────────┘      └────┬─────┘      └──────────┘       │
│                         │                                │
│        ┌────────────────┼────────────────┐              │
│        │                │                │              │
│   ┌────▼────┐      ┌────▼────┐      ┌────▼────┐        │
│   │ lucidia │      │blackroad│      │ lucidia │        │
│   │   -pi   │      │   -pi   │      │   -alt  │        │
│   │  .38    │      │  .64    │      │  .99    │        │
│   └─────────┘      └─────────┘      └─────────┘        │
│                                                          │
│   WireGuard VPN ─────────────────────────────────▶ Cloud│
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Network Diagnostics

```bash
# Test connectivity
ping -c 4 api.blackroad.io

# DNS resolution
dig api.blackroad.io
nslookup api.blackroad.io

# Port connectivity
nc -zv api.blackroad.io 443
telnet api.blackroad.io 443

# SSL certificate check
openssl s_client -connect api.blackroad.io:443 -servername api.blackroad.io

# Trace route
traceroute api.blackroad.io

# Check listening ports
netstat -tlnp
ss -tlnp

# iptables rules
iptables -L -n -v

# WireGuard status
wg show
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Connection timeout | Firewall blocking | Check security groups |
| DNS not resolving | DNS misconfigured | Verify DNS records |
| SSL error | Certificate expired | Renew certificate |
| WebSocket disconnect | Proxy timeout | Increase proxy timeout |
| High latency | Geographic distance | Use regional endpoints |

---

## Quick Reference

### Important Ports

| Port | Service | Protocol |
|------|---------|----------|
| 22 | SSH | TCP |
| 80 | HTTP | TCP |
| 443 | HTTPS | TCP |
| 5432 | PostgreSQL | TCP |
| 6379 | Redis | TCP |
| 8080 | API | TCP |
| 11434 | Ollama | TCP |
| 51820 | WireGuard | UDP |

### Network Commands

```bash
# View routes
ip route show

# View interfaces
ip addr show

# DNS lookup
dig +short api.blackroad.io

# Test TCP connection
nc -zv host port

# Monitor traffic
tcpdump -i eth0 port 443
```

---

## Related Documentation

- [INFRASTRUCTURE.md](INFRASTRUCTURE.md) - Infrastructure setup
- [SECURITY.md](SECURITY.md) - Security practices
- [FEDERATION.md](FEDERATION.md) - Multi-cluster networking
- [RASPBERRY_PI.md](RASPBERRY_PI.md) - Edge device setup
- [SCALING.md](SCALING.md) - Scaling guide

---

*Your AI. Your Hardware. Your Rules.*
