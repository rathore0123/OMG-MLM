# CLAUDE.md

This file provides guidance to Claude Code when working with the OMG MLM NEW project.

## Project Overview

**OMG Foundation ERP** — Full-stack MLM ERP system with two React+Vite frontends and a .NET Core API backend.

This is the renamed/restructured successor of the original `OMG_MLM` project
(`C:\Users\Harsh Prajapati\Desktop\OMG_MLM`). Same backend, same database, same
stored-procedure gateway — folders were renamed and deploy base paths changed.

| Panel | Package | Folder | Base Path | React Version |
|---|---|---|---|---|
| **AdminPanel** | `trezo-admin` | `OMG-AdminPanel/` | `/admin` | React 19 |
| **MemberPanel** | `bdgcoin` | `OMG-MemberPanel/` | `/member` | React 18 |

Backend: single stored-procedure gateway — all data calls go through `POST /executeprocedure`.

API Base (production): `https://omginternational.live/mainapi/api/api/workforce`
API Base (direct/RDP, commented fallback in `.env`): `http://122.160.25.202/omgmlm/mainapi/api/api/workforce`

---

## Dev Commands

Run from inside the panel folder:

```bash
# AdminPanel
cd OMG-AdminPanel
npm install && npm run dev      # localhost:5173 (or next free port)

# MemberPanel
cd OMG-MemberPanel
npm install && npm run dev      # localhost:5173 (or next free port)
```

```bash
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

---

## Environment Variables

Both panels have `.env` already present (gitignored — do not commit).

### OMG-AdminPanel/.env

```env
VITE_APP_SECRET_KEY=BDGCoin$$2024#$%
VITE_DOOPAY_USERNAME=7007601881
VITE_DOOPAY_PASSWORD=7007601881
VITE_REGISTRATION_AMOUNT=10
VITE_REGISTRATION_RECEIVER=0x0000000000000000000000000000000000000000

VITE_APP_WEBSITEAPI_URL=https://omginternational.live/mainapi/api/api/workforce/
VITE_BILLPAY_URL=https://omginternational.live/mainapi/api/api/workforce/billpay
VITE_APP_API_URL=https://omginternational.live/mainapi/api/api/workforce
VITE_BASE_URL=https://omginternational.live/mainapi/api/api/workforce
VITE_LOGIN_URL=https://omginternational.live/mainapi/api/api/workforce/Login
VITE_COMPANY_DETAILS=https://omginternational.live/mainapi/api/api/workforce/GetCompanyDetails
VITE_MEMBER_LOGIN_URL=https://omginternational.live/mainapi/api/api/workforce/MemberLogin
VITE_EXEC_PROC=https://omginternational.live/mainapi/api/api/workforce
VITE_IMAGE_PREVIEW_URL=https://omginternational.live/mainapi/uploads/
VITE_IMAGE_PREVIEW_URL_2=https://omginternational.live/mainapi/uploads/
VITE_THEME_URL=https://omginternational.live/mainapi/api/api/workforce/GetActiveTheme
VITE_REGISTRATION_URL=https://omginternational.live/member/register
VITE_MEMBER_PANEL_URL=https://omginternational.live/member/loginauth
```

A commented-out block in the same `.env` swaps every URL to the direct RDP host
(`http://122.160.25.202/omgmlm/...`) for local/LAN testing against the backend
without going through the live domain.

### OMG-MemberPanel/.env

Same shape as AdminPanel's, plus `VITE_IMAGE_PREVIEW_URL_2` currently pointing at
the direct RDP host instead of the live domain — check this if uploads/images
don't resolve.

---

## Architecture

### Shared Stack

| Layer | Technology |
|---|---|
| Framework | React 18/19 + TypeScript + Vite 6 |
| Forms | Formik + Yup |
| HTTP | Axios (with interceptors) |
| Charts | ApexCharts, Recharts |
| Notifications | React-Toastify, SweetAlert2 |
| PDF/Excel | jsPDF, XLSX |
| Auth | AES-encrypted JWT in `localStorage.authtoken` |

### Stored Procedure Call Pattern

```ts
POST ${VITE_EXEC_PROC}/executeprocedure
Body: { ProcedureName: "USP_ProcName", Parameters: { ... } }
```

All stored procedures use the `USP_` prefix.

---

## Remote Backend & Database

Two real servers back this project — a live/production IIS box and a shared
dev box (used by several client projects, OMG included). Credentials are kept
out of git, in gitignored reference files at the repo root:
- `ServerCredentail/.env` — production server (SSH + DB)
- `DevelopmentServer-Credential/.env` — dev server (SSH + DB)

Dedicated global MCP servers (configured once in `~/.claude.json`, available in
every project) connect to each, using copies of the same `ssh-mcp`/`mssql-mcp`
scripts other projects on this machine use:

| Tool prefix | Server | Host | Purpose |
|---|---|---|---|
| `mcp__ssh-omg-prod__*` | Production (`omginternational.live`) | `82.180.144.51` | File ops, remote exec, SQL tools |
| `mcp__mssql-omg-prod__*` | Production | via ssh-omg-prod broker (port `14339`) | SQL tools, no second SSH connection |
| `mcp__ssh-omg-dev__*` | Dev (shared box, `C:\Projects\OMG\`) | `163.128.208.196` | File ops, remote exec — **no OMG database exists on this box yet** (see below) |
| `mcp__mssql-omg-dev__*` | Dev | via ssh-omg-dev broker (port `14340`) | Configured for when an OMG dev DB exists |

Prefer `mcp__mssql-omg-prod__*` for SQL work; both `ssh-omg-prod` and
`mssql-omg-prod` expose identical SQL tools.

> **The dev SQL Server has no `OMG` database.** `sys.databases` on
> `163.128.208.196` only has `AINet`, `BitMartsAyurveda`, `Funderax`, `LoanAPP`,
> `SunValley`, `TellMe` — no OMG. File/code access to `C:\Projects\OMG\` works
> fine via `mcp__ssh-omg-dev__*`; SQL tools via `mcp__mssql-omg-dev__*` will
> fail until an OMG database is created/restored there. All DB work happens
> against **production** for now.

### SQL Tools (both mssql/ssh prefixes)

| Tool | Purpose |
|---|---|
| `execute_query` | SELECT — returns JSON array |
| `execute_command` | CREATE / ALTER / DROP / INSERT / UPDATE / DELETE / EXEC |
| `list_tables` | All tables in current database |
| `list_stored_procedures` | All stored procedures |
| `get_stored_procedure` | Full definition of a procedure |
| `get_procedure_parameters` | Parameter list of a procedure |
| `describe_table` | Column definitions of a table |

### Connection Architecture

```
mcp__ssh-omg-prod__*   → ssh-mcp-omg-prod   → SSH exec → 82.180.144.51 runs PowerShell/ADO.NET → local SQL Server
mcp__mssql-omg-prod__* → mssql-mcp-omg-prod → TCP 127.0.0.1:14339 → ssh-mcp-omg-prod (reuses the same SSH connection)

mcp__ssh-omg-dev__*    → ssh-mcp-omg-dev    → SSH exec → 163.128.208.196 runs PowerShell/ADO.NET → local SQL Server
mcp__mssql-omg-dev__*  → mssql-mcp-omg-dev  → TCP 127.0.0.1:14340 → ssh-mcp-omg-dev (reuses the same SSH connection)
```

Same mechanism on both: `ssh-mcp-omg-*` (`~/.claude/ssh-mcp-omg-{prod,dev}/index.js`,
using the `ssh2` npm client) keeps one persistent SSH connection open and, for
every SQL call, base64/UTF-16LE-encodes a small PowerShell script
(`-EncodedCommand`, to dodge shell-quoting) that opens a
`System.Data.SqlClient.SqlConnection` **from the remote server itself**, runs
the query via `SqlDataAdapter`/`ExecuteNonQuery`, and serializes rows to JSON.
A local TCP broker (`127.0.0.1:14339` prod / `14340` dev) lets `mssql-mcp-omg-*`
submit `{action, sql}` requests through the same SSH session without opening a
second one.

The database actually queried is whatever `ssh-mcp-omg-*` currently has loaded
from its own `db.config.json` (re-read on every call, not cached) — see below.

### Switching DB / Project — READ THIS FIRST

`ssh-mcp-omg-prod` and `ssh-mcp-omg-dev` are **dedicated, OMG-only** copies —
their `db.config.json` should always say `"database": "OMG"` and there's no
reason to change it for this project:
- `C:\Users\Harsh Prajapati\.claude\ssh-mcp-omg-prod\db.config.json`
- `C:\Users\Harsh Prajapati\.claude\ssh-mcp-omg-dev\db.config.json`

**However**, both physical servers also host other client projects (AINet,
Funderax, TellMe, SunValley, ...), reached through their own *separate* global
MCP registrations (`ssh-prod`/`mssql-prod`/`ssh-dev2`/`mssql-dev2`, still
configured in `~/.claude.json`, pointed at the exact same two hosts). Those
were the original tools before the OMG-dedicated copies existed, and their own
`db.config.json` files (under `ssh-mcp-ainet-prod`/`ssh-mcp-ainet-dev2`) get
switched between projects by whoever is using them — **do not use the
`ssh-prod`/`mssql-prod`/`ssh-dev2`/`mssql-dev2` prefixes for OMG work**, they
are shared with AINet and will silently return the wrong project's data
whenever AINet work last left them pointed at `AINet`/`Ainet`. Use the
`-omg-` prefixed tools instead — they're isolated copies with their own ports
and their own `db.config.json`, so no other project's session can repoint them.

If `SELECT DB_NAME()` via `mcp__mssql-omg-prod__execute_query` ever returns
anything other than `OMG`, something edited that dedicated config by mistake —
fix `ssh-mcp-omg-prod\db.config.json`'s `"database"` field back to `"OMG"`.

Key server paths:
- Production site root (`mcp__ssh-omg-prod__*`): `C:\inetpub\vhosts\omginternational.live\httpdocs\` — contains `Admin\`, `MEMBER\`, `MainAPI\` directly (deploy target, not a separate `ReactBuilds\` staging dir)
- Dev project root (`mcp__ssh-omg-dev__*`): `C:\Projects\OMG\` — same `Admin\`, `MEMBER\`, `MainAPI\` layout

Use `mcp__mssql-omg-prod__get_stored_procedure` / `mcp__mssql-omg-prod__execute_command`
to inspect or modify stored procedures directly on the server.

---

## Production Build & Deploy

1. `base` in each panel's `vite.config.ts` is already set for this project:
   AdminPanel → `/admin`, MemberPanel → `/member`
2. Run `npm run build` — outputs to `dist/`
3. Upload `dist/` to the production site root via `mcp__ssh-omg-prod__write_file` /
   `mcp__ssh-omg-prod__execute_remote`. The live site
   (`C:\inetpub\vhosts\omginternational.live\httpdocs\`) has `Admin\` and
   `MEMBER\` folders directly under it, matching the panels' base paths —
   confirm the exact target subfolder against what's already deployed there
   before overwriting anything.

---

## Reference Project

`C:\Users\Harsh Prajapati\Desktop\OMG_MLM` — the original OMG MLM project this one
was restructured from. Its `CLAUDE.md` and `BUSINESS_SPEC.md` document full
business rules, algorithms, DB schema (table list, `USP_` stored-procedure list by
category), and API spec in detail — consult it for anything not covered here.

`C:\Users\Harsh Prajapati\Desktop\SmartBC\SmartBc_Member` — VisionX Global Member
Panel, built from the same template; structurally identical `src/utils/`,
`src/Service/`, `src/CommonElements/`. Uses `database: "visionx"` in
`db.config.json`.
