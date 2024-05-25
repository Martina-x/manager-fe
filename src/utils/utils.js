/**
 * 工具函数封装
 */
export default {
  /**
   * 
   * @param {Date} date 
   * @param {String} rule 
   * @returns 
   */
  formatDate(date, rule) {
    let fmt = rule || 'yyyy-MM-dd hh:mm:ss';
    const re = /(y+)/;
    if (re.test(fmt)) {
      const t = re.exec(fmt)[1];
      fmt = fmt.replace(
        t,
        (date.getFullYear() + '').substring(4 - t.length)
      );
    }
    const o = {
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'h+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds()
    }
    for (let k in o) {
      const re = new RegExp(`(${k})`);
      if (re.test(fmt)) {
        const t = re.exec(fmt)[1];
        const val = o[k] + ''; // 防止取到的数据类型是数值然后相加出错
        fmt = fmt.replace(
          t,
          t.length == 1 ? val : ('00' + val).substring(val.length)
        );
      }
    }
    return fmt;
  },
  // 动态拼接路由
  generateRoute(menuList) {
    let routes = [];
    const deep = list => {
      list.forEach(item => {
        if (item.action) {
          routes.push({
            name: item.component,
            meta: {
              title: item.menuName,
            },
            path: item.path,
            component: item.component
          })
        }
        if (item.children && !item.action) {
          deep(item.children);
        }
      });
    }
    deep(menuList);
    return routes;
  }
}