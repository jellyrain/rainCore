import { parse } from '../compiler/index'
import { generate } from './codegen'

/* 解析 模板 并 转换成 render 渲染函数 */
function compile(template: string) {
    const ast = parse(template)
    return generate(ast)
}

export { compile }