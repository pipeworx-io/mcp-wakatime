# @pipeworx/wakatime

[WakaTime](https://wakatime.com/developers) MCP — coding-time stats by user (langs, projects, editors, OSes). Free API key.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Wakatime data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
