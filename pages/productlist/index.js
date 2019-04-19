const WXAPI = require('../../wxapi/main')
const CONFIG = require('../../config.js')
//获取应用实例
var app = getApp()
Page({
  data: {
    inputShowed: false, // 是否显示搜索框
    inputVal: "", // 搜索框内容
    category_box_width: 750, //分类总宽度
    goodsRecommend: [], // 推荐商品
    goods: [],

    scrollTop: 0,
    loadingMoreHidden: true,

    coupons: [],

    curPage: 1,
    pageSize: 20,
    cateScrollTop: 0,
    currentTab:0
  },
  //点击切换
  clickTab: function(e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current,
      })
    }
  },
  tabClick: function(e) {
    let offset = e.currentTarget.offsetLeft;
    if (offset > 150) {
      offset = offset - 150
    } else {
      offset = 0;
    }
    this.setData({
      activeCategoryId: e.currentTarget.id,
      curPage: 1,
      cateScrollTop: offset
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  //事件处理函数
  toDetailsTap: function(e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },


  onLoad: function(e) {
    wx.showShareMenu({
      withShareTicket: true
    })
    const that = this
    if (e && e.scene) {
      const scene = decodeURIComponent(e.scene)
      if (scene) {
        wx.setStorageSync('referrer', scene.substring(11))
      }
    }
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })
    /**
     * 示例：
     * 调用接口封装方法
     */

    WXAPI.goodsCategory().then(function(res) {
      let categories = [{
        id: 0,
        icon: '/images/fl.png',
        name: "全部"
      }];
      if (res.code == 0) {
        categories = categories.concat(res.data)
      }
      const _n = Math.ceil(categories.length / 2)
      that.setData({
        categories: categories,
        category_box_width: 150 * _n,
        activeCategoryId: 0,
        curPage: 1
      });
      that.getGoodsList(0);
    })
  },
  onPageScroll(e) {
    let scrollTop = this.data.scrollTop
    this.setData({
      scrollTop: e.scrollTop
    })
  },
  getGoodsList: function(categoryId, append) {
    if (categoryId == 0) {
      categoryId = "";
    }
    var that = this;
    wx.showLoading({
      "mask": true
    })
    WXAPI.goods({
      categoryId: categoryId,
      nameLike: that.data.inputVal,
      page: this.data.curPage,
      pageSize: this.data.pageSize
    }).then(function(res) {
      wx.hideLoading()
      if (res.code == 404 || res.code == 700) {
        let newData = {
          loadingMoreHidden: false
        }
        if (!append) {
          newData.goods = []
        }
        that.setData(newData);
        return
      }
      let goods = [];
      if (append) {
        goods = that.data.goods
      }
      for (var i = 0; i < res.data.length; i++) {
        goods.push(res.data[i]);
      }
      that.setData({
        loadingMoreHidden: true,
        goods: goods,
      });
    })
  },

})