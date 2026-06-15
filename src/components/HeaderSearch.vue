<template>
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
</template>

<script>
export default {
  name: 'HeaderSearch',
  data() {
    return {
      draftKeyword: this.$route.query.keyword || '',
      keyword: this.$route.query.keyword || '',
      debounceTimer: null
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
    }
  }
}
</script>

<style scoped>
.header-search {
  align-items: center;
  background: rgba(240, 232, 216, 0.08);
  border: 1px solid rgba(201, 168, 106, 0.34);
  display: flex;
  height: 36px;
  max-width: calc(100% - 32px);
  position: absolute;
  right: 24px;
  top: 22px;
  transition: border-color 0.2s ease, background 0.2s ease;
  width: 230px;
  z-index: 5;
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

@media (max-width: 760px) {
  .header-search {
    margin: 18px auto 0;
    position: static;
    width: min(320px, calc(100% - 48px));
  }
}
</style>
