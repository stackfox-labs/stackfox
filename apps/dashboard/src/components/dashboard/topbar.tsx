import { BookOpenIcon, CheckIcon, ChevronsUpDownIcon, PlusIcon, RefreshCwIcon, SettingsIcon, UsersIcon, XIcon } from "lucide-react"
import { Link, useNavigate } from "@tanstack/react-router"
import type { AuthProject } from "@/lib/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface TopbarProps {
  projects: Array<AuthProject>
  projectId: string
  projectName: string
  onNewProject: () => void
  docsOpen: boolean
  onDocsToggle: () => void
  onRefresh: () => void
  refreshing: boolean
}

export function Topbar({
  projects,
  projectId,
  projectName,
  onNewProject,
  docsOpen,
  onDocsToggle,
  onRefresh,
  refreshing,
}: TopbarProps) {
  const navigate = useNavigate()

  return (
    <div className="flex h-11 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-3 gap-2">
      {/* Left: project dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 rounded-none border border-transparent px-2 py-1 text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-200 hover:bg-zinc-50 focus:outline-none"
          >
            <span className="max-w-50 truncate">{projectName || "Select project"}</span>
            <ChevronsUpDownIcon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={4}
          className="min-w-55 rounded-none border-2 border-zinc-900 bg-white p-0 shadow-brutal-md"
        >
          <DropdownMenuLabel className="border-b border-zinc-200 bg-zinc-50 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Projects</p>
          </DropdownMenuLabel>
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              asChild
              className="cursor-pointer rounded-none px-3 py-2 focus:bg-red-50 focus:text-primary"
            >
              <Link
                to="/dashboard/projects/$projectId"
                params={{ projectId: project.id }}
                className="flex items-center justify-between gap-2"
              >
                <span className="truncate text-xs font-medium">{project.name}</span>
                {project.id === projectId && (
                  <CheckIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
                )}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="mx-0 my-0 h-px bg-zinc-200" />
          <DropdownMenuItem
            className="cursor-pointer rounded-none px-3 py-2 text-primary focus:bg-red-50 focus:text-primary"
            onClick={onNewProject}
          >
            <PlusIcon className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">New Project</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="mx-0 my-0 h-px bg-zinc-200" />
          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-none px-3 py-2 focus:bg-red-50 focus:text-primary"
          >
            <Link
              to="/dashboard/projects/$projectId/settings"
              params={{ projectId }}
              className="flex items-center gap-2"
            >
              <SettingsIcon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Project Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-none px-3 py-2 text-zinc-400" disabled>
            <UsersIcon className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Invite Members</span>
            <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-zinc-400">Soon</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          title="Refresh data"
          className="flex h-7 w-7 cursor-pointer items-center justify-center border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RefreshCwIcon className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
        </button>

        <button
          type="button"
          onClick={onDocsToggle}
          title={docsOpen ? "Close docs" : "Open docs"}
          className={cn(
            "flex h-7 cursor-pointer items-center gap-1.5 border px-2.5 text-xs font-medium transition-colors",
            docsOpen
              ? "border-zinc-900 bg-zinc-950 text-white hover:bg-zinc-800"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 hover:text-zinc-900",
          )}
        >
          {docsOpen ? (
            <XIcon className="h-3 w-3 shrink-0" />
          ) : (
            <BookOpenIcon className="h-3 w-3 shrink-0" />
          )}
          Docs
        </button>
      </div>
    </div>
  )
}
