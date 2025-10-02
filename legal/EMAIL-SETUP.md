# Email Setup Guide for blazesportsintel.com

## Required Email Addresses

Set up the following email addresses for legal compliance:

1. **legal@blazesportsintel.com** - Legal inquiries, DMCA notices, contracts
2. **privacy@blazesportsintel.com** - GDPR/CCPA requests, data deletion, youth privacy
3. **support@blazesportsintel.com** - General help, technical issues
4. **security@blazesportsintel.com** - Vulnerability reports, security incidents
5. **abuse@blazesportsintel.com** - Policy violations, spam, harassment (optional but recommended)
6. **appeals@blazesportsintel.com** - Account suspension appeals (optional)

---

## Setup Method: Cloudflare Email Routing (FREE)

Cloudflare Email Routing allows you to create unlimited email addresses that forward to your personal email (ahump20@outlook.com).

### Step 1: Enable Email Routing in Cloudflare Dashboard

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your domain: **blazesportsintel.com**
3. Navigate to **Email** → **Email Routing** in the left sidebar
4. Click **Enable Email Routing**
5. Cloudflare will automatically configure DNS records (MX, TXT, SPF)

### Step 2: Add Destination Email

1. In Email Routing settings, under **Destination addresses**:
   - Click **Add destination address**
   - Enter: `ahump20@outlook.com`
   - Click **Send verification email**
2. Check your Outlook inbox and click the verification link
3. Return to Cloudflare and confirm the address is verified (green checkmark)

### Step 3: Create Routing Rules

For each required email address, create a custom address:

#### Legal Email
1. Click **Create address** under Custom addresses
2. **Custom address**: `legal`
3. **Action**: Forward to `ahump20@outlook.com`
4. Click **Save**

#### Privacy Email
1. Click **Create address**
2. **Custom address**: `privacy`
3. **Action**: Forward to `ahump20@outlook.com`
4. Click **Save**

#### Support Email
1. Click **Create address**
2. **Custom address**: `support`
3. **Action**: Forward to `ahump20@outlook.com`
4. Click **Save**

#### Security Email
1. Click **Create address**
2. **Custom address**: `security`
3. **Action**: Forward to `ahump20@outlook.com`
4. Click **Save**

#### Abuse Email (Optional)
1. Click **Create address**
2. **Custom address**: `abuse`
3. **Action**: Forward to `ahump20@outlook.com`
4. Click **Save**

#### Appeals Email (Optional)
1. Click **Create address**
2. **Custom address**: `appeals`
3. **Action**: Forward to `ahump20@outlook.com`
4. Click **Save**

### Step 4: Configure Catch-All (Optional)

To catch any other emails sent to @blazesportsintel.com:

1. Under **Catch-all address**
2. **Action**: Forward to `ahump20@outlook.com`
3. Click **Save**

### Step 5: Test Email Routing

Send test emails to each address:

```bash
# From any email client, send test messages to:
legal@blazesportsintel.com
privacy@blazesportsintel.com
support@blazesportsintel.com
security@blazesportsintel.com
```

Verify they all arrive in `ahump20@outlook.com`.

---

## Alternative: Gmail Alias Setup (If Preferred)

If you prefer using Gmail for these addresses:

1. Create a Gmail account: `blazesportsintel@gmail.com`
2. In Cloudflare Email Routing, forward all addresses to this Gmail
3. In Gmail settings → **Accounts and Import** → **Send mail as**:
   - Add each alias (legal@, privacy@, support@, security@)
   - This allows you to reply FROM these addresses

---

## Email Management Best Practices

### 1. Create Email Filters/Labels in Outlook

To organize incoming emails by type:

1. In Outlook, go to **Settings** → **Mail** → **Rules**
2. Create rules for each address:

**Legal Rule:**
- **Condition**: To address contains `legal@blazesportsintel.com`
- **Action**: Move to folder `Blaze Legal` and mark as important

**Privacy Rule:**
- **Condition**: To address contains `privacy@blazesportsintel.com`
- **Action**: Move to folder `Blaze Privacy` and mark as important

**Support Rule:**
- **Condition**: To address contains `support@blazesportsintel.com`
- **Action**: Move to folder `Blaze Support`

**Security Rule:**
- **Condition**: To address contains `security@blazesportsintel.com`
- **Action**: Move to folder `Blaze Security` and mark as important

### 2. Set Up Auto-Replies for Non-Critical Addresses

For support@ and abuse@, consider auto-replies:

**Support Auto-Reply:**
```
Thank you for contacting Blaze Sports Intelligence support.

We have received your message and will respond within 24-48 hours.

For urgent issues, please visit our Help Center:
https://blazesportsintel.com/help

For account-related questions:
https://blazesportsintel.com/account

Best regards,
Blaze Sports Intelligence Team
```

### 3. Response Time Targets

| Email Address | Priority | Target Response Time |
|---------------|----------|---------------------|
| security@ | **CRITICAL** | 4 hours (security vulnerabilities) |
| privacy@ | **HIGH** | 24 hours (GDPR/CCPA legally mandated) |
| legal@ | **HIGH** | 24-48 hours (DMCA, legal notices) |
| support@ | Medium | 48 hours |
| abuse@ | Medium | 48-72 hours |
| appeals@ | Low | 72 hours |

### 4. DMCA Response Template

Keep this template ready for DMCA takedown notices sent to legal@:

```
Dear [Copyright Holder],

We have received your DMCA takedown notice dated [DATE] regarding [CONTENT DESCRIPTION].

We take copyright infringement seriously and are investigating your claim.

Per our Copyright Policy (https://blazesportsintel.com/legal/copyright-dmca), we will:

1. Review the allegedly infringing content within 24 hours
2. Contact the user who posted the content (if applicable)
3. Remove the content if it violates copyright law
4. Notify you of our decision within 3-5 business days

For our records, please confirm the following information is correct:
- Your contact information: [VERIFY]
- Description of copyrighted work: [VERIFY]
- URL of infringing content: [VERIFY]
- Good faith statement: [RECEIVED]
- Accuracy statement under penalty of perjury: [RECEIVED]
- Physical or electronic signature: [RECEIVED]

We will contact you at [EMAIL] with updates.

Best regards,
Austin Humphrey
Designated DMCA Agent
Blaze Sports Intelligence
legal@blazesportsintel.com
(210) 273-5538
```

### 5. Privacy Request Template

For GDPR/CCPA data requests sent to privacy@:

```
Dear [User Name],

We have received your request to [DELETE/ACCESS/EXPORT] your personal data under [GDPR/CCPA].

We will process your request within:
- GDPR: 30 days (EU users)
- CCPA: 45 days (California residents)

To verify your identity, please confirm:
1. Your registered email address
2. Account username (if applicable)
3. Last 4 digits of any payment method used (if applicable)

Once verified, we will:
- [DELETE] all personal data from our systems
- [PROVIDE] a complete export of your data in JSON format
- [CONFIRM] completion within the legally required timeframe

If you have any questions, please reply to this email.

Best regards,
Blaze Sports Intelligence Privacy Team
privacy@blazesportsintel.com
```

---

## DNS Records Verification

After enabling Email Routing, verify these DNS records are present:

```bash
# Check MX records
dig MX blazesportsintel.com

# Expected output:
blazesportsintel.com.  300  IN  MX  1 route1.mx.cloudflare.net.
blazesportsintel.com.  300  IN  MX  2 route2.mx.cloudflare.net.
blazesportsintel.com.  300  IN  MX  3 route3.mx.cloudflare.net.

# Check SPF record
dig TXT blazesportsintel.com

# Expected output should include:
"v=spf1 include:_spf.mx.cloudflare.net ~all"
```

---

## Security Considerations

### 1. Enable 2FA on Outlook Account

Since all emails forward to `ahump20@outlook.com`, secure this account:

1. Go to [Microsoft Account Security](https://account.microsoft.com/security)
2. Enable **Two-step verification**
3. Add authenticator app (Microsoft Authenticator, Google Authenticator)
4. Save backup codes in a secure location

### 2. Monitor for Phishing

Be cautious of emails claiming to be from:
- Users requesting data deletion (verify identity first)
- Fake DMCA notices (verify copyright holder legitimacy)
- Security researchers (verify through responsible disclosure platforms)

### 3. Encryption

For sensitive communications (privacy requests, legal notices):
- Consider using ProtonMail or Tutanota for encrypted responses
- Or use PGP encryption with your existing Outlook account

---

## Compliance Checklist

After setup, verify:

- ✅ All 4 critical emails are active (legal@, privacy@, support@, security@)
- ✅ Test emails successfully delivered to ahump20@outlook.com
- ✅ Outlook filters/rules created for organization
- ✅ Response templates prepared
- ✅ Auto-replies configured (optional)
- ✅ 2FA enabled on Outlook account
- ✅ Legal documents updated with correct email addresses
- ✅ Website footer includes contact information

---

## Monitoring and Maintenance

### Weekly Tasks
- Check all email folders for missed messages
- Respond to privacy/legal requests within SLA targets
- Archive resolved issues

### Monthly Tasks
- Review email routing rules in Cloudflare
- Update response templates if needed
- Audit response times and improve processes

### Quarterly Tasks
- Review email security settings
- Test disaster recovery (backup destination email)
- Update legal team contact information if changed

---

## Troubleshooting

### Emails Not Being Received

1. **Check Cloudflare Email Routing status**:
   - Dashboard → Email → Email Routing → **Enabled** (green)
   - Destination address: **Verified** (green checkmark)

2. **Check DNS propagation**:
   ```bash
   dig MX blazesportsintel.com
   # Should show route1.mx.cloudflare.net, route2.mx.cloudflare.net, route3.mx.cloudflare.net
   ```

3. **Check Outlook spam folder**:
   - Forwarded emails may initially be flagged as spam
   - Mark as "Not Spam" and add blazesportsintel.com to safe senders

4. **Check Cloudflare Email Routing logs**:
   - Dashboard → Email → Email Routing → **Activity**
   - View delivery status for each email

### Emails Being Marked as Spam

1. **Add SPF and DKIM records** (Cloudflare does this automatically)
2. **Add DMARC record** for additional authentication:
   ```
   Name: _dmarc.blazesportsintel.com
   Type: TXT
   Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@blazesportsintel.com
   ```

3. **Warm up the domain**:
   - Start with low email volume
   - Gradually increase over 2-4 weeks
   - Avoid sudden spikes in outbound emails

---

## Cost Analysis

### Cloudflare Email Routing (Current Recommendation)
- **Cost**: FREE (unlimited addresses, unlimited forwarding)
- **Pros**: Simple, reliable, integrated with Cloudflare DNS
- **Cons**: Forwarding only (cannot send FROM these addresses without additional setup)

### Gmail Business (Alternative)
- **Cost**: $6/user/month (Google Workspace)
- **Pros**: Full email hosting, send/receive, 30GB storage, professional
- **Cons**: Monthly recurring cost ($72/year for 1 user)

### Microsoft 365 Business Basic (Alternative)
- **Cost**: $6/user/month
- **Pros**: Outlook integration, OneDrive, Teams
- **Cons**: Monthly recurring cost ($72/year)

**Recommendation**: Start with **free Cloudflare Email Routing** and upgrade to Google Workspace or Microsoft 365 only if you need to send emails FROM these addresses frequently.

---

## Next Steps

1. ✅ Complete Cloudflare Email Routing setup (15 minutes)
2. ✅ Send test emails to verify delivery (5 minutes)
3. ✅ Create Outlook filters/rules (10 minutes)
4. ✅ Prepare response templates (30 minutes)
5. ✅ Update legal documents with confirmed email addresses (5 minutes)
6. ✅ Add email addresses to website footer (see footer implementation guide)

**Total Setup Time**: ~60 minutes

---

## Support Resources

- [Cloudflare Email Routing Documentation](https://developers.cloudflare.com/email-routing/)
- [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [Microsoft Outlook Help](https://support.microsoft.com/en-us/outlook)
- [Gmail Business Workspace](https://workspace.google.com/)

---

**Last Updated**: January 20, 2025
**Prepared by**: Blaze Intelligence Legal Team
**Questions?** Contact legal@blazesportsintel.com (once setup is complete)
