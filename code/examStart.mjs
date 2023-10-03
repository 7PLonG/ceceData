/*
 * @Author: 7PLonG 1412sybbob@163.com
 * @Date: 2023-07-30 18:17:58
 * @LastEditors: 7PLonG 1412sybbob@163.com
 * @LastEditTime: 2023-08-17 20:26:23
 * @FilePath: \cece\code\examStart.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE'
 */
import {apikey,
    uuid,agent,deviceId,appType,channel,from,vs,hash
} from './baseData.mjs' 

let base_params = {
    uuid: uuid,
    agent: agent,
    deviceId:deviceId,
    seed: new Date().getTime().toString(),
    appType: appType,
    channel: channel,
    from: from,
    vs: vs,
    hash: hash,    // 不负责校验
    apikey: apikey,  // 账号凭证

}
export const oneLoopNum = 10;
export const getBaseObj = ()=>Object.assign({},base_params);
export const getExamObj = (CategoryType)=>{
    return Object.assign({},base_params,{category:CategoryType})
}
