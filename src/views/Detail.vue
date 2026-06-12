<template>
  <div class="detail-page">
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
          @click="handleNavClick(item.type)"
        >
          {{ item.name }}
        </div>
      </div>
    </nav>

    <main class="detail-container container" v-if="detailData">
      <button class="back-btn" type="button" @click="goBack">
        <span class="back-arrow">&larr;</span>
        返回列表
      </button>

      <article class="detail-card">
        <div class="detail-image-wrap">
          <img :src="detailData.image" :alt="detailData.title" class="detail-image" />
          <div class="detail-image-overlay">
            <span class="detail-badge">{{ detailData.category }}</span>
          </div>
        </div>

        <div class="detail-body">
          <h2 class="detail-title">{{ detailData.title }}</h2>
          <time class="detail-date">{{ detailData.date }}</time>

          <div class="detail-divider"></div>

          <div class="detail-text">
            <p>{{ detailData.content }}</p>
          </div>

          <div class="detail-info">
            <div class="info-item">
              <span class="info-icon">&#9656;</span>
              <span class="info-label">类别</span>
              <span class="info-value">{{ detailData.category }}</span>
            </div>
            <div class="info-item">
              <span class="info-icon">&#9656;</span>
              <span class="info-label">年代</span>
              <span class="info-value">{{ detailData.period }}</span>
            </div>
            <div class="info-item">
              <span class="info-icon">&#9656;</span>
              <span class="info-label">收藏地</span>
              <span class="info-value">{{ detailData.location }}</span>
            </div>
          </div>
        </div>
      </article>
    </main>

    <div class="loading" v-else>
      <span class="loading-text">加载中...</span>
    </div>

    
  </div>
</template>

<script>
import request from '@/utils/request'
import AdminLoginEntry from '@/components/AdminLoginEntry.vue'

export default {
  name: 'RelicDetail',
  components: {
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
      detailData: null
    }
  },
  mounted() {
    this.fetchDetail()
  },
  methods: {
    async fetchDetail() {
      try {
        const id = this.$route.params.id
        const res = await request.get(`/api/relics/${id}`)
        if (res.success) {
          const data = res.data
          this.detailData = {
            id: data.id,
            title: data.title,
            date: data.publishDate || '2025-10-19',
            image: data.imageUrl || '',
            content: data.content || '',
            category: this.getCategoryName(data.categoryId),
            period: data.period || '',
            location: data.location || ''
          }
        } else {
          this.detailData = this.generateMockDetail()
        }
      } catch (error) {
        console.error('Failed to fetch detail:', error)
        this.detailData = this.generateMockDetail()
      }
    },
    getCategoryName(categoryId) {
      const item = this.navItems.find(i => i.type === categoryId)
      return item ? item.name : '未知分类'
    },
    generateMockDetail() {
      return {
        id: this.$route.params.id,
        title: '《兴国土地法》',
        date: '2025-10-19',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Red%20revolutionary%20document%20historical%20land%20law%20Chinese%20Soviet%20period&image_size=landscape_16_9',
        content: '《兴国土地法》是中国共产党在土地革命时期制定的一部重要土地法规。1929年4月，毛泽东在总结赣南土地斗争经验的基础上，主持制定了这部法律。该法明确规定了"没收一切公共土地及地主阶级的土地"，并将土地分配给无地或少地的农民。这一法律的颁布，极大地激发了农民的革命积极性，巩固了革命根据地的政权基础。',
        category: '印信图章',
        period: '土地革命时期',
        location: '江西省博物馆'
      }
    },
    handleNavClick(type) {
      this.$router.push(`/list/${type}`)
    },
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.detail-page {
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

.detail-container {
  padding: 40px 24px 60px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 13px;
  transition: all 0.2s ease;
  margin-bottom: 28px;
}

.back-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.back-arrow {
  font-size: 16px;
}

.detail-card {
  max-width: 800px;
  margin: 0 auto;
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
}

.detail-image-wrap {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.detail-image {
  width: 100%;
  max-height: 480px;
  object-fit: cover;
  display: block;
}

.detail-image-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
}

.detail-badge {
  display: inline-block;
  padding: 5px 14px;
  background: var(--color-primary);
  color: #f0e8d8;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 1px;
}

.detail-body {
  padding: 36px 40px 40px;
}

.detail-title {
  font-family: var(--font-heading);
  font-size: 26px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  letter-spacing: 2px;
}

.detail-date {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-muted);
  display: block;
  margin-top: 8px;
}

.detail-divider {
  height: 1px;
  background: var(--color-border-light);
  margin: 24px 0;
}

.detail-text {
  line-height: 2;
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: 15px;
  margin-bottom: 32px;
}

.detail-text p {
  text-indent: 2em;
}

.detail-info {
  border-top: 2px solid var(--color-border);
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-body);
  font-size: 14px;
}

.info-icon {
  color: var(--color-accent);
  font-size: 10px;
}

.info-label {
  color: var(--color-text-secondary);
  min-width: 56px;
  font-weight: 500;
}

.info-value {
  color: var(--color-text);
}

.loading {
  padding: 80px 24px;
  text-align: center;
}

.loading-text {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--color-text-muted);
}

.site-footer {
  background: var(--color-footer-bg);
  color: rgba(240, 232, 216, 0.7);
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
