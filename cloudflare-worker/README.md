# WordBridge Proxy Backend (Cloudflare Workers)

## 1. Prerequisites
- A free Cloudflare account: https://dash.cloudflare.com/
- OpenRouter API key: https://openrouter.ai/keys
- Node.js (LTS) on your Mac, for Wrangler deployment.

## 2. Deploy the Worker
In Terminal, enter this folder:
```bash
cd wordbridge-proxy/cloudflare-worker
npm create cloudflare@latest -- --existing
```
If prompted, select the current directory / Worker project. Alternatively install Wrangler:
```bash
npm install -D wrangler
npx wrangler login
```
Set the OpenRouter key as an encrypted Worker secret:
```bash
npx wrangler secret put OPENROUTER_API_KEY
```
Paste the key when prompted. Do not put it in wrangler.toml, source code, or Git.

Deploy:
```bash
npx wrangler deploy
```
Wrangler prints a URL similar to:
`https://wordbridge-proxy.<your-subdomain>.workers.dev`

## 3. Connect the extension
Replace `YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev` in:
- `extension/background.js` (API_ENDPOINT)
- `extension/manifest.json` (host_permissions)

Use the exact Worker hostname, e.g.
`https://wordbridge-proxy.yourname.workers.dev/translate`
and host permission:
`https://wordbridge-proxy.yourname.workers.dev/*`

Reload the extension at chrome://extensions/ and refresh the webpage.

## 4. Test the API
```bash
curl -i -X POST 'https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev/translate' \
  -H 'Content-Type: application/json' \
  -d '{"word":"beautiful","language":"hindi"}'
```
Expected JSON shape:
```json
{"translation":"सुंदर","meaning":"pleasing to the senses or mind","language":"Hindi"}
```

## Security and abuse prevention
- The OpenRouter key exists only as the Cloudflare Worker secret `OPENROUTER_API_KEY`.
- This endpoint is publicly reachable. CORS is not authentication; non-browser clients can call it.
- Before sharing the extension publicly, configure Cloudflare rate limiting / WAF rules for `/translate`, monitor usage, and consider requiring Cloudflare Turnstile or an authenticated user system. A static bearer token embedded in an extension is extractable and is not a secure secret.
- Cloudflare Workers Free currently lists 100,000 requests/day and 10 ms CPU per invocation; provider/model usage and limits are separate. See https://developers.cloudflare.com/workers/platform/limits/
