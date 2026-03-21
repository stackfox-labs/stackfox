import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/dashboard/projects/$projectId/setup")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/dashboard/projects/$projectId", params })
  },
})
