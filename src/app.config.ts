export default defineAppConfig({
  pages: [
    'pages/discover/index',
    'pages/record/index',
    'pages/map/index',
    'pages/species/index',
    'pages/mine/index',
    'pages/observation-detail/index',
    'pages/new-record/index',
    'pages/species-detail/index',
    'pages/species-compare/index',
    'pages/trip-detail/index',
    'pages/new-trip/index',
    'pages/stats-detail/index',
    'pages/wishlist/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#FAF8F3',
    navigationBarTitleText: '观鸟手记',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FAF8F3'
  },
  tabBar: {
    color: '#8A94A0',
    selectedColor: '#2F6B4F',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/discover/index',
        text: '发现'
      },
      {
        pagePath: 'pages/record/index',
        text: '记录'
      },
      {
        pagePath: 'pages/map/index',
        text: '地图'
      },
      {
        pagePath: 'pages/species/index',
        text: '物种库'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
