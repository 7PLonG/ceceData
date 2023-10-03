/*
 * @Author: 7PLonG 1412sybbob@163.com
 * @Date: 2023-07-21 15:41:54
 * @LastEditors: 7PLonG 1412sybbob@163.com
 * @LastEditTime: 2023-09-27 09:45:03
 * @FilePath: \cece\code\quesStore.mjs
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { getTimeStr, getFsPath } from './tools.mjs'
import * as fs from 'node:fs/promises';
const get_ans_choice_item = (ansStr) => ansStr.toString().split('').map((el) => el - 1)
// 返回合并后的数据和报错信息数组
//return  [allArr,errorArr]
export const mergeQuesData = (list, all) => {
    let notSameNum = 0;
    const errorLogArr = []
    list.forEach(el => {
        // 如果已经存过了，检查选项是否有重叠
        const hasEl = all.find(outEl => outEl.id === el.id)
        if (hasEl) {
            // 如果两次ID同题修改了题干？！
            if (hasEl.title.replace(/\s*/g, "") !== el.title.replace(/\s*/g, "")) {
                console.log(`${hasEl.id}两次题干不一致！！！！`)
                errorLogArr.push(`${getTimeStr()}--${hasEl.id}两次同题，题干不一致。`)
                errorLogArr.push(`旧---${hasEl.title}`)
                errorLogArr.push(`新---${el.title}`)
                hasEl.title = el.title
                notSameNum++
            }

            if (hasEl.ans && hasEl.ans.toString() !== '0') {
                // 有过答案，且是正确答案，验证两边答案是否一致
                const hasAnsArr = get_ans_choice_item(hasEl.ans).map((e) => hasEl.choice[e])
                const newAnsArr = get_ans_choice_item(el.ans).map((e) => el.choice[e])
                if (hasAnsArr.length !== newAnsArr.length ||
                    !hasAnsArr.every((item) => newAnsArr.find((newItem) =>
                        newItem.replace(/\s*/g, "") === item.replace(/\s*/g, "")
                    ))
                ) {
                    console.log(`${hasEl.id}两次答案不一致！！！！`)
                    console.log('old')
                    console.log(hasEl)
                    console.log('new')
                    console.log(el)
                    errorLogArr.push(`${getTimeStr()}--${hasEl.id}两次同题，答案不一致。`)
                    errorLogArr.push(`旧---${hasAnsArr.join(' ')}`)
                    errorLogArr.push(`新---${newAnsArr.join(' ')}`)
                    hasEl.choice = el.choice
                    hasEl.ans = el.ans
                    hasEl.rightKey = hasEl.rightKey?
                    [...new Set([... hasEl.rightKey,...hasAnsArr,...newAnsArr])]
                    :[...new Set([...hasAnsArr,...newAnsArr])]
                    notSameNum++
                }
            } else {
                //覆盖旧答案
                hasEl.choice = el.choice
                hasEl.ans = el.ans
            }
        } else {
            notSameNum++
            all.push(el)
        }
    })
    return [all, errorLogArr, notSameNum]
}

export const creatQuesDataMap = async (category_arr) => {
    const map = new Map()
    const step =  (arr) => {
        return arr.map(async (name) => {
            return JSON.parse(await fs.readFile(getFsPath(name), "utf8"))
        })
    }
    const dataArr = step(category_arr);
    for (const key in category_arr) {
        map.set(category_arr[key], await dataArr[key])
    }
    
    return map
}





