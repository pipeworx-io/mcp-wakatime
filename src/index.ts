interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * WakaTime MCP.
 */


const BASE = 'https://wakatime.com/api/v1';
const UA = 'pipeworx-mcp-wakatime/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  { name: 'current_user', description: 'Authenticated user profile.', inputSchema: { type: 'object', properties: {} } },
  { name: 'user', description: 'Public profile.', inputSchema: { type: 'object', properties: { user_id: { type: 'string' } }, required: ['user_id'] } },
  {
    name: 'summaries',
    description: 'Daily summaries.',
    inputSchema: {
      type: 'object',
      properties: { user_id: { type: 'string' }, start: { type: 'string' }, end: { type: 'string' }, project: { type: 'string' }, branches: { type: 'string' }, timeout: { type: 'number' }, writes_only: { type: 'boolean' }, timezone: { type: 'string' } },
      required: ['user_id', 'start', 'end'],
    },
  },
  {
    name: 'stats',
    description: 'Aggregate stats.',
    inputSchema: {
      type: 'object',
      properties: { user_id: { type: 'string' }, range: { type: 'string' }, project: { type: 'string' }, timeout: { type: 'number' }, writes_only: { type: 'boolean' } },
      required: ['user_id', 'range'],
    },
  },
  {
    name: 'durations',
    description: 'Durations for a date.',
    inputSchema: {
      type: 'object',
      properties: { user_id: { type: 'string' }, date: { type: 'string' }, project: { type: 'string' }, branches: { type: 'string' }, timeout: { type: 'number' }, writes_only: { type: 'boolean' }, timezone: { type: 'string' }, slice_by: { type: 'string' } },
      required: ['user_id', 'date'],
    },
  },
  { name: 'heartbeats', description: 'Raw heartbeats for a date.', inputSchema: { type: 'object', properties: { user_id: { type: 'string' }, date: { type: 'string' } }, required: ['user_id', 'date'] } },
  { name: 'goals', description: "User's goals.", inputSchema: { type: 'object', properties: { user_id: { type: 'string' }, page: { type: 'number' } }, required: ['user_id'] } },
  { name: 'projects', description: "User's projects.", inputSchema: { type: 'object', properties: { user_id: { type: 'string' }, q: { type: 'string' } }, required: ['user_id'] } },
  { name: 'leaders', description: 'Public leaderboard.', inputSchema: { type: 'object', properties: { language: { type: 'string' }, country_code: { type: 'string' }, page: { type: 'number' } } } },
  {
    name: 'commits',
    description: 'Recent commits for a project.',
    inputSchema: {
      type: 'object',
      properties: { user_id: { type: 'string' }, project: { type: 'string' }, author: { type: 'string' }, branch: { type: 'string' }, page: { type: 'number' } },
      required: ['user_id', 'project'],
    },
  },
  { name: 'editors', description: 'Public editor stats.', inputSchema: { type: 'object', properties: {} } },
  { name: 'meta', description: 'Current API meta.', inputSchema: { type: 'object', properties: {} } },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string | undefined)?.trim();
  if (!apiKey) throw new Error('WakaTime requires an API key. Set PLATFORM_WAKATIME_KEY or pass ?_apiKey=… (free at https://wakatime.com/api-key).');
  // WakaTime accepts Basic auth with the API key as the username.
  const auth = `Basic ${btoa(apiKey + ':')}`;
  const get = async (path: string, params?: Record<string, unknown>) => {
    const p = new URLSearchParams();
    if (params) for (const [k, v] of Object.entries(params)) if (k !== '_apiKey' && v != null) p.set(k, String(v));
    const res = await fetch(`${BASE}${path}${[...p].length ? `?${p}` : ''}`, {
      headers: { Accept: 'application/json', 'User-Agent': UA, Authorization: auth },
    });
    if (res.status === 401 || res.status === 403) throw new Error('WakaTime: invalid API key.');
    if (!res.ok) throw new Error(`WakaTime: ${res.status}`);
    return res.json();
  };
  const reqStr = (k: string, ex: string) => {
    const v = args[k];
    if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${k}" is missing. Pass a string like ${ex}.`);
    return v;
  };
  switch (name) {
    case 'current_user':
      return get('/users/current');
    case 'user':
      return get(`/users/${encodeURIComponent(reqStr('user_id', '"current"'))}`);
    case 'summaries':
      return get(`/users/${encodeURIComponent(reqStr('user_id', '"current"'))}/summaries`, { start: args.start, end: args.end, project: args.project, branches: args.branches, timeout: args.timeout, writes_only: args.writes_only, timezone: args.timezone });
    case 'stats':
      return get(`/users/${encodeURIComponent(reqStr('user_id', '"current"'))}/stats/${encodeURIComponent(reqStr('range', '"last_7_days"'))}`, { project: args.project, timeout: args.timeout, writes_only: args.writes_only });
    case 'durations':
      return get(`/users/${encodeURIComponent(reqStr('user_id', '"current"'))}/durations`, { date: args.date, project: args.project, branches: args.branches, timeout: args.timeout, writes_only: args.writes_only, timezone: args.timezone, slice_by: args.slice_by });
    case 'heartbeats':
      return get(`/users/${encodeURIComponent(reqStr('user_id', '"current"'))}/heartbeats`, { date: args.date });
    case 'goals':
      return get(`/users/${encodeURIComponent(reqStr('user_id', '"current"'))}/goals`, { page: args.page });
    case 'projects':
      return get(`/users/${encodeURIComponent(reqStr('user_id', '"current"'))}/projects`, { q: args.q });
    case 'leaders':
      return get('/leaders', args);
    case 'commits':
      return get(`/users/${encodeURIComponent(reqStr('user_id', '"current"'))}/projects/${encodeURIComponent(reqStr('project', '"<project>"'))}/commits`, { author: args.author, branch: args.branch, page: args.page });
    case 'editors':
      return get('/editors');
    case 'meta':
      return get('/meta');
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
