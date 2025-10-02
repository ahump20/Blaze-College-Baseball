# Legal Documentation Deployment Guide

**Quick Start Guide for Deploying Legal Documentation**
**Blaze Sports Intelligence - blazesportsintel.com**

---

## Step 1: Email Setup (CRITICAL - Do First)

### Create Email Addresses

You need to set up the following email addresses before deployment:

**Required:**
- legal@blazesportsintel.com
- privacy@blazesportsintel.com
- support@blazesportsintel.com
- security@blazesportsintel.com

**Recommended:**
- abuse@blazesportsintel.com
- appeals@blazesportsintel.com
- media@blazesportsintel.com
- research@blazesportsintel.com

### Options:

**Option A: Email Forwarding (Simplest)**
- Set up forwarding in Cloudflare Email Routing or domain provider
- Forward all to ahump20@outlook.com initially
- Filter by subject line or set up folders

**Option B: Dedicated Inbox**
- Use Google Workspace, Microsoft 365, or similar
- Create dedicated inboxes for each address
- Recommended for higher volume

**Option C: Hybrid**
- Support/General → Dedicated inbox
- Legal/Privacy/Security → Forward to owner

### Test Emails
```bash
# Send test emails to verify setup
echo "Test" | mail -s "Test Legal Email" legal@blazesportsintel.com
echo "Test" | mail -s "Test Privacy Email" privacy@blazesportsintel.com
```

---

## Step 2: Deploy Legal Files

### Option A: Direct Upload (Static Hosting)

**If using Cloudflare Pages with static files:**

```bash
# From project root
cd /Users/AustinHumphrey/BSI-1

# Deploy legal directory
wrangler pages deploy legal --project-name=blazesportsintel
```

### Option B: Add to Existing Build

**If using build process (Next.js, React, etc.):**

```bash
# Copy legal files to public directory
cp -r legal public/legal

# Or add to build script in package.json:
# "prebuild": "cp -r legal public/legal"
```

### Option C: Serve from Cloudflare Workers

**Create `/functions/legal/[[path]].js`:**

```javascript
export async function onRequest(context) {
  const path = context.params.path || 'index.html';

  // Map extensionless URLs
  const file = path.includes('.') ? path : `${path}.md`;

  try {
    // Fetch markdown or HTML file
    const content = await context.env.ASSETS.fetch(`/legal/${file}`);

    if (file.endsWith('.md')) {
      // Convert markdown to HTML
      const markdown = await content.text();
      const { marked } = await import('marked');
      const html = marked.parse(markdown);

      return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${path.replace(/-/g, ' ')} - Blaze Sports Intelligence</title>
  <link rel="stylesheet" href="/css/legal.css">
</head>
<body>
  <div class="container legal-document">
    ${html}
  </div>
  <footer>
    <a href="/legal">Return to Legal Hub</a> | <a href="/">Home</a>
  </footer>
</body>
</html>
      `, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    return content;
  } catch (error) {
    return new Response('Legal document not found', { status: 404 });
  }
}
```

---

## Step 3: Update Website Footer

### Add Legal Links to All Pages

**HTML Example:**
```html
<footer>
  <nav aria-label="Legal">
    <a href="/legal/terms-of-service">Terms of Service</a> |
    <a href="/legal/privacy-policy">Privacy Policy</a> |
    <a href="/legal/cookie-policy">Cookie Policy</a> |
    <a href="/legal/disclaimer">Disclaimer</a> |
    <a href="/legal">Legal</a> |
    <a href="#" id="cookie-settings">Cookie Settings</a>
  </nav>
  <p>&copy; 2025 Blaze Intelligence. All Rights Reserved.</p>
</footer>
```

**React Example:**
```jsx
// components/Footer.jsx
export default function Footer() {
  return (
    <footer>
      <nav aria-label="Legal">
        <Link href="/legal/terms-of-service">Terms of Service</Link>
        <Link href="/legal/privacy-policy">Privacy Policy</Link>
        <Link href="/legal/cookie-policy">Cookie Policy</Link>
        <Link href="/legal/disclaimer">Disclaimer</Link>
        <Link href="/legal">Legal</Link>
        <button onClick={openCookieSettings}>Cookie Settings</button>
      </nav>
      <p>&copy; 2025 Blaze Intelligence. All Rights Reserved.</p>
    </footer>
  );
}
```

---

## Step 4: Implement Cookie Consent

### Quick Implementation (Osano Cookie Consent - Free)

**Install:**
```bash
npm install vanilla-cookieconsent
# or
<script src="https://cdn.jsdelivr.net/npm/vanilla-cookieconsent@3/dist/cookieconsent.umd.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vanilla-cookieconsent@3/dist/cookieconsent.css">
```

**Initialize:**
```javascript
// public/cookie-consent-init.js
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';

CookieConsent.run({
  categories: {
    necessary: {
      enabled: true,
      readOnly: true
    },
    analytics: {
      enabled: false,
      autoClear: {
        cookies: [
          { name: /^_bsi_analytics/ },
          { name: 'cf_analytics' }
        ]
      }
    },
    preferences: {
      enabled: false,
      autoClear: {
        cookies: [
          { name: 'bsi_theme' },
          { name: 'bsi_timezone' },
          { name: 'bsi_favorites' }
        ]
      }
    }
  },

  language: {
    default: 'en',
    translations: {
      en: {
        consentModal: {
          title: 'We use cookies',
          description: 'We use cookies to provide essential functionality and analyze usage. You can customize your preferences below.',
          acceptAllBtn: 'Accept All',
          acceptNecessaryBtn: 'Reject Optional',
          showPreferencesBtn: 'Manage Preferences'
        },
        preferencesModal: {
          title: 'Cookie Preferences',
          acceptAllBtn: 'Accept All',
          acceptNecessaryBtn: 'Reject Optional',
          savePreferencesBtn: 'Save Preferences',
          sections: [
            {
              title: 'Essential Cookies',
              description: 'Required for authentication and core functionality.',
              linkedCategory: 'necessary'
            },
            {
              title: 'Analytics Cookies',
              description: 'Help us understand how you use the site to improve performance.',
              linkedCategory: 'analytics'
            },
            {
              title: 'Preference Cookies',
              description: 'Remember your settings like theme, timezone, and favorite teams.',
              linkedCategory: 'preferences'
            }
          ]
        }
      }
    }
  }
});
```

---

## Step 5: Terms Acceptance on Signup

### Add to Registration Form

**HTML Example:**
```html
<form id="signup-form" action="/api/auth/register" method="POST">
  <input type="email" name="email" placeholder="Email" required>
  <input type="password" name="password" placeholder="Password" required>

  <label style="display: flex; align-items: start; gap: 8px;">
    <input type="checkbox" name="agree_terms" required style="margin-top: 4px;">
    <span style="font-size: 14px;">
      I agree to the <a href="/legal/terms-of-service" target="_blank">Terms of Service</a>
      and <a href="/legal/privacy-policy" target="_blank">Privacy Policy</a>
    </span>
  </label>

  <button type="submit">Create Account</button>
</form>
```

**React Example:**
```jsx
// components/SignupForm.jsx
import { useState } from 'react';

export default function SignupForm() {
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    // Log consent
    await logConsent({
      type: 'terms_of_service',
      version: '1.0',
      timestamp: new Date().toISOString(),
      ip: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip)
    });

    // Proceed with registration
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />

      <label>
        <input
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          required
        />
        I agree to the{' '}
        <a href="/legal/terms-of-service" target="_blank">Terms of Service</a>
        {' '}and{' '}
        <a href="/legal/privacy-policy" target="_blank">Privacy Policy</a>
      </label>

      <button type="submit" disabled={!agreeTerms}>
        Create Account
      </button>
    </form>
  );
}
```

**Database Schema (Log Consent):**
```sql
CREATE TABLE user_consents (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  consent_type VARCHAR(50), -- 'terms_of_service', 'privacy_policy', 'cookie_consent'
  consent_version VARCHAR(10), -- '1.0'
  consented_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Index for fast lookups
CREATE INDEX idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX idx_user_consents_type ON user_consents(consent_type);
```

---

## Step 6: Test Deployment

### Checklist

**Test URLs:**
- [ ] https://blazesportsintel.com/legal
- [ ] https://blazesportsintel.com/legal/terms-of-service
- [ ] https://blazesportsintel.com/legal/privacy-policy
- [ ] https://blazesportsintel.com/legal/acceptable-use-policy
- [ ] https://blazesportsintel.com/legal/disclaimer
- [ ] https://blazesportsintel.com/legal/cookie-policy
- [ ] https://blazesportsintel.com/legal/copyright-dmca

**Test Functionality:**
- [ ] All internal links work
- [ ] External links open in new tabs
- [ ] Mobile responsive design
- [ ] Cookie consent banner appears on first visit
- [ ] Cookie settings button works
- [ ] Terms checkbox required on signup
- [ ] Legal links in footer present on all pages

**Test Emails:**
- [ ] Send test to legal@blazesportsintel.com
- [ ] Send test to privacy@blazesportsintel.com
- [ ] Send test to support@blazesportsintel.com
- [ ] Send test to security@blazesportsintel.com
- [ ] Verify emails are received

**Accessibility:**
- [ ] Run WAVE scan: https://wave.webaim.org
- [ ] Test keyboard navigation (Tab through all links)
- [ ] Verify color contrast (WCAG AA)
- [ ] Test with screen reader (if possible)

---

## Step 7: Register DMCA Agent

### U.S. Copyright Office Registration

**Required Information:**
- Designated Agent Name: Austin Humphrey
- Organization: Blaze Intelligence
- Address: Boerne, Texas, USA (full address required)
- Phone: (210) 273-5538
- Email: legal@blazesportsintel.com

**How to Register:**
1. Go to: https://www.copyright.gov/dmca-directory/
2. Click "Designation of Agent to Receive Notification of Claimed Infringement"
3. Complete online form
4. Pay $6 fee
5. Receive confirmation within 1-2 business days

**Why Register:**
- Required for DMCA safe harbor protection (17 U.S.C. § 512(c))
- Makes you the official contact for copyright infringement notices
- Protects against liability for user-generated content

---

## Step 8: Optional Enhancements

### A. Privacy Request Portal

Create `/privacy-request` page:

```html
<h1>Privacy Rights Request</h1>
<p>Submit requests for data access, deletion, or correction per GDPR/CCPA.</p>

<form action="/api/privacy-request" method="POST">
  <label>Request Type:
    <select name="request_type" required>
      <option value="access">Access My Data (GDPR Art. 15 / CCPA Right to Know)</option>
      <option value="delete">Delete My Data (GDPR Art. 17 / CCPA Right to Delete)</option>
      <option value="portability">Download My Data (GDPR Art. 20)</option>
      <option value="correction">Correct My Data (GDPR Art. 16)</option>
      <option value="opt_out">Opt Out of Marketing</option>
    </select>
  </label>

  <label>Email (for verification):
    <input type="email" name="email" required>
  </label>

  <label>Additional Details:
    <textarea name="details" rows="4"></textarea>
  </label>

  <button type="submit">Submit Request</button>
</form>

<p><small>We will verify your identity and respond within 30 days (GDPR) or 45 days (CCPA).</small></p>
```

### B. Accessibility Statement

Create `/accessibility` page:

```markdown
# Accessibility Statement

Blaze Sports Intelligence is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.

## Conformance Status

We aim to conform to WCAG 2.1 Level AA standards.

## Feedback

We welcome your feedback on the accessibility of blazesportsintel.com. Please let us know if you encounter accessibility barriers:

- Email: support@blazesportsintel.com
- Phone: (210) 273-5538

We aim to respond to accessibility feedback within 3 business days.

## Technical Specifications

blazesportsintel.com relies on the following technologies:
- HTML5
- CSS3
- JavaScript
- ARIA attributes

## Known Limitations

We are aware of the following accessibility limitations and are working to address them:
- [List any known issues]

Last Updated: January 20, 2025
```

### C. Legal Document Versioning

Track changes to legal documents:

```javascript
// lib/legal-versions.js
export const legalVersions = {
  'terms-of-service': {
    current: '1.0',
    effective: '2025-01-20',
    history: [
      { version: '1.0', date: '2025-01-20', changes: 'Initial release' }
    ]
  },
  'privacy-policy': {
    current: '1.0',
    effective: '2025-01-20',
    history: [
      { version: '1.0', date: '2025-01-20', changes: 'Initial release' }
    ]
  }
  // ... other documents
};
```

---

## Step 9: Post-Deployment

### Announce to Users (If Existing Users)

**Email Template:**
```
Subject: Updated Legal Policies - Blaze Sports Intelligence

Hi [Name],

We've updated our legal policies to provide greater transparency and protection for your data. The new policies are effective immediately and can be reviewed at:

- Terms of Service: https://blazesportsintel.com/legal/terms-of-service
- Privacy Policy: https://blazesportsintel.com/legal/privacy-policy

Key Highlights:
✓ GDPR and CCPA compliant
✓ Enhanced youth athlete privacy protections
✓ Clear cookie consent controls
✓ Transparent data usage policies

Your continued use of Blaze Sports Intelligence constitutes acceptance of these updated policies. If you have questions, please contact privacy@blazesportsintel.com.

Thank you,
Austin Humphrey
Blaze Intelligence
```

### Update Sitemap

Add legal pages to `sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://blazesportsintel.com/legal</loc>
    <lastmod>2025-01-20</lastmod>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://blazesportsintel.com/legal/terms-of-service</loc>
    <lastmod>2025-01-20</lastmod>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://blazesportsintel.com/legal/privacy-policy</loc>
    <lastmod>2025-01-20</lastmod>
    <priority>0.5</priority>
  </url>
  <!-- Add other legal pages -->
</urlset>
```

### Monitor Analytics

Track legal page views to understand user engagement:

```javascript
// Track legal page views
if (window.location.pathname.startsWith('/legal')) {
  analytics.track('legal_page_view', {
    page: window.location.pathname,
    timestamp: new Date().toISOString()
  });
}
```

---

## Troubleshooting

### Issue: Legal pages return 404

**Solution:**
- Verify file paths and URL routing
- Check server configuration (Cloudflare Pages, Workers)
- Ensure build process includes legal directory

### Issue: Cookie consent not showing

**Solution:**
- Check browser console for JavaScript errors
- Verify cookie consent script is loaded
- Clear cookies and reload page
- Test in incognito mode

### Issue: Email not received

**Solution:**
- Check spam/junk folders
- Verify DNS records (MX, SPF, DKIM)
- Test with different email providers
- Use email testing tool: https://mxtoolbox.com

### Issue: Terms checkbox not blocking signup

**Solution:**
- Verify `required` attribute on checkbox
- Check form validation JavaScript
- Test with browser developer tools

---

## Support

**Questions about deployment?**
Contact Austin Humphrey:
- Email: ahump20@outlook.com
- Phone: (210) 273-5538

**Technical issues?**
- Email: support@blazesportsintel.com

**Legal questions?**
- Email: legal@blazesportsintel.com

---

## Quick Deploy Command (One-Step)

```bash
#!/bin/bash
# deploy-legal.sh

echo "Deploying Blaze Sports Intelligence Legal Documentation..."

# Step 1: Verify email setup
echo "✓ Verify these emails are active:"
echo "  - legal@blazesportsintel.com"
echo "  - privacy@blazesportsintel.com"
echo "  - support@blazesportsintel.com"
echo "  - security@blazesportsintel.com"
read -p "Press Enter when emails are verified..."

# Step 2: Deploy legal files
echo "Deploying legal directory..."
wrangler pages deploy legal --project-name=blazesportsintel

# Step 3: Update sitemap
echo "Updating sitemap.xml..."
# Add sitemap update logic here

# Step 4: Notify
echo "✅ Legal documentation deployed successfully!"
echo "Next steps:"
echo "1. Test URLs: https://blazesportsintel.com/legal"
echo "2. Implement cookie consent banner"
echo "3. Add Terms acceptance to signup form"
echo "4. Register DMCA agent: https://www.copyright.gov/dmca-directory/"
echo "5. Consider trademark filings and insurance"
```

**Make executable:**
```bash
chmod +x deploy-legal.sh
./deploy-legal.sh
```

---

**Deployment Complete!** 🎉

Your legal documentation is now ready for production. Monitor user feedback and compliance requirements, and schedule quarterly reviews to keep policies current.

**Version:** 1.0
**Last Updated:** January 20, 2025
