/*
 * @Author: 7PLonG 1412sybbob@163.com
 * @Date: 2023-09-07 18:56:01
 * @LastEditors: 7PLonG 1412sybbob@163.com
 * @LastEditTime: 2023-09-15 13:57:50
 * @FilePath: \cece\code\login.mjs
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios from 'axios';
import {
    EXAM_QUES_URL, RESET_URL, LOGIN_URL, CHECK_TOKEN_URL, UPDATE_APP_URL
} from './ansConf.mjs';
import { getExamObj, getBaseObj } from './examStart.mjs'

// 解绑token， 再用旧token重新与next账号绑定
export const login_token_fn = async (userItem) => {
    try {


        const resetData = await axios({
            url: `${RESET_URL}?` + new URLSearchParams(getBaseObj()).toString(),
            method: 'get'
        })

        // succ re
        if (resetData.data && resetData.data.error === 0) {
            const loginObj = getBaseObj();
            loginObj.username = userItem.id.toString();
            loginObj.password = userItem.code;
            const loginData = await axios({
                url: `${LOGIN_URL}?` + new URLSearchParams(loginObj).toString(),
                method: 'get'
            })
            //succ log
            if (loginData.data && loginData.data.error === 3) {
                console.log(`new login fin ${userItem.id.toString()}`)
                return true

            } else {
                console.log('login state error')
                console.log(loginData.data)
                return false
            }


        }

    } catch (e) {
        console.warn(e)
    }

}

export const update_check_fn = async () => {
    try {
        const updateData = await axios({
            url: `${UPDATE_APP_URL}?` + new URLSearchParams(getBaseObj()).toString(),
            method: 'get'
        })
        // succ re
        if (updateData.data
            && updateData.data.error === 3
            && updateData.data.update === 0
        ) {
            return true
        } else {
            return updateData.data
        }

    } catch (e) {
        console.warn(e)
        console.log(`软件需更新，请抓包并重新填写配置项`)
    }

}