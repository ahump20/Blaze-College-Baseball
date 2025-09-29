# 🔥 Blaze Sports Platform - Master Configuration Guide

**Repository:** BSI (ahump20/BSI)  
**Domain:** blazesportsintel.com  
**Platform:** Cloudflare Pages Exclusive  
**Brand:** Blaze Intelligence - Deep South Sports Authority  
**Updated:** January 26, 2025

---

## 🎯 Platform Overview

The Blaze Sports Intel platform (blazesportsintel.com) is a championship-level sports intelligence platform exclusively deployed on Cloudflare Pages. This document serves as the definitive reference for all platform configurations, deployment standards, and operational procedures.

### Core Identity
- **Brand Name:** Blaze Intelligence (never use other names)
- **Platform Focus:** Deep South Sports Authority
- **Sports Coverage:** Baseball, Football, Basketball, Track & Field (NO soccer)
- **Target Region:** Southeastern United States
- **Domain:** blazesportsintel.com (primary), blazesportsintel.pages.dev (fallback)

---

## 🏗️ Technical Architecture

### Deployment Platform (EXCLUSIVE)
```yaml
Primary Platform: Cloudflare Pages
- Commands: wrangler pages deploy
- Storage: Cloudflare R2 for media assets
- Database: Cloudflare D1 for structured data
- Cache: Cloudflare KV for session/cache data
- Functions: Cloudflare Workers
- CDN: Cloudflare global edge network

PROHIBITED PLATFORMS:
❌ Netlify (completely removed)
❌ Vercel (not supported)
❌ Replit (not suitable)
❌ Any other hosting platform
```

### Repository Structure
```
BSI (ahump20/BSI)/
├── index.html                   # Main championship platform
├── wrangler.toml               # Primary Cloudflare configuration
├── _headers                    # Enterprise security headers
├── _redirects                  # URL management
├── functions/                  # Cloudflare Workers functions
│   ├── api/championship.js     # Team data & analytics
│   └── api/live-scores.js      # Real-time game scores
├── css/                        # Styling (burnt orange #BF5700)
├── js/                         # JavaScript modules
├── data/                       # Sports data integration
└── docs/                       # Documentation
```

---

## 🚀 Deployment Standards

### Production Deployment
```bash
# Standard deployment command
cd /path/to/BSI
wrangler pages deploy . --project-name=blazesportsintel --env=production

# Verification
curl -I https://blazesportsintel.com
curl -I https://blazesportsintel.pages.dev
```

### Environment Configuration
```yaml
Production:
  URL: https://blazesportsintel.com
  Fallback: https://blazesportsintel.pages.dev
  
Preview:
  URL: https://preview.blazesportsintel.com
  Branch: preview
  
Development:
  Local: http://localhost:8080
  Testing: wrangler pages dev
```

### Security Headers (_headers file)
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
  Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 🎯 Agent Configuration Standards

### Standard Agent Template
```markdown
---
name: [agent-name]
description: [Clear, specific description for BSI/Cloudflare Pages context]
model: [specific-model or defined-parent]
platforms: cloudflare-pages
repository: BSI
---

You are a [role] specialized in Cloudflare Pages deployment for the Blaze Sports Intel platform (blazesportsintel.com).

## Platform Standards
- **Deployment:** Cloudflare Pages exclusively
- **Commands:** `wrangler pages deploy` for production
- **Storage:** Cloudflare R2 for media assets
- **Database:** Cloudflare D1 for structured data
- **Cache:** Cloudflare KV for session/cache data

## Repository Context
- **Repo:** BSI (ahump20/BSI)
- **Domain:** blazesportsintel.com
- **Brand:** Blaze Intelligence (never use other names)

## Sports Focus
- **Primary:** Baseball, Football, Basketball, Track & Field
- **Region:** Deep South / Southeastern United States
- **Prohibited:** Soccer content

[Specific agent instructions...]
```

### Agent Workflow Patterns

#### Deployment Sequence
```bash
1. @blaze-sports-intel-updater  # Gather latest features
2. @cloudflare-domain-manager    # Verify domain config
3. @web-deployment-specialist    # Execute deployment
4. @project-veracity-auditor     # Validate deployment
```

#### Sports Data Integration
```bash
1. @sports-intelligence-analyst  # Analyze data requirements
2. @sports-feature-engineer      # Create features
3. @deep-south-sports-authority  # Apply regional focus
4. @blaze-implementation-executor # Implement on site
```

#### Quality Assurance
```bash
1. @site-integrity-guardian      # Check site integrity
2. @data-drift-monitor          # Verify data accuracy
3. @brand-consistency-enforcer  # Ensure brand compliance
```

---

## 🏆 Sports Intelligence Features

### Championship Analytics Dashboard
- **3D Visualizations:** Three.js powered sports analytics
- **Real-time Data:** Live game scores and statistics
- **Monte Carlo Simulations:** Predictive sports modeling
- **Biomechanics Analysis:** AI-powered motion analysis
- **Team Performance Metrics:** Comprehensive championship data

### Data Sources (Legitimate & Attributed)
- **MLB Stats API:** Official Major League Baseball data
- **NFL Game Center:** National Football League statistics
- **NBA Stats:** National Basketball Association data
- **NCAA Statistics:** College sports data
- **Perfect Game USA:** Youth baseball intelligence

### Regional Specialization
- **Deep South Focus:** SEC, ACC, Southern Conference
- **Local Teams:** Regional championship coverage
- **Recruitment Intelligence:** College and professional scouting
- **Historical Analysis:** Southern sports heritage

---

## 🔧 Troubleshooting & Maintenance

### Common Issues

#### Domain 404 Errors
**Cause:** Domain routing to R2 storage instead of Pages
**Solution:**
1. Remove domain from R2 bucket configuration
2. Add domain to Pages project custom domains
3. Wait 1-2 minutes for DNS propagation

#### Deployment Failures
**Cause:** Incorrect wrangler configuration
**Solution:**
1. Verify wrangler.toml is properly configured
2. Check Cloudflare account permissions
3. Use `wrangler pages deploy --help` for debugging

### Monitoring
- **Analytics:** Cloudflare Analytics dashboard
- **Performance:** Web Vitals monitoring
- **Errors:** Real-time error tracking
- **Security:** Security header validation

---

## 📋 Operational Procedures

### Daily Operations
- [ ] Monitor deployment status
- [ ] Check analytics for performance issues
- [ ] Verify all sports data feeds are operational
- [ ] Review security headers and SSL certificates

### Weekly Maintenance
- [ ] Update sports data integrations
- [ ] Review agent performance and optimization
- [ ] Test backup deployment procedures
- [ ] Audit brand consistency across platform

### Monthly Reviews
- [ ] Comprehensive platform audit
- [ ] Agent configuration optimization
- [ ] Performance benchmark analysis
- [ ] Security vulnerability assessment

---

## 🎨 Brand Standards

### Visual Identity
- **Primary Color:** Burnt Orange (#BF5700)
- **Secondary Colors:** Deep South themed palette
- **Typography:** Championship-grade fonts
- **Logo:** Blaze Intelligence flame icon

### Content Guidelines
- **Voice:** Authoritative sports intelligence
- **Tone:** Championship-focused, data-driven
- **Terminology:** "Blaze Intelligence" (never other names)
- **Regional:** Deep South Sports Authority positioning

### Prohibited Content
- ❌ Soccer/football (international) content
- ❌ References to other platforms (Netlify, Vercel, etc.)
- ❌ Non-championship focused content
- ❌ Brand names other than "Blaze Intelligence"

---

## 📞 Support & Escalation

### Technical Support
- **Repository Issues:** GitHub Issues (ahump20/BSI)
- **Deployment Problems:** Cloudflare Pages documentation
- **Agent Optimization:** AGENT-CONFIGURATION-OPTIMIZATION-REPORT.md

### Escalation Path
1. **Level 1:** Check this document and existing reports
2. **Level 2:** Review agent-specific documentation
3. **Level 3:** Create GitHub issue with detailed context
4. **Level 4:** Platform administrator intervention

---

## 🔄 Version Control

**Document Version:** 1.0  
**Last Updated:** January 26, 2025  
**Next Review:** February 26, 2025  
**Approved By:** Austin Humphrey / Blaze Intelligence  

### Change Log
- **v1.0 (2025-01-26):** Initial comprehensive platform documentation
- **Future:** Regular updates based on platform evolution

---

**🔥 This document is the single source of truth for all Blaze Sports Platform operations. All agents, deployments, and configurations must align with these standards.**