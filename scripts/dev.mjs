import { spawn } from "node:child_process"

const commandSpecs = [
  ["cmd.exe", ["/d", "/s", "/c", "npm run dev --workspace @stackfox/api"]],
  ["cmd.exe", ["/d", "/s", "/c", "npm run dev --workspace @stackfox/dashboard"]],
]

const children = commandSpecs.map(([command, args]) =>
  spawn(command, args, {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: false,
  }),
)

let shuttingDown = false

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return
  }

  shuttingDown = true

  for (const child of children) {
    if (!child.killed) {
      child.kill()
    }
  }

  process.exit(exitCode)
}

for (const child of children) {
  child.on("exit", (code) => {
    if (shuttingDown) {
      return
    }

    shutdown(code ?? 0)
  })
}

process.on("SIGINT", () => shutdown(0))
process.on("SIGTERM", () => shutdown(0))