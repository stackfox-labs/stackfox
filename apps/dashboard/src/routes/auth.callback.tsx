import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
  head: () => ({
    meta: [
      {
        title: "StackFox Dashboard | Finalizing Roblox Sign-In",
      },
    ],
  }),
})

function AuthCallbackPage() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [state, setState] = useState<"loading" | "error">("loading")

  const params = useMemo(() => {
    if (typeof window === "undefined") {
      return new URLSearchParams()
    }

    return new URLSearchParams(window.location.search)
  }, [])

  useEffect(() => {
    const status = params.get("status")
    const returnTo = params.get("returnTo") || "/dashboard"

    if (status !== "success") {
      setState("error")
      return
    }

    refresh()
      .then(() => {
        navigate({ to: returnTo as "/dashboard" | "/" })
      })
      .catch(() => {
        setState("error")
      })
  }, [navigate, params, refresh])

  const message = params.get("message")

  return (
    <div className="flex min-h-screen bg-zinc-100">
      <main className="flex flex-1 items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-xl border-2 border-zinc-900 bg-white shadow-brutal-xl">
          <div className="border-b-2 border-zinc-900 bg-zinc-950 px-6 py-4">
            <div className="flex items-center gap-3">
              <Logo type="full" size="6" />
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Dashboard</p>
            </div>
          </div>

          <div className="space-y-5 p-6 sm:p-8">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Roblox OAuth</p>
              <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
                {state === "loading" ? "Finalizing sign-in" : "Sign-in failed"}
              </h1>
              <p className="text-sm text-zinc-600 sm:text-base">
                {state === "loading"
                  ? "Your StackFox dashboard session is being created. You will be redirected automatically."
                  : message || "The Roblox OAuth callback did not complete successfully."}
              </p>
            </div>

            <div className="border-2 border-zinc-900 bg-zinc-50 p-4 shadow-brutal-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Status</p>
              <p className="mt-2 text-sm text-zinc-700">
                {state === "loading"
                  ? "Waiting for the refreshed dashboard session before navigating back into the app."
                  : "Return to the dashboard root and start the Roblox sign-in flow again after checking your backend OAuth configuration."}
              </p>
            </div>

            {state === "error" ? (
              <Button asChild className="w-full sm:w-auto">
                <Link to="/dashboard">Go To Dashboard</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}