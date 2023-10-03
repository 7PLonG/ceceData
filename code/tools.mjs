/*
 * @Author: 7PLonG 1412sybbob@163.com
 * @Date: 2023-09-01 17:50:54
 * @LastEditors: 7PLonG 1412sybbob@163.com
 * @LastEditTime: 2023-09-13 17:48:51
 * @FilePath: \cece\code\tools.mjs
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export const getTimeStr = ()=> {
    const  str = new Date().toString();
    return str.substring(0,str.indexOf(' GMT'))
}

export const getDateStr = (link='_')=> {
    const d =  new Date()
    var year = d.getFullYear();
    var month = d.getMonth() + 1; 
    var day = d.getDate(); 
    return `${year}${link}${month}${link}${day}`
}

export const getFsPath = (categoryType, fsTplFn = (path)=>`./data/${path}_ques_data.json`) =>{
    return fsTplFn(categoryType)
}