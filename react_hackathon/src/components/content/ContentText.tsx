function renderInlineMarkdown(line: string) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g)

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }

    return part
  })
}

type ContentTextProps = {
  summary: string
  text: string
}

export function ContentText({ summary, text }: ContentTextProps) {
  const blocks = text.split(/\n(?=## )/)

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      {summary ? <p>{summary}</p> : null}

      {blocks.map((block, index) => {
        const trimmed = block.trim()
        if (!trimmed) {
          return null
        }

        if (trimmed.startsWith("## ")) {
          const newlineIndex = trimmed.indexOf("\n")
          const heading =
            newlineIndex === -1
              ? trimmed.slice(3).trim()
              : trimmed.slice(3, newlineIndex).trim()
          const body =
            newlineIndex === -1 ? "" : trimmed.slice(newlineIndex + 1).trim()

          return (
            <section key={index}>
              <h3 className="text-base font-semibold">{heading}</h3>
              {body ? (
                <div className="mt-2 space-y-1">
                  {body.split("\n").map((line, lineIndex) => (
                    <p key={lineIndex}>{renderInlineMarkdown(line)}</p>
                  ))}
                </div>
              ) : null}
            </section>
          )
        }

        return (
          <p key={index} className="whitespace-pre-wrap">
            {trimmed}
          </p>
        )
      })}
    </div>
  )
}
