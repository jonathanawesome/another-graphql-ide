import JSON5 from 'json5'

export type ParsedVariables =
  { ok: true; value?: Record<string, unknown> } | { ok: false; message: string }

// JSON5, not JSON, to match the json5 highlighting the variables editor uses.
export const parseVariables = (raw: string | undefined): ParsedVariables => {
  if (!raw?.trim()) return { ok: true }

  try {
    return { ok: true, value: JSON5.parse<Record<string, unknown>>(raw) }
  } catch {
    return { ok: false, message: 'Variables are not valid JSON5' }
  }
}
