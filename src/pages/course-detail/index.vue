<template>
  <view class="course-detail-container" v-if="course_detail">
    <!-- 1.0 封面图 -->
    <view v-if="!isPlaying" class="cover_image">
      <image :src="course_detail.course.cover_image_url" alt="">
      <view class="play">
          <image @click="playVideo" src="/static/images/play@2x.png" mode="" />
          <text>播放课程简介</text>
      </view>
    </view>
    <view v-else class="course_video">
      <video id="videoId" autoplay controls :src="course_detail.course.course_video_url"></video>
    </view>
    <!-- 2.0 简介 -->
    <view class="introduction">
      <view class="title-price">
        <text>{{course_detail.course.title}}</text>
        <text>￥{{course_detail.course.price}}.00</text>
      </view>
      <text class="introduce">{{course_detail.course.introduction}}</text>
      <view class="star">
        <!-- Start子组件 -->
        <!-- 坑:在小程序中若再次渲染,则不会再渲染子组件,而在vue中是正常的,也就是小程序里面的,子组件只会渲染一次 -->
        <!-- 坑:如果个子组件传递的是普通的值类型,如果之前已经渲染过,则不会再渲染;如果是引用类型,则会再次渲染 -->
        <star :score="course_detail.course.score"/>
        <text>{{course_detail.course.study_count}}人在学</text>
      </view>
      <view class="study-share">
        <image @click="goToStudy" src="/static/images/start_study@2x.png" alt/>
        <!-- share是uniapp官方开放文档提供 -->
        <button open-type="share" plain class="share-button"></button>
      </view>
    </view>
    <!-- 3.0 目录、讲师介绍、评价 -->
    <view class="catalog">
      <view class="head">
        <text @click="toggleSelect(index)" :class="[index === activeIndex ? 'active' : '' ]" v-for="(item,index) in menus" :key="index">{{item}}</text>
      </view>
      <view class="body">
        <!-- 这是目录 -->
        <view class="catelog-container" v-if="activeIndex === 0">
          <text v-for="(item,index) in course_detail.videos" :key="item.id">{{index+1}}.{{item.name}}</text>
          <text v-if="!course_detail.videos">暂无课程视频哦，请联系客服添加~</text>
        </view>
        <!-- 这是讲师介绍 -->
        <view class="lecturer-container" v-else-if="activeIndex === 1">
          <view class="info" v-if="course_detail.lecturer"> 
            <image :src="course_detail.lecturer.avatar" alt />
            <view class="name-follow">
              <text>{{course_detail.lecturer.name}}</text>
              <text>关注人数：{{course_detail.lecturer.follow_count}}</text>
            </view>
            <text @click="followOrUnFollow(course_detail.lecturer)" :class="[course_detail.lecturer.is_follow === 0 ? 'unfollow' : 'follow']">{{course_detail.lecturer.is_follow === 0 ? '关注' : '已关注'}}</text>
          </view>
          <view v-if="course_detail.lecturer" class="introduce">
            <text>{{course_detail.lecturer.introduction}}</text>
          </view>
          <text style="color:#636363;font-size:15px;" v-if="!course_detail.lecturer">暂无讲师简介哦~</text>
        </view>
        <!-- 这是评价 -->
        <view class="comment-container" v-else-if="activeIndex === 2">
          <view class="comment-item" v-for="item in course_detail.comments" :key="item.id">
            <view class="info">
              <image :src="item.avatar" alt />
              <view class="nickname-content">
                <view class="nickname">
                  <view style="margin-top:12rpx;">{{item.nickname}}</view>&nbsp;&nbsp;
                  <view style="margin-left:20rpx">
                    <star :score="item.score"/>
                  </view>
                </view>
                <view>{{item.content}}</view>
              </view>
              <text class="time">{{item.comment_time}}</text>
            </view>
            <view class="star">
              <image @click="likeOrUnLike(item)" :src="item.is_like === 1 ? '/static/images/like_normal@2x.png' : '/static/images/like_highlight@2x.png'"/>
            </view>
          </view>
          <text style="color:#636363;font-size:15px;padding:38rpx;" v-if="!course_detail.comments">暂无评论哦，请学习之后再评价~</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import Vue from 'vue'
import {fetch} from '../../utils/fetch'
import Star from '../../components/Star.vue'
export default Vue.extend({
  // 注册子组件
  components:{
    Star
  },
  data() {
    return {
      id: null, // 课程id
      course_detail: null,  // 课程详情  坑:这里不能使用空对象{},因为第一次v-if判断时为false,不会进行那步的渲染
      isPlaying: false,  // 是否正在播放课程简介
      menus: ['目录','讲师介绍','评价'],
      activeIndex: 0 // tab的默认激活索引
    }
  },
  onLoad(options){
    this.id = options.id

    //发送请求
    this.getCourseDetailData()
  },
  onShareAppMessage(res){
    return {
      title: `${this.course_detail.course.title}`,
      path: '/pages/home/index', // 你分享给别人之后，别人打开我们的小程序首先进入path中
      imageUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1581434506577&di=1b793769170c2a6d8484af881bfc1537&imgtype=0&src=http%3A%2F%2Fwww.deskcar.com%2Fdesktop%2Felse%2F20121222214128%2F19.jpg',
      content: '打开该小程序就可以学习了'
    }
  },
  
  methods: {
    async getCourseDetailData(){
      const result = await fetch({ url:`course/${this.id}` })
      if(result.data.status === 0){
        this.course_detail = result.data.message
        this.menus[2] = `评价(${result.data.message.commentTotal})`
      }
    },
    // 播放视频简介
    playVideo() {
      this.isPlaying = true
      // 手动播放
      setTimeout(()=>{
        uni.createVideoContext('videoId').play()
      },200)
    },
    // 跳转到播放页面
    goToStudy() {
      // 先暂停视频的播放
      // 这里表示前面不为null的时候会执行后面的,反之如果为null不会执行后面
      uni.createVideoContext('videoId') && uni.createVideoContext('videoId').pause()

      // 声明式导航
      uni.navigateTo({
        url: `/pages/play/index?id=${this.id}`
      })
    },
    // 切换选中的索引
    toggleSelect(index){
      this.activeIndex = index
    },
    // 关注与取消关注
    async followOrUnFollow(lecturer){
      switch (lecturer.is_follow) {
        case 0: // 之前没有关注，现在点击之后，要关注
          const res1 = await fetch({
            url: '/lecturer/follow',
            method: 'POST',
            data: {
              lecturer_id: lecturer.id
            }
          })

          if (res1.data.status === 0) {
            uni.showToast({
              title: res1.data.message,
              icon: 'none',
              duration: 500
            })

            // 更改模型，变成已关注
            lecturer.is_follow = 1
          }
          break;
        case 1: // 之前关注过，现在点击要取消关注
          const res2 = await fetch({
            url: '/lecturer/unfollow',
            method: 'POST',
            data: {
              lecturer_id: lecturer.id
            }
          })

          if (res2.data.status === 0) {
            uni.showToast({
              title: res2.data.message,
              icon: 'none',
              duration: 500
            })
            // 更改模型，变成关注
            lecturer.is_follow = 0
          }
        default:
          break;
      }
    },
    // 某条评价的点赞与取消点赞
    async likeOrUnLike(comment){
      switch (comment.is_like) {
        case 1: { // 之前未点赞，现在给它点赞
          const res = await fetch({
            url: 'comment/like',
            method: 'POST',
            data: {
              comment_id: comment.id,
              is_like: 2
            }
          })
          if (res.data.status === 0) {
            uni.showToast({
              title: '点赞成功',
              icon: 'none',
              duration: 1000
            })
            // 更改模型，重新渲染
            comment.is_like = 2
          }
          break;
        }
          
        case 2: { // 之前点赞过，现在取消点赞了
          const res = await fetch({
            url: 'comment/like',
            method: 'POST',
            data: {
              comment_id: comment.id,
              is_like: 1
            }
          })
          if (res.data.status === 0) {
            uni.showToast({
              title: '已取消点赞',
              icon: 'none',
              duration: 1000
            })
            // 更改模型，重新渲染
            comment.is_like = 1
          }
          break;
        }
        default:
          break;
      }
    }
  }
})
</script>

<style lang="less" scoped>
.course-detail-container {
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
    position: relative;
    .play {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      position: absolute;
      image {
        width: 164rpx;
        height: 164rpx;
      }
      text {
        margin-top: 10rpx;
        color: #e9e9e9;
        font-size: 30rpx;
      }
    }
  }
  .course_video {
    width: 750rpx;
    height: 434rpx;
    video {
      width: 750rpx;
      height: 434rpx;
    }
  }
  .introduction {
    z-index: 3;
    position: absolute;
    margin-top: 0rpx;
    border-radius: 16px 16px 0px 0px;
    left: 0;
    right: 0;
    height: 452rpx;
    background-color: #ffffff;
    padding: 20rpx 30rpx;
    .title-price {
      margin-top: 20rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text:nth-child(1) {
        font-size: 24px;
        color: #343434;
        font-weight: Bold;
      }
      text:nth-child(2) {
        font-size: 22px;
        color: #ee3939;
      }
    }
    .introduce {
      color: #818181;
      font-size: 12px;
      margin-top: 100rpx;
    }
    .star {
      display: flex;
      margin-top: 20rpx;
      text {
        height: 50rpx;
        line-height: 50rpx;
        margin-left: 20rpx;
        font-size: 12px;
        color: #fe8e38;
      }
    }
    .study-share {
      margin-top: 42rpx;
      margin-bottom: 52rpx;
      image:nth-child(1) {
        width: 568rpx;
        height: 92rpx;
      }
      .share-button {
        border: none;
        width: 92rpx;
        height: 92rpx;
        background-color: #fff;
        border-radius: 10rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        float: right;
        background-image: url(../../static/images/share@2x.png);
        background-repeat: no-repeat;
        background-size: 34rpx 34rpx;
        background-position: 30rpx 30rpx;
      }
    }
  }
  .catalog {
    margin-top: 520rpx;
    // position: absolute;
    z-index: 5;
    width: 750rpx;
    // height: 582rpx;
    background-color: #ffffff;
    .head {
      height: 120rpx;
      background-color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f5f5f5;
      text {
        text-align: center;
        color: #a8a8a8;
        font-size: 14px;
        height: 120rpx;
        line-height: 120rpx;
        flex: 1;
        position: relative;
      }
      .active {
        color: #333333;
        font-weight: bold;
        &::after {
          content: '';
          position: absolute;
          left: 88rpx;
          bottom: 0px;
          width: 74rpx;
          height: 3px;
          background-color: #ff8e43;
        }
      }
    }
    .catelog-container {
      padding: 30rpx;
      height: 582rpx;
      text {
        background-color: #ffffff;
        color: #636363;
        font-size: 30rpx;
        height: 80rpx;
        line-height: 80rpx;
        display: block;
      }
    }
    .lecturer-container {
      padding: 30rpx;
      .info {
        height: 200rpx;
        display: flex;
        align-items: center;
        .name-follow {
          margin-left: 30rpx;
          display: flex;
          flex-direction: column;
          flex: 1;
          text:nth-child(1) {
            font-size: 34rpx;
            color: #333333;
          }
          text:nth-child(2) {
            font-size: 28rpx;
            margin-top: 15rpx;
            color: #a8a8a8;
          }
        }
        image {
          margin-left: 12rpx;
          width: 120rpx;
          height: 120rpx;
        }
        .unfollow {
          width: 136rpx;
          height: 52rpx;
          line-height: 52rpx;
          text-align: center;
          border: 1px solid #a8a8a8;
          border-radius: 26rpx;
          color: #a8a8a8;
          font-size: 28rpx;
        }
        .follow {
          width: 136rpx;
          height: 52rpx;
          line-height: 52rpx;
          text-align: center;
          border: 1px solid #a8a8a8;
          border-radius: 26rpx;
          color: #fff;
          background-color: #a8a8a8;
          font-size: 28rpx;
        }
      }
      .introduce {
        background-color: #ffffff;
        text {
          margin-left: 12rpx;
          font-size: 12px;
          font-family: PingFang SC;
          font-weight: 400;
          line-height: 20px;
          color: rgba(168, 168, 168, 1);
          opacity: 1;
        }
      }
    }
    .comment-item {
      background-color: #ffffff;
      padding: 30rpx;
      height: 180rpx;
      border-bottom: 2px solid #f1f1f1;
      .info {
        height: 120rpx;
        display: flex;
        align-items: center;
        image {
          margin-left: 6rpx;
          width: 96rpx;
          height: 96rpx;
          border-radius: 50%;
        }
        .nickname-content {
          flex: 1;
          margin-left: 30rpx;
          .nickname {
            color: #333333;
            font-size: 30rpx;
            font-weight: bold;
            align-items: center;
            display: flex;
            view {
              height: 100%;
              display: inline-block;
            }
          }
          view:nth-child(2) {
            margin-top: 16rpx;
            color: #a8a8a8;
            font-size: 12px;
          }
        }
        .time {
          color: #a8a8a8;
          font-size: 11px;
        }
      }
    }
    .star {
      image {
        margin-top: 30rpx;
        width: 44rpx;
        height: 44rpx;
        float: right;
        margin-right: 20rpx;
      }
      image:nth-child(0) {
        margin-right: 20rpx;
      }
    }
  }
}
</style>