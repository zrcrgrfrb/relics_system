<template>
  <div class="admin-login-page">
    <div class="ink-wash"></div>
    <main class="login-shell">
      <section class="login-brand">
        <span class="eyebrow">RELICS ARCHIVE</span>
        <h1>红色文物后台管理</h1>
        <p>用于馆藏数据上传、发布校验与系统运行监视。</p>
        <div class="brand-seal">管</div>
      </section>

      <section class="login-card">
        <div class="card-heading">
          <span>管理员入口</span>
          <strong>Sign in</strong>
        </div>
        <el-form :model="loginForm" :rules="rules" ref="loginForm" @submit.native.prevent="handleLogin">
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" prefix-icon="el-icon-user" placeholder="管理员账号" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" placeholder="管理员密码" show-password />
          </el-form-item>
          <el-alert
            v-if="loginError"
            :title="loginError"
            type="error"
            show-icon
            :closable="false"
            class="login-alert"
          />
          <button class="login-button" type="submit">登录管理员</button>
        </el-form>
        <p class="login-tip">演示账号：admin / admin123</p>
        <button class="back-home" type="button" @click="$router.push('/')">返回前台首页</button>
      </section>
    </main>
  </div>
</template>

<script>
import { adminLogin } from '@/api/relics'

export default {
  name: 'AdminLogin',
  data() {
    return {
      loginError: '',
      loginForm: {
        username: 'admin',
        password: ''
      },
      rules: {
        username: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入管理员密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(async valid => {
        if (!valid) return

        try {
          const res = await adminLogin(this.loginForm)
          localStorage.setItem('relic_admin_token', res.data.token)
          localStorage.setItem('relic_admin_user', res.data.username)
          this.$message.success('\u767b\u5f55\u6210\u529f\uff0c\u6b63\u5728\u8fdb\u5165\u540e\u53f0')
          this.$router.replace(this.$route.query.redirect || '/admin')
        } catch (error) {
          this.loginError = error.message || '\u8d26\u53f7\u6216\u5bc6\u7801\u9519\u8bef\uff0c\u8bf7\u68c0\u67e5\u540e\u91cd\u8bd5'
        }
      })
    }
  }
}
</script>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 16% 20%, rgba(201, 168, 106, 0.22), transparent 28%),
    radial-gradient(circle at 84% 74%, rgba(139, 26, 26, 0.26), transparent 30%),
    #170909;
  color: #f2e8d4;
}

.ink-wash {
  position: absolute;
  inset: 0;
  opacity: 0.28;
  background-image:
    linear-gradient(120deg, transparent 0 42%, rgba(201, 168, 106, 0.16) 42% 43%, transparent 43% 100%),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0 1px, transparent 1px 7px);
}

.login-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  width: min(1080px, calc(100% - 48px));
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 420px;
  align-items: center;
  gap: 64px;
}

.login-brand .eyebrow {
  color: var(--color-accent);
  font-size: 12px;
  letter-spacing: 5px;
}

.login-brand h1 {
  margin: 18px 0 16px;
  font-family: var(--font-heading);
  font-size: 56px;
  line-height: 1.08;
  letter-spacing: 4px;
}

.login-brand p {
  max-width: 520px;
  color: rgba(242, 232, 212, 0.72);
  font-size: 17px;
  line-height: 1.9;
}

.brand-seal {
  margin-top: 42px;
  width: 96px;
  height: 96px;
  display: grid;
  place-items: center;
  border: 2px solid var(--color-accent);
  color: var(--color-accent);
  font-family: var(--font-heading);
  font-size: 44px;
  transform: rotate(-8deg);
}

.login-card {
  padding: 36px;
  background: rgba(245, 240, 232, 0.94);
  border: 1px solid rgba(201, 168, 106, 0.42);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
  color: var(--color-text);
}

.card-heading {
  margin-bottom: 28px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 18px;
}

.card-heading span {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
}

.card-heading strong {
  color: var(--color-text-muted);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.login-alert {
  margin-bottom: 18px;
}

.login-button {
  width: 100%;
  height: 48px;
  border: 0;
  background: var(--color-primary);
  color: #fff7e8;
  font-family: var(--font-heading);
  font-size: 16px;
  letter-spacing: 4px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.login-button:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(107, 18, 18, 0.24);
}

.login-tip,
.back-home {
  margin-top: 18px;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.back-home {
  border: 0;
  background: transparent;
  cursor: pointer;
  text-decoration: underline;
}

@media (max-width: 900px) {
  .login-shell {
    grid-template-columns: 1fr;
    padding: 48px 0;
    gap: 32px;
  }

  .login-brand h1 {
    font-size: 40px;
  }
}
</style>
