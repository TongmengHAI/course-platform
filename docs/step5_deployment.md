# 🚀 Production Cloud Deployment Guide — Frontend Deployment

A step-by-step administrator guide for building, configuring, and hosting the **Online Course Platform UI** (React + Ant Design) for production.

> **Stack**: React 19 · Vite · Tailwind CSS
> **Hosting Choices**: Managed CDN Platforms (Vercel / Netlify) OR Manual VPS Virtual Machines (Nginx static folder hosting)

---

## 📚 Table of Contents

1. [Understanding Production Builds](#1-understanding-production-builds)
2. [Step 1 — Configuring Production Environment Variables](#step-1---configuring-production-environment-variables)
3. [Step 2 — Compiling the Static Distributable Bundle](#step-2---compiling-the-static-distributable-bundle)
4. [Step 3 — Deploying to Managed Services (Vercel / Netlify)](#step-3---deploying-to-managed-services-vercel--netlify)
5. [Step 4 — Manual VPS Static Hosting with Nginx](#step-4---manual-vps-static-hosting-with-nginx)
6. [Common Build Failures & Fixes](#common-build-failures--fixes)

---

## 1. Understanding Production Builds

Unlike development mode, which runs a hot-reloading dev server (Vite), production environments require a **compiled static distributable bundle** (plain HTML, minified JS, and optimized CSS).
- **No Node process needed at runtime**: Once compiled, the frontend runs completely inside the visitor's browser. It can be hosted on high-performance static CDNs.
- **Environment Variables**: API endpoints must be resolved at compilation time (e.g., swapping `localhost:5000` with the production server API endpoint `api.yourdomain.com`).

---

## Step 1 — Configuring Production Environment Variables

1. Create a production environment settings file in the project root:
   ```bash
   nano .env.production
   ```
2. Insert your deployed cloud backend domain URL:
   ```env
   VITE_API_URL=https://api.yourdomain.com
   ```
   *Vite automatically loads `.env.production` during the build compilation process.*

---

## Step 2 — Compiling the Static Distributable Bundle

Execute the build script to compile the frontend assets:
```bash
npm run build
```
This generates a `dist/` directory containing all optimized assets:
```
dist/
├── index.html        # Main Entry Document
└── assets/           # Minified Javascript & Stylesheet files
```

---

## Step 3 — Deploying to Managed Services (Vercel / Netlify)

Hosting on Vercel or Netlify is the recommended option for frontend deployments as they handle SSL, DNS routing, and global CDN caching automatically.

### 3.1 Vercel Deployment
1. Log in or create an account at [vercel.com](https://vercel.com).
2. Connect your Git repository.
3. Configure Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: `https://api.yourdomain.com`
5. Click **Deploy**.

### 3.2 Netlify Deployment
1. Log in or create an account at [netlify.com](https://netlify.com).
2. Connect your Git repository and choose build command settings (same as above).
3. Add Environment Variable under Site Settings → Environment Variables.
4. Click **Deploy Site**.

---

## Step 4 — Manual VPS Static Hosting with Nginx

If you prefer to host the frontend on the same cloud virtual machine as the backend (Alibaba Cloud ECS or Digital Ocean Droplet), you can configure Nginx to serve the static built files directly.

1. **Upload Assets to VPS**:
   Use SSH/SCP to copy your compiled `dist/` folder to the server:
   ```bash
   scp -r ./dist root@<VPS_IP_ADDRESS>:/var/www/course-platform
   ```
2. **Configure Nginx Server Block**:
   Create a new Nginx configuration block:
   ```bash
   sudo nano /etc/nginx/sites-available/yourdomain.com
   ```
   Add block config. *Note: We include history-mode fallback configuration (`try_files`) so that React Router paths resolve correctly.*
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       root /var/www/course-platform;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Optional: cache static assets aggressively
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires max;
           log_not_found off;
       }
   }
   ```
3. **Link Config & Restart Nginx**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```
4. **Secure with SSL (Certbot)**:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

## Common Build Failures & Fixes

| Symptom | Cause | Remedy |
|---|---|---|
| Deep page links (e.g. `/courses/1`) fail on page refresh (404 Error) | The web server tried to find a folder named `/courses/1` instead of redirecting the request to `index.html`. | Configure `try_files` redirect fallback in your Nginx config, or configure redirect rewrites on Vercel/Netlify. |
| Mixed Content block errors | The frontend was served over secure HTTPS, but tried to query the API over insecure HTTP. | Verify your `VITE_API_URL` uses the `https://` protocol and that your backend Nginx reverse proxy is configured with an SSL certificate. |
