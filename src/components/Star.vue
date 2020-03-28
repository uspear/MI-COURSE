<template>
  <view class="container">
    <!-- 五个空心背景 -->
    <view class="star-bg">
      <image v-for="item in 5" :key="item" src="/static/images/star_empty@2x.png" />
    </view>
    <!-- 实心背景 -->
    <view class="star">
      <image v-for="item in myScore" :key="item" src="/static/images/star_fill@2x.png" />
    </view>
  </view>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data() {
    return {
      myScore: 0  // 默认分数为0
    }
  },
  props: {
    score: {
      type: Number,
      default: 5
    }
  },
  created() {
    this.myScore = this.score
  }
})
</script>

<style lang="less">
.container {
  position: relative;
}
.star,
.star-bg {
  float: left;
  display: flex;
  height: 50rpx;
  align-items: center;
  image {
    width: 38rpx;
    height: 36rpx;
  }
}
.star {
  position: absolute;
  top: 0;
  left: 0;
}
</style>