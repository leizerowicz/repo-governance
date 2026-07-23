# Proposal-Submitted Webhook — Configure Outbound Webhook to ai-fleet

**Client:** Hopskip (internal)
**Source:** ai-fleet #1280 P1 (event→tool dispatch primitive, ADR-057)
**Scope:** Configure the Sourcing API to send a webhook when a proposal is submitted, so ai-fleet can auto-score proposals headlessly.

## Context

ai-fleet now has an event→tool dispatch primitive (ADR-057) that invokes host-native tools directly from inbound CloudEvents — no LLM orchestration, no state machine. The first use case is **headless scoring**: when a hotel submits a proposal, ai-fleet automatically scores all proposals for that RFP, so scores are ready before the planner even opens the evaluation view.

For this to work, the Sourcing API (owned by analytics-infrastructure) needs to send an HTTP webhook to the ai-fleet host when a proposal is submitted. The full integration spec is in `docs/event-integration-proposal-submitted.md` in ai-fleet — this prompt is the actionable version for your repo.

## What to do

### 1. Identify the proposal-submitted event source

Find where in the Sourcing API codebase a proposal submission is finalized (the handler/controller that persists the proposal and returns success to the hotel). This is the hook point where the webhook should fire.

If there's already an event/message bus (Service Bus, Event Grid, etc.) that emits on proposal submission, you can wire the webhook as a consumer of that event rather than modifying the submission handler directly.

### 2. Implement the webhook sender

Send an HTTP POST to the ai-fleet host when a proposal is submitted. The body is a **native CloudEvent v1.0** — not a custom payload.

**Endpoint:**
```
POST https://agents.myhopskip.com/events/hopskip-sourcing
```

**Content-Type:** `application/json`

**CloudEvent fields (top-level):**

| Field | Value | Notes |
|-------|-------|-------|
| `specversion` | `"1.0"` | CloudEvents spec version |
| `id` | `<your-event-id>` | Unique per event instance — used for idempotent dispatch. You own this. |
| `source` | `"https://hopskip.com/data-platform"` | **Must be exactly this value.** Identifies the producer. |
| `type` | `"proposal.submitted"` | **Must be exactly this value.** Identifies the event type. |
| `time` | `<ISO 8601>` | When the event occurred |
| `datacontenttype` | `"application/json"` | |
| `data` | object | See below |

**Required `data` fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rfp_id` | string | **yes** | The RFP/event plan ID (same ID used by `find_rfps`) |
| `proposal_id` | string | **yes** | The proposal ID that was submitted |
| `planner_email` | string | **yes** | The planner's email — used to resolve their workspace for scoring |

**Optional `data` fields:**

| Field | Type | Description |
|-------|------|-------------|
| `venue_name` | string | Hotel/venue name (for logging/audit) |
| `environment` | string | `prod` \| `demo` \| `qa` \| `dev` (defaults to `prod`) |
| `submitted_at` | string (ISO 8601) | When the proposal was submitted |

The `planner_email` is used by ai-fleet to resolve the planner's workspace for scoring. Send the email associated with the planner who owns the RFP.

### Example CloudEvent

```json
{
  "specversion": "1.0",
  "id": "evt-20260721-001",
  "source": "https://hopskip.com/data-platform",
  "type": "proposal.submitted",
  "time": "2026-07-21T14:30:00Z",
  "datacontenttype": "application/json",
  "data": {
    "rfp_id": "01J5X8KQZ4N7RHT3YM2BCD6F9A",
    "proposal_id": "01J5X8M2PBH3QNKR7V9STY4F0C",
    "planner_email": "planner@meetingencore.com",
    "venue_name": "Grand Hyatt San Antonio",
    "environment": "prod",
    "submitted_at": "2026-07-21T14:30:00Z"
  }
}
```

### 3. Implement HMAC-SHA256 authentication

Sign the raw request body with a shared secret and send the signature in the `X-Signature` header.

**Header format:**
```
X-Signature: sha256=<hex-encoded-hmac-digest>
```

**How to compute:**
1. Take the **raw JSON body bytes** (the exact bytes you're POSTing — do not re-serialize or pretty-print after signing)
2. Compute `HMAC-SHA256(key=SHARED_SECRET, message=raw_body_bytes)`
3. Hex-encode the digest
4. Send as `X-Signature: sha256=<hex>`

**Important:** Send the exact body bytes you signed. If your HTTP client re-serializes the JSON, the signature won't match. Use raw bytes for both signing and sending.

**Example (C# / .NET):**
```csharp
using System.Security.Cryptography;
using System.Text;

var bodyJson = JsonSerializer.Serialize(payload);
var bodyBytes = Encoding.UTF8.GetBytes(bodyJson);

using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(sharedSecret));
var hash = hmac.ComputeHash(bodyBytes);
var signature = Convert.ToHexString(hash).ToLowerInvariant();

httpClient.DefaultRequestHeaders.Add("X-Signature", $"sha256={signature}");
var content = new StringContent(bodyJson, Encoding.UTF8, "application/json");
await httpClient.PostAsync("https://agents.myhopskip.com/events/hopskip-sourcing", content);
```

### 4. Store the shared secret

The shared secret will be coordinated out-of-band (1Password shared vault or Azure Key Vault direct). Store it in your application's secret store (Key Vault reference, app setting, etc.) — **never** in code, config files, or commits.

ai-fleet stores its copy as `WEBHOOK_HMAC_SECRET_HOPSKIP_SOURCING` in Key Vault, injected as an env var on the Container App.

### 5. Handle the response

- **202 Accepted** — event received, scoring will run asynchronously. Success.
- **401 Unauthorized** — HMAC signature invalid or missing. Check your signing logic.
- **400 Bad Request** — payload validation failed (missing required fields, invalid email, etc.).
- **404 Not Found** — the `hopskip-sourcing` source is not registered (should not happen in prod).

**Retries:** The webhook is safe to retry. ai-fleet derives a stable event ID from `rfp_id + proposal_id` and the scoring pipeline is idempotent (uses `input_hash` to upsert, not duplicate). Retry on 5xx and timeouts with exponential backoff. Do not retry on 400 or 401 — fix the payload or signature instead.

### 6. Test against dev

In non-production environments, auth is bypassed if no HMAC secret is configured. You can send unsigned POSTs to the dev host for initial testing:

```bash
curl -X POST https://agents-dev.myhopskip.com/events/hopskip-sourcing \
  -H 'Content-Type: application/json' \
  -d '{"specversion":"1.0","id":"test-001","source":"https://hopskip.com/data-platform","type":"proposal.submitted","time":"2026-07-21T14:30:00Z","datacontenttype":"application/json","data":{"rfp_id":"test-rfp","proposal_id":"test-prop","planner_email":"planner@example.com","environment":"dev"}}'
```

Once the HMAC secret is configured on dev, test your signature computation:

```bash
SECRET="your-shared-secret"
BODY='{"specversion":"1.0","id":"test-001","source":"https://hopskip.com/data-platform","type":"proposal.submitted","time":"2026-07-21T14:30:00Z","datacontenttype":"application/json","data":{"rfp_id":"test","proposal_id":"p1","planner_email":"planner@example.com","environment":"dev"}}'
SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')
curl -X POST https://agents-dev.myhopskip.com/events/hopskip-sourcing \
  -H 'Content-Type: application/json' \
  -H "X-Signature: sha256=$SIG" \
  -d "$BODY"
```

### 7. Add monitoring

Add an alert for webhook delivery failures (non-2xx responses or timeouts). The webhook is fire-and-forget from the planner's perspective — they won't know scoring didn't trigger. An alert ensures the analytics-infrastructure team can catch delivery issues before the planner notices missing scores.

## Verifiable outcomes

- [ ] Webhook sender implemented at the proposal-submission hook point
- [ ] HMAC-SHA256 signing implemented and tested against dev
- [ ] Shared secret stored in Key Vault (not in code/config/commits)
- [ ] Retry logic implemented for 5xx and timeouts
- [ ] Monitoring alert configured for delivery failures
- [ ] End-to-end test: submit a proposal in dev → verify 202 response → verify scores appear in ai-fleet evaluation view within ~1 minute

## Questions

- **Endpoint or auth issues:** ai-fleet team (repo owner)
- **Payload field semantics:** analytics-infrastructure owns the Sourcing API data model — confirm the `rfp_id` and `proposal_id` formats match what ai-fleet's `find_rfps` / `list_rfp_proposals` tools expect
- **Secret coordination:** 1Password shared vault or Key Vault direct
- **Full integration spec:** `docs/event-integration-proposal-submitted.md` in ai-fleet
