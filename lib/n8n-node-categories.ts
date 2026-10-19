/** Visual roles inferred from node types, not a claim about configured behavior. */
export const NODE_CATEGORIES = {
  trigger: { label: 'Trigger', icon: 'zap', color: '#875900', background: '#fff2cc', description: 'Starts a workflow from an event, schedule, or manual run.' },
  ai: { label: 'AI & models', icon: 'brain', color: '#6934a3', background: '#f0e4ff', description: 'Agents, language models, embeddings, and AI tools.' },
  data: { label: 'Data store', icon: 'database', color: '#196244', background: '#ddf3e7', description: 'Databases, spreadsheets, vector stores, and memory.' },
  decision: { label: 'Routing', icon: 'branch', color: '#95470d', background: '#ffead6', description: 'Conditions, switches, loops, filtering, and error paths.' },
  transform: { label: 'Transform', icon: 'shuffle', color: '#145e72', background: '#dbf2f8', description: 'Reshapes, combines, extracts, or formats items.' },
  code: { label: 'Code', icon: 'code', color: '#344b88', background: '#e5ecff', description: 'Runs code, scripts, or commands.' },
  http: { label: 'Web / API', icon: 'globe', color: '#205e9b', background: '#deefff', description: 'HTTP requests and responses to web services.' },
  message: { label: 'Messaging', icon: 'send', color: '#9b325f', background: '#ffe4ef', description: 'Email, chat, SMS, and social messaging integrations.' },
  file: { label: 'Files / media', icon: 'file', color: '#66532f', background: '#f0e9d7', description: 'Files, documents, storage services, images, and media.' },
  workflow: { label: 'Subworkflow', icon: 'workflow', color: '#4d4b99', background: '#eae8ff', description: 'Calls another workflow or exposes it as a tool.' },
  wait: { label: 'Wait', icon: 'timer', color: '#606022', background: '#f2f2d4', description: 'Pauses execution before continuing.' },
  integration: { label: 'Integration', icon: 'plug', color: '#52616e', background: '#e8eef2', description: 'A service or utility without a more specific category.' },
} as const
export type NodeCategory = keyof typeof NODE_CATEGORIES

export function getNodeCategory(type: string): NodeCategory {
  const name = type.split('.').pop()!.replace(/[^a-z0-9]/gi, '').toLowerCase()
  // Entry points take precedence over the service they listen to.
  if (name.includes('trigger') || ['webhook', 'cron', 'interval', 'start', 'manualchat'].includes(name)) return 'trigger'
  if (['executeworkflow', 'toolworkflow', 'retrieverworkflow'].includes(name)) return 'workflow'
  if (name === 'wait') return 'wait'
  if (['code', 'function', 'functionitem', 'executecommand', 'executecommandtool', 'toolcode', 'ssh'].includes(name)) return 'code'
  if (['if', 'switch', 'filter', 'splitinbatches', 'loopoveritems', 'stopanderror', 'nooperation', 'noop'].includes(name)) return 'decision'
  if (/^(memory|vectorstore)/.test(name) || /^(postgres|mysql|microsoftsql|mongodb|redis|supabase|airtable|baserow|nocodb|snowflake|questdb|cratedb|timescaledb|elasticsearch|googlesheets|googlesheetstool|microsoftexcel|googlebigquery|googlefirebase|datatable|n8ndatastore|keyvaluestorage)/.test(name)) return 'data'
  if (/^(agent|chain|lm|embeddings|openai|anthropic|googlegemini|perplexity|retriever|toolthink|toolvectorstore|sentimentanalysis|textclassifier|informationextractor|aitransform)/.test(name)) return 'ai'
  if (/^(httprequest|toolhttprequest|respondtowebhook|graphql)/.test(name)) return 'http'
  if (/^(telegram|slack|discord|gmail|email|microsoftoutlook|microsoftteams|googlechat|whatsapp|twilio|sendgrid|mailgun|mailjet|postmark|matrix|mattermost|rocketchat|line$|sms|messagebird|pushover|pushbullet|gotify|ntfy|twitter|bluesky|linkedin)/.test(name)) return 'message'
  if (/^(readbinary|writebinary|readwritefile|localfile|googledrive|dropbox|box$|awss3|s3$|googlecloudstorage|microsoftonedrive|ftp|readpdf|pdf|mergepdf|compresspdf|document|google(?:docs|slides)|youtube|spotify|editimage|elevenlabs)/.test(name)) return 'file'
  if (/^(set$|editfields|merge$|aggregate|summarize|splitout|itemlists|sort$|limit$|removeduplicates|renamekeys|extract|convert|movebinary|compression|datetime|crypto|markdown|html|xml|outputparser|textsplitter|comparedatasets)/.test(name)) return 'transform'
  return 'integration'
}
