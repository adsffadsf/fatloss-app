# 减脂系统（本地网页，无登录）

## 运行

在项目根目录下执行：

```powershell
cd fatloss_app
python -m http.server 5173
```

然后用浏览器打开：

- `http://localhost:5173`

## 在 iPhone 上“安装”（PWA）

### 方式 A：部署到 HTTPS（推荐）
把 `fatloss_app/` 当作纯静态站点部署到任意支持 HTTPS 的静态托管（例如 GitHub Pages / Netlify / Vercel / Cloudflare Pages）。  
然后在 iPhone **Safari** 打开你的站点：

- 点击底部 **分享** → **添加到主屏幕**

这样会以“App”形式启动（无浏览器地址栏），并支持离线缓存（首次打开后生效）。

### 方式 B：局域网临时使用（不保证离线）
如果只想在同一 Wi-Fi 下临时给 iPhone 用：

1. Windows 电脑运行 `python -m http.server 5173`
2. iPhone Safari 打开 `http://<电脑IP>:5173`
3. 分享 → 添加到主屏幕

说明：iOS 的离线缓存/Service Worker 对 **HTTPS** 更友好；局域网 HTTP 场景可能无法离线。

## 功能

- 记录身高/体重/性别（可选：年龄、活动水平）
- 计算 BMI（中国/WHO 两套阈值可切换）
- 估算 BMR/TDEE（信息不足时给保守估算并提示补全）
- 生成每日菜单：早餐/午餐/晚餐/加餐（每项克数 + 热量 + 汇总）
- 支持“换一份”、复制文本、导出 JSON
- 默认勾选“坚果/花生过敏”（生成菜单不包含相关食物）

## 免责声明

本工具提供一般性饮食/减脂建议，不构成医疗诊断。特殊人群（孕期/哺乳期、未成年人、慢病用药、进食障碍史等）请咨询医生/营养师。

