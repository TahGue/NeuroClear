import fs from "node:fs"
import path from "node:path"

export default async function globalTeardown() {
  const pidPath = path.join(process.cwd(), "playwright/.auth/server.pid")

  if (!fs.existsSync(pidPath)) return

  const raw = fs.readFileSync(pidPath, "utf8").trim()
  const pid = Number(raw)

  if (!Number.isFinite(pid)) return

  try {
    process.kill(-pid, "SIGTERM")
  } catch {
    try {
      process.kill(pid, "SIGTERM")
    } catch {
      // ignore
    }
  }

  try {
    fs.unlinkSync(pidPath)
  } catch {
    // ignore
  }
}
