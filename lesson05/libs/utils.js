import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export function readJSON (path) {
  return require(path, 'utf-8')
}
