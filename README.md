# @pipeworx/wakatime

[WakaTime](https://wakatime.com/developers) MCP — coding-time stats by user (langs, projects, editors, OSes). Free API key.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1576+ live data sources.

## Auth

- Platform: `PLATFORM_WAKATIME_KEY`. BYO: `?_apiKey=…` (use your own API key — WakaTime data is per-user).

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

`https://wakatime.com/api/v1`

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

Both URLs reach the same gateway and the same 1576+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/wakatime_current_user \
  -H 'Content-Type: application/json' \
  -d '{}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/wakatime_current_user`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Standalone (no gateway account)

This package also runs as a local stdio MCP server — no Pipeworx account, no
gateway round-trip:

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

Or run it directly to confirm it starts:

```bash
npx -y @pipeworx/mcp-wakatime
```

It speaks MCP over stdin/stdout and answers `initialize`/`tools/list`/`tools/call`
for **only** this pack's tools — none of the shared meta-tools the gateway
connection above adds. Same source, same tools, no ask_pipeworx routing.

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
