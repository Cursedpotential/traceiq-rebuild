# Fallback resume (only if the overnight session died)

> _Byline: Claude Code · Fable 5 · 2026-07-24_

The 4:45AM pickup is scheduled INSIDE the running Claude Code session (job 38a084ec).
It requires that terminal to stay open. If the machine rebooted or the session closed,
open a terminal in `E:\AI_Workspace\Projects\traaceiq_mess` and run Claude Code with:

```
claude "Resume the TraceIQ overnight run. Read memory workspace-git-snapshot-recovery-asset.md and E:\AI_Workspace\Projects\traaceiq_mess\_unfuck\RESTRUCTURE_LEDGER.md. DB is live (traceiq on data-pg). Continue: salvage staging copies, working-layer transformation over chunks 2+3, wave-1 views, backups. Non-destructive only; no quarantine moves."
```

Do NOT run this while the original session is still alive — two sessions in one checkout
collide (known hazard, happened 2026-07-19/20).
