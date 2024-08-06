// File extension .cjs means that use CommonJS
// File extension .js means that use CommonJS (default behaviour)
// File extension .mjs means that use ECMA Script Module
const { lesson01 } = require('./lessons/lesson01')

// Define Lessons
const lesson = {
  '01': {
    id: '01',
    default: '',
    'Operating System': 'os',
    'File System Sync': 'fs sync',
    'File System Async Callback': 'fs async callback',
    'File System Async Promises': 'fs async promises',
    Path: 'path',
    ls: 'ls',
    'Process Properties': 'process',
    dir: 'dir'
  }
}
// Execute lessons

// lesson01('os')
// lesson01(lesson['01']['Operating System'])
// lesson01('fs')
// lesson01(lesson['01']['File System Sync'])
// lesson01(lesson['01']['File System Async Callback'])
// lesson01(lesson['01']['File System Async Promises'])
// lesson01(lesson['01']['Path'])

// execute node index.js lessons/files to test for an specified folder
// to force the error execute node index.js lesson/file and will throw an error but not an unexpected error :)
// lesson01(lesson['01']['ls'])

// lesson01(lesson['01']['ls'], path.join(__dirname, 'lessons','files')) -> Not works any more

// execute node index.js lessons/files to test for an specified folder
// to force the error execute node index.js lesson/file and will throw an error but not an unexpected error :)
lesson01(lesson['01'].dir)
