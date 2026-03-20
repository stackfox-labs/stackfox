import type * as React from "react"

export interface ToasterProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: "light" | "dark" | "system"
}

function Toaster({ className, ...props }: ToasterProps) {
  return <div className={className} data-theme={props.theme} hidden />
}

export { Toaster }
