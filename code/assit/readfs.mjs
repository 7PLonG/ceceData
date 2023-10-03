/*
 * @Author: 7PLonG 1412sybbob@163.com
 * @Date: 2023-08-01 17:11:20
 * @LastEditors: 7PLonG 1412sybbob@163.com
 * @LastEditTime: 2023-09-01 17:56:19
 * @FilePath: \cece\code\readfs.mjs
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as fs from 'node:fs/promises';
import {apikey,
    uuid,agent,deviceId,appType,channel,from,vs,hash
} from '../baseData.mjs' 
import {mergeQuesData} from '../quesStore.mjs'
const fsPath = `./data/???_ques_data.json`;

try {
    // await fs.copyFile('source.txt', 'destination.txt', constants.COPYFILE_EXCL);
    const allData =JSON.parse( await fs.readFile(fsPath,"utf8"))
    fs.writeFile(fsPath,JSON.stringify(mergeQuesData([],await allData)))
        .then((e)=>{
            console.log(e)
            console.log('write fin')
        })
} catch (err) {
    console.log("rw data error")
    console.log(err)
    // handle the error
}