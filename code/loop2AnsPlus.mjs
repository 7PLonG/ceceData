
// 一次考核拿到的题目数据，url: course_exam_get_new， 通过check ans接口， 利用返回score 变化， 校验出答案，并填充数据

import axios from 'axios';
import {
    DEFAULT_QUES_TYPE,
    SINGLE_CHOICE_TYPE, MUTI_CHOICE_TYPE,
    URL_ANS, EXAM_QUES_URL,
    getAnsBodyFn, FIRSCORE,

} from './ansConf.mjs';

import { getExamObj, getBaseObj } from './examStart.mjs'
import * as fs from 'node:fs/promises';

import { mergeQuesData,creatQuesDataMap } from './quesStore.mjs'
import { cWStreamFn, baseWriteLog } from './assit/log.mjs'
import { getDateStr, getFsPath } from './tools.mjs'
import { login_token_fn, update_check_fn } from './login.mjs'


let QUESANSARR = []; //
let QUES_LIST_ARR = []
let FIR_ANS_DATA = []
let CategoryIndex = 0;
let UserIndex = 0;
const MaxOneCatagoryTypeLoopNum = 5;
let ajaxCategoryType = '';
let fsPath = '';
let globalQuesMap = undefined
const oneTestStoreTpl = {
    isFinsh: false,
    index: 0,
    oneQuesStoreArr: []
}
const wlog = (log) => {
    const logName = `ans-${ajaxCategoryType}-${getDateStr()}`
    const wS = cWStreamFn(logName)
    baseWriteLog(wS, log)
}
const makeOneQuesStore = (ques_type) => {
    return {
        arr: (ques_type === 1 ? MUTI_CHOICE_TYPE : SINGLE_CHOICE_TYPE),
        index: 0,
        isFinsh: false,
    }
}
const makeUserStore = (user_data) => {
    return user_data.map((i) => {
        i.time = "";
        i.finish = false;
        return i
    })
}
const childAjax = async (id, oneQuesStore) => {
    let _url = `${URL_ANS}?` + new URLSearchParams(makeGetBody(id, oneQuesStore)).toString()
    let scoreData = {}
    try {
        scoreData = await axios({
            url: _url,
            method: 'get'
        })
    } catch (e) {
        console.warn(e)
    }
    return scoreData
    // return axios({
    //     url: _url,
    //     method: 'get'
    // })
}

const checkAnsSyncFn = (e, id, scoreBase, oneQuesStore) => {
    const newScore = e.data.hasOwnProperty("score") ? (e.data.score) : -1;
    if (e.data.error !== 0) {
        console.log(e)
        throw new Error(e);
    }
    if (newScore < 0) {
        console.log(`${id} no score data`)
        throw new Error(e);
    }
    if (newScore > scoreBase) {
        const target = QUES_LIST_ARR.find((el) => el.id === id)
        if (!target) {
            console.log(`${id} no get data in base`)
            return false
        }
        target.ans = oneQuesStore.arr[oneQuesStore.index].toString()
        return target

    } else if (newScore < scoreBase) {
        const target = QUES_LIST_ARR.find((el) => el.id === id)
        if (!target) {
            console.log(`${id} no get data in base`)
            return false
        }
        target.ans = Object.assign({}, FIR_ANS_DATA)[id];
        return target;
        // 新分数比旧的少，说明原答案为正确答案
    } else {
        return false;
    }
}
async function loopOneQuesAjaxNew(id, oneQuesStore) {

    const res = await childAjax(id, oneQuesStore)
    const ansData = checkAnsSyncFn(res, id, FIRSCORE, oneQuesStore)
    oneQuesStore.index++
    if (ansData) {
        oneQuesStore.isFinsh = true

        QUESANSARR.push(ansData)
        return true;
    } else if (!oneQuesStore.isFinsh) {

        await new Promise((resolve) => setTimeout(resolve, 200))
        return await loopOneQuesAjaxNew(id, oneQuesStore)
    } else if (oneQuesStore.index === oneQuesStore.arr) {
        return false
    } {
        return false
    }
}

function makeGetBody(ques_id, oneQuesStore) {
    let temp = Object.assign({}, getAnsBodyFn(ajaxCategoryType));
    temp.the_answer = Object.assign({}, FIR_ANS_DATA);
    const newAns = oneQuesStore.arr[oneQuesStore.index]
    temp.the_answer[ques_id] = newAns.toString()
    temp.the_answer = JSON.stringify(temp.the_answer)
    return temp
}

const loopAnsNew = async function (ques_type, QUES_LIST_ARR, firAnsData, firscore, store) {
    const ansArr = Object.keys(firAnsData);
    const id = ansArr[store.index]
    const oneQuesStore = makeOneQuesStore(DEFAULT_QUES_TYPE);
    const oneQuesStatus = await loopOneQuesAjaxNew(id, oneQuesStore)

    if (oneQuesStatus === true && (store.index === ansArr.length - 1)) {
        store.isFinsh = true;
    }
    if (oneQuesStatus === true && store.isFinsh) {
        return true
    }
    if (oneQuesStatus === true && !store.isFinsh) {
        store.index++
        await new Promise((resolve) => setTimeout(resolve, 200))
        return await loopAnsNew(DEFAULT_QUES_TYPE, QUES_LIST_ARR, Object.assign({}, FIR_ANS_DATA), FIRSCORE, store)
    }
}
async function HandleLoopWriteFn() {
    fsPath = getFsPath(ajaxCategoryType)
    const status = await loopAnsNew(DEFAULT_QUES_TYPE, QUES_LIST_ARR, Object.assign({}, FIR_ANS_DATA), FIRSCORE, Object.assign({}, oneTestStoreTpl))

    if (status === true) {
       //const allData = JSON.parse(await fs.readFile(fsPath, "utf8"))
       // 读取内存数据，以减少read
       const allData = globalQuesMap.get(ajaxCategoryType)?
            globalQuesMap.get(ajaxCategoryType)
            :JSON.parse(await fs.readFile(fsPath, "utf8"))
        const newQuesDataArr = mergeQuesData(QUESANSARR, await allData);
        if (newQuesDataArr[1].length > 0) {
            newQuesDataArr[1].forEach((el) => {
                wlog(el)
            })
        }
        console.log(`not same ques ${newQuesDataArr[2]}`)
        globalQuesMap.set(ajaxCategoryType, newQuesDataArr[0])
        return await fs.writeFile(fsPath, JSON.stringify(newQuesDataArr[0]))
    }

}
// 清空作用域
const resetData = (_category_arr) => {
    if(CategoryIndex>=_category_arr.length-1){
        CategoryIndex = 0
    }else{
        CategoryIndex++
    }
        QUESANSARR = []
        QUES_LIST_ARR = []
        FIR_ANS_DATA = []
        ajaxCategoryType = _category_arr[CategoryIndex]
}
//一人份启动前自检
const beforeCheckFn = (_category_arr)=>{
    return !!_category_arr[CategoryIndex] 
}

const loopFindQuesAjax = async (allData, loopOneCataNum)=>{
    try {
        const ajaxData = await axios({
            url: `${EXAM_QUES_URL}?` + new URLSearchParams(getExamObj(ajaxCategoryType)).toString(),
            method: 'get'
        })
        if (ajaxData.data.list && ajaxData.data.list.length > 0) {
            const examData =  ajaxData.data.list
            // 如果题都有存且未达到最大循环次数，
            if( examData.every(
                    (el)=> allData.find(
                        (allEl)=>allEl.id ===el.id && allEl.ans
                    )
                ) && loopOneCataNum < MaxOneCatagoryTypeLoopNum
            ){
                loopOneCataNum++
                await new Promise((resolve) => setTimeout(resolve, 150))
                return await loopFindQuesAjax(allData,loopOneCataNum)
            }else{
                console.log(`tiny loop time ${loopOneCataNum}`)
                return examData
            }

        }else {
            console.log('题目列表为空')
            console.log(ajaxData)
            return false 
        }
    }catch (e) {
        console.log('请求题目列表时出现问题')
        console.error(e)
        return false 
    }
}
const HandleOneQuesFn = async (category_arr,UserDataArr) => {
        const examData = await loopFindQuesAjax(globalQuesMap.get(ajaxCategoryType),0)
        if (examData.length > 0) {
            QUES_LIST_ARR = examData
            let obj = {}
            examData.map((el) => el.id).forEach(element => {
                obj[element] = "0"
            });
            FIR_ANS_DATA = obj;
            await HandleLoopWriteFn()

            console.log(`write ${fsPath} fin`)
            if (CategoryIndex >= (category_arr.length - 1)) {
                resetData(category_arr)
                UserDataArr[UserIndex].finish = true
                console.log(new Date())
                return true
            } else {
                resetData(category_arr)
                await new Promise((resolve) => setTimeout(resolve, 200))
                return await HandleOneQuesFn(category_arr,UserDataArr)
            }

        } else {
            // console.log('题目列表为空')
            // console.log(examData)
        }

}
const HandleUserFn = async (category_arr, UserDataArr) => {
    if (!UserDataArr[UserIndex]) {
        console.log(UserDataArr)
        console.log("user group fin")
        return true
    }

    const login_status = await login_token_fn(UserDataArr[UserIndex])
    const update_status = await update_check_fn()
    if (true === login_status && true === update_status && beforeCheckFn(category_arr)) {
        const ques_status = await HandleOneQuesFn(category_arr, UserDataArr)
        if (true === ques_status) {
            // 完成一个账户的所有题目获取
            UserDataArr[UserIndex].time = `${new Date().getHours()}-${new Date().getMinutes()}`
            UserIndex++
            return await HandleUserFn(category_arr, UserDataArr)
        }
    }else{
        console.log('init error')
        console.log(update_status)
    }
}



export const quesMain = async (category_arr, UserDataArr)=>{
    // 读取已写入的题目数据
    globalQuesMap =  await creatQuesDataMap(category_arr)
    //读取用户信息
    ajaxCategoryType = category_arr[CategoryIndex]
    fsPath = getFsPath(ajaxCategoryType);
    return await HandleUserFn(category_arr, makeUserStore(UserDataArr))
}

// quesMain(category_arr, USER_DATA)