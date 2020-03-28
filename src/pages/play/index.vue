<template>
  <view class="play-container" v-if="course_detail">
    <!-- 视频 -->
    <view class="cover_image">
      <video @play="onVideoPlay" id="videoId" :src="playingUrl" controls></video>
    </view>
    <!-- 基本信息渲染 -->
    <view class="introduction">
      <view class="title-and-info">
        <text class="title">{{course_detail.course.title}}</text>
        <text class="info">
          <text>{{course_detail.course.study_count}}人学过</text>
          <!-- 1. 通过计算属性的方式 -->
          <text>难度:{{level}}</text>
          <!-- 2. 通过方法的方式 -->
          <!-- <text>难度:{{getLevel(course_detail.course.level)}}</text> -->
          <!-- 3. 通过过滤器的方式 -->
          <!-- <text>难度:{{course_detail.course.level | getLevel}}</text> -->
          <text>时长:{{course_detail.course.course_duration}}</text>
        </text>
      </view>
      <view class="comment">
        <image @click="evaluate" src="/static/images/evaluate@2x.png" alt />
      </view>
    </view>
    <!-- 3.0 课程进度 -->
    <view class="course-progress">
      <view class="title">课程进度</view> 
      <view class="catelog-container">
        <view @click="playOneVideo(index)" v-for="(item,index) in course_detail.videos" :key="item.id" class="course-item">
          <text :class="[index === playingIndex ? 'active' : '']">{{index + 1}}.{{item.name}}</text>
          <text v-if="item.is_study === 1" class="studied">已学习</text>
          <text :class="[index === playingIndex ? 'active' : '']" v-else>{{item.duration}}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Vue from 'vue'
import { fetch } from '../../utils/fetch'
export default Vue.extend({
  data() {
    return {
      id: null,  //课程id
      course_detail: null, // 课程详情
      playingUrl: null,  //当前正在播放的url
      playingIndex: 0, // 正在播放视频的索引
      isValidateRight: false // 是否校验过权限
    }
  },
  onLoad(options){
    this.id = options.id
    this.getCourseDetailData()
  },

  // 1. 通过计算属性的方式
  computed: {
    level(){
      // 如果这个视频信息不存在,则直接返回
      if(!this.course_detail) return
      switch(this.course_detail.course.level){
        case 1: {
          return '初级';
          break;
        }
        case 2: {
          return '中级';
          break;
        }
        case 3: {
          return '高级';
          break;
        }
        default: 
          return '无级别';
          break;
      }
    }
  },

  // 3. 通过过滤器的方式
  // filters: {
  //   getLevel(level){
  //     switch(level){
  //       case 1: {
  //         return '初级';
  //         break;
  //       }
  //       case 2: {
  //         return '中级';
  //         break;
  //       }
  //       case 3: {
  //         return '高级';
  //         break;
  //       }
  //       default: 
  //         return '无级别';
  //         break;
  //     }
  //   }
  // },


  methods: {
    async getCourseDetailData(){
      const res = await fetch({
        url: `course/play/${this.id}`
      })
      if(res.data.status === 0){
        this.course_detail = res.data.message
        //给playingUrl赋值
        this.playingUrl = res.data.message.videos[0].video_url
        
      }
    },
    // 获取级别
    // 2. 通过方法的方式
    // getLevel(level){
    //   switch(this.course_detail.course.level){
    //     case 1: {
    //       return '初级';
    //       break;
    //     }
    //     case 2: {
    //       return '中级';
    //       break;
    //     }
    //     case 3: {
    //       return '高级';
    //       break;
    //     }
    //     default: 
    //       return '无级别';
    //       break;
    //   }
    // },

    // 我要评价
    evaluate(){
      console.log('我要评价')
    },
    onVideoPlay(){
      if(!this.isValidateRight){
        this.playOneVideo(0)
      }
    },
    // 播放某个视频
    async playOneVideo(index){
      // 切换选中的索引
      this.playingIndex = index

      // 停止之前视频的播放
      uni.createVideoContext('videoId').pause()

      // 去鉴权，如果支付了，则正常播放，如果没有，则提示要跳转支付页面
      const isCanPlay = await this.validatePlayRight()
      if(!isCanPlay){
        // 提示要去到支付页面
        uni.showModal({
          title: '提示',
          content: '请先支付,再来收看视频哦~',
          confirmText: '去支付',
          confirmColor: '#ff9a29',
          success: res => {
            if (res.confirm) {
              uni.navigateTo({
                url: `/pages/pay/index?id=${this.id}&title=${this.course_detail.course.title}&price=${this.course_detail.course.price}&cover_image_url=${this.course_detail.course.cover_image_url}`
              })
            }
          }
        });
        return
      }
      // 有权限之后，播放刚刚点击的那个视频
      // 给playingUrl赋值
      this.playingUrl = this.course_detail.videos[index].video_url
      setTimeout(() => {
        uni.createVideoContext('videoId').play()
      }, 200);
    },
    // 发请求，查看当前的课程是否购买过
    async validatePlayRight(){
      // return new Promise((resolve,reject) => {
      //   // 在这里发送请求，网络请求，然后通过 resolve和reject把结果传递出去
      // })

      const result = await fetch({
        url: 'order/info',
        data: {
          course_id: this.id
        }
      })
      if(result.data.status === 0){
        if(result.data.message.pay_status === 0){
          return Promise.resolve(false)
        } else {
          this.onVideoPlay = true
          return Promise.resolve(true)
        }
      } else {
        return Promise.resolve(false)
      }
    }
  }
})
</script>

<style lang="less" scoped>
.play-container {
  background-color: #efefef;
  position: relative;
  .cover_image {
    width: 750rpx;
    height: 434rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    image {
      width: 750rpx;
      height: 434rpx;
    }
    video {
      width: 750rpx;
      height: 434rpx;
    }
  }
  .introduction {
    z-index: 3;
    position: absolute;
    margin-top: -10rpx;
    border-radius: 16px 16px 0px 0px;
    border-bottom: 1px solid #f5f5f5;
    left: 0;
    right: 0;
    height: 192rpx;
    background-color: #ffffff;
    padding: 38rpx 32rpx;
    display: flex;
    align-items: center;
    .title-and-info {
      flex: 1;
      .title {
        color: #343434;
        font-size: 24px;
        font-weight: bold;
      }
      .info {
        margin-top: 12rpx;
        height: 34rpx;
        line-height: 34rpx;
        color: #818181;
        font-size: 12px;
        display: block;
        text {
          padding-right: 15rpx;
        }
        text:nth-child(2),
        text:nth-child(3) {
          padding-left: 15rpx;
        }
        text:nth-child(2) {
          position: relative;
          &::before {
            position: absolute;
            content: '';
            background-color: #ebebeb;
            left: 0rpx;
            width: 1px;
            top: 8rpx;
            height: 20rpx;
          }
          &::after {
            position: absolute;
            content: '';
            background-color: #ebebeb;
            right: 0rpx;
            width: 1px;
            top: 8rpx;
            height: 20rpx;
          }
        }
      }
    }
    .comment {
      margin-top: 32rpx;
      image {
        width: 198rpx;
        height: 80rpx;
      }
    }
  }
  .course-progress {
    margin-top: 222rpx;
    padding: 44rpx 32rpx;
    background-color: #fff;
    .title {
      color: #343434;
      font-size: 30rpx;
      font-family: PingFang SC;
      font-weight: 800;
    }
    .catelog-container {
      .course-item {
        display: flex;
        justify-content: space-between;
      }
      text {
        color: #636363;
        font-size: 30rpx;
        height: 80rpx;
        line-height: 80rpx;
      }
      .studied {
        float: right;
        margin-top: 16rpx;
        font-size: 10px;
        text-align: center;
        color: #aaaaaa;
        background-color: #f5f5f5;
        border-radius: 12rpx;
        width: 98rpx;
        height: 48rpx;
        line-height: 48rpx;
      }
      .time {
        float: right;
      }
      .active {
        color: #ff5e00;
      }
    }
  }
}
.comment-content {
  label {
    width: 100rpx;
  }
  textarea {
    width: 100%;
    height: 200rpx;
  }
}
</style>