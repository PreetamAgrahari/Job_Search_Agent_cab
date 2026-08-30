import { Fragment } from 'react'

// Lightweight renderer for the plain-text / lightly-formatted answers the
// backend returns. Handles paragraphs, bullet lists, and **bold** spans.
export function AnswerText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/)

  return (
    <div className="flex flex-col gap-3 leading-relaxed">
      {blocks.map((block, i) => {
        const lines = block.split('\n')
        const isList = lines.every((l) => /^\s*[-*•]\s+/.test(l))

        if (isList) {
          return (
            <ul key={i} className="flex list-disc flex-col gap-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^\s*[-*•]\s+/, ''))}</li>
              ))}
            </ul>
          )
        }

        return (
          <p key={i}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {renderInline(l)}
                {j < lines.length - 1 && <br />}
              </Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}

function renderInline(line: string) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}
