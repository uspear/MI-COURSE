/** 
 * 封装的网络请求方法,,对uni.request进行封装
 */
import {BASEURL} from './url'
//header = {}默认空对象,自己要传就以自己传的为主, fetch => { 解构赋值 }
const fetch = ({url,method = 'GET',data,header = {},tips = '正在加载中...',isNeedAuth = true}) => {
  return new Promise((resolve,reject) => {
    // Promise执行的是异步任务，比如发送网路请求
    // 对token进行处理  是否需要携带token
    if(isNeedAuth){
      const my_token = uni.getStorageSync('my_token')
      if(my_token){
        header.Authorization = my_token
      }
    }

    // 给一个提示
    uni.showLoading({
      title: tips
    })

    // 封装发送网络异步请求
    uni.request({
      url: `${BASEURL}${url}`, //仅为示例，并非真实接口地址。
      method,
      data: data,
      header: header,
      success: (res) => {
        //成功后返回的数据
        resolve(res)
      },
      fail: error => {
        //失败后返回的数据
        reject(error)
      },
      // 不管成功失败都隐藏加载
      complete: () => {
        uni.hideLoading()
      }
    })
  })
}

// 按需导出fetch
export { fetch }