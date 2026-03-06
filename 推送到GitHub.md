# 将减脂系统推送到 GitHub

本机需要先安装 **Git**（若未安装）：  
[https://git-scm.com/download/win](https://git-scm.com/download/win)  
安装后**重新打开**终端（PowerShell 或 CMD）。

---

## 在 PowerShell 中执行（在 `fatloss_app` 目录下）

```powershell
cd c:\Users\User\ai-visibility-diagnostic\fatloss_app

# 若从未初始化过，执行：
git init
git add .
git commit -m "减脂系统：aespa 风格主题 + 赛博风背景与 PWA"

# 设置远程并推送（首次）
git branch -M main
git remote add origin https://github.com/adsffadsf/fatloss-app.git
git push -u origin main --force
```

若之前已经添加过 `origin`，可省略 `git remote add`，直接执行：

```powershell
git add .
git commit -m "减脂系统：aespa 风格主题 + 赛博风背景与 PWA"
git push -u origin main --force
```

---

## 推送时提示需要登录

- **用户名**：填你的 GitHub 用户名（如 `adsffadsf`）
- **密码**：填 **Personal Access Token**，不要填登录密码  
  - 生成 Token：GitHub → 右上角头像 → Settings → Developer settings → Personal access tokens → Generate new token  
  - 勾选 `repo` 权限后生成，复制 Token 粘贴到终端

推送成功后，在浏览器打开：  
[https://github.com/adsffadsf/fatloss-app](https://github.com/adsffadsf/fatloss-app)  
即可看到最新代码。
