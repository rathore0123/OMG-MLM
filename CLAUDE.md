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

## Remote Backend & Database (SSH reference)

The backend runs on a Windows RDP server, reached via two global MCP servers
(configured once in `~/.claude.json`, available in every project — no per-project
setup needed):

| Tool prefix | Purpose |
|---|---|
| `mcp__ssh__*` | SSH into `122.160.25.202` — file ops, remote exec, AND all SQL tools |
| `mcp__mssql__*` | Same SQL tools via a local TCP proxy into ssh-mcp (no second SSH connection) |

Both prefixes expose identical SQL tools; prefer `mcp__mssql__*` for SQL work.

### SQL Tools (both prefixes)

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
mcp__ssh__*   → ssh-mcp   → SSH exec → 122.160.25.202 runs PowerShell/ADO.NET → SQL Server 192.168.1.53:9989
mcp__mssql__* → mssql-mcp → TCP localhost:14332 → ssh-mcp (reuses the same SSH connection)
```

This is **not** a port-forward/tunnel to the DB port. `192.168.1.53:9989` is only
reachable from inside the RDP server's LAN, so `ssh-mcp` (`~/.claude/ssh-mcp/index.js`,
using the `ssh2` npm client) keeps one persistent SSH connection open to
`122.160.25.202` and, for every SQL call, base64/UTF-16LE-encodes a small
PowerShell script (`-EncodedCommand`, to dodge shell-quoting) that:
1. opens a `System.Data.SqlClient.SqlConnection` to `192.168.1.53:9989` **from
   the remote server itself**,
2. runs the query via `SqlDataAdapter`/`ExecuteNonQuery`,
3. serializes rows to JSON (`ConvertTo-Json`) and prints them,

then runs that script over the SSH exec channel (`conn.exec`) and captures stdout.
A local TCP broker on `127.0.0.1:14332` lets `mssql-mcp` submit `{action, sql}`
requests through this same SSH session without opening a second one.

`mssql-mcp`'s own env vars in `~/.claude.json` (`MSSQL_HOST=localhost`, etc.) are
vestigial — `mssql-mcp/index.js` ignores them and always proxies to
`127.0.0.1:14332`. The database actually queried is whatever `ssh-mcp` currently
has loaded from `db.config.json` below (it re-reads that file, not the env vars,
on every call — `getDbCfg()`).

### Switching DB / Project

Edit `C:\Users\Harsh Prajapati\.claude\mssql-mcp\db.config.json` — ssh-mcp rereads
it on every SQL call, no restart needed:

```json
{ "host": "192.168.1.53", "port": 9989, "database": "omg", "user": "sa", "password": "..." }
```

> As of this writing, `db.config.json` is pointed at a **different** project's
> database (`ZENTORACAPITAL`). Before running any SQL tool for OMG MLM work,
> switch `"database"` to `"omg"` (same DB the original `OMG_MLM` project used),
> or you'll be querying the wrong project's data.

Key server paths (on the RDP server, via `mcp__ssh__*`):
- API project: `C:\Projects\TestApi\` (.NET Core Web API, uses EF Core + stored procs)
- API config: `C:\Projects\TestApi\appsettings.json` (connection string)
- React build output: `C:\ReactBuilds\`

Use `mcp__mssql__get_stored_procedure` / `mcp__mssql__execute_command` to inspect
or modify stored procedures directly on the server.

---

## Production Build & Deploy

1. `base` in each panel's `vite.config.ts` is already set for this project:
   AdminPanel → `/admin`, MemberPanel → `/member`
2. Run `npm run build` — outputs to `dist/`
3. Upload `dist/` to `C:\ReactBuilds\` on the RDP server via `mcp__ssh__write_file`
   or `mcp__ssh__execute_remote`

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
