import { readFile } from 'node:fs/promises'

export async function readFileAsyncAwait () {
  const fileContent1 = await readFile('./lessons/files/archivo.txt', 'utf-8')
  const fileContent2 = await readFile('./lessons/files/archivo2.txt', 'utf-8')

  console.log('--------------------------------------------------------------------------------')
  console.log('File 1', fileContent1)
  console.log('-------------------------------')
  console.log('File 2', fileContent2)
  console.log('--------------------------------------------------------------------------------')
}

export function readFilePromisesAll () {
  Promise.all(
    [
      readFile('./lessons/files/archivo.txt', 'utf-8'),
      readFile('./lessons/files/archivo2.txt', 'utf-8')
    ]
  ).then(([fileContent1, fileContent2]) => {
    console.log('File 1', fileContent1)
    console.log('File 2', fileContent2)
  })

  console.log('--------------------------------------------------------------------------------')
  console.log('------------------------------1')
  console.log('------------------------------2')
  console.log('------------------------------3')
  console.log('------------------------------4')
  console.log('------------------------------5')
  console.log('------------------------------6')
  console.log('------------------------------7')
  console.log('------------------------------8')
  console.log('------------------------------9')
  console.log('-----------------------------10')
  console.log('-----------------------------11')
  console.log('-----------------------------12')
  console.log('-----------------------------13')
  console.log('-----------------------------14')
  console.log('-----------------------------15')
  console.log('-----------------------------16')
  console.log('-----------------------------17')
  console.log('-----------------------------18')
  console.log('-----------------------------19')
  console.log('-----------------------------20')
  console.log('-----------------------------21')
  console.log('-----------------------------22')
  console.log('-----------------------------23')
  console.log('-----------------------------24')
  console.log('-----------------------------25')
  console.log('-----------------------------26')
  console.log('-----------------------------27')
  console.log('-----------------------------28')
  console.log('-----------------------------29')
  console.log('-----------------------------30')
  console.log('--------------------------------------------------------------------------------')
}
