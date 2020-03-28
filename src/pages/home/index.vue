<template>
	<view class="home-container">
		<!-- 搜索框 -->
		<search-bar tips="请输入课程名称"/>
		<!-- 轮播图 -->
		<swiper autoplay circular indicator-dots indicator-active-color="#f92672" :interval="1000">
			<!-- 这里使用声明式导航进行跳转 -->
			<navigator :url="'/pages/course-detail/index?id='+item.course_id" v-for="item in swipers" :key="item.id">
				<swiper-item>
					<image :src="item.img_url"></image>
				</swiper-item>
			</navigator>
		</swiper>
		<!-- 推荐课程 -->
		<view>
			<view class="tips">
				<text class="tip">推荐课程</text>
				<image @click="goToCoursePage" src="/static/images/arrow@2x.png" alt="" />
			</view>
			<scroll-view scroll-x class="course-container">
				<navigator :url="'/pages/course-detail/index?id='+item.relation_id" class="course-item" v-for="item in courses" :key="item.id">
					<image :src="item.icon" alt="" />
				</navigator>
			</scroll-view>
		</view>
		<!-- 热门视频 -->
		<view>
			<view class="tips">
				<text class="tip">热门视频</text>
				<image @click="goToCourseDetail(3)" src="/static/images/arrow@2x.png" alt="" />
			</view>
			<view class="hot-video">
				<navigator :url="'/pages/course-detail/index?id='+item.course_id" class="video-item" v-for="item in videos" :key="item.id">
					<image :src="item.cover_photo_url" alt="" />
					<text class="title">{{item.name}}</text>
					<text class="subtitle">{{item.view_count}}人已观看</text>
				</navigator>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
import Vue from 'vue';
import { fetch } from '../../utils/fetch'
import SearchBar from '../../components/SearchBar.vue'
export default Vue.extend({
	//注册组件
	components:{
		// "search-bar":SearchBar  // 两个方式都可以
		SearchBar
	},
	data() {
		return {
			swipers: [], // 轮播图
			courses: [], // 推荐课程
			videos: []   // 热门视频
		}
	},
	onLoad() {
		this.getSwipersData()
		this.getCoursesData()
		this.getVideosData()
	},
	methods: {
		// 获取轮播图数据
		async getSwipersData(){
			const result = await fetch({url: 'home/swipers'})
			if(result.data.status === 0){
				this.swipers = result.data.message
			}
		},
		//获取推荐课程数据
		async getCoursesData(){
			const result = await fetch({url: 'home/course'})
			if(result.data.status === 0){
				this.courses = result.data.message
			}
		},
		//获取热门视频数据
		async getVideosData(){
			const result = await fetch({url: 'home/video'})
			if(result.data.status === 0){
				this.videos = result.data.message
			}
		},
		// 切换到课程页面
		goToCoursePage(){
			uni.switchTab({url: '/pages/course/index'})
		},
		// 跳转到课程详情页面(id=3是创意手绘班)
		goToCourseDetail(id: number){
			// 这里使用编程式导航进行跳转
			uni.navigateTo({url: `/pages/course-detail/index?id=${id}`})
		}
	}
		
});
</script>

<style lang="less" scoped>
.home-container {
  padding: 20rpx;
  background-color: #fff;
}

swiper {
  width: 100%;
  height: 342rpx;
}

swiper-item {
  width: 100%;
  height: 100%;
}

swiper-item image {
  width: 100%;
  height: 100%;
}

.tips {
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tips .tip {
  font-size: 36rpx;
  font-weight: 700;
  color: #212121;
}

.tips image {
  width: 48rpx;
  height: 48rpx;
}

.course-container {
  height: 170rpx;
  white-space: nowrap;
}

.course-item {
  width: 296rpx;
  height: 168rpx;
  display: inline-block;
  margin-right: 32rpx;
}

.course-item image {
  width: 100%;
  height: 100%;
}

.hot-video {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}

.hot-video .video-item {
  width: 340prx;
  display: flex;
  flex-direction: column;
}

.video-item image {
  width: 340rpx;
  height: 210rpx;
  border-radius: 12rpx;
}

.video-item .title {
	display: block;
  margin-top: 15rpx;
  color: #262626;
  font-size: 26rpx;
}

.video-item .subtitle {
	display: block;
  margin-top: 15rpx;
  margin-bottom: 15rpx;
  color: #959595;
  font-size: 18rpx;
}

</style>
