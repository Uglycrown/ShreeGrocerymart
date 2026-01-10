# MSG91 Integration Guide for Shree Grocery Mart

## Step 1: Sign Up for MSG91

1. Visit https://msg91.com/signup
2. Sign up with your email
3. Verify your email address
4. Complete KYC (required for Indian SMS)
5. Get ₹20 free credits (~100 SMS)

## Step 2: Get Your Credentials

### Get Auth Key:
1. Login to MSG91 dashboard
2. Go to "Manage" → "API Keys"
3. Copy your Auth Key

### Create OTP Template:
1. Go to "SMS" → "Templates"
2. Click "Create Template"
3. Select "OTP" category
4. Template example:
   ```
   Your OTP for Shree Grocery Mart login is {otp}. Valid for 10 minutes. Do not share this OTP.
   ```
5. Submit for approval (usually approved in 1-2 hours)
6. Once approved, copy the Template ID

## Step 3: Configure Your App

Update `.env.local` file:

```env
# MSG91 Configuration
MSG91_AUTH_KEY=your_actual_auth_key_here
MSG91_TEMPLATE_ID=your_actual_template_id_here
MSG91_SENDER_ID=SHRGMT
```

## Step 4: DLT Registration (Required for India)

1. Register on DLT portal: https://www.vilpower.in/
2. Register your Entity
3. Register your Template
4. Link Template with MSG91
5. Get DLT Entity ID and Template ID

## Step 5: Test Your Integration

1. Restart your Next.js server: `npm run dev`
2. Try logging in with your phone number
3. You should receive real SMS!

## Pricing:

- Transactional SMS: ₹0.15 - ₹0.20 per SMS
- Promotional SMS: ₹0.10 - ₹0.15 per SMS
- International SMS: $0.04 - $0.10 per SMS

## Alternative: Use MSG91 OTP Widget (Easier)

MSG91 provides a simpler OTP widget:

```typescript
// Simpler implementation with MSG91 OTP Widget
const response = await fetch('https://control.msg91.com/api/v5/otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'authkey': process.env.MSG91_AUTH_KEY
  },
  body: JSON.stringify({
    template_id: process.env.MSG91_TEMPLATE_ID,
    mobile: `91${phoneNumber}`,
    otp_length: 6,
    otp_expiry: 10 // minutes
  })
})
```

## Support:

- Documentation: https://docs.msg91.com/
- Support Email: support@msg91.com
- WhatsApp: +91 9650679994

## Current Status:

✅ Code integrated with MSG91
✅ Falls back to demo mode if credentials not configured
✅ OTP shown in console for development
🔄 Waiting for your MSG91 credentials

Once you add your credentials to `.env.local`, real SMS will be sent!
