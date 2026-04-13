/**
 * Builds beginner-oriented tutorial markdown for selected examples/.
 * Code fences contain the exact files from the source tree at sync time.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

function rf(root, ...segments) {
  const p = join(root, ...segments)
  if (!existsSync(p)) throw new Error(`[docs:sync] Example file missing: ${p}`)
  return readFileSync(p, 'utf8')
}

function fence(lang, body) {
  return `\`\`\`${lang}\n${body.replace(/\n$/, '')}\n\`\`\`\n`
}

function buildSimple(root) {
  const ex = join(root, 'examples', 'simple')
  const pty = rf(ex, 'simple.pty')
  const main = rf(ex, '__main__.py')
  const pipeline = rf(ex, 'simple.py')
  const init = rf(ex, 'events', '__init__.py')
  const fetch = rf(ex, 'events', 'fetch.py')
  const process = rf(ex, 'events', 'process.py')
  const execute = rf(ex, 'events', 'execute.py')
  const save = rf(ex, 'events', 'save_to_db.py')
  const ret = rf(ex, 'events', 'ereturn.py')

  return `# Simple

## Before you start

- Install Volnux: \`pip install volnux\`
- Use a new folder and copy the files below with the **same paths** (\`simple.py\`, \`simple.pty\`, \`events/\` package, \`__main__.py\`).

## 1. Declare the graph (\`simple.pty\`)

Pointy describes **how events connect**. This file sets recursion depth and mode, then lists operators such as \`||\` (parallel), \`->\` (sequence), and \`|->\` (conditional). Event names match the Python classes you will register next.

${fence('text', pty)}

## 2. Pipeline class and batch template (\`simple.py\`)

\`Simple\` is the pipeline template: \`name\` is an input field. \`SimpleBatch\` is optional batch scaffolding. The listener prints kwargs when the pipeline starts.

${fence('python', pipeline)}

## 3. Event implementations (\`events/\` package)

Each class subclasses \`EventBase\` and implements \`process\`. Return \`(True, payload)\` for success. \`Fetch\` uses a **thread pool** executor; adjust per your workload.

**Package exports** — import every event class so the framework can resolve names used in the \`.pty\` file:

${fence('python', init)}

**Fetch**

${fence('python', fetch)}

**Process**

${fence('python', process)}

**Execute**

${fence('python', execute)}

**SaveToDB**

${fence('python', save)}

**Return**

${fence('python', ret)}

## 4. Run it (\`__main__.py\`)

This builds \`Simple(name="home")\` and calls \`start(force_rerun=True)\`. Uncomment helpers to draw the graph or try batch scheduling.

${fence('python', main)}

## 5. Run from the example directory

\`\`\`bash
cd examples/simple
python -m examples.simple
\`\`\`
`
}

function trimForDocs(s, max = 4000) {
  if (s.length <= max) return s
  return `${s.slice(0, max)}\n\n… (truncated for web docs — see the full file under \`examples/sentiment_analysis/posts_comments.json\` in the repo)\n`
}

function buildSentimentAnalysis(root) {
  const ex = join(root, 'examples', 'sentiment_analysis')
  const pipeline = rf(ex, 'sentiment_analysis_pipeline.py')
  const main = rf(ex, '__main__.py')
  const pty = rf(ex, 'pointy_file.pty')
  const events = rf(ex, 'events.py')
  const cust = rf(ex, 'custom_exceptions.py')
  const jsonPath = join(ex, 'posts_comments.json')
  const posts = existsSync(jsonPath) ? trimForDocs(readFileSync(jsonPath, 'utf8')) : '[]'

  return `# Sentiment analysis

## Before you start

\`\`\`bash
pip install volnux textblob matplotlib yagmail python-dotenv
\`\`\`

Copy \`.env.example\` to \`.env\` and set \`SENDER_EMAIL\`, \`SENDER_PASSWORD\`, \`RECIPIENT_EMAIL\` if you want email branches to work.

## 1. Pipeline and fields (\`sentiment_analysis_pipeline.py\`)

\`FileInputDataField\` points at \`posts_comments.json\`. Email fields read from environment when not passed explicitly. The graph lives in \`Meta.pointy\` (you can switch to \`Meta.file\` + \`pointy_file.pty\` instead).

${fence('python', pipeline)}

## 2. Pointy file (optional external graph)

Same structure as \`Meta.pointy\`, kept as a separate \`.pty\` for readability:

${fence('text', pty)}

## 3. Event logic (\`events.py\`)

**LoadData** reads JSON; if the file is missing it uses \`goto(descriptor=2, …)\` to jump the flow to **NotifyDataFileMissing**. JSON errors go to **DataFileJsonError**. **ProcessData** narrows fields; **AnalyzeSentiment** scores bodies; **PlotStackedSentiments** renders a stacked bar chart.

${fence('python', events)}

## 4. Custom exceptions (\`custom_exceptions.py\`)

Used with \`RetryPolicy\` and error handling in events.

${fence('python', cust)}

## 5. Sample input (\`posts_comments.json\`)

The repo ships a large sample; the excerpt below is enough to see the schema (\`postId\`, \`body\`, …).

${fence('json', posts)}

## 6. Entry point (\`__main__.py\`)

Loads environment variables, draws graphs (needs **Graphviz** installed for \`draw_graphviz_image\`), then runs the pipeline.

${fence('python', main)}

## 7. Run

\`\`\`bash
cd examples/sentiment_analysis
python -m examples.sentiment_analysis
\`\`\`
`
}

function buildUserPostsEtl(root) {
  const ex = join(root, 'examples', 'user_posts_etl')
  const pipeline = rf(ex, 'etl_pipeline.py')
  const main = rf(ex, '__main__.py')
  const pty = rf(ex, 'userspost_ptr.pty')
  const events = rf(ex, 'events.py')
  const cust = rf(ex, 'custom_exception.py')

  return `# User posts ETL

## Before you start

\`\`\`bash
pip install volnux httpx matplotlib
\`\`\`

## 1. Pipeline (\`etl_pipeline.py\`)

A single \`InputDataField\` \`url\` defaults to JSONPlaceholder posts. \`Meta.pointy\` is a straight line: \`LoadData |-> ProcessData |-> GraphData\`.

${fence('python', pipeline)}

## 2. Pointy file (\`userspost_ptr.pty\`)

Equivalent one-liner if you prefer loading from file:

${fence('text', pty)}

## 3. Events (\`events.py\`)

**LoadData** uses \`httpx\`, maps status codes to custom exceptions, and sets \`stop_on_exception\`. **ProcessData** reads \`previous_result\`. **GraphData** plots counts per user.

${fence('python', events)}

## 4. HTTP-oriented exceptions (\`custom_exception.py\`)

${fence('python', cust)}

## 5. Run (\`__main__.py\`)

${fence('python', main)}

## 6. Run

\`\`\`bash
cd examples/user_posts_etl
python -m examples.user_posts_etl
\`\`\`
`
}

/**
 * @param {string} sourceRoot - event_pipeline repo root
 * @returns {{ id: string, title: string, path: string, fname: string, markdown: string }[]}
 */
export function buildExampleTutorialPages(sourceRoot) {
  const pages = [
    { id: 'example-simple', title: 'Simple', build: buildSimple },
    { id: 'example-sentiment-analysis', title: 'Sentiment analysis', build: buildSentimentAnalysis },
    { id: 'example-user-posts-etl', title: 'User posts ETL', build: buildUserPostsEtl },
  ]
  return pages.map(({ id, title, build }) => {
    const slug = id.replace(/^example-/, '')
    const fname = `example--${slug}.md`
    return {
      id,
      title,
      path: `markdown/${fname}`,
      fname,
      markdown: build(sourceRoot),
    }
  })
}
