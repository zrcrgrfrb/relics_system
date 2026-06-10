<template>
  <div class="list-page">
    <header class="site-header">
      <div class="header-inner container">
        <h1 class="site-title">
          <span class="title-icon"></span>
          红色文物管理系统
        </h1>
        <p class="site-subtitle">革命文物数字化保护与传承平台</p>
        <AdminLoginEntry />
      </div>
      <div class="header-accent"></div>
    </header>
    <nav class="site-nav">
      <div class="nav-inner container">
        <div
          v-for="(item, index) in navItems"
          :key="index"
          class="nav-item"
          :class="{ active: parseInt($route.params.type) === item.type }"
          @click="handleNavClick(item.type)"
        >
          {{ item.name }}
        </div>
      </div>
    </nav>

    <main class="main-content container">
      <aside class="side-section left-section">
        <div class="section-header">
          <h3 class="section-title">
            <span class="title-dot"></span>
            {{ currentTypeName }}
          </h3>
          <MoreLink :type="currentType" />
        </div>
        <div class="article-list">
          <div
            v-for="item in leftColumnData"
            :key="item.id"
            class="article-item"
            @click="goToDetail(item.id)"
          >
            <span class="article-title">{{ item.title }}</span>
            <span class="article-date">{{ item.date }}</span>
          </div>
        </div>
      </aside>

      <section class="carousel-section">
        <el-carousel :interval="4000" height="540px" indicator-position="bottom" arrow="always">
          <el-carousel-item v-for="(image, index) in currentCarouselImages" :key="index">
            <div class="carousel-item-inner">
              <img :src="image.image" :alt="image.title" class="carousel-img" />
              <div class="carousel-caption">
                <span class="caption-label">馆藏文物</span>
                <h3 class="caption-title">{{ image.title }}</h3>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </section>

      <aside class="side-section right-section">
        <div class="section-header">
          <h3 class="section-title">
            <span class="title-dot"></span>
            {{ currentTypeName }}
          </h3>
          <MoreLink :type="currentType" />
        </div>
        <div class="article-list">
          <div
            v-for="item in rightColumnData"
            :key="item.id"
            class="article-item"
            @click="goToDetail(item.id)"
          >
            <span class="article-title">{{ item.title }}</span>
            <span class="article-date">{{ item.date }}</span>
          </div>
        </div>
      </aside>
    </main>

    <footer class="site-footer">
      <div class="footer-accent"></div>
      <div class="footer-inner container">
        <div class="footer-cols">
          <div class="footer-col footer-brand">
            <div class="footer-logo">
              <div class="logo-mark">红</div>
              <span class="footer-title">红色文物管理系统</span>
            </div>
          </div>
          <div class="footer-col footer-info">
            <p>&copy; 版权所有 2024 "江西"数字思政创新研究中心</p>
            <p>邮编：341000 联系电话：0797-8393666</p>
            <p>赣ICP备2022028116号-1</p>
            <p>地址：江西省赣州市章贡区师大南路赣南师范大学人文科技中心二楼江西数字思政创新研究中心</p>
          </div>
          <div class="footer-col footer-links">
            <a href="#" class="footer-link">关于我们</a>
            <a href="#" class="footer-link">意见反馈</a>
            <a href="#" class="footer-link">平台声明</a>
            <a href="#" class="footer-link">制作团队</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import request from '@/utils/request'
import MoreLink from '@/components/MoreLink.vue'
import AdminLoginEntry from '@/components/AdminLoginEntry.vue'

export default {
  name: 'RelicList',
  components: {
    MoreLink,
    AdminLoginEntry
  },
  data() {
    return {
      navItems: [
        { name: '印信图章', type: 1 },
        { name: '旗帜证徽', type: 2 },
        { name: '货币票证', type: 3 },
        { name: '邮票邮品', type: 4 },
        { name: '生活器具', type: 5 },
        { name: '武装器械', type: 6 },
        { name: '其它', type: 7 }
      ],
      listData: [],
      carouselImagesMap: {
        1: [
          { title: '古代印章', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20Chinese%20seal%20stamp%20red%20ink%20historical%20relic&image_size=landscape_16_9' },
          { title: '官印', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20official%20seal%20bronze%20ancient&image_size=landscape_16_9' },
          { title: '玉玺', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=imperial%20jade%20seal%20Chinese%20ancient%20treasure&image_size=landscape_16_9' },
          { title: '篆刻印章', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20seal%20carving%20traditional%20art%20calligraphy&image_size=landscape_16_9' }
        ],
        2: [
          { title: '红军军旗', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Red%20Army%20flag%20Chinese%20revolution%20historical%20banner&image_size=landscape_16_9' },
          { title: '苏维埃徽章', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Soviet%20badge%20Chinese%20revolution%20red%20star&image_size=landscape_16_9' },
          { title: '锦旗', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=honorary%20flag%20red%20silk%20Chinese%20traditional&image_size=landscape_16_9' },
          { title: '证书', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=historical%20certificate%20document%20revolution%20period&image_size=landscape_16_9' }
        ],
        3: [
          { title: '苏维埃货币', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Soviet%20currency%20banknote%20Chinese%20revolution&image_size=landscape_16_9' },
          { title: '苏区纸币', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Soviet%20area%20paper%20money%20historical%20currency&image_size=landscape_16_9' },
          { title: '银元', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=silver%20coin%20Chinese%20ancient%20currency&image_size=landscape_16_9' },
          { title: '粮票', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=food%20coupon%20Chinese%20historical%20ration%20ticket&image_size=landscape_16_9' }
        ],
        4: [
          { title: '革命邮票', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=revolutionary%20stamp%20collection%20postage%20China&image_size=landscape_16_9' },
          { title: '纪念邮票', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=commemorative%20stamp%20historical%20event%20China&image_size=landscape_16_9' },
          { title: '苏区邮票', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Soviet%20area%20stamp%20postal%20history&image_size=landscape_16_9' },
          { title: '邮品', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=postal%20collection%20envelope%20stamp%20vintage&image_size=landscape_16_9' }
        ],
        5: [
          { title: '陶瓷器具', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ceramic%20vase%20Chinese%20traditional%20porcelain&image_size=landscape_16_9' },
          { title: '生活用品', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20daily%20utensils%20wooden&image_size=landscape_16_9' },
          { title: '家具', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ancient%20furniture%20wooden%20desk&image_size=landscape_16_9' },
          { title: '纺织用品', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20textile%20fabric%20silk&image_size=landscape_16_9' }
        ],
        6: [
          { title: '步枪', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=old%20rifle%20military%20weapon%20historical&image_size=landscape_16_9' },
          { title: '大刀', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20broadsword%20traditional%20weapon%20steel&image_size=landscape_16_9' },
          { title: '军旗', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=military%20flag%20red%20army%20banner&image_size=landscape_16_9' },
          { title: '军装', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=military%20uniform%20vintage%20revolution%20period&image_size=landscape_16_9' }
        ],
        7: [
          { title: '革命文献', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=revolutionary%20document%20manuscript%20historical&image_size=landscape_16_9' },
          { title: '历史照片', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=historical%20black%20white%20photo%20China&image_size=landscape_16_9' },
          { title: '纪念章', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=commemorative%20medal%20badge%20honor&image_size=landscape_16_9' },
          { title: '文物', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=historical%20relic%20museum%20exhibition&image_size=landscape_16_9' }
        ]
      }
    }
  },
  computed: {
    currentType() {
      return parseInt(this.$route.params.type, 10) || 1
    },
    currentTypeName() {
      const item = this.navItems.find(i => i.type === this.currentType)
      return item ? item.name : '文物列表'
    },
    currentCarouselImages() {
      return this.carouselImagesMap[this.currentType] || this.carouselImagesMap[1]
    },
    leftColumnData() {
      return this.listData.slice(0, Math.ceil(this.listData.length / 2))
    },
    rightColumnData() {
      return this.listData.slice(Math.ceil(this.listData.length / 2))
    }
  },
  mounted() {
    this.fetchData()
  },
  watch: {
    '$route.params.type'() {
      this.fetchData()
    }
  },
  methods: {
    async fetchData() {
      try {
        const type = this.$route.params.type
        const res = await request.get(`/api/relics?type=${type}`)
        if (res.success) {
          this.listData = res.data.map(item => ({
            id: item.id,
            title: item.title,
            date: item.publishDate || '2025-10-19'
          }))
        } else {
          this.listData = this.generateMockData()
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        this.listData = this.generateMockData()
      }
    },
    generateMockData() {
      const type = parseInt(this.$route.params.type)
      const typeNames = ['', '印信图章', '旗帜证徽', '货币票证', '邮票邮品', '生活器具', '武装器械', '其它']
      const currentTypeName = typeNames[type] || '文物'

      return [
        { id: 1, title: `《兴国土地法》${currentTypeName}`, date: '2025-10-19' },
        { id: 2, title: `中华民国是两个流部${currentTypeName}`, date: '2025-10-19' },
        { id: 3, title: `拥护中华苏维埃中央政府${currentTypeName}`, date: '2025-10-19' },
        { id: 4, title: `卧薪尝胆誓复仇-${currentTypeName}`, date: '2025-10-19' },
        { id: 5, title: `全世界无产阶级联合起来${currentTypeName}`, date: '2025-10-19' },
        { id: 6, title: `取消一切苛捐杂税${currentTypeName}`, date: '2025-10-19' },
        { id: 7, title: `部分中央苏区土地法${currentTypeName}`, date: '2025-10-19' },
        { id: 8, title: `中国人民解放军总部颁布口号-${currentTypeName}`, date: '2025-10-19' },
        { id: 9, title: `乡村土地实行平分-${currentTypeName}`, date: '2025-10-19' },
        { id: 10, title: `井冈山《土地法》${currentTypeName}`, date: '2025-10-19' },
        { id: 11, title: `全国民联合起来${currentTypeName}`, date: '2025-10-19' },
        { id: 12, title: `取消苛捐杂税-${currentTypeName}`, date: '2025-10-19' }
      ]
    },
    handleNavClick(type) {
      this.$router.push(`/list/${type}`)
    },
    goToDetail(id) {
      this.$router.push(`/detail/${id}`)
    }
  }
}
</script>

<style scoped>
.list-page {
  min-height: 100vh;
  background: var(--color-bg);
}

.site-header {
  background: var(--color-footer-bg);
  padding: 52px 0 0;
  position: relative;
}

.header-inner {
  text-align: center;
  padding-bottom: 40px;
}

.site-title {
  font-family: var(--font-heading);
  font-size: 36px;
  font-weight: 700;
  color: #f0e8d8;
  letter-spacing: 6px;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  display: inline-block;
  width: 10px;
  height: 10px;
  background: var(--color-accent);
  transform: rotate(45deg);
}

.site-subtitle {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 300;
  color: rgba(201, 168, 106, 0.6);
  letter-spacing: 4px;
  margin-top: 10px;
}

.header-accent {
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
  opacity: 0.5;
}

.site-nav {
  background: var(--color-footer-bg);
  border-bottom: 1px solid rgba(201, 168, 106, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-inner {
  display: flex;
  align-items: center;
  gap: 0;
}

.nav-item {
  flex: 1;
  padding: 14px 0;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 400;
  color: rgba(240, 232, 216, 0.65);
  transition: all 0.3s ease;
  text-align: center;
  letter-spacing: 2px;
  position: relative;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: var(--color-accent);
  transition: width 0.3s ease;
}

.nav-item:hover {
  color: rgba(240, 232, 216, 0.9);
  background: rgba(201, 168, 106, 0.05);
}

.nav-item.active {
  color: var(--color-accent);
  font-weight: 500;
}

.nav-item.active::after {
  width: 60%;
}

.main-content {
  display: flex;
  padding: 40px 24px;
  gap: 28px;
  align-items: flex-start;
}

.side-section {
  width: 260px;
  flex-shrink: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--color-border);
}

.section-title {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: var(--color-primary);
  border-radius: 50%;
}

.article-list {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.article-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 11px 14px;
  border-bottom: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: all 0.2s ease;
}

.article-item:last-child {
  border-bottom: none;
}

.article-item:hover {
  background: rgba(139, 26, 26, 0.03);
  padding-left: 18px;
}

.article-title {
  flex: 1;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-date {
  font-family: var(--font-body);
  font-size: 11px;
  color: var(--color-text-muted);
  margin-left: 10px;
  flex-shrink: 0;
}

.carousel-section {
  flex: 1;
  min-width: 0;
}

.carousel-item-inner {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-img {
  width: 100%;
  height: 540px;
  object-fit: cover;
  display: block;
}

.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px 32px 24px;
  background: linear-gradient(transparent, rgba(26, 10, 10, 0.85));
  color: #fff;
}

.caption-label {
  display: inline-block;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 6px;
  opacity: 0.8;
}

.caption-title {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 600;
  color: #f0e8d8;
  margin: 0;
  letter-spacing: 2px;
}

.site-footer {
  background: var(--color-footer-bg);
  color: rgba(240, 232, 216, 0.7);
  margin-top: 20px;
}

.footer-accent {
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
  opacity: 0.3;
}

.footer-inner {
  padding: 40px 24px;
}

.footer-cols {
  display: flex;
  gap: 60px;
  align-items: flex-start;
}

.footer-brand {
  flex: 0 0 auto;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-mark {
  width: 52px;
  height: 52px;
  border: 2px solid var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-accent);
  opacity: 0.8;
}

.footer-title {
  font-family: var(--font-heading);
  font-size: 17px;
  font-weight: 500;
  color: rgba(240, 232, 216, 0.85);
}

.footer-info {
  flex: 2;
}

.footer-info p {
  font-size: 12px;
  line-height: 1.8;
  margin: 3px 0;
  opacity: 0.7;
}

.footer-links {
  flex: 1;
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-link {
  color: rgba(240, 232, 216, 0.6);
  text-decoration: none;
  font-size: 13px;
  font-weight: 300;
  transition: color 0.3s;
  letter-spacing: 1px;
}

.footer-link:hover {
  color: var(--color-accent);
}
</style>
