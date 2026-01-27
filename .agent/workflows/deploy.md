---
description: How to deploy local changes to the live Render site
---

Follow these steps whenever you make changes in your local code and want them to appear on your live website:

### 1. Open your terminal
Make sure you are in the root directory of your project: `c:\Users\USER\Pictures\My Website - Test v1\ecommerce-fullstack`

### 2. Stage your changes
Add the files you've changed to the staging area:
```powershell
git add .
```
*(You can also add specific files, e.g., `git add frontend/src/pages/Home.js`)*

### 3. Commit your changes
Create a "save point" with a descriptive message:
```powershell
git commit -m "Describe what you changed here"
```

### 4. Pull latest changes (Safety Step)
It's good practice to pull any changes from GitHub first to avoid conflicts:
```powershell
git pull origin main
```

### 5. Push to GitHub
Send your local changes to your online repository:
```powershell
git push origin main
```

### 6. Wait for Render
Once pushed, Render will automatically detect the new code and start a "Deploy". This usually takes **2-3 minutes**. You can monitor progress on your Render Dashboard.

---

// turbo
### Quick Update Command
If you want to do it all in one go, you can run:
```powershell
git add . ; git commit -m "Update" ; git push origin main
```
