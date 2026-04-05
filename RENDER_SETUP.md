# Render Deployment - Environment Variables Setup

## Backend SMTP Configuration

Your backend is deployed at: https://frameza-backend.onrender.com

### Required Environment Variables

Add these to your Render Backend service in Dashboard → Environment:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support.frameza@gmail.com
SMTP_PASS=khro ptyq ekgt vgmt
MAIL_FROM=Frameza <support.frameza@gmail.com>
```

### Steps to Update:

1. Go to https://dashboard.render.com
2. Select your backend service (frameza-backend)
3. Click "Environment" in sidebar
4. Add/Update the variables above
5. Click "Save" (this will trigger a redeploy)
6. Wait for deployment to complete

### Verify SMTP Works:

Once deployed, test email sending by accepting/rejecting a booking in admin panel.
Check the "Email Log" column in bookings table for confirmation.

## Local Testing (Already Works ✅)

Run locally to verify config before pushing:
```bash
cd backend
node scripts/testSMTP.js
```

## Database Connection

Already configured and working:
```
MONGO_URI=mongodb://frameza_db_user:Gaurav1725@ac-3kgfvuo-shard-00-00.kbyb2pc.mongodb.net:27017,...
```

## JWT & Other Secrets

```
JWT_SECRET=frameza_secret
CLOUDINARY_CLOUD_NAME=dhkalmp5x
CLOUDINARY_API_KEY=397437546399443
CLOUDINARY_API_SECRET=mXqS8lQEqT31Ol6sgO2IVqZeLfg
```

These are already set on Render.

## Troubleshooting

### Emails still not sending after env update?
1. Verify variables are saved correctly in Render dashboard
2. Check redeploy status (should show "deployed" badge)
3. Wait 2-3 minutes after redeploy before testing
4. Check booking "Email Log" for the specific error message

### Connection Timeout error?
- Confirm SMTP_PORT=587 (not 465)
- Confirm SMTP_SECURE=false (for port 587)
- Check SMTP_PASS is exactly: `khro ptyq ekgt vgmt` (with spaces)
