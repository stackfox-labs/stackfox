export interface DashboardRecord {
  id: string
  project_id: string
  collection: string
  record_key: string
  data_jsonb: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DashboardEvent {
  id: string
  project_id: string
  event_name: string
  payload_json: Record<string, unknown>
  created_at: string
}

export interface DashboardLogEntry {
  id: string
  action: string
  status: string
  message: string
  meta: Record<string, unknown> | null
  created_at: string
}

export interface DashboardOverview {
  ok: boolean
  project: {
    id: string
    name: string
    api_key: string
    created_at: string
  }
  events: Array<DashboardEvent>
  records: Array<DashboardRecord>
  logs: Array<DashboardLogEntry>
}

export const sampleDashboardOverview: DashboardOverview = {
  ok: true,
  project: {
    id: "proj_demo",
    name: "Dungeon Crawler Live Ops",
    api_key: "sf_live_demo0000000000000000000000",
    created_at: "2026-03-15T02:00:00.000Z",
  },
  events: [
    {
      id: "evt_1",
      project_id: "proj_demo",
      event_name: "player_join",
      payload_json: { userId: "player_1", username: "Tiago", region: "us-east" },
      created_at: "2026-03-15T02:15:00.000Z",
    },
    {
      id: "evt_2",
      project_id: "proj_demo",
      event_name: "item_purchase",
      payload_json: { userId: "player_1", item: "sword", cost: 50 },
      created_at: "2026-03-15T02:14:00.000Z",
    },
  ],
  records: [
    {
      id: "rec_1",
      project_id: "proj_demo",
      collection: "players",
      record_key: "player_1",
      created_at: "2026-03-15T02:12:00.000Z",
      updated_at: "2026-03-15T02:14:00.000Z",
      data_jsonb: {
        username: "Tiago",
        coins: 100,
        level: 5,
        inventory: { slots: 24, equipped: ["sword", "shield"] },
      },
    },
    {
      id: "rec_2",
      project_id: "proj_demo",
      collection: "guilds",
      record_key: "guild_alpha",
      created_at: "2026-03-15T02:13:00.000Z",
      updated_at: "2026-03-15T02:13:00.000Z",
      data_jsonb: {
        name: "Alpha Raiders",
        memberCount: 18,
      },
    },
  ],
  logs: [],
}
