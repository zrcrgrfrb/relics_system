<template>
 <button class="admin-login-entry" type="button" @click="goToAdminLogin">
    登录管理员
 </button>
</template>

<script>
export default {
  name: 'AdminLoginEntry',
  methods: {
    goToAdminLogin() {
      this.$router.push('/admin/login')
    }
  }
}
</script>

<style scoped>
.admin-login-entry {
  margin-top: 18px;
  padding: 10px 24px;
  border: 1px solid rgba(201, 168, 106, 0.7);
  background: linear-gradient(135deg, rgba(201, 168, 106, 0.14), rgba(139, 26, 26, 0.12));
  color: var(--color-accent);
  font-family: var(--font-heading);
  font-size: 14px;
  letter-spacing: 3px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.admin-login-entry:hover {
  transform: translateY(-2px);
  background: rgba(201, 168, 106, 0.2);
  color: #f0e8d8;
}
</style>
