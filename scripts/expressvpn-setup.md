
# ExpressVPN Setup for GitHub Actions
This guide explains how to install, activate, and connect ExpressVPN inside a GitHub Actions runner.  
It also includes troubleshooting steps to handle cases where the ExpressVPN CLI fails to install or activate.

---

## 🚀 1. Why VPN Is Needed
Our QA automation requires traffic to originate from a **UK IP address**.  
To ensure consistent test behavior, we connect to ExpressVPN during CI execution.

---

## 📦 2. Installing ExpressVPN CLI (Reliable Method)

We use the official ExpressVPN Debian repository instead of installing a `.deb` file manually, as the download URLs frequently change.

Add this installation block to your GitHub workflow:

```yaml
- name: Install ExpressVPN CLI (official repo)
  run: |
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gpg

    curl -o expressvpn_public_key.asc https://www.expressvpn.works/keys/public_key_2022.asc
    gpg --dearmor expressvpn_public_key.asc
    sudo install -o root -g root -m 644 expressvpn_public_key.asc.gpg /usr/share/keyrings/expressvpn_keyring.gpg

    echo "deb [signed-by=/usr/share/keyrings/expressvpn_keyring.gpg] https://www.expressvpn.works/debian stable main" | sudo tee /etc/apt/sources.list.d/expressvpn.list

    sudo apt-get update
    sudo apt-get install -y expressvpn
