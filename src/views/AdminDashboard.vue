<template>
  <div class="admin-dashboard">
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <div class="brand-mark">红</div>
        <div>
          <strong>文物后台</strong>
          <span>Archive Console</span>
        </div>
      </div>
      <nav class="admin-menu">
        <button :class="{ active: currentPanel === 'overview' }" type="button" @click="switchPanel('overview')">运行监视</button>
        <button :class="{ active: currentPanel === 'upload' }" type="button" @click="switchPanel('upload')">数据上传</button>
        <button :class="{ active: currentPanel === 'records' }" type="button" @click="switchPanel('records')">数据列表</button>
      </nav>
      <button class="logout-button" type="button" @click="logout">退出登录</button>
    </aside>
    <main class="admin-main">
      <header class="admin-topbar">
        <div>
          <span class="topbar-kicker">ADMIN CONTROL ROOM</span>
          <h1>{{ panelTitle }}</h1>
        </div>
        <div class="topbar-actions">
          <button class="front-button" type="button" @click="fetchRelics">刷新数据</button>
          <button class="front-button" type="button" @click="$router.push('/')">返回前台</button>
        </div>
      </header>
      <section v-show="currentPanel === 'overview'" class="panel-page overview-page">
        <section class="metric-grid">
          <article class="metric-card">
            <span>馆藏总量</span>
            <strong>{{ totalRelics }}</strong>
            <small>已接入系统记录</small>
          </article>
          <article class="metric-card warm">
            <span>分类覆盖</span>
            <strong>{{ activeCategoryCount }}</strong>
            <small>{{ categories.length }} 个文物目录</small>
          </article>
          <article class="metric-card deep">
            <span>最近更新</span>
            <strong>{{ latestDate }}</strong>
            <small>按发布日期监视</small>
          </article>
          <article class="metric-card pulse">
            <span>服务器状态</span>
            <strong>{{ apiStatus }}</strong>
            <small>{{ statusText }}</small>
          </article>
        </section>
        <section class="chart-grid">
          <article class="panel chart-panel large">
            <div class="panel-heading"><span>Category Overview</span><h2>分类数据总览</h2></div>
            <div ref="categoryChart" class="chart-box tall"></div>
          </article>
          <article class="panel chart-panel">
            <div class="panel-heading"><span>Archive Ring</span><h2>馆藏比例</h2></div>
            <div ref="pieChart" class="chart-box"></div>
          </article>
          <article class="panel chart-panel">
            <div class="panel-heading"><span>Timeline</span><h2>发布趋势</h2></div>
            <div ref="timelineChart" class="chart-box"></div>
          </article>
          <article class="panel chart-panel">
            <div class="panel-heading"><span>Period Mix</span><h2>年代分布</h2></div>
            <div ref="periodChart" class="chart-box"></div>
          </article>
          <article class="panel chart-panel">
            <div class="panel-heading"><span>Location Top</span><h2>收藏地排名</h2></div>
            <div ref="locationChart" class="chart-box"></div>
          </article>
        </section>
      </section>
      <section v-show="currentPanel === 'upload'" class="panel-page upload-page">
        <article class="panel upload-panel">
          <div class="panel-heading">
            <div><span>Upload Dock</span><h2>文物数据入库</h2></div>
          </div>
          <el-upload drag action="" :auto-upload="false" :show-file-list="false" :before-upload="handleFileUpload" class="upload-box">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">拖入 JSON/CSV 文件，或 <em>点击选择</em></div>
            <div class="el-upload__tip" slot="tip">JSON/CSV fields: title, categoryId, content, imageUrl, period, location, publishDate</div>
          </el-upload>
          <el-form :model="form" label-position="top" class="relic-form">
            <el-row :gutter="18">
              <el-col :span="12"><el-form-item label="文物标题"><el-input v-model="form.title" placeholder="请输入文物标题" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="所属分类"><el-select v-model="form.categoryId" placeholder="选择分类" class="full-width"><el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item></el-col>
            </el-row>
            <el-row :gutter="18">
              <el-col :span="12">
            <el-form-item label="图片">
              <div class="image-upload-row">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
                  style="display:none"
                  @change="handleImageSelect"
                />
                <button
                  type="button"
                  class="upload-btn"
                  :disabled="uploading"
                  @click="$refs.fileInput.click()"
                >
                  {{ uploading ? '上传中...' : '选择图片' }}
                </button>
                <span v-if="selectedFile" class="file-name">{{ selectedFile.name }}</span>
                <button
                  v-if="selectedFile && !uploading"
                  type="button"
                  class="upload-upload-btn"
                  @click="triggerImageUpload"
                >
                  上传
                </button>
              </div>
              <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
              <img
                v-if="form.imageUrl"
                :src="form.imageUrl"
                class="image-preview"
                alt="图片预览"
              />
              <el-input
                v-model="form.imageUrl"
                placeholder="或手动输入图片 URL"
                class="url-fallback"
              />
            </el-form-item>
          </el-col>
              <el-col :span="12"><el-form-item label="发布日期"><el-date-picker v-model="form.publishDate" value-format="yyyy-MM-dd" type="date" placeholder="选择日期" class="full-width" /></el-form-item></el-col>
            </el-row>
            <el-row :gutter="18">
              <el-col :span="12"><el-form-item label="年代"><el-input v-model="form.period" placeholder="如：土地革命时期" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="收藏地"><el-input v-model="form.location" placeholder="馆藏或陈列地点" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="文物说明">
              <quill-editor
                ref="quillEditor"
                v-model="form.content"
                :options="quillOptions"
                class="quill-editor-custom"
              />
            </el-form-item>
            <button class="submit-button" type="button" :disabled="submitting" @click="submitRelic">{{ submitText }}</button>
          </el-form>
        </article>
      </section>
      <section v-show="currentPanel === 'records'" class="panel-page records-page">
        <article class="panel records-panel">
          <div class="panel-heading records-heading">
            <div><span>Latest Records</span><h2>数据记录</h2></div>
            <div class="records-tools">
              <el-button
                type="danger"
                icon="el-icon-delete"
                :disabled="!selectedRows.length"
                :loading="submitting"
                @click="deleteSelectedRelics"
              >
                批量删除
              </el-button>
              <el-input v-model="keyword" placeholder="搜索标题、地点、年代" prefix-icon="el-icon-search" class="search-input" />
            </div>
          </div>
          <el-table
            ref="recordsTable"
            v-loading="loading"
            :data="filteredRelics"
            row-key="id"
            stripe
            empty-text="暂无数据"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="48" reserve-selection />
            <el-table-column prop="title" label="标题" min-width="220" />
            <el-table-column label="分类" width="120"><template slot-scope="scope">{{ categoryName(scope.row.categoryId) }}</template></el-table-column>
            <el-table-column prop="period" label="年代" width="150" />
            <el-table-column prop="location" label="收藏地" min-width="180" />
            <el-table-column prop="publishDate" label="发布日期" width="140" />
            <el-table-column label="操作" width="170" fixed="right">
              <template slot-scope="scope">
                <el-button type="text" icon="el-icon-edit" @click="openEditDialog(scope.row)">修改</el-button>
                <el-button type="text" class="danger-link" icon="el-icon-delete" @click="deleteSingleRelic(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </article>
      </section>
    </main>
    <el-dialog
      title="修改文物数据"
      :visible.sync="editDialogVisible"
      width="760px"
      custom-class="edit-relic-dialog"
      :close-on-click-modal="false"
      @closed="resetEditForm"
    >
      <el-form :model="editForm" label-position="top" class="relic-form edit-form">
        <el-row :gutter="18">
          <el-col :span="12"><el-form-item label="文物标题"><el-input v-model="editForm.title" placeholder="请输入文物标题" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="所属分类"><el-select v-model="editForm.categoryId" placeholder="选择分类" class="full-width"><el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item></el-col>
        </el-row>
        <el-row :gutter="18">
          <el-col :span="12">
            <el-form-item label="图片">
              <div class="image-upload-row">
                <el-upload
                  action=""
                  :show-file-list="false"
                  :http-request="uploadEditImage"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
                >
                  <el-button size="small" :loading="editImageUploading">选择图片</el-button>
                </el-upload>
              </div>
              <img v-if="editForm.imageUrl" :src="editForm.imageUrl" class="image-preview" alt="图片预览" />
              <el-input v-model="editForm.imageUrl" placeholder="或手动输入图片 URL" class="url-fallback" />
            </el-form-item>
          </el-col>
          <el-col :span="12"><el-form-item label="发布日期"><el-date-picker v-model="editForm.publishDate" value-format="yyyy-MM-dd" type="date" placeholder="选择日期" class="full-width" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="18">
          <el-col :span="12"><el-form-item label="年代"><el-input v-model="editForm.period" placeholder="如：土地革命时期" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="收藏地"><el-input v-model="editForm.location" placeholder="馆藏或陈列地点" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="文物说明">
          <quill-editor
            v-model="editForm.content"
            :options="quillOptions"
            class="quill-editor-custom"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editSubmitting" @click="submitEditRelic">保存修改</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getCategories, getRelics, getRelicDetail, createRelic, updateRelic, deleteRelic, batchDeleteRelics, uploadImage } from '@/api/relics'
import { quillEditor } from 'vue-quill-editor'
import { clearAdminSession } from '@/utils/auth'
import 'quill/dist/quill.snow.css'

export default {
  name: 'AdminDashboard',
  components: { quillEditor },
  data() {
    return {
      currentPanel: 'overview',
      charts: {},
      loading: false,
      submitting: false,
      selectedFile: null,
      uploading: false,
      uploadError: '',
      selectedRows: [],
      editDialogVisible: false,
      editSubmitting: false,
      editImageUploading: false,
      apiStatus: '检测中',
      statusText: '正在连接后端服务',
      keyword: '',
      categories: [
        { id: 1, name: '印信图章' },
        { id: 2, name: '旗帜证徽' },
        { id: 3, name: '货币票证' },
        { id: 4, name: '邮票邮品' },
        { id: 5, name: '生活器具' },
        { id: 6, name: '武装器械' },
        { id: 7, name: '其它' }
      ],
      relics: [],
      form: this.emptyForm(),
      editForm: this.emptyForm(),
      quillOptions: {
        theme: 'snow',
        placeholder: '请输入文物介绍与史料说明',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ header: [1, 2, 3, false] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['blockquote', 'code-block'],
            [{ color: [] }, { background: [] }],
            ['link', 'image'],
            ['clean']
          ]
        }
      }
    }
  },
  computed: {
    panelTitle() {
      const titles = {
        overview: '红色文物运行监视中心',
        upload: '文物数据上传与编辑',
        records: '文物数据列表'
      }
      return titles[this.currentPanel]
    },
    totalRelics() {
      return this.relics.length
    },
    activeCategoryCount() {
      return this.categories.filter(category => this.relics.some(relic => relic.categoryId === category.id)).length
    },
    latestDate() {
      const dates = this.relics.map(item => item.publishDate).filter(Boolean).sort().reverse()
      return dates[0] || '暂无'
    },
    filteredRelics() {
      const keyword = this.keyword.trim().toLowerCase()
      if (!keyword) return this.relics
      return this.relics.filter(item => [item.title, item.location, item.period].some(value => String(value || '').toLowerCase().includes(keyword)))
    },
    categorySeries() {
      return this.categories.map(category => ({ name: category.name, value: this.relics.filter(relic => relic.categoryId === category.id).length }))
    },
    monthSeries() {
      const stat = this.relics.reduce((result, item) => {
        const month = (item.publishDate || '未设置').slice(0, 7) || '未设置'
        result[month] = (result[month] || 0) + 1
        return result
      }, {})
      return Object.keys(stat).sort().map(name => ({ name, value: stat[name] }))
    },
    periodSeries() {
      return this.topSeries('period', '未设置年代', 8)
    },
    locationSeries() {
      return this.topSeries('location', '未设置地点', 8)
    },
    submitText() {
      return this.submitting ? '正在提交...' : '提交入库'
    }
  },
  mounted() {
    this.fetchCategories()
    this.fetchRelics()
    window.addEventListener('resize', this.resizeCharts)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
    Object.values(this.charts).forEach(chart => chart.dispose())
  },
  methods: {
    emptyForm() {
      return { title: '', categoryId: 1, content: '', imageUrl: '', period: '', location: '', publishDate: '' }
    },
    switchPanel(panel) {
      this.currentPanel = panel
      this.$nextTick(() => {
        if (panel === 'overview') this.renderCharts()
      })
    },
    initChart(refName) {
      if (this.charts[refName]) {
        this.charts[refName].dispose()
        delete this.charts[refName]
      }
      if (!this.$refs[refName]) return null
      this.charts[refName] = echarts.init(this.$refs[refName])
      return this.charts[refName]
    },
    renderCharts() {
      if (this.$refs.categoryChart) this.renderCategoryBar()
      if (this.$refs.pieChart) this.renderPie()
      if (this.$refs.timelineChart) this.renderTimeline()
      if (this.$refs.periodChart) this.renderPeriod()
      if (this.$refs.locationChart) this.renderLocation()
    },
    renderCategoryBar() {
      const chart = this.initChart('categoryChart')
      if (!chart) return
      chart.setOption({
        color: ['#8B1A1A'],
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: 48, right: 20, top: 28, bottom: 48 },
        xAxis: { type: 'category', data: this.categorySeries.map(i => i.name), axisLabel: { interval: 0, rotate: 28 } },
        yAxis: { type: 'value', minInterval: 1 },
        series: [{ type: 'bar', data: this.categorySeries.map(i => i.value), barWidth: 28, itemStyle: { borderRadius: [8, 8, 0, 0] } }]
      })
    },
    renderPie() {
      const chart = this.initChart('pieChart')
      if (!chart) return
      chart.setOption({
        color: ['#8B1A1A', '#C9A86A', '#6B1212', '#D4B87A', '#2C1810', '#A52A2A', '#8C7A6B'],
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: 0, textStyle: { fontSize: 11 } },
        series: [{
          name: '文物数量',
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['50%', '43%'],
          itemStyle: { borderColor: '#f5f0e8', borderWidth: 3 },
          data: this.categorySeries,
          label: { show: false }
        }]
      })
    },
    renderTimeline() {
      const chart = this.initChart('timelineChart')
      if (!chart) return
      chart.setOption({
        color: ['#C9A86A'],
        tooltip: { trigger: 'axis' },
        grid: { left: 48, right: 20, top: 28, bottom: 48 },
        xAxis: { type: 'category', data: this.monthSeries.map(i => i.name), axisLabel: { rotate: 30 } },
        yAxis: { type: 'value', minInterval: 1 },
        series: [{ type: 'line', smooth: true, areaStyle: { opacity: 0.16 }, data: this.monthSeries.map(i => i.value) }]
      })
    },
    renderPeriod() {
      const chart = this.initChart('periodChart')
      if (!chart) return
      chart.setOption({
        color: ['#6B1212'],
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: 88, right: 20, top: 22, bottom: 26 },
        xAxis: { type: 'value', minInterval: 1 },
        yAxis: {
          type: 'category',
          data: this.periodSeries.map(i => i.name).reverse(),
          axisLabel: { fontSize: 11 }
        },
        series: [{ type: 'bar', data: this.periodSeries.map(i => i.value).reverse(), barWidth: 14 }]
      })
    },
    renderLocation() {
      const chart = this.initChart('locationChart')
      if (!chart) return
      chart.setOption({
        color: ['#2C1810'],
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}: {c} 件' },
        grid: { left: 88, right: 20, top: 22, bottom: 26 },
        xAxis: { type: 'value', minInterval: 1 },
        yAxis: {
          type: 'category',
          data: this.locationSeries.map(i => i.name).reverse(),
          axisLabel: { fontSize: 11 }
        },
        series: [{ type: 'bar', data: this.locationSeries.map(i => i.value).reverse(), barWidth: 14 }]
      })
    },
    resizeCharts() {
      Object.values(this.charts).forEach(chart => chart.resize())
    },
    topSeries(field, fallback, limit) {
      const stat = this.relics.reduce((result, item) => {
        const name = item[field] || fallback
        result[name] = (result[name] || 0) + 1
        return result
      }, {})
      return Object.keys(stat).map(name => ({ name, value: stat[name] })).sort((a, b) => b.value - a.value).slice(0, limit)
    },
    async fetchCategories() {
      try {
        const res = await getCategories()
        if (res.success && Array.isArray(res.data) && res.data.length) this.categories = res.data.map(item => ({ id: item.id, name: item.name }))
      } catch (error) {
        this.$message.warning('分类接口暂不可用，已使用默认分类')
      }
    },
    async fetchRelics() {
      this.loading = true
      try {
        const res = await getRelics()
        if (res.success) {
          this.relics = (res.data || []).map(this.normalizeRelic)
          this.apiStatus = '在线'
          this.statusText = '后端接口连接正常'
          this.$nextTick(this.renderCharts)
        }
      } catch (error) {
        this.apiStatus = '离线'
        this.statusText = '请确认 relics_serve 已启动'
        this.$message.error('获取文物数据失败')
      } finally {
        this.loading = false
      }
    },
    normalizeRelic(item) {
      return { id: item.id, title: item.title || '', categoryId: item.categoryId || item.type || 1, content: item.content || '', imageUrl: item.imageUrl || item.image || '', period: item.period || '', location: item.location || '', publishDate: item.publishDate || item.date || '' }
    },
    formPayload(source) {
      return {
        title: (source.title || '').trim(),
        categoryId: Number(source.categoryId || 1),
        content: source.content || '',
        imageUrl: source.imageUrl || '',
        period: source.period || '',
        location: source.location || '',
        publishDate: source.publishDate || ''
      }
    },
    categoryName(id) {
      const category = this.categories.find(item => item.id === id)
      return category ? category.name : '未分类'
    },
    async submitRelic() {
      if (!this.form.title.trim()) {
        this.$message.warning('请先填写文物标题')
        return
      }
      this.submitting = true
      try {
        const res = await createRelic(this.form)
        if (res.success) {
          this.$message.success('数据已提交入库')
          this.resetForm()
          this.fetchRelics()
        }
      } catch (error) {
        this.$message.error('提交失败，请检查后端服务')
      } finally {
        this.submitting = false
      }
    },
    handleSelectionChange(rows) {
      this.selectedRows = rows
    },
    async openEditDialog(row) {
      let relic = row
      if (row.content === undefined || row.imageUrl === undefined) {
        try {
          const res = await getRelicDetail(row.id)
          if (res.success) relic = res.data
        } catch (error) {
          this.$message.warning('未能读取完整详情，已使用列表数据')
        }
      }
      this.editForm = this.normalizeRelic(relic)
      this.editDialogVisible = true
    },
    async submitEditRelic() {
      if (!this.editForm.id) return
      if (!this.editForm.title.trim()) {
        this.$message.warning('请先填写文物标题')
        return
      }
      this.editSubmitting = true
      try {
        const res = await updateRelic(this.editForm.id, this.formPayload(this.editForm))
        if (res.success) {
          this.$message.success('数据已修改')
          this.editDialogVisible = false
          await this.fetchRelics()
        }
      } catch (error) {
        this.$message.error('修改失败，请检查后端服务')
      } finally {
        this.editSubmitting = false
      }
    },
    async uploadEditImage(option) {
      this.editImageUploading = true
      try {
        const res = await uploadImage(option.file)
        if (res.success) {
          this.editForm.imageUrl = res.data
          this.$message.success('图片已上传')
        } else {
          this.$message.error(res.message || '上传失败')
        }
      } catch (error) {
        this.$message.error('图片上传失败')
      } finally {
        this.editImageUploading = false
      }
    },
    async deleteSingleRelic(row) {
      try {
        await this.$confirm(`确定删除“${row.title}”吗？`, '删除确认', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.submitting = true
        const res = await deleteRelic(row.id)
        if (res.success) {
          this.$message.success('数据已删除')
          await this.fetchRelics()
        }
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') this.$message.error('删除失败')
      } finally {
        this.submitting = false
      }
    },
    async deleteSelectedRelics() {
      const ids = this.selectedRows.map(item => item.id)
      if (!ids.length) return
      try {
        await this.$confirm(`确定删除已选的 ${ids.length} 条数据吗？`, '批量删除确认', {
          confirmButtonText: '批量删除',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.submitting = true
        const res = await batchDeleteRelics(ids)
        if (res.success) {
          this.$message.success('已批量删除')
          this.selectedRows = []
          if (this.$refs.recordsTable) this.$refs.recordsTable.clearSelection()
          await this.fetchRelics()
        }
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') this.$message.error('批量删除失败')
      } finally {
        this.submitting = false
      }
    },
    handleFileUpload(file) {
      const reader = new FileReader()
      reader.onload = async event => {
        try {
          const records = this.parseUploadContent(file.name, event.target.result)
          await this.uploadRecords(records)
        } catch (error) {
          this.$message.error(error.message || '文件解析失败')
        }
      }
      reader.readAsText(file, 'utf-8')
      return false
    },
    parseUploadContent(fileName, content) {
      if (fileName.toLowerCase().endsWith('.json')) {
        const parsed = JSON.parse(content)
        return Array.isArray(parsed) ? parsed : [parsed]
      }
      if (fileName.toLowerCase().endsWith('.csv')) {
        const rows = content.split(/\r?\n/).filter(Boolean)
        const headers = rows.shift().split(',').map(item => item.trim())
        return rows.map(row => {
          const values = row.split(',').map(item => item.trim())
          return headers.reduce((record, header, index) => { record[header] = values[index]; return record }, {})
        })
      }
      throw new Error('仅支持 JSON 或 CSV 文件')
    },
    async uploadRecords(records) {
      if (!records.length) {
        this.$message.warning('文件中没有可上传的数据')
        return
      }
      this.submitting = true
      try {
        for (const record of records) await createRelic({ title: record.title, categoryId: Number(record.categoryId || record.type || 1), content: record.content || '', imageUrl: record.imageUrl || record.image || '', period: record.period || '', location: record.location || '', publishDate: record.publishDate || record.date || '' })
        this.$message.success('成功上传 ' + records.length + ' 条数据')
        this.fetchRelics()
      } finally {
        this.submitting = false
      }
    },
    handleImageSelect(event) {
      this.selectedFile = event.target.files[0]
      this.uploadError = ''
    },
    async triggerImageUpload() {
      if (!this.selectedFile) return
      this.uploading = true
      this.uploadError = ''

      try {
        const res = await uploadImage(this.selectedFile)
        if (res.success) {
          this.form.imageUrl = res.data
          this.selectedFile = null
          this.$refs.fileInput.value = ''
        } else {
          this.uploadError = res.message || '上传失败'
        }
      } catch (err) {
        this.uploadError = err.message || '网络错误，请重试'
      } finally {
        this.uploading = false
      }
    },
    resetForm() {
      this.form = this.emptyForm()
    },
    resetEditForm() {
      this.editForm = this.emptyForm()
      this.editSubmitting = false
      this.editImageUploading = false
    },
    logout() {
      clearAdminSession()
      this.$router.replace('/admin/login')
    }
  }
}
</script>


<style scoped>
.image-upload-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.upload-btn, .upload-upload-btn { height: 34px; padding: 0 16px; border: 1px solid var(--color-border); background: rgba(255,255,255,0.58); color: var(--color-text); cursor: pointer; transition: all 0.2s ease; font-size: 13px; }
.upload-btn:hover, .upload-upload-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.upload-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.file-name { font-size: 13px; color: var(--color-text-secondary); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.upload-error { color: #e74c3c; font-size: 13px; margin: 6px 0 0; }
.image-preview { max-width: 200px; max-height: 150px; display: block; margin: 8px 0; border: 1px solid #ddd; border-radius: 4px; }
.url-fallback { margin-top: 4px; }

.admin-dashboard { min-height: 100vh; display: grid; grid-template-columns: 260px 1fr; background: linear-gradient(135deg, rgba(139, 26, 26, 0.08), transparent 38%), var(--color-bg); }
.admin-sidebar { position: sticky; top: 0; height: 100vh; padding: 30px 24px; background: #1a0a0a; color: #f0e8d8; display: flex; flex-direction: column; }
.sidebar-brand { display: flex; gap: 14px; align-items: center; padding-bottom: 28px; border-bottom: 1px solid rgba(201, 168, 106, 0.24); }
.brand-mark { width: 48px; height: 48px; display: grid; place-items: center; border: 1px solid var(--color-accent); color: var(--color-accent); font-family: var(--font-heading); font-size: 24px; }
.sidebar-brand strong, .sidebar-brand span { display: block; }
.sidebar-brand strong { font-family: var(--font-heading); font-size: 18px; }
.sidebar-brand span { margin-top: 4px; color: rgba(240, 232, 216, 0.52); font-size: 12px; }
.admin-menu { margin-top: 34px; display: grid; gap: 12px; }
.admin-menu button, .logout-button, .front-button { cursor: pointer; transition: all 0.25s ease; }
.admin-menu button { padding: 13px 14px; color: rgba(240, 232, 216, 0.68); background: transparent; border: 0; border-left: 2px solid transparent; text-align: left; font-size: 15px; }
.admin-menu button:hover, .admin-menu button.active { color: var(--color-accent); background: rgba(201, 168, 106, 0.08); border-left-color: var(--color-accent); }
.logout-button { margin-top: auto; height: 42px; border: 1px solid rgba(201, 168, 106, 0.42); background: transparent; color: var(--color-accent); }
.admin-main { padding: 34px; min-width: 0; }
.admin-topbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 26px; gap: 18px; }
.topbar-actions { display: flex; gap: 12px; }
.topbar-kicker, .panel-heading span { color: var(--color-primary); font-size: 12px; font-weight: 700; letter-spacing: 3px; }
.admin-topbar h1, .panel-heading h2 { margin: 8px 0 0; font-family: var(--font-heading); color: var(--color-text); }
.admin-topbar h1 { font-size: 34px; }
.front-button { border: 1px solid var(--color-border); background: rgba(255, 255, 255, 0.58); color: var(--color-text); padding: 10px 18px; }
.front-button:hover { border-color: var(--color-primary); color: var(--color-primary); }
.metric-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; margin-bottom: 22px; }
.metric-card, .panel { background: rgba(255, 255, 255, 0.84); border: 1px solid rgba(224, 213, 193, 0.78); box-shadow: 0 18px 38px rgba(44, 24, 16, 0.07); }
.metric-card { position: relative; overflow: hidden; padding: 24px; }
.metric-card::after { content: ''; position: absolute; right: -28px; top: -28px; width: 92px; height: 92px; border-radius: 50%; background: rgba(139, 26, 26, 0.08); }
.metric-card span, .metric-card small { display: block; color: var(--color-text-secondary); }
.metric-card strong { display: block; margin: 12px 0 6px; color: var(--color-primary); font-family: var(--font-heading); font-size: 34px; }
.metric-card.warm strong { color: #b18432; }
.metric-card.deep strong, .metric-card.pulse strong { font-size: 24px; }
.metric-card.pulse strong { color: #1f7a4d; }
.chart-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; }
.panel { padding: 24px; }
.panel.large { grid-column: span 2; }
.panel-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 18px; margin-bottom: 20px; }
.chart-box { height: 330px; }
.chart-box.tall { height: 380px; }
.upload-page { max-width: 1120px; }
.upload-box { margin-bottom: 22px; }
.full-width, .search-input { width: 100%; }
.submit-button { width: 100%; height: 46px; border: 0; background: var(--color-primary); color: #fff7e8; font-family: var(--font-heading); letter-spacing: 3px; cursor: pointer; }
.submit-button:disabled { opacity: 0.64; cursor: not-allowed; }
.records-panel .records-heading { align-items: center; }
.records-tools { display: flex; align-items: center; gap: 12px; }
.search-input { max-width: 320px; }
.danger-link { color: #a11818; }
.danger-link:hover { color: #c23a3a; }
.edit-relic-dialog .el-dialog__body { padding-top: 8px; }
.edit-form { max-height: 62vh; overflow-y: auto; padding-right: 4px; }
.quill-editor-custom .ql-editor { min-height: 180px; font-size: 15px; line-height: 1.8; }
.quill-editor-custom .ql-toolbar { border-color: var(--color-border); }
.quill-editor-custom .ql-container { border-color: var(--color-border); }
@media (max-width: 1180px) { .admin-dashboard { grid-template-columns: 1fr; } .admin-sidebar { position: static; height: auto; } .metric-grid, .chart-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 760px) { .admin-main { padding: 22px; } .admin-topbar, .panel-heading, .topbar-actions, .records-tools { flex-direction: column; align-items: stretch; } .metric-grid, .chart-grid { grid-template-columns: 1fr; } .panel.large { grid-column: span 1; } }
</style>
