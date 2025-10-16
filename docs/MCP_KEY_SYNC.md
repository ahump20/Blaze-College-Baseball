# MCP Key Synchronization

Use the `API_KEYS_MASTER.js` source to populate local configuration without committing secrets.

## Prerequisites
- Place `API_KEYS_MASTER.js` at the repository root. The file must export an object that contains your secrets.
- Ensure a sanitized `wrangler-championship.toml` template exists at the repository root. The sync command clones this file into
  `wrangler-championship.local.toml` with your MCP credentials. If the template is missing the script will warn and skip the
  Wrangler output.

## Generate local configuration
```bash
npm run mcp:sync
```

The command:
1. Scans `API_KEYS_MASTER.js` for supported keys (MCP, database, Redis, email, sports APIs).
2. Writes a `config/mcp.env` file containing environment variables (gitignored, mode `0600`).
3. Generates `wrangler-championship.local.toml` with the right MCP values for Cloudflare (gitignored, mode `0600`). If the
   template is absent the script exits successfully but logs a warning so you can add it before deploying.

If required keys are missing, the script exits with an error so you can fix the source file before deploying.

### Expected output

Successful runs emit masked confirmations similar to:

```text
✅ MCP environment values written to /path/to/repo/config/mcp.env
✅ Local Wrangler config generated at /path/to/repo/wrangler-championship.local.toml
🔐 Synced keys: MCP_SERVER_URL=ht***al, MCP_TOKEN=su***en, API_BASE_URL=ht***om
```

> ⚠️ If you do not provide `wrangler-championship.toml`, you will see a warning noting that the local Wrangler config was
> skipped. Create or copy the template into the repository root to enable Wrangler output.

> ⚠️ **Security**: The generated files stay on disk only and are ignored by Git. Do not check them into source control.
