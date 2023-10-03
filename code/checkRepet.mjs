/*
 * @Author: 7PLonG 1412sybbob@163.com
 * @Date: 2023-09-01 15:55:52
 * @LastEditors: 7PLonG 1412sybbob@163.com
 * @LastEditTime: 2023-09-16 20:34:08
 * @FilePath: \cece\code\checkRepet.mjs
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// plan 轮询50次 dice ques 借口，对比230901题库
// 列举，每次重复比率的占比，
// log 
// ·当前伦茨
//  当前id是否重复，重复的给出答案文本
import { USER_DATA_Fir } from '../user.mjs'
import * as fs from 'node:fs/promises';
import axios from 'axios';
import {EXAM_QUES_URL} from './ansConf.mjs'
import {getExamObj,oneLoopNum} from './examStart.mjs'
import {cWStreamFn,baseWriteLog} from './assit/log.mjs'
import {getDateStr, getTimeStr} from './tools.mjs'
import { login_token_fn } from './login.mjs'
const ceceType = "tarot";
const fsPath = `./code/data/${ceceType}_ques_data.json`;
const allData = JSON.parse(await fs.readFile(fsPath, "utf8"))
const maxLoopNum = 50;

let loopNumNow = 0
const rateArr = [];
const logName = `check-${getDateStr()}`
const loopPassCheck = () => {
    return loopNumNow >= maxLoopNum
}
const wlog = (log,fname=logName) =>{
    const wS = cWStreamFn(logName)
    baseWriteLog(wS,log)
}

const loopFillQues = async () => {
    axios({
        url: `${EXAM_QUES_URL}?` + new URLSearchParams(getExamObj(ceceType)).toString(),
        method: 'get'
    }).then(async (e) => {
        if (e.data.list && e.data.list.length > 0) {
            loopNumNow++
            const _list = e.data.list
            wlog(`${getTimeStr()}--第${loopNumNow+1}次重复-详情`)
            //循环，如果id 和所求答案一致，push
            let exitFindAnsArr = allData.filter((newEl) =>
                _list.find((ansEl) => ansEl.id === newEl.id)
            )
            let newFindAnsArr = allData.filter((newEl) =>
            _list.find((ansEl) => ansEl.id === newEl.id)
        )
            rateArr.push(Number((exitFindAnsArr.length/oneLoopNum).toFixed(3)))
            //console.log(exitFindAnsArr)
            if(exitFindAnsArr.length > 0){
                // exitFindAnsArr.forEach(element => {
                //     wlog(`${getTimeStr()}--重复旧题为`)
                //     wlog(element.id)
                //     wlog(element.title)
                //     wlog(element.ans)
                // });
                const diffTitArr = exitFindAnsArr.filter((oldEL)=>{
                    const newEl = _list.find((ansEl) => ansEl.id === oldEL.id)
                    return newEl.title.replace(/\s*/g,"") !== oldEL.title.replace(/\s*/g,"")
                })
                if(diffTitArr.length > 0){
                    diffTitArr.forEach((element,i) => {
                        wlog(`${getTimeStr()}--重复题中存在不同题干的为`)
                        wlog(element.id)
                        // wlog(i)
                    });
                }
            }else{
                wlog(`${getTimeStr()}--第${loopNumNow+1}无重复！`)
            }
            if(newFindAnsArr.length > 0){
                newFindAnsArr.forEach(element => {
                    wlog(`${getTimeStr()}--不重复旧题为`)
                    wlog(element.id)
                    wlog(element.title)
                    wlog(element.ans)
                });
            }
            if (loopPassCheck()) {
                const sum = rateArr.reduce((a,b)=>a+b,0)
                const rateAll = (sum/rateArr.length).toFixed(3)
                console.log(`${ceceType}RATE循环平均重复率${rateAll}`)
                wlog(`RATE循环平均重复率${rateAll}`)
                return true
            } else {
                wlog("---------------------")
                await new Promise((resolve) => setTimeout(resolve, 200))
                return await loopFillQues()
            }

        } else {
            console.log('题目列表为空')
        }
    }).catch((e) => {
        console.log('请求题目列表时出现问题')
        console.error(e)
    })
}
const login_status = await login_token_fn(USER_DATA_Fir[0])
if (true === login_status){
    loopFillQues()
}
