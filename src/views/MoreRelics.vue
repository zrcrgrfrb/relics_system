<template>
  <div class="more-page">
    <header class="site-header">
      <HeaderSearch />
      <div class="header-inner container">
        <h1 class="site-title">
          
          红色文物管理系统
        </h1>
        <p class="site-subtitle">革命文物数字化保护与传承平台</p>
      </div>
      <div class="header-accent">
      </div>
    </header>

    <nav class="site-nav">
      <div class="nav-inner container">
        <div
          v-for="item in navItems"
          :key="item.type"
          class="nav-item"
          :class="{ active: !isLookupMode && currentType === item.type }"
          @click="handleNavClick(item.type)"
        >
          {{ item.name }}
        </div>
      </div>
    </nav>

    <main class="more-container">
      <div class="page-heading">
        <div>
          <h2>{{ pageTitle }}</h2>
          <p>{{ pageSummary }}</p>
        </div>
        <button class="back-button" type="button" @click="goBack">返回</button>
      </div>

      <el-table
        v-loading="loading"
        :data="relics"
        border
        class="relic-table"
        empty-text="暂无数据"
        @row-click="handleRowClick"
      >
        <el-table-column label="图片" width="180" align="center">
          <template slot-scope="scope">
            <img
              class="relic-image"
              :src="scope.row.image"
              :alt="scope.row.title"
              @click.stop="goToDetail(scope.row.id)"
            />
          </template>
        </el-table-column>
        <el-table-column label="标题" min-width="260">
          <template slot-scope="scope">
            <button class="title-button" type="button" @click.stop="goToDetail(scope.row.id)">
              <span
                v-for="(part, index) in highlightParts(scope.row.title)"
                :key="`title-${scope.row.id}-${index}`"
                :class="{ 'search-highlight': part.match }"
              >{{ part.text }}</span>
            </button>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="发布日期" width="160" align="center">
          <template slot-scope="scope">
            <span
              v-for="(part, index) in highlightParts(scope.row.date)"
              :key="`date-${scope.row.id}-${index}`"
              :class="{ 'search-highlight': part.match }"
            >{{ part.text }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="isImageSearchMode" label="相似度" width="120" align="center">
          <template slot-scope="scope">
            <span class="similarity-badge">{{ formatSimilarity(scope.row.similarity) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!isImageSearchMode" class="pagination-wrap">
        <el-pagination
          background
          layout="prev, pager, next, jumper, total"
          :current-page="page"
          :page-size="pageSize"
          :total="total"
          @current-change="handlePageChange"
        />
      </div>
    </main>

  
  </div>
</template>

<script>
import HeaderSearch from '@/components/HeaderSearch.vue'
import { getRelicsPage, searchRelics } from '@/api/relics'

export default {
  name: 'MoreRelics',
  components: {
    HeaderSearch
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
      relics: [],
      page: 1,
      pageSize: 8,
      total: 0,
      loading: false
    }
  },
  computed: {
    isSearchMode() {
      return this.$route.params.type === 'search'
    },
    isImageSearchMode() {
      return this.$route.params.type === 'image-search'
    },
    isLookupMode() {
      return this.isSearchMode || this.isImageSearchMode
    },
    searchKeyword() {
      return (this.$route.query.keyword || '').trim()
    },
    currentType() {
      return parseInt(this.$route.params.type, 10) || 1
    },
    currentTypeName() {
      const item = this.navItems.find(i => i.type === this.currentType)
      return item ? item.name : '文物列表'
    },
    pageTitle() {
      if (this.isImageSearchMode) {
        return '图像检索结果'
      }
      return this.isSearchMode ? '搜索结果' : this.currentTypeName
    },
    pageSummary() {
      if (this.isImageSearchMode) {
        return `按图片特征匹配到 ${this.total} 件相似文物`
      }
      if (this.isSearchMode) {
        return this.searchKeyword
          ? `“${this.searchKeyword}” 共匹配 ${this.total} 件文物`
          : '请输入标题或发布日期进行搜索'
      }
      return `共 ${this.total} 件文物`
    }
  },
  mounted() {
    this.fetchRelics()
  },
  watch: {
    '$route.params.type'() {
      this.page = 1
      this.fetchRelics()
    },
    '$route.query.keyword'() {
      this.page = 1
      this.fetchRelics()
    }
  },
  methods: {
    async fetchRelics() {
      this.loading = true
      try {
        if (this.isImageSearchMode) {
          this.loadImageSearchResults()
          return
        }

        if (this.isSearchMode && !this.searchKeyword) {
          this.relics = []
          this.total = 0
          return
        }

        const params = {
          page: this.page,
          pageSize: this.pageSize
        }
        const res = this.isSearchMode
          ? await searchRelics({ ...params, keyword: this.searchKeyword })
          : await getRelicsPage({ ...params, type: this.currentType })

        if (res.success) {
          const data = res.data || {}
          this.relics = (data.list || []).map(item => ({
            id: item.id,
            title: item.title,
            date: item.publishDate || item.date || '',
            image: item.imageUrl || item.image || '',
            similarity: item.similarity
          }))
          this.total = data.total || 0
          return
        }
        this.useMockData()
      } catch (error) {
        console.error('Failed to fetch relic page:', error)
        this.useMockData()
      } finally {
        this.loading = false
      }
    },
    useMockData() {
      const all = Array.from({ length: 23 }).map((_, index) => ({
        id: `${this.currentType}-${index + 1}`,
        title: `${this.isSearchMode ? '搜索结果' : this.currentTypeName}文物 ${index + 1}`,
        date: '2025-10-19',
        image: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20red%20revolutionary%20relic%20museum%20object%20${this.currentType}%20${index + 1}&image_size=square`
      }))
      const start = (this.page - 1) * this.pageSize
      this.relics = all.slice(start, start + this.pageSize)
      this.total = all.length
    },
    loadImageSearchResults() {
      const raw = sessionStorage.getItem('imageSearchResults')
      if (!raw) {
        this.relics = []
        this.total = 0
        return
      }

      try {
        const data = JSON.parse(raw)
        const list = data.list || []
        this.relics = list.map(item => ({
          id: item.id,
          title: item.title,
          date: item.publishDate || item.date || '',
          image: item.imageUrl || item.image || '',
          similarity: item.similarity
        }))
        this.total = data.total || list.length
      } catch (error) {
        console.error('Failed to parse image search results:', error)
        this.relics = []
        this.total = 0
      }
    },
    handlePageChange(page) {
      this.page = page
      this.fetchRelics()
    },
    handleNavClick(type) {
      this.$router.push(`/more/${type}`)
    },
    handleRowClick(row) {
      this.goToDetail(row.id)
    },
    goToDetail(id) {
      this.$router.push(`/detail/${id}`)
    },
    goBack() {
      this.$router.back()
    },
    highlightParts(value) {
      const text = String(value || '')
      const keyword = this.isSearchMode ? this.searchKeyword : ''
      if (!keyword) {
        return [{ text, match: false }]
      }

      const lowerText = text.toLowerCase()
      const lowerKeyword = keyword.toLowerCase()
      const parts = []
      let start = 0
      let index = lowerText.indexOf(lowerKeyword)

      while (index !== -1) {
        if (index > start) {
          parts.push({ text: text.slice(start, index), match: false })
        }
        const end = index + keyword.length
        parts.push({ text: text.slice(index, end), match: true })
        start = end
        index = lowerText.indexOf(lowerKeyword, start)
      }

      if (start < text.length) {
        parts.push({ text: text.slice(start), match: false })
      }
      return parts.length ? parts : [{ text, match: false }]
    },
    formatSimilarity(value) {
      if (typeof value !== 'number') {
        return '-'
      }
      return `${Math.round(value * 100)}%`
    }
  }
}
</script>

<style scoped>
.more-page {
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

.nav-item.active {
  color: var(--color-accent);
  font-weight: 500;
}

.nav-item.active::after {
  width: 60%;
}

.more-container {
  margin: 0 auto;
  max-width: 1180px;
  padding: 32px 24px 60px;
}

.page-heading {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-heading h2 {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 4px;
  letter-spacing: 1px;
}

.page-heading p {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}

.back-button {
  padding: 8px 20px;
  background: var(--color-primary);
  border: none;
  color: #f0e8d8;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 13px;
  letter-spacing: 1px;
  transition: background 0.2s ease;
}

.back-button:hover {
  background: var(--color-primary-dark);
}

.relic-table {
  width: 100%;
  border-color: var(--color-border-light) !important;
}

.relic-table >>> .el-table__row {
  cursor: pointer;
}

.relic-image {
  border: 1px solid var(--color-border-light);
  cursor: pointer;
  height: 90px;
  object-fit: cover;
  width: 130px;
  transition: opacity 0.2s ease;
}

.relic-image:hover {
  opacity: 0.85;
}

.title-button {
  background: transparent;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.5;
  padding: 0;
  text-align: left;
  transition: color 0.2s ease;
}

.title-button:hover {
  color: var(--color-primary);
}

.search-highlight {
  background: rgba(201, 168, 106, 0.22);
  box-shadow: inset 0 -1px 0 rgba(201, 168, 106, 0.55);
  color: var(--color-primary);
  padding: 0 2px;
}

.similarity-badge {
  background: rgba(139, 26, 26, 0.08);
  border: 1px solid rgba(139, 26, 26, 0.16);
  color: var(--color-primary);
  display: inline-block;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  min-width: 54px;
  padding: 3px 8px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
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
