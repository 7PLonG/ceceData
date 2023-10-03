/*
 * @Author: 7PLonG 1412sybbob@163.com
 * @Date: 2023-07-24 19:41:34
 * @LastEditors: 7PLonG 1412sybbob@163.com
 * @LastEditTime: 2023-09-06 20:38:40
 * @FilePath: \cece\code\conf.mjs
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {  apikey, uuid, agent, deviceId, appType, channel, from, vs, hash } from './baseData.mjs'
export const DEFAULT_QUES_TYPE = 1;
export const SINGLE_CHOICE_TYPE = [1, 2, 3, 4];
export const MUTI_CHOICE_TYPE = [
  1, 2, 3, 4, 12, 13, 14, 23, 24, 34, 123, 124, 134, 234, 1234,
];
export const URL_ANS =
  "https://www.xxwolo.com/ccsrv/must/course_check_answer_new";
export const EXAM_QUES_URL = 'https://www.xxwolo.com/ccsrv/must/course_exam_get_new';

export const RESET_URL = 'https://www.xxwolo.com/ccsrv/ms_app2/reset';
export const CHECK_TOKEN_URL = 'https://www.xxwolo.com/ccsrv/ms_app2/reset';
export const LOGIN_URL = `https://www.xxwolo.com/ccsrv/ms_app2/log`
export const UPDATE_APP_URL = `https://www.xxwolo.com/ccsrv/adminapi/app_update`

export const getAnsBodyFn = (CategoryType) => {
  return {
    agent: agent,
    deviceId: deviceId,
    appType: appType,
    from: from,
    vs: vs,
    channel: channel,
    apikey: apikey,
    uuid: uuid,
    the_answer: {},
    seed: new Date().getTime().toString(),
    category: CategoryType,
    hash: hash,
  }
};
export const FIRSCORE = 0;
