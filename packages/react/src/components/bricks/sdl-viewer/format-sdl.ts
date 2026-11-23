import { parse, print } from 'graphql'

/** Pretty-printed SDL, or the text unchanged when it does not parse. */
export const formatSdl = (sdl: string) => {
  try {
    return print(parse(sdl))
  } catch {
    return sdl
  }
}
