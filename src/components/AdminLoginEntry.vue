<template>
  <button v-if="shouldShowEntry" class="admin-login-entry" type="button" @click="goToAdmin">
    {{ entryText }}
  </button>
</template>

<script>
import { clearAdminSession, isValidAdminToken } from '@/utils/auth'

export default {
  name: 'AdminLoginEntry',
  data() {
    return {
      hasAdminToken: false
    }
  },
  computed: {
    shouldShowEntry() {
      return !this.$route.path.startsWith('/admin')
    },
    entryText() {
      return this.hasAdminToken ? '进入后台' : '管理员登录'
    }
  },
  mounted() {
    this.refreshTokenState()
  },
  watch: {
    '$route.path'() {
      this.refreshTokenState()
    }
  },
  methods: {
    refreshTokenState() {
      this.hasAdminToken = isValidAdminToken()
    },
    goToAdmin() {
      this.refreshTokenState()
      const targetPath = this.hasAdminToken ? '/admin' : '/admin/login'
      if (!this.hasAdminToken) {
        clearAdminSession()
      }
      if (this.$route.path !== targetPath) {
        this.$router.push(targetPath)
      }
    }
  }
}
</script>

<style scoped>
.admin-login-entry {
  padding: 0;
  border: 0;
  background: transparent;
  color: rgba(240, 232, 216, 0.6);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 300;
  letter-spacing: 1px;
  line-height: 1.6;
  text-align: right;
  cursor: pointer;
  transition: color 0.3s;
}

.admin-login-entry:hover {
  color: var(--color-accent);
}
</style>
