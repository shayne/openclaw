---
name: proxmox
description: Control Proxmox VE via API tokens (list nodes/VMs, power on/off, status).
---

# Proxmox Skill

Use Proxmox VE HTTPS API with a token.

## Env vars

```
PROXMOX_HOST=https://10.0.4.2:8006
PROXMOX_TOKEN_ID=root@pam!mate
PROXMOX_TOKEN_SECRET=...  # token secret
```

## Quick test (API version)

```bash
curl -sk "$PROXMOX_HOST/api2/json/version" \
  -H "Authorization: PVEAPIToken=$PROXMOX_TOKEN_ID=$PROXMOX_TOKEN_SECRET"
```

## List nodes

```bash
curl -sk "$PROXMOX_HOST/api2/json/nodes" \
  -H "Authorization: PVEAPIToken=$PROXMOX_TOKEN_ID=$PROXMOX_TOKEN_SECRET"
```
