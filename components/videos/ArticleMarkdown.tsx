import Markdown from 'react-markdown'

/**
 * Article body. Uses the same `prose` treatment as the rest of the site's long-form
 * pages (Tailwind typography), so a video article reads like a blog post.
 */
export default function ArticleMarkdown({ children }: { children: string }) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tighter prose-a:text-foreground prose-a:underline prose-img:rounded-lg">
      <Markdown
        components={{
          h1: ({ children }) => <h2>{children}</h2>,
          a: ({ href, children }) => {
            const internal = !!href && href.startsWith('/')
            return internal
              ? <a href={href}>{children}</a>
              : <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
          },
        }}
      >
        {children}
      </Markdown>
    </div>
  )
}
