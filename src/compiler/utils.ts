import { astContext } from './ast'

/* HTML 标准元素 */
const HTML_TAGS =
    'html,body,base,head,link,meta,style,title,address,article,aside,footer,' +
    'header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,div,dd,dl,dt,figcaption,' +
    'figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,' +
    'data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,s,samp,small,span,strong,sub,sup,' +
    'time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,' +
    'canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,' +
    'th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,' +
    'option,output,progress,select,textarea,details,dialog,menu,' +
    'summary,template,blockquote,iframe,tfoot'

/* HTML 标准自闭合元素 */
const VOID_TAGS =
    'area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr'

/* 提供字符串生成判断函数 */
function makeMap(str: string) {
    const map = str.split(',').reduce((map, item) => ((map[item] = true), map), Object.create(null))
    return (value: string) => !!map[value]
}

/* HTML 标准元素 判断函数 */
export const isNativeTag = makeMap(HTML_TAGS);

/* HTML 标准自闭合元素 判断函数 */
export const isVoidTag = makeMap(VOID_TAGS);

/* 删除指定长度内容 */
export function advanceBy(context: astContext, numberOfCharacters: number) {
    const { source } = context
    context.source = source.slice(numberOfCharacters)
}

/* 删除空格 */
export function advanceSpaces(context: astContext) {
    const match = /^[\t\r\n\f ]+/.exec(context.source)
    match && advanceBy(context, match![0].length)
}

/* 判断是否解析完成 */
export function isEnd(context: astContext) {
    const template = context.source
    return !template || template.startsWith('</')
}

/* 截取文本数据返回 并删除模板内对应数据 */
export function textData(context: astContext, length: number) {
    const text = context.source.slice(0, length)
    advanceBy(context, length)
    return text
}

/* my-class 变 驼峰 myClass */
export function camelize(str: string) {
    return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}