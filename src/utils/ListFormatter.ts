import { gLT } from "./I18n";
import { fS } from "./StringFormatter";

enum MODEL_INFO {
    NAME = "ListFormatter"
}

MODEL_INFO;

/**
 * 通过分页的方式直接显示指定页的列表数据
 * @param list 要查询的列表对象
 * @param page 要查询的页数
 * @param countPerPage 每页显示的项目数量，默认为10
 * @param title 查询后显示的标题，格式为`${title}的查询结果为:`，默认请查看Locale.ts文件
 * @returns 格式化的查询列表字符串
 */
function getListStringByPage(list: Array<any>, page: number, countPerPage: number = 10, title: string = gLT("list_formatter_title_default")): string {
    const listLen = list.length;
    const pageSum = Math.floor(listLen / countPerPage) + 1;

    if (page < 1) page = 1;
    else if (page > pageSum) page = pageSum;

    const startIndex = (page - 1) * countPerPage;
    const endIndex = (page) * countPerPage - 1 > listLen ? listLen - 1 : (page) * countPerPage;

    let returnText = fS(gLT("list_formatter_title_format"), title);
    for (let i = startIndex; i < endIndex; i++) {
        returnText += `\n${i + 1}、${list[i]}`;
    }
    returnText += `\n${fS(gLT("list_formatter_page_format"), page, pageSum)}`;
    return returnText;
}

export {
    getListStringByPage
}