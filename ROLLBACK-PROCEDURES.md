# = Blaze Sports Intel - Rollback Procedures

**Version**: 1.0.0
**Last Updated**: 2025-10-11
**Owner**: Austin Humphrey
**Emergency Contact**: austin@blazesportsintel.com | (210) 273-5538

---

## =� Table of Contents

1. [Quick Reference](#quick-reference)
2. [Database Rollbacks](#database-rollbacks)
3. [API Rollbacks](#api-rollbacks)
4. [Frontend Rollbacks](#frontend-rollbacks)
5. [Full System Rollback](#full-system-rollback)
6. [Emergency Contacts](#emergency-contacts)
7. [Post-Rollback Checklist](#post-rollback-checklist)

---

## =� Quick Reference

### Emergency Rollback Commands

```bash
# OPTION 1: Rollback to previous Cloudflare Pages deployment
~/.npm-global/bin/wrangler pages deployment list --project-name blazesportsintel
~/.npm-global/bin/wrangler pages deployment rollback <DEPLOYMENT_ID> --project-name blazesportsintel

# OPTION 2: Rollback to specific git commit
git log --oneline -10  # Find the last known good commit
git revert HEAD --no-commit  # Revert latest commit
~/.npm-global/bin/wrangler pages deploy . --project-name blazesportsintel --branch main --commit-dirty=true

# OPTION 3: Rollback database migration
~/.npm-global/bin/wrangler d1 execute blazesports-db --file=schema/rollback_NNNN.sql
```

### Rollback Decision Matrix

| Issue                   | Severity     | Rollback Strategy                         | ETA    |
| ----------------------- | ------------ | ----------------------------------------- | ------ |
| API 500 errors          | **CRITICAL** | Immediate rollback to previous deployment | 2 min  |
| Database corruption     | **CRITICAL** | Restore from backup + rollback migrations | 15 min |
| UI rendering bug        | **HIGH**     | Rollback frontend deployment only         | 5 min  |
| Performance degradation | **MEDIUM**   | Rollback + investigate                    | 10 min |
| Analytics not tracking  | **LOW**      | Investigation first, rollback if needed   | 30 min |

---

## =� Database Rollbacks

### D1 Database Migration Rollback

Every migration must have a corresponding rollback script.

#### Step 1: Identify the Migration to Rollback

```bash
# List all migrations
ls -lh schema/*.sql

# Check which migrations have been applied
~/.npm-global/bin/wrangler d1 execute blazesports-db --remote --command="SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 10;"
```

#### Step 2: Create Rollback Script (if not exists)

```sql
-- schema/rollback_003_add_analytics.sql
-- Rollback for: 003_add_analytics.sql

-- Drop new tables
DROP TABLE IF EXISTS analytics_events;

-- Remove new columns
ALTER TABLE games DROP COLUMN IF EXISTS analytics_tracked;

-- Restore previous state
-- (Include specific restoration commands here)
```

#### Step 3: Execute Rollback

```bash
# Rollback on production
~/.npm-global/bin/wrangler d1 execute blazesports-db --remote --file=schema/rollback_003_add_analytics.sql

# Verify rollback
~/.npm-global/bin/wrangler d1 execute blazesports-db --remote --command="PRAGMA table_info(games);"
```

#### Step 4: Update Migration Tracking

```bash
# Mark migration as rolled back in schema_migrations table
~/.npm-global/bin/wrangler d1 execute blazesports-db --remote --command="
DELETE FROM schema_migrations WHERE version = '003';
"
```

### D1 Database Backup Restoration

If corruption occurs, restore from the most recent backup.

```bash
# List available backups
~/.npm-global/bin/wrangler d1 backup list blazesports-db

# Restore from specific backup
~/.npm-global/bin/wrangler d1 backup restore blazesports-db <BACKUP_ID>

# Verify restoration
~/.npm-global/bin/wrangler d1 execute blazesports-db --remote --command="SELECT COUNT(*) FROM games;"
```

---

## = API Rollbacks

### Cloudflare Workers Functions Rollback

#### Step 1: List Deployments

```bash
~/.npm-global/bin/wrangler pages deployment list --project-name blazesportsintel
```

Output example:

```
Deployment ID              Status    Created              Branch

abc123def456               Success   2025-10-11 14:23     main
xyz789ghi012               Success   2025-10-11 12:10     main  <- Last known good
uvw345jkl678               Failed    2025-10-11 14:00     main
```

#### Step 2: Rollback to Last Known Good Deployment

```bash
# Rollback to previous deployment (1 step back)
~/.npm-global/bin/wrangler pages deployment rollback --project-name blazesportsintel

# OR: Rollback to specific deployment ID
~/.npm-global/bin/wrangler pages deployment rollback xyz789ghi012 --project-name blazesportsintel
```

#### Step 3: Verify API Endpoints

```bash
# Test critical endpoints
curl -s https://blazesportsintel.com/api/nfl/teams?teamId=1001 | jq '.team.displayName'
curl -s https://blazesportsintel.com/api/mlb/standings | jq '.standings[0]'
curl -s https://blazesportsintel.com/api/copilot/health | jq '.status'
```

### API-Specific Rollback (Individual Endpoints)

If only a specific API endpoint is broken, you can rollback just that function:

```bash
# Identify the broken function
# Example: /functions/api/nfl/teams.js

# Restore from git history
git checkout HEAD~1 -- functions/api/nfl/teams.js

# Deploy with commit-dirty flag
~/.npm-global/bin/wrangler pages deploy . --project-name blazesportsintel --branch main --commit-dirty=true --commit-message="HOTFIX: Rollback NFL teams endpoint"
```

---

## <� Frontend Rollbacks

### Full Frontend Rollback

#### Step 1: Identify Last Known Good Commit

```bash
# View recent commits
git log --oneline -10

# Example output:
# abc123d (HEAD -> main) Enhance 3D graphics with V4 system
# xyz789f Add premium glassmorphism design
# uvw345e Integrate Analytics Engine monitoring  <- Last known good
```

#### Step 2: Rollback via Git Revert

```bash
# Revert the latest commit (preserves history)
git revert HEAD --no-commit

# Or revert multiple commits
git revert HEAD~2..HEAD --no-commit

# Commit the revert
git commit -m "ROLLBACK: Revert to known good state (commit uvw345e)"
```

#### Step 3: Deploy Reverted Code

```bash
~/.npm-global/bin/wrangler pages deploy . --project-name blazesportsintel --branch main
```

### Partial Frontend Rollback (Single Page)

If only a specific page is broken (e.g., copilot.html):

```bash
# Restore specific file from previous commit
git checkout HEAD~1 -- copilot.html

# Deploy
~/.npm-global/bin/wrangler pages deploy . --project-name blazesportsintel --branch main --commit-dirty=true --commit-message="HOTFIX: Rollback copilot.html"
```

### Static Assets Rollback

If issue is with static assets (CSS, JS, images):

```bash
# Restore entire public directory
git checkout HEAD~1 -- public/

# Or restore specific assets
git checkout HEAD~1 -- public/css/bsi-tokens.css
git checkout HEAD~1 -- public/js/blaze-particle-engine-v4.js

# Deploy
~/.npm-global/bin/wrangler pages deploy . --project-name blazesportsintel --branch main --commit-dirty=true
```

---

## < Full System Rollback

### Complete Platform Rollback (Nuclear Option)

Use when multiple systems are affected or root cause is unknown.

#### Step 1: Stop Incoming Traffic (Optional)

```bash
# Temporarily return 503 Service Unavailable via Worker
# This gives you time to investigate without affecting users further

# Create maintenance mode file
cat > functions/_middleware.js << 'EOF'
export async function onRequest(context) {
    return new Response(JSON.stringify({
        status: 'maintenance',
        message: 'Platform undergoing emergency maintenance. ETA: 15 minutes.',
        timestamp: new Date().toISOString()
    }), {
        status: 503,
        headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900' // 15 minutes
        }
    });
}
EOF

# Deploy maintenance mode
~/.npm-global/bin/wrangler pages deploy . --project-name blazesportsintel --branch main --commit-dirty=true --commit-message="EMERGENCY: Enable maintenance mode"
```

#### Step 2: Rollback All Components

```bash
# 1. Rollback database to last known good state
~/.npm-global/bin/wrangler d1 backup restore blazesports-db <LAST_GOOD_BACKUP_ID>

# 2. Rollback Cloudflare Pages deployment
~/.npm-global/bin/wrangler pages deployment rollback <LAST_GOOD_DEPLOYMENT_ID> --project-name blazesportsintel

# 3. Clear all caches
~/.npm-global/bin/wrangler kv:key delete --namespace-id a53c3726fc3044be82e79d2d1e371d26 --prefix ""

# 4. Verify all systems
./scripts/health-check.sh
```

#### Step 3: Re-enable Traffic

```bash
# Restore original middleware
git checkout HEAD~2 -- functions/_middleware.js  # Before maintenance mode commit

# Deploy
~/.npm-global/bin/wrangler pages deploy . --project-name blazesportsintel --branch main --commit-message="RESTORE: Exit maintenance mode after rollback"
```

---

## =� Emergency Contacts

### Primary Contact

**Austin Humphrey**
=� austin@blazesportsintel.com
=� (210) 273-5538
=P Availability: 24/7 for critical issues

### Cloudflare Support

**Enterprise Support** (if subscribed)
< https://dash.cloudflare.com/?to=/:account/support
=� support@cloudflare.com
=� +1 (888) 993-5273

### Third-Party Service Status

- **Cloudflare Status**: https://www.cloudflarestatus.com/
- **GitHub Status**: https://www.githubstatus.com/
- **SportsDataIO Status**: Check API response codes

---

##  Post-Rollback Checklist

After executing a rollback, complete this checklist to ensure system stability:

### Immediate (0-15 minutes)

- [ ] Verify site is accessible: https://blazesportsintel.com
- [ ] Test critical API endpoints (NFL, MLB, NBA, CFB, CBB)
- [ ] Check Analytics Engine is receiving data
- [ ] Verify database queries are working
- [ ] Test AI Copilot semantic search
- [ ] Check 3D graphics rendering on desktop and mobile
- [ ] Verify footer links and legal pages

### Short-term (15-60 minutes)

- [ ] Review Analytics Engine logs for errors
- [ ] Check error rates in monitoring dashboard
- [ ] Verify cache hit rates are normal
- [ ] Test all sport-specific pages (MLB, NFL, CFB, CBB)
- [ ] Verify data freshness (last update timestamps)
- [ ] Check WebSocket connections (if implemented)
- [ ] Test landing pages (data-transparency.html, features.html)

### Follow-up (1-24 hours)

- [ ] Document root cause of issue
- [ ] Create post-mortem report
- [ ] Update rollback procedures if needed
- [ ] Notify stakeholders of resolution
- [ ] Schedule fix for original issue
- [ ] Review monitoring alerts and thresholds
- [ ] Update CHANGELOG.md with rollback event

---

## =� Rollback Metrics to Track

After each rollback, record the following metrics:

```markdown
### Rollback Event: YYYY-MM-DD HH:MM

**Trigger**: [What caused the rollback?]
**Affected Systems**: [Database / API / Frontend / All]
**Downtime**: [Total time from detection to resolution]
**Impact**: [Number of users affected, if known]
**Rollback Method**: [Cloudflare rollback / Git revert / Database restore]
**Resolution Time**: [Time to complete rollback]
**Root Cause**: [What caused the issue?]
**Prevention**: [How to prevent in the future?]

**Timeline**:

- 14:00 - Issue detected
- 14:05 - Rollback initiated
- 14:10 - Rollback completed
- 14:15 - Verification complete
- 14:20 - All systems nominal
```

---

## = Access and Permissions

### Required Access

To execute rollbacks, you need:

1. **Cloudflare Dashboard Access**: account-level permissions
2. **Wrangler CLI**: installed and authenticated (`wrangler login`)
3. **GitHub Access**: push access to `ahump20/BSI` repository
4. **Command Line Access**: macOS/Linux terminal with bash
5. **Environment Variables**: Properly configured Cloudflare API tokens

### Verify Access

```bash
# Verify Wrangler authentication
~/.npm-global/bin/wrangler whoami

# Verify Git access
git remote -v

# Verify database access
~/.npm-global/bin/wrangler d1 list
```

---

## =� References

- [Cloudflare Pages Deployments](https://developers.cloudflare.com/pages/configuration/deployments/)
- [D1 Database Backups](https://developers.cloudflare.com/d1/platform/backups/)
- [Git Revert Documentation](https://git-scm.com/docs/git-revert)
- [Blaze Sports Intel Architecture](./ARCHITECTURE.md)
- [Engineering Assessment Report](./docs/ENGINEERING-ASSESSMENT.md)

---

**� Important**: Always test rollback procedures in a staging environment before executing in production. Keep this document up-to-date as the platform evolves.

**Last Reviewed**: 2025-10-11
**Next Review**: 2025-11-11
