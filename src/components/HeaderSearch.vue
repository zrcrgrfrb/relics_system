<template>
  <div class="header-tools">
    <form class="header-search" @submit.prevent="confirmSearch">
      <input
        v-model.trim="draftKeyword"
        class="header-search-input"
        type="search"
        placeholder="搜索标题/时间"
        aria-label="搜索标题或时间"
        @input="handleInput"
      />
      <button class="header-search-button" type="submit" title="搜索" aria-label="搜索">
        <i class="el-icon-search"></i>
      </button>
    </form>

    <button class="image-search-trigger" type="button" @click="openImageSearch">
      <span>图像检索</span>
    </button>

    <el-dialog
      title="图像检索"
      :visible.sync="imageDialogVisible"
      width="420px"
      custom-class="image-search-dialog"
      append-to-body
    >
      <div class="image-search-panel">
        <label class="image-drop" for="image-search-file">
          <input
            id="image-search-file"
            ref="imageFile"
            class="image-input"
            type="file"
            accept="image/*"
            @change="handleImageChange"
          />
          <img v-if="imagePreview" class="image-preview" :src="imagePreview" alt="待检索图片" />
          <span v-else class="image-placeholder">
            <i class="el-icon-upload"></i>
            <span>上传一张文物图片</span>
          </span>
        </label>
        <p class="image-tip">系统会提取颜色、纹理和感知哈希特征，返回最相似的 10 件文物。</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <button class="dialog-btn ghost" type="button" @click="imageDialogVisible = false">取消</button>
        <button class="dialog-btn primary" type="button" :disabled="!imageFile || imageSearching" @click="confirmImageSearch">
          {{ imageSearching ? '检索中...' : '开始检索' }}
        </button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { imageSearchRelics } from '@/api/relics'

export default {
  name: 'HeaderSearch',
  data() {
    return {
      draftKeyword: this.$route.query.keyword || '',
      keyword: this.$route.query.keyword || '',
      debounceTimer: null,
      imageDialogVisible: false,
      imageFile: null,
      imagePreview: '',
      imageSearching: false
    }
  },
  watch: {
    '$route.query.keyword'(value) {
      const nextValue = value || ''
      this.draftKeyword = nextValue
      this.keyword = nextValue
    }
  },
  beforeDestroy() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    this.revokePreview()
  },
  methods: {
    handleInput() {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }
      this.debounceTimer = setTimeout(() => {
        this.keyword = this.draftKeyword
      }, 300)
    },
    confirmSearch() {
      const keyword = (this.draftKeyword || this.keyword || '').trim()
      if (!keyword) {
        return
      }
      this.$router.push({
        name: 'MoreRelics',
        params: { type: 'search' },
        query: { keyword }
      })
    },
    openImageSearch() {
      this.imageDialogVisible = true
    },
    handleImageChange(event) {
      const file = event.target.files && event.target.files[0]
      this.revokePreview()
      this.imageFile = file || null
      if (file) {
        this.imagePreview = URL.createObjectURL(file)
      }
    },
    async confirmImageSearch() {
      if (!this.imageFile) {
        return
      }
      this.imageSearching = true
      try {
        const res = await imageSearchRelics(this.imageFile, 10)
        if (!res.success) {
          this.$message.error(res.message || '图片检索失败')
          return
        }
        sessionStorage.setItem('imageSearchResults', JSON.stringify(res.data || { list: [] }))
        this.imageDialogVisible = false
        this.$router.push({
          name: 'MoreRelics',
          params: { type: 'image-search' }
        })
      } catch (error) {
        console.error('Image search failed:', error)
        this.$message.error('图片检索失败，请稍后重试')
      } finally {
        this.imageSearching = false
      }
    },
    revokePreview() {
      if (this.imagePreview) {
        URL.revokeObjectURL(this.imagePreview)
      }
      this.imagePreview = ''
    }
  }
}
</script>

<style scoped>
.header-tools {
  align-items: center;
  display: flex;
  gap: 10px;
  max-width: calc(100% - 32px);
  position: absolute;
  right: 24px;
  top: 22px;
  z-index: 5;
}

.header-search {
  align-items: center;
  background: rgba(240, 232, 216, 0.08);
  border: 1px solid rgba(201, 168, 106, 0.34);
  display: flex;
  height: 36px;
  transition: border-color 0.2s ease, background 0.2s ease;
  width: 230px;
}

.header-search:focus-within {
  background: rgba(240, 232, 216, 0.12);
  border-color: rgba(201, 168, 106, 0.7);
}

.header-search-input {
  background: transparent;
  border: 0;
  color: #f0e8d8;
  flex: 1;
  font-family: var(--font-body);
  font-size: 13px;
  height: 100%;
  min-width: 0;
  outline: none;
  padding: 0 10px 0 12px;
}

.header-search-input::placeholder {
  color: rgba(240, 232, 216, 0.45);
}

.header-search-button {
  align-items: center;
  background: rgba(201, 168, 106, 0.16);
  border: 0;
  border-left: 1px solid rgba(201, 168, 106, 0.26);
  color: var(--color-accent);
  cursor: pointer;
  display: inline-flex;
  font-size: 15px;
  height: 100%;
  justify-content: center;
  transition: background 0.2s ease, color 0.2s ease;
  width: 38px;
}

.header-search-button:hover {
  background: rgba(201, 168, 106, 0.28);
  color: #f0e8d8;
}

.image-search-trigger {
  align-items: center;
  background: rgba(201, 168, 106, 0.18);
  border: 1px solid rgba(201, 168, 106, 0.42);
  color: #f0e8d8;
  cursor: pointer;
  display: inline-flex;
  font-family: var(--font-body);
  font-size: 13px;
  gap: 6px;
  height: 36px;
  letter-spacing: 1px;
  padding: 0 13px;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
}

.image-search-trigger:hover {
  background: rgba(201, 168, 106, 0.3);
  border-color: rgba(201, 168, 106, 0.75);
  transform: translateY(-1px);
}

.image-search-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-drop {
  align-items: center;
  background: #f8f3ea;
  border: 1px dashed rgba(139, 26, 26, 0.32);
  cursor: pointer;
  display: flex;
  height: 220px;
  justify-content: center;
  overflow: hidden;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.image-drop:hover {
  background: #fbf7ef;
  border-color: rgba(139, 26, 26, 0.62);
}

.image-input {
  display: none;
}

.image-preview {
  height: 100%;
  object-fit: contain;
  width: 100%;
}

.image-placeholder {
  align-items: center;
  color: var(--color-text-secondary);
  display: flex;
  flex-direction: column;
  font-family: var(--font-body);
  font-size: 14px;
  gap: 10px;
}

.image-placeholder i {
  color: var(--color-primary);
  font-size: 32px;
}

.image-tip {
  color: var(--color-text-muted);
  font-family: var(--font-body);
  font-size: 12px;
  line-height: 1.7;
  margin: 0;
}

.dialog-footer {
  display: inline-flex;
  gap: 10px;
}

.dialog-btn {
  border: 1px solid var(--color-border);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 13px;
  height: 34px;
  padding: 0 18px;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.dialog-btn.ghost {
  background: transparent;
  color: var(--color-text-secondary);
}

.dialog-btn.primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #f0e8d8;
}

.dialog-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 760px) {
  .header-tools {
    align-items: stretch;
    flex-direction: column;
    margin: 18px auto 0;
    position: static;
    width: min(320px, calc(100% - 48px));
  }

  .header-search,
  .image-search-trigger {
    width: 100%;
  }

  .image-search-trigger {
    justify-content: center;
  }
}
</style>
