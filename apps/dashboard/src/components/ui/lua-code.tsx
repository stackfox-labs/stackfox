import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter"
import lua from "react-syntax-highlighter/dist/esm/languages/prism/lua"
import type { CSSProperties } from "react"

SyntaxHighlighter.registerLanguage("lua", lua)

const theme: Record<string, CSSProperties> = {
  'code[class*="language-"]': { color: "#e4e4e7" },
  'pre[class*="language-"]': { color: "#e4e4e7", background: "transparent" },
  keyword: { color: "#c084fc" },
  "string-interpolation": { color: "#fcd34d" },
  string: { color: "#fcd34d" },
  number: { color: "#fb923c" },
  boolean: { color: "#c084fc" },
  comment: { color: "#71717a", fontStyle: "italic" },
  function: { color: "#38bdf8" },
  "class-name": { color: "#38bdf8" },
  operator: { color: "#d4d4d8" },
  punctuation: { color: "#a1a1aa" },
  property: { color: "#e4e4e7" },
  variable: { color: "#e4e4e7" },
  builtin: { color: "#c084fc" },
  namespace: { color: "#38bdf8" },
  "attr-name": { color: "#e4e4e7" },
}

export function LuaCode({ code }: { code: string }) {
  return (
    <SyntaxHighlighter
      language="lua"
      style={theme}
      PreTag="pre"
      customStyle={{
        padding: "1.25rem",
        fontSize: "inherit",
        background: "transparent",
        overflowX: "auto",
        lineHeight: "inherit",
        margin: 0,
      }}
      codeTagProps={{ style: { fontFamily: "inherit" } }}
    >
      {code}
    </SyntaxHighlighter>
  )
}
