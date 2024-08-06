import { sum } from './utils.mjs'
import { readFileAsyncAwait, readFilePromisesAll } from '../lessons/lesson01.mjs'

console.log(sum(3, 5))

readFileAsyncAwait()

readFilePromisesAll()
