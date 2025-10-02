# 🔧 Scripts Directory

This directory contains utility scripts for the WAGMI Crypto Manager project.

---

## 📜 **Available Scripts**

### **`apply_dark_theme.sh`**
Applies dark theme styling to the application.

**Usage:**
```bash
./scripts/apply_dark_theme.sh
```

---

### **`setup-github.sh`**
Sets up GitHub repository configuration and secrets.

**Usage:**
```bash
./scripts/setup-github.sh
```

**Prerequisites:**
- GitHub CLI installed
- Repository access
- Required environment variables

---

### **`google-sheets-api.gs`**
Google Apps Script for Google Sheets integration.

**Usage:**
1. Open your Google Sheet
2. Go to Extensions > Apps Script
3. Copy the contents of this file
4. Deploy as a web app

**Documentation:**
See [Google Sheets Setup Guide](../docs/guides/GOOGLE-SHEETS-SETUP.md) for detailed instructions.

---

## 🚀 **Running Scripts**

### **Make Scripts Executable**
```bash
chmod +x scripts/*.sh
```

### **Execute a Script**
```bash
./scripts/script-name.sh
```

---

## 📝 **Adding New Scripts**

When adding a new script:
1. Place it in this directory
2. Add documentation to this README
3. Make it executable (`chmod +x`)
4. Follow naming conventions (`kebab-case.sh`)
5. Include error handling
6. Add usage examples

---

## 🔒 **Security**

- Never commit API keys or secrets in scripts
- Use environment variables for sensitive data
- Add `.env` files to `.gitignore`
- Review scripts before execution

---

**Last Updated**: October 2, 2025

