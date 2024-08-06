function TermDisplayExamples(message) {
    console.log(message)
    console.info(message)
    console.debug(message)
}
// Global Variables: globalThis
function globalVariablesExplain() {
    console.log('Window object not exist in nodejs ')
    console.log(typeof window)
    console.log(globalThis)    
}
// Import Modules commonjs Version
const { sum } = require('../cjs/utils')

function TermDisplaySum(a, b) {
    console.log(sum(a, b))
}

// Native Module [os] -> Operating System
const os = require('node:os')

function TermDisplayOs() {
    console.log('Operating system Information')
    console.log('----------------------------')
    console.log('OS NAME', os.platform())
    console.log('OS Version', os.release())
    console.log('Architecture', os.arch())
    console.log('CPUs', os.cpus().length, os.cpus()) // Allows process scalabe in node
    console.log('Free memory', os.freemem() / 1024 / 1024)
    console.log('Total mejory', os.totalmem() / 1024 / 1024)
    console.log('Uptime', os.uptime() / 60 / 60)
}

// Native Module [fs] -> File System
const fs = require('node:fs')

//Status of a file (synchronous type)
//const fileStatus = fs.statSync('./files/archivo.txt');

function TermDisplayFs(fileStatus, fileContent) {
    console.log('--------------------------------------------------------------------------------')
    console.log(
        'The file ',
        ', is it a file? ' + fileStatus.isFile(),
        ', is it a directory? ' + fileStatus.isDirectory(),
        ', is it a symbolic link? ' + fileStatus.isSymbolicLink(),
        ', has a size of ' + fileStatus.size,
        ', has an unique reference ' + fileStatus.uid,
        ', last modification time was ' + fileStatus.ctime,
        ', last time was accessed was ' + fileStatus.atime,
        ', the file was created at ' + fileStatus.birthtime
        )
    console.log('-------------------------------')
    console.log(fileContent)
    console.log('--------------------------------------------------------------------------------')
}

function TermDisplayPathActions() {
    const path = require('node:path')

    //Show Separator path of your Operating System
    console.log('System separator path char is',path.sep)
    //Construct the filePathRout for './lessons/files/archivo.txt'
    const filePath = path.join(path.basename(__dirname),'files','archivo.txt')
    console.log('The file path is', filePath);
    console.log('the basename is', path.basename(filePath))
    console.log('the filename (without extension) is', path.basename(filePath,'.txt'))
    console.log('the extension of this file is', path.extname(filePath))
}

const path = require('node:path');

function ls(filePath = path.basename(__dirname)) {
        fs.readdir(filePath, (err, files) => {
        if (err) {
            console.error('Error reading filesystem directory',
                filePath,
                err)
            return
        }
        console.log('reading content of path',filePath)
        files.forEach(file => {
            console.log(file)
        })
    })
}

async function dir(directory = process.cwd()) {
    const fsp = require('node:fs/promises')
    const pc = require('picocolors')
    let files

    process.on('exit', () => { 
        if (process.exitCode) {
            console.log(pc.red('Leaving the process with return code'),process.exitCode)
        } else {
            console.log(pc.green('Leaving the process with return code 0'))
        }
    })

    try {
        files = await fsp.readdir(directory)
    }catch {
        console.error(pc.red(`😕 Access to directory ${path.join(process.cwd(),directory)} is imposible`))
        process.exit(1)
    }

    const filesPromises = files.map(async file => {
        const filePath = path.join(directory, file)
        let fileStats
        
        try {
            fileStats = await fsp.stat(filePath)
        } catch {
            console.error(`There is no way to read file ${filePath}`)
            process.exit(1)
        }

        const isDirectory = fileStats.isDirectory()
        const fileType = isDirectory ? '/' : '-'
        const fileSize = fileStats.size.toString()
        const fileModifed = fileStats.mtime.toLocaleString()
        return `${fileType.padEnd(3)} ${file.padEnd(50)} ${fileSize.padStart(10)} ${fileModifed.padStart(25)}`
    })

    const filesInfo = await Promise.all(filesPromises)

    filesInfo.forEach(fileInfo => { console.log(fileInfo)})
}

function TermDisplayProcessCharacteristics() {
    // the list of arguments
    console.log('This is the list of arguments were writen in term')
    console.log(process.argv)
    console.log('The current working directory is', process.cwd())
    console.log('The environment variables are', process.env)
    process.on('exit', () => { console.log('Exiting the function')})

    console.log('This function will return the exit code 0', '[process.exit(0)]')
    process.exit(0)
}

function executeLesson01(lessonSection) {
    console.log('---> Inicio la Lección 01', lessonSection)
    switch(lessonSection) {
        case 'os':
            TermDisplayOs()
            break;
        case 'fs sync':
            //Status of a file (synchronous type)
            //const fileStatus = fs.statSync('/media/zilon/98b19a25-5bc7-41d8-89dd-c3fa1247f479/Proyectos/Development/NodeJS/Cursos/CursoDesde0_MiduDev/Course_NodeJs/lessons/files/archivo.txt');
            const fileStatus = fs.statSync('./lessons/files/archivo.txt');
            const fileContent = fs.readFileSync('./lessons/files/archivo.txt', 'utf-8');
            const fileStatus2 = fs.statSync('./lessons/files/archivo2.txt');
            const fileContent2 = fs.readFileSync('./lessons/files/archivo2.txt', 'utf-8');
            TermDisplayFs(fileStatus, fileContent)
            TermDisplayFs(fileStatus2, fileContent2)
            break;
        case 'fs async callback':
            console.log('--------------------------------------------------------------------------------')
            fs.readFile('./lessons/files/archivo.txt', 'utf-8', (err, text) => {
                console.log('Fichero 1')
                console.log(text)
            });
            console.log('-------------------------------')
            fs.readFile('./lessons/files/archivo2.txt', 'utf-8', (err, text) => {
                console.log('Fichero 2')
                console.log(text)
            });

            console.log('--------------------------------------------------------------------------------')
            break;
        case 'fs async promises':
            const fsp = require('node:fs/promises');

            console.log('--------------------------------------------------------------------------------')
            fsp.readFile('./lessons/files/archivo.txt', 'utf-8')
                .then(text => {
                    console.log('Fichero 1')
                    console.log(text)
                }
            )
            console.log('-------------------------------')
            fsp.readFile('./lessons/files/archivo2.txt', 'utf-8')
                .then(text => {
                console.log('Fichero 2')
                console.log(text)
                }
            )
            console.log('--------------------------------------------------------------------------------')
            break;
        case 'path':
            TermDisplayPathActions()
            break;
        case 'ls':
            ls(process.argv[2])
            break;
        case 'dir':
            dir(process.argv[2])
            break;
        case 'process':
            TermDisplayProcessCharacteristics()
            break;
        default: 
            TermDisplayExamples('Hola mundo')
            globalVariablesExplain()
            TermDisplaySum(4, 2)
            break;
    }
    console.log('---> Finalizo la Lección 01')
}

module.exports = {
    lesson01 : executeLesson01
}