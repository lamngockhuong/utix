# Enterprise Deployment

Advanced deployment scenarios for enterprise environments.

## Automated Deployment with Ansible

```yaml
---
- name: Deploy Utilux
  hosts: all
  become: yes
  tasks:
    - name: Install dependencies
      package:
        name: [curl, bash, jq]
        state: present

    - name: Download Utilux installer
      get_url:
        url: https://raw.githubusercontent.com/lamngockhuong/utilux/main/install.sh
        dest: /tmp/utilux-install.sh
        mode: "0755"

    - name: Install Utilux
      command: /tmp/utilux-install.sh
      args:
        creates: /usr/local/bin/utilux

    - name: Verify installation
      command: utilux version
      register: version_output

    - name: Display version
      debug:
        var: version_output.stdout
```

## Configuration Management

**System-wide Configuration** (`/etc/profile.d/utilux.sh`):

```bash
export UTILUX_LOG_LEVEL="warn"
export UTILUX_CACHE_DIR="/var/cache/utilux"
export UTILUX_REGISTRY_URL="https://internal-registry.company.com/manifest.json"
```

**Shared Cache**:

```bash
sudo mkdir -p /var/cache/utilux
sudo chmod 1777 /var/cache/utilux  # Sticky bit for multi-user
echo 'export UTILUX_CACHE_DIR="/var/cache/utilux"' | sudo tee /etc/profile.d/utilux.sh
```

## Custom Registry Deployment

**Setup Internal Registry**:

```bash
git clone https://github.com/lamngockhuong/utilux.git
cd utilux

# Customize registry
# Edit registry/manifest.json
# Add custom scripts to registry/

# Host on internal server
cd registry && python3 -m http.server 8080

# Or via Nginx
sudo cp -r registry /var/www/html/utilux-registry
```

**Configure Clients**:

```bash
export UTILUX_REGISTRY_URL="https://internal.company.com/utilux-registry/manifest.json"
```

## Air-Gapped Deployment

**Step 1: Prepare Package (Online Machine)**:

```bash
VERSION="1.0.0"
wget https://github.com/lamngockhuong/utilux/releases/download/v${VERSION}/utilux-${VERSION}.tar.gz

git clone --depth 1 https://github.com/lamngockhuong/utilux.git
cd utilux

# Pre-cache all scripts
for script in registry/*/*.sh; do
  script_name=$(basename "$script" .sh)
  ./utilux run "$script_name" --help || true
done

tar -czf utilux-airgapped-${VERSION}.tar.gz utilux-${VERSION}.tar.gz ~/.utilux/
```

**Step 2: Deploy (Offline Machine)**:

```bash
tar -xzf utilux-airgapped-1.0.0.tar.gz
tar -xzf utilux-1.0.0.tar.gz && cd utilux-1.0.0
sudo ./install.sh

cp -r .utilux ~/
export UTILUX_OFFLINE=1
utilux list
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM ubuntu:22.04

RUN apt-get update && \
    apt-get install -y curl bash jq && \
    rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://raw.githubusercontent.com/lamngockhuong/utilux/main/install.sh | bash

WORKDIR /workspace
CMD ["utilux", "list"]
```

### Docker Compose

```yaml
version: "3.8"

services:
  utilux:
    image: utilux:latest
    environment:
      - UTILUX_LOG_LEVEL=info
      - UTILUX_CACHE_DIR=/cache
    volumes:
      - utilux-cache:/cache
      - ./scripts:/workspace

volumes:
  utilux-cache:
```

**Build and Run**:

```bash
docker build -t utilux:latest .
docker run -it utilux:latest bash
docker run utilux:latest utilux run system-info
```

## Troubleshooting

### Common Issues

**Command Not Found**:

```bash
# Check if installed
ls -la /usr/local/bin/utilux

# Add to PATH
export PATH="/usr/local/bin:$PATH"
```

**Permission Denied**:

```bash
sudo chmod +x /usr/local/bin/utilux
```

**Bash Version Too Old**:

```bash
bash --version
sudo apt update && sudo apt install --only-upgrade bash

# Or use Go CLI
utilux-go list
```

**Cannot Download Scripts**:

```bash
curl -I https://raw.githubusercontent.com
echo $https_proxy

# Try offline mode
export UTILUX_OFFLINE=1
utilux list
```

**SHA256 Mismatch**:

```bash
utilux cache clear script-name
utilux run script-name
```

**Script Fails to Execute**:

```bash
UTILUX_LOG_LEVEL=debug utilux run script-name
utilux info script-name  # Check @requires field
```

### Debug Mode

```bash
UTILUX_LOG_LEVEL=debug utilux run script-name 2>&1 | tee debug.log
bash -x /usr/local/bin/utilux run script-name
utilux-go --verbose run script-name
```

### Getting Help

```bash
utilux help
utilux run --help

# Include in bug report
utilux version
bash --version
uname -a
```

## Security Considerations

### Verification Best Practices

```bash
# Download and inspect before installation
curl -fsSL https://raw.githubusercontent.com/lamngockhuong/utilux/main/install.sh > install.sh
less install.sh
sudo bash install.sh
```

### Secure Configuration

```bash
chmod 700 ~/.utilux
chmod 700 ~/.utilux/cache

# Run scripts as non-root
utilux run system-info

# Only use sudo when necessary
sudo utilux run disk-cleanup
```

## Performance Tuning

### Cache Optimization

```bash
# Pre-cache frequently used scripts
for script in docker-prune git-clean system-info; do
  utilux run "$script" --help &
done
wait

# Multi-user shared cache
export UTILUX_CACHE_DIR="/shared/utilux-cache"
```

### Network Optimization

```bash
export UTILUX_REGISTRY_URL="https://cdn.company.com/utilux/manifest.json"
export UTILUX_HTTP_TIMEOUT=60
```

## Related Documentation

- [Deployment Guide](./deployment-guide.md)
- [System Architecture](./system-architecture.md)
- [Code Standards](./code-standards.md)
