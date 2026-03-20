import { Link, useNavigate, useRouterState } from "@tanstack/react-router"
import {
  ActivityIcon,
  BookOpenIcon,
  CodeIcon,
  DatabaseIcon,
  EyeIcon,
  KeyIcon,
  LayoutDashboardIcon,
  LinkIcon,
  LogOutIcon,
  MegaphoneIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  ScrollTextIcon,
  SettingsIcon,
  UserIcon,
  ZapIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import type { AuthProject } from "@/lib/auth"
import { useAuth } from "@/components/auth/auth-provider"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"

interface SidebarProps {
  projects: Array<AuthProject>
  projectId: string
  docsOpen: boolean
  onDocsToggle: () => void
}

interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  comingSoon?: boolean
  children?: Array<NavItem>
}

const navItems: Array<NavItem> = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboardIcon,
    children: [
      { label: "Overview", path: "", icon: EyeIcon },
      { label: "Setup", path: "/setup", icon: CodeIcon },
    ],
  },
  {
    label: "Events",
    path: "/events",
    icon: MegaphoneIcon,
    children: [
      { label: "Events", path: "/events", icon: MegaphoneIcon },
    ],
  },
  {
    label: "Records",
    path: "/records",
    icon: DatabaseIcon,
    children: [
      { label: "Records", path: "/records", icon: DatabaseIcon },
    ],
  },
  {
    label: "Activity",
    path: "/usage",
    icon: ActivityIcon,
    children: [
      { label: "Usage", path: "/usage", icon: ActivityIcon },
      { label: "Logs", path: "/logs", icon: ScrollTextIcon },
    ],
  },
  {
    label: "Upcoming",
    path: "",
    icon: ZapIcon,
    children: [
      { label: "Connectors", path: "", icon: LinkIcon, comingSoon: true },
      { label: "Automations", path: "", icon: ZapIcon, comingSoon: true },
    ],
  },
]

function getProjectRoute(path: string) {
  switch (path) {
    case "":
    case "/":
      return "/dashboard/projects/$projectId" as const
    case "/setup":
      return "/dashboard/projects/$projectId/setup" as const
    case "/events":
      return "/dashboard/projects/$projectId/events" as const
    case "/records":
      return "/dashboard/projects/$projectId/records" as const
    case "/usage":
      return "/dashboard/projects/$projectId/usage" as const
    case "/logs":
      return "/dashboard/projects/$projectId/logs" as const
    case "/settings":
      return "/dashboard/projects/$projectId/settings" as const
    case "/keys":
      return "/dashboard/projects/$projectId/keys" as const
    default:
      return "/dashboard/projects/$projectId" as const
  }
}

export function DashboardSidebar({ projects, projectId, docsOpen, onDocsToggle }: SidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()
  const auth = useAuth()
  const basePath = `/dashboard/projects/${projectId}`
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sf-sidebar-collapsed") === "1"
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem("sf-sidebar-collapsed", collapsed ? "1" : "0")
    } catch {}
  }, [collapsed])

  function isItemActive(item: NavItem): boolean {
    if (item.path === "") return pathname === basePath || pathname === basePath + "/"
    return pathname.startsWith(basePath + item.path)
  }

  function isGroupActive(item: NavItem): boolean {
    if (item.comingSoon) return false
    if (item.children) return item.children.some((child) => !child.comingSoon && isItemActive(child))
    return isItemActive(item)
  }

  function renderNavLink(item: NavItem, indent = false) {
    if (item.comingSoon) {
      return (
        <div
          key={item.label}
          title={collapsed ? item.label : undefined}
          className={cn(
            "flex items-center gap-2 py-1.5 text-xs text-zinc-400",
            collapsed ? "justify-center px-0" : indent ? "pl-8 pr-3" : "px-3",
          )}
        >
          <item.icon className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && (
            <>
              <span>{item.label}</span>
              <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-zinc-400 border border-zinc-200 bg-zinc-50 px-1 py-0.5">
                Soon
              </span>
            </>
          )}
        </div>
      )
    }

    const active = isItemActive(item)
    return (
      <Link
        key={item.path + item.label}
        to={getProjectRoute(item.path)}
        params={{ projectId }}
        title={collapsed ? item.label : undefined}
        className={cn(
          "flex items-center gap-2 py-1.5 text-xs font-medium transition-colors",
          collapsed ? "justify-center px-0" : indent ? "pl-8 pr-3" : "px-3",
          active
            ? "bg-red-50 text-primary border-l-2 border-primary"
            : "text-zinc-600 border-l-2 border-transparent hover:bg-zinc-50 hover:text-zinc-900",
        )}
      >
        <item.icon className={cn("h-3.5 w-3.5 shrink-0", active && "text-primary")} />
        {!collapsed && item.label}
      </Link>
    )
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r-2 border-zinc-900 bg-white transition-all duration-200 ease-in-out shrink-0 overflow-hidden",
        collapsed ? "w-13" : "w-55",
      )}
    >
      {/* Logo */}
      <div className="flex h-11 shrink-0 items-center border-b-2 border-zinc-900 px-3">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <Logo type={collapsed ? "icon-only" : "full"} size="5" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((item, index) => {
          const sep = index > 0 ? (
            <div className={cn("my-1 h-px bg-zinc-100", collapsed ? "mx-1.5" : "mx-3")} />
          ) : null

          if (!item.children) {
            return (
              <div key={item.label}>
                {sep}
                {renderNavLink(item)}
              </div>
            )
          }

          const groupActive = isGroupActive(item)

          return (
            <div key={item.label}>
              {sep}
              {!collapsed && (
                <div
                  className={cn(
                    "px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em]",
                    groupActive ? "text-primary" : "text-zinc-400",
                  )}
                >
                  {item.label}
                </div>
              )}
              <div className="space-y-0.5">
                {item.children.map((child) => renderNavLink(child, !collapsed))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Bottom section: keys, settings, collapse, profile */}
      <div className={cn("border-t border-zinc-200 py-1.5 space-y-0.5", collapsed ? "px-1.5" : "px-2.5")}>
        <button
          type="button"
          onClick={onDocsToggle}
          title={collapsed ? (docsOpen ? "Close Docs" : "Open Docs") : undefined}
          className={cn(
            "flex w-full cursor-pointer items-center gap-2 py-1.5 text-xs font-medium transition-colors",
            collapsed ? "justify-center px-0" : "px-1",
            docsOpen ? "text-primary" : "text-zinc-500 hover:text-zinc-900",
          )}
        >
          <BookOpenIcon className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && (docsOpen ? "Docs (open)" : "Docs")}
        </button>

        <Link
          to="/dashboard/projects/$projectId/keys"
          params={{ projectId }}
          title={collapsed ? "API Keys" : undefined}
          className={cn(
            "flex items-center gap-2 py-1.5 text-xs font-medium transition-colors",
            collapsed ? "justify-center px-0" : "px-1",
            pathname.startsWith(`${basePath}/keys`)
              ? "text-primary"
              : "text-zinc-500 hover:text-zinc-900",
          )}
        >
          <KeyIcon className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && "API Keys"}
        </Link>

        <Link
          to="/dashboard/projects/$projectId/settings"
          params={{ projectId }}
          title={collapsed ? "Settings" : undefined}
          className={cn(
            "flex items-center gap-2 py-1.5 text-xs font-medium transition-colors",
            collapsed ? "justify-center px-0" : "px-1",
            pathname.startsWith(`${basePath}/settings`)
              ? "text-primary"
              : "text-zinc-500 hover:text-zinc-900",
          )}
        >
          <SettingsIcon className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && "Settings"}
        </Link>

      </div>

      {/* Collapse toggle */}
      <div className={cn("border-t border-zinc-200 py-1.5", collapsed ? "px-1.5" : "px-2.5")}>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex w-full cursor-pointer items-center gap-2 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-900",
            collapsed ? "justify-center px-0" : "px-1",
          )}
        >
          {collapsed ? (
            <PanelLeftOpenIcon className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <>
              <PanelLeftCloseIcon className="h-3.5 w-3.5 shrink-0" />
              Collapse
            </>
          )}
        </button>
      </div>

      {/* Profile */}
      {auth.authenticated && auth.user && (
        <div className={cn("border-t-2 border-zinc-900 bg-zinc-50 py-2", collapsed ? "px-1.5" : "px-2.5")}>
          <div
            className={cn(
              "flex items-center",
              collapsed ? "justify-center" : "gap-2.5 justify-between",
            )}
          >
            {auth.user.avatarUrl ? (
              <img
                src={auth.user.avatarUrl}
                alt=""
                title={collapsed ? auth.user.displayName : undefined}
                className="h-7 w-7 shrink-0 border border-zinc-300 object-cover"
              />
            ) : (
              <div
                title={collapsed ? auth.user.displayName : undefined}
                className="flex h-7 w-7 shrink-0 items-center justify-center border border-zinc-300 bg-zinc-100"
              >
                <UserIcon className="h-3.5 w-3.5 text-zinc-500" />
              </div>
            )}
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-zinc-900">{auth.user.displayName}</p>
                  <p className="truncate text-[10px] text-zinc-400">@{auth.user.username}</p>
                </div>
                <button
                  type="button"
                  title="Sign out"
                  onClick={() => {
                    void auth.logout().then(() => {
                      void navigate({ to: "/dashboard", replace: true })
                    })
                  }}
                  className="shrink-0 cursor-pointer p-1 text-zinc-400 transition-colors hover:text-red-600"
                >
                  <LogOutIcon className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
          {collapsed && (
            <button
              type="button"
              title="Sign out"
              onClick={() => {
                void auth.logout().then(() => {
                  void navigate({ to: "/dashboard", replace: true })
                })
              }}
              className="mt-1 flex w-full cursor-pointer justify-center p-1 text-zinc-400 transition-colors hover:text-red-600"
            >
              <LogOutIcon className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </aside>
  )
}
