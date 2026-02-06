# Deployment Guide - Shupavu High SMS

This guide explains how to deploy the Shupavu High SMS application with the frontend on Netlify and backend on Render.

## Architecture

- **Frontend**: Netlify (https://shupavu.netlify.app)
- **Backend**: Render (https://shupavu-high.onrender.com)
- **Database**: MongoDB Atlas

## Prerequisites

- GitHub repository connected to both Netlify and Render
- MongoDB Atlas account with connection string
- Netlify account
- Render account

## Frontend Deployment (Netlify)

### Initial Setup

1. **Connect Repository**
   - Log into Netlify
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Select the `shupavu_high` repository

2. **Build Settings**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

3. **Environment Variables**
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL` = `https://shupavu-high.onrender.com`  
     (the frontend will auto-append `/api` if it???s missing)

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically deploy on every push to main branch

### SPA Routing Configuration

The `_redirects` file in `frontend/public/` handles client-side routing:
```
/*    /index.html   200
```
This ensures page reloads work correctly with React Router.

## Backend Deployment (Render)

### Initial Setup

1. **Create Web Service**
   - Log into Render
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the `shupavu_high` repository

2. **Service Settings**
   - **Name**: `shupavu-high`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`

3. **Environment Variables**
   - Go to Environment tab
   - Add the following variables:

   ```
   PORT=5000
   MONGO_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_jwt_secret>
   NODE_ENV=production
   FRONTEND_URL=https://shupavu.netlify.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy on every push to main branch

### CORS Configuration

The backend is configured to accept requests from:
- Local development: `http://localhost:5173`, `http://localhost:5174`, `http://localhost:3000`
- Production: `https://shupavu.netlify.app`
- Netlify previews: `https://*.netlify.app`
- Custom: `process.env.FRONTEND_URL`

## Post-Deployment Steps

### After Pushing Code Changes

1. **Netlify** will auto-deploy (usually takes 1-2 minutes)
2. **Render** will auto-deploy (usually takes 2-5 minutes)

### Update Environment Variables on Render

If you need to update the `FRONTEND_URL`:
1. Go to Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Update `FRONTEND_URL` to `https://shupavu.netlify.app`
5. Click "Save Changes"
6. Render will automatically redeploy

## Troubleshooting

### Login Not Working

**Symptom**: Login fails with CORS errors in browser console

**Solution**:
1. Check browser DevTools → Console for CORS errors
2. Verify `FRONTEND_URL` is set correctly on Render
3. Ensure Netlify URL is in backend's `allowedOrigins` array
4. Restart Render service after updating environment variables

### 404 Error on Page Reload

**Symptom**: Navigating works, but reloading a page shows "Page not found"

**Solution**:
1. Verify `_redirects` file exists in `frontend/public/`
2. Redeploy on Netlify
3. Check Netlify deploy logs to confirm `_redirects` was included

### API Connection Issues

**Symptom**: Frontend can't connect to backend

**Solution**:
1. Verify `VITE_API_URL` is set on Netlify
2. Check backend is running on Render (visit https://shupavu-high.onrender.com)
3. Verify MongoDB connection string is correct on Render
4. Check Render logs for errors

### Environment Variables Not Working

**Symptom**: Changes to environment variables don't take effect

**Solution**:
1. After updating environment variables, manually redeploy:
   - **Netlify**: Trigger a new deploy from Deploys tab
   - **Render**: Click "Manual Deploy" → "Deploy latest commit"
2. Clear browser cache and reload

## Monitoring

### Netlify
- **Deploy logs**: Deploys tab → Click on a deploy
- **Function logs**: Functions tab (if using serverless functions)
- **Analytics**: Analytics tab

### Render
- **Logs**: Logs tab (real-time backend logs)
- **Metrics**: Metrics tab (CPU, memory usage)
- **Events**: Events tab (deploy history)

## Custom Domain (Optional)

### Netlify
1. Go to Domain settings
2. Add custom domain
3. Configure DNS records as instructed

### Render
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records as instructed
4. Update `FRONTEND_URL` on Render to your custom domain

## Security Notes

> [!IMPORTANT]
> - Never commit `.env` files to GitHub
> - Keep MongoDB connection strings secure
> - Use strong JWT secrets in production
> - Regularly rotate secrets and credentials
> - Enable 2FA on Netlify and Render accounts
