/*
 * @Author: 7PLonG 1412sybbob@163.com
 * @Date: 2023-08-12 08:59:49
 * @LastEditors: 7PLonG 1412sybbob@163.com
 * @LastEditTime: 2023-08-13 18:46:13
 * @FilePath: \cece\code\targetAns.mjs
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 利用EXAM_QUES_URL抓取10道题，与题库对比，n道无答案，10-n有答案。
//取出1道或2道有答案题作答，验证判分是否正确
//如正确，loop的方式获取答案 ，写入

// 如顺利，可考虑多抓些无答案题待用

import * as fs from 'node:fs/promises';
import axios from 'axios';
import {
    EXAM_QUES_URL,
} from './ansConf.mjs';
import {getExamObj} from './examStart.mjs'
const fsPath = `./data/tarot_ques_data.json`;
const allData = JSON.parse(await fs.readFile(fsPath, "utf8"))
let ANS_ARR = []
let backUpArr = []; //补充题目用的数组，尽量选最新请求的
const targetAnsArr = allData.filter((el) => !el.ans)
const maxLoopNum = 50;
let loopNum = 0
const loopFillQues = async () => {
    axios({
        url: `${EXAM_QUES_URL}?` + new URLSearchParams(getExamObj()).toString(),
        method: 'get'
    }).then(async (e) => {
        if (e.data.list && e.data.list.length > 0) {
            loopNum++
            const _list = e.data.list
            let updateArr = []
            //循环，如果id 和所求答案一致，push
            let newFindAnsArr = _list.filter((newEl) =>
                targetAnsArr.find((ansEl) => ansEl.id === newEl.id)
                && !ANS_ARR.find((ansEl) => ansEl.id === newEl.id)
            )

            if (newFindAnsArr.length > 0) {
                ANS_ARR = ANS_ARR.concat(newFindAnsArr)
            }


            const newAddArr = _list.filter((newEl) =>
                !allData.find((ansEl) => ansEl.id === newEl.id)
            )
            if(newAddArr.length > 0){
                const newAllData = allData.concat(newAddArr)
                console.log(newAddArr)
                fs.writeFile(fsPath,JSON.stringify(newAllData))
                    .then((e)=>{
                        console.log(`write ${fsPath} fin`)
                    })
            }

            // 否则，如果在alldata 中无存， push
            // 因为影响效率，先不加  ！！

            //最后刷新请求数据
            updateArr = _list.filter((newEl) => ANS_ARR.find((ansEl) => ansEl.id === newEl.id))
            if (updateArr.length > 0) {
                // 如过ANS_ARR已存在，替换，并console。 对比两边有无修改
                updateAnsArrFn(updateArr)
            }
            backUpArr = backUpArr.concat(
                _list.filter((newEl) =>!targetAnsArr.find((ansEl) => ansEl.id === newEl.id))
            )

            if (loopPassCheck()) {
                if(loopPassButFail()){
                    console.log('no get ans')
                    return false 
                }
                ANS_ARR = ANS_ARR.concat(backUpArr)
                ANS_ARR.splice(10);
                console.log('=======================')
                console.log('get ans arr')
                console.log(ANS_ARR)
                let obj = {}
                ANS_ARR.map((el)=>el.id).forEach(element => {
                    obj[element] = "0"
                });
                console.log(obj)
            } else {
                await new Promise((resolve) => setTimeout(resolve, 1000))
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

const updateAnsArrFn = (upArr) => {
    upArr.forEach(element => {
        let tar = ANS_ARR.find((el)=>(el.id === element.id))
        if (tar) {
            console.log('update old')
            console.log(tar)
            console.log('update 2 new')
            console.log(element)
            tar.choice = element.choice
            tar.ans = element.ans
        }
    });
}
const loopPassCheck = () => {
    return ANS_ARR.length > 0 || loopNum >= maxLoopNum
}
const loopPassButFail = () => {
    return ANS_ARR.length === 0 || loopNum >= maxLoopNum
}
console.log(targetAnsArr)
console.log('预期')
loopFillQues()