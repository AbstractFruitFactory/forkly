import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

export type LlmMessage =
  | { role: 'system' | 'user' | 'assistant'; content: string }

export type LlmFunctionTool = {
  name: string
  description?: string
  parameters: Record<string, any>
}

export type LlmToolCall = {
  function: { name: string; arguments: string }
}

export type LlmChatOptions = {
  provider?: 'openai' | 'anthropic'
  model?: string
  temperature?: number
  maxTokens?: number
  tools?: LlmFunctionTool[]
  toolChoice?: { type: 'function'; function: { name: string } }
}

export type LlmChatResponse = {
  content?: string
  toolCalls?: LlmToolCall[]
}

export type LLM = {
  chat: (messages: LlmMessage[], opts?: LlmChatOptions) => Promise<LlmChatResponse>
}


export const OpenAIProvider: LLM = {
  chat: async (messages, opts) => {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await openai.chat.completions.create({
      model: opts?.model ?? 'gpt-4o-mini',
      temperature: opts?.temperature ?? 0,
      max_tokens: opts?.maxTokens,
      messages,
      tools: opts?.tools?.map((t) => ({
        type: 'function' as const,
        function: { name: t.name, description: t.description, parameters: t.parameters }
      })),
      tool_choice: opts?.toolChoice ?? undefined
    })
    const msg = completion.choices?.[0]?.message as any
    const mappedToolCalls = Array.isArray(msg?.tool_calls)
      ? (msg.tool_calls as any[])
        .map((tc: any) => {
          const fn = (tc && (tc.function || (tc as any).function)) as any
          if (fn && fn.name) return { function: { name: fn.name, arguments: fn.arguments } }
          return null
        })
        .filter((x: any): x is LlmToolCall => Boolean(x))
      : undefined
    return { content: msg?.content ?? undefined, toolCalls: mappedToolCalls }
  }
}

export const AnthropicProvider: LLM = {
  chat: async (messages, opts) => {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n') || undefined
    const msgBlocks = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: [{ type: 'text' as const, text: m.content }]
      }))
    const tools = opts?.tools?.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: (t.parameters as { type: 'object'; properties?: any; required?: string[] })
    }))
    const tool_choice = opts?.toolChoice ? ({ type: 'tool' as const, name: opts.toolChoice.function.name }) : undefined
    const resp = await client.messages.create({
      model: opts?.model ?? 'claude-3-5-haiku-20241022',
      temperature: opts?.temperature ?? 0,
      max_tokens: opts?.maxTokens ?? 1200,
      system,
      messages: msgBlocks,
      tools,
      tool_choice
    })
    const contentBlocks = Array.isArray(resp?.content) ? resp.content : []
    const text = contentBlocks.filter((b: any) => b?.type === 'text').map((b: any) => b.text).join('\n\n') || undefined
    const toolCalls = contentBlocks
      .filter((b: any) => b?.type === 'tool_use')
      .map((b: any) => ({ function: { name: b.name, arguments: JSON.stringify(b.input) } }))
    return { content: text, toolCalls }
  }
}

export const createLlmClient = (provider: 'openai' | 'anthropic' = 'openai'): LLM => {
  return provider === 'anthropic' ? AnthropicProvider : OpenAIProvider
}


