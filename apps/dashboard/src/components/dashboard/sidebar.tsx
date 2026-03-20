import { Link, useNavigate, useRouterState } from "@tanstack/react-router"
import {
  ActivityIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  CircleHelpIcon,
  CodeIcon,
  DatabaseIcon,
  DownloadIcon,
  EyeIcon,
  LayoutDashboardIcon,
  LinkIcon,
  LogOutIcon,
  MegaphoneIcon,
  PlusIcon,
  RefreshCwIcon,
  ScrollTextIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react"
import { useState } from "react"
import type { AuthProject } from "@/lib/auth"
import { useAuth } from "@/components/auth/auth-provider"
import { Logo } from "@/components/logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SidebarProps {
  projects: Array<AuthProject>
  projectId: string
  onNewProject?: () => void
}

interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  comingSoon?: boolean
  beta?: boolean
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
    label: "Platform",
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
    default:
      return "/dashboard/projects/$projectId" as const
  }
}

export function DashboardSidebar({ projects, projectId, onNewProject }: SidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()
  const auth = useAuth()
  const basePath = `/dashboard/projects/${projectId}`
  const currentProject = projects.find((p) => p.id === projectId)
  const [refreshing, setRefreshing] = useState(false)

  function handleRefresh() {
    setRefreshing(true)
    window.dispatchEvent(new CustomEvent("stackfox:refresh"))
    setTimeout(() => setRefreshing(false), 1000)
  }

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
          className={`flex items-center gap-2.5 border-l-2 border-transparent py-1.5 text-sm font-medium text-zinc-600 ${indent ? "pl-9 pr-2.5" : "px-2.5"}`}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {item.label}
          <span className="ml-auto border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500">Soon</span>
        </div>
      )
    }

    const active = isItemActive(item)
    return (
      <Link
        key={item.path + item.label}
        to={getProjectRoute(item.path)}
        params={{ projectId }}
        className={`flex cursor-pointer items-center gap-2.5 py-1.5 text-sm font-medium transition-all ${indent ? "pl-9 pr-2.5" : "px-2.5"} ${
          active
            ? "border-l-2 border-primary bg-red-50 text-primary"
            : "border-l-2 border-transparent text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
        }`}
      >
        <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : ""}`} />
        {item.label}
      </Link>
    )
  }

  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-r-2 border-zinc-900 bg-white md:flex overflow-hidden">
      {/* Logo & Brand */}
      <div className="border-b-2 border-zinc-900 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <Logo type="full" size="6" />
        </Link>
      </div>

      {/* Project Dropdown */}
      <div className="border-b border-zinc-200 px-3 py-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-between border-2 border-zinc-900 bg-zinc-950 px-3 py-2 text-left shadow-brutal-sm transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] focus:outline-none"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{currentProject?.name ?? "Select Project"}</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{currentProject?.role ?? ""}</p>
              </div>
              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 text-zinc-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="rounded-none border-2 border-zinc-900 bg-white p-0 shadow-brutal-md min-w-[230px]"
          >
            {/* Project list */}
            <DropdownMenuLabel className="border-b-2 border-zinc-900 bg-zinc-950 px-4 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Projects</p>
            </DropdownMenuLabel>
            {projects.map((project) => (
              <DropdownMenuItem key={project.id} asChild className="rounded-none px-4 py-2.5 focus:bg-red-50 focus:text-primary">
                <Link to="/dashboard/projects/$projectId" params={{ projectId: project.id }} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{project.name}</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-400">{project.role}</p>
                  </div>
                  {project.id === projectId && (
                    <CheckIcon className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
            {onNewProject && (
              <>
                <DropdownMenuSeparator className="mx-0 my-0 h-px bg-zinc-200" />
                <DropdownMenuItem
                  className="rounded-none px-4 py-2.5 text-primary focus:bg-red-50 focus:text-primary"
                  onClick={onNewProject}
                >
                  <PlusIcon className="h-4 w-4" />
                  <span className="font-medium">New Project</span>
                </DropdownMenuItem>
              </>
            )}

            {/* Project actions */}
            <DropdownMenuSeparator className="mx-0 my-0 h-px bg-zinc-200" />
            <DropdownMenuLabel className="px-4 py-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Project</p>
            </DropdownMenuLabel>
            <DropdownMenuItem asChild className="rounded-none px-4 py-2 focus:bg-red-50 focus:text-primary">
              <Link to="/dashboard/projects/$projectId/settings" params={{ projectId }} className="flex items-center gap-2.5">
                <SettingsIcon className="h-4 w-4" />
                <span className="font-medium">Project Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-none px-4 py-2 text-zinc-400" disabled>
              <UsersIcon className="h-4 w-4" />
              <span className="font-medium">Invite Members</span>
              <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-zinc-400">Soon</span>
            </DropdownMenuItem>

            {/* Account */}
            {auth.authenticated && auth.user && (
              <>
                <DropdownMenuSeparator className="mx-0 my-0 h-px bg-zinc-200" />
                <DropdownMenuLabel className="border-t border-zinc-200 bg-zinc-950 px-4 py-3">
                  <div className="flex items-center gap-3">
                    {auth.user.avatarUrl ? (
                      <img
                        src={auth.user.avatarUrl}
                        alt=""
                        className="h-8 w-8 border-2 border-zinc-700 object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center border-2 border-zinc-700 bg-primary/20">
                        <UserIcon className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-white">{auth.user.displayName}</p>
                      <p className="text-[11px] text-zinc-500">@{auth.user.username}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className="rounded-none px-4 py-2.5 text-red-600 focus:bg-red-50 focus:text-red-700"
                  onClick={() => {
                    void auth.logout().then(() => {
                      void navigate({ to: "/dashboard", replace: true })
                    })
                  }}
                >
                  <LogOutIcon className="h-4 w-4" />
                  <span className="font-medium">Sign Out</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {navItems.map((item, index) => {
          const separator = index > 0 ? <div className="mx-2.5 my-3 h-px bg-zinc-200" /> : null

          if (!item.children) {
            return (
              <div key={item.label}>
                {separator}
                {renderNavLink(item)}
              </div>
            )
          }

          // Group with children
          const groupActive = isGroupActive(item)
          return (
            <div key={item.label}>
              {separator}
              <div className="space-y-0.5">
                {/* Group label */}
                <div
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] ${
                    groupActive ? "text-primary" : "text-zinc-400"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                  {item.beta && (
                    <span className="ml-auto border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">Beta</span>
                  )}
                  {item.comingSoon && (
                    <span className="ml-auto border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500">Soon</span>
                  )}
                </div>
                {/* Children */}
                <div className="space-y-0.5">
                  {item.children.map((child) => renderNavLink(child, true))}
                </div>
              </div>
            </div>
          )
        })}
      </nav>

      {/* Bottom pinned: Settings, Exports, Help */}
      <div className="border-t border-zinc-200 px-3 py-2 space-y-0.5">
        <Link
          to="/dashboard/projects/$projectId/settings"
          params={{ projectId }}
          className={`flex cursor-pointer items-center gap-2.5 px-2.5 py-1.5 text-sm font-medium transition-all ${
            pathname.startsWith(`${basePath}/settings`)
              ? "border-l-2 border-primary bg-red-50 text-primary"
              : "border-l-2 border-transparent text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
          }`}
        >
          <SettingsIcon className={`h-4 w-4 shrink-0 ${pathname.startsWith(`${basePath}/settings`) ? "text-primary" : ""}`} />
          Settings
        </Link>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-2.5 border-l-2 border-transparent px-2.5 py-1.5 text-sm font-medium text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
        >
          <DownloadIcon className="h-4 w-4 shrink-0" />
          Exports
        </button>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-2.5 border-l-2 border-transparent px-2.5 py-1.5 text-sm font-medium text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
        >
          <CircleHelpIcon className="h-4 w-4 shrink-0" />
          Help
        </button>

        {/* Refresh */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex w-full cursor-pointer items-center gap-2.5 border-l-2 border-transparent px-2.5 py-1.5 text-sm font-medium text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50"
        >
          <RefreshCwIcon className={`h-4 w-4 shrink-0 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </aside>
  )
}
