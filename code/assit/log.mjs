import * as fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName)

const logPath = path.resolve(dirName, '../../log')

export const cWStreamFn = (fName) =>{
    const logfilePath = path.resolve(logPath,`${fName}.log`)
    const wStream = fs.createWriteStream(logfilePath,
        {flags:"a"}
    )
    return wStream
}
export const  baseWriteLog = (stream, log) => {
    stream.write(log + '\n')
}
