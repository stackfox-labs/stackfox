import { HeadContent, Link, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import appCss from "../styles.css?url"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Logo } from "@/components/logo"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "StackFox Dashboard" },
      {
        name: "description",
        content: "Manage StackFox projects, events, records, logs, and API keys from the developer dashboard.",
      },
      { property: "og:title", content: "StackFox Dashboard" },
      {
        property: "og:description",
        content: "Manage StackFox projects, events, records, logs, and API keys from the developer dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background font-sans text-foreground">
        <AuthProvider>{children}</AuthProvider>
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen bg-zinc-100">
      <main className="flex flex-1 items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-2xl border-2 border-zinc-900 bg-white shadow-brutal-xl">
          <div className="border-b-2 border-zinc-900 bg-zinc-950 px-6 py-4">
            <div className="flex items-center gap-3">
              <Logo type="full" size="6" />
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">Dashboard</p>
            </div>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">404</p>
              <h1 className="text-3xl font-black text-zinc-950 sm:text-4xl">Page not found</h1>
              <p className="max-w-xl text-sm text-zinc-600 sm:text-base">
                This dashboard page does not exist anymore, or the URL is invalid for your current session.
              </p>
            </div>

            <div className="border-2 border-zinc-900 bg-zinc-50 p-4 shadow-brutal-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">What to do next</p>
              <p className="mt-2 text-sm text-zinc-700">
                Go back to the dashboard root and select a valid project, or return to the previous page.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="sm:min-w-44">
                <Link to="/dashboard">Go To Dashboard</Link>
              </Button>
              <BackButton variant="outline" className="border-2 border-zinc-900 sm:min-w-32">
                Go Back
              </BackButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}