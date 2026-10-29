# @pipeworx/wakatime

[WakaTime](https://wakatime.com/developers) MCP — coding-time stats by user (langs, projects, editors, OSes). Account data is BYOK with your own WakaTime personal OAuth token; public data is keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1858+ live data sources. This is an independent, unofficial integration — not affiliated with, endorsed by, or published by the upstream provider.

## Auth

WakaTime API keys stop working for anything but editor plugins on 2026-11-01, so this pack takes **your own personal OAuth token** (sent as a Bearer token), passed as `_apiKey`. There is no platform credential.

- Needs your token: `current_user`, `summaries`, `durations`, `heartbeats`, `goals`, `projects`, `commits`, and any call with `user_id: "current"`. Without one the tool refuses and says it requires your WakaTime personal OAuth token.
- Keyless: `leaders`, `editors`, `meta`, and `user` / `stats` for public profiles (pass the token for private ones).

## Tools

- `current_user()` — authenticated user profile
- `user(user_id)` — public profile (use `current` for self)
- `summaries(user_id, start, end, project?, branches?, timeout?, writes_only?, timezone?)` — daily summaries
- `stats(user_id, range, project?, timeout?, writes_only?)` — aggregate stats (`range` = `last_7_days|last_30_days|last_6_months|last_year|all_time`)
- `durations(user_id, date, project?, branches?, timeout?, writes_only?, timezone?, slice_by?)` — durations for a date
- `heartbeats(user_id, date)` — raw heartbeats for a date (full visibility into edits)
- `goals(user_id, page?)` — user's goals
- `projects(user_id, q?)` — user's projects
- `leaders(language?, country_code?, page?)` — public leaderboard
- `commits(user_id, project, author?, branch?, page?)` — recent commits (if project linked to git)
- `editors()` — public editor stats
- `meta()` — current API meta

## Data source

WakaTime, public developer API.

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "wakatime": {
      "url": "https://gateway.pipeworx.io/wakatime/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/wakatime/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1858+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/wakatime_current_user \
  -H 'Content-Type: application/json' \
  -d '{}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/wakatime_current_user`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Run it from npm

`@pipeworx/mcp-wakatime` is a local stdio bridge to the Pipeworx gateway: your MCP client
starts it with `npx`, and it forwards every call to the same
`https://gateway.pipeworx.io/wakatime/mcp` endpoint shown above. It needs network access;
there is no offline mode.

```json
{
  "mcpServers": {
    "wakatime": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-wakatime"]
    }
  }
}
```

Without a key it calls anonymously, capped at 50 calls a day. A free account
raises that to 200 a day: get a key at https://pipeworx.io/signup and add
`"env": { "PIPEWORX_API_KEY": "<your key>" }` to the server entry.
The key is sent as a Bearer token, the same way a hosted connection sends it,
so calls are metered and billed exactly as they are there.

It lists **only** this pack's tools by default. Set `PIPEWORX_META_TOOLS=1` to
also list `ask_pipeworx` and the other gateway-wide tools.

Behind an HTTPS proxy: Node's built-in `fetch` does not read `HTTPS_PROXY` by
default. Newer Node releases honour it when `NODE_USE_ENV_PROXY=1` is set; check
your Node version's documentation.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Wakatime data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
