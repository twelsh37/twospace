# Password Reset Troubleshooting Guide

## 🚨 Emergency Solutions

If you're locked out of your admin account and can't receive reset emails, use these solutions in order:

### **Option 1: Emergency Admin Reset Script**
```bash
cd frontend
node scripts/emergency-admin-reset.js
```

### **Option 2: Direct Database Reset**
```bash
cd frontend
node scripts/direct-db-reset.js
```

### **Option 3: Supabase Dashboard**
1. Go to your Supabase Dashboard
2. Navigate to Authentication > Users
3. Find your admin user
4. Click "Edit" and set a new password

## 🔍 Email Configuration Issues

### **Common Problems:**

1. **Email not being sent**
   - Check Supabase email settings
   - Verify SMTP configuration
   - Check spam/junk folders

2. **Email templates not configured**
   - Go to Supabase Dashboard > Authentication > Email Templates
   - Configure password reset template

3. **Domain restrictions**
   - Check if your email domain is allowed
   - Add domain to allowed list in Supabase

### **Supabase Email Settings to Check:**

1. **Authentication > Settings**
   - ✅ Enable email confirmations: ON
   - ✅ Enable email change confirmations: ON
   - ✅ Enable password reset emails: ON

2. **Authentication > Email Templates**
   - Configure "Password Reset" template
   - Test email delivery

3. **Authentication > SMTP Settings**
   - Configure SMTP server (optional)
   - Or use Supabase's built-in email service

## 🛠️ Manual Password Reset Steps

### **Using the Admin API:**
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SERVICE_ROLE_KEY'
);

const { error } = await supabase.auth.admin.updateUserById(
  'USER_ID',
  { password: 'NewSecurePassword123!' }
);
```

### **Using Supabase Dashboard:**
1. Go to Supabase Dashboard
2. Navigate to Authentication > Users
3. Find your user account
4. Click "Edit"
5. Set a new password
6. Save changes

## 📧 Email Troubleshooting Checklist

### **Before Running Scripts:**
- [ ] Check `.env.local` has correct Supabase credentials
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] Ensure you have admin access to Supabase project

### **Email Configuration:**
- [ ] Enable email confirmations in Supabase
- [ ] Configure email templates
- [ ] Test email delivery
- [ ] Check spam/junk folders
- [ ] Verify email domain is allowed

### **After Password Reset:**
- [ ] Provide new password securely to user
- [ ] User should change password after first login
- [ ] Fix email configuration to prevent future issues

## 🔐 Password Requirements

All new passwords must meet these requirements:
- At least 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@£$%^&*():"|;'\?><,.//)

## 📞 Getting Help

If none of these solutions work:

1. **Check Supabase Status**: Visit https://status.supabase.com
2. **Review Logs**: Check Supabase Dashboard > Logs
3. **Contact Support**: Use Supabase support if needed
4. **Emergency Access**: Use database connection if available

## ⚠️ Security Notes

- Always provide new passwords through secure channels
- Users should change passwords after first login
- Monitor for suspicious activity after password changes
- Consider enabling 2FA for admin accounts