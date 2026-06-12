<template>
  <div id="app">
    <router-view />
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
export default {
  name: 'App'
}
</script>

<style>
:root {
  --color-primary: #8B1A1A;
  --color-primary-dark: #6B1212;
  --color-primary-light: #A52A2A;
  --color-accent: #C9A86A;
  --color-accent-light: #D4B87A;
  --color-bg: #F5F0E8;
  --color-bg-alt: #ECE6DA;
  --color-surface: #FFFFFF;
  --color-text: #2C1810;
  --color-text-secondary: #8C7A6B;
  --color-text-muted: #B0A090;
  --color-border: #E0D5C1;
  --color-border-light: #EDE5D5;
  --color-overlay-dark: rgba(26, 10, 10, 0.75);
  --color-footer-bg: #1A0A0A;
  --font-heading: "Noto Serif SC", "STSong", "SimSun", "Songti SC", serif;
  --font-body: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  --shadow-sm: 0 1px 3px rgba(44, 24, 16, 0.06);
  --shadow-md: 0 4px 12px rgba(44, 24, 16, 0.08);
  --shadow-lg: 0 8px 24px rgba(44, 24, 16, 0.1);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  font-weight: 400;
  color: var(--color-text);
  background: var(--color-bg);
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(201, 168, 106, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 50%, rgba(139, 26, 26, 0.02) 0%, transparent 50%);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
}

.el-carousel__button {
  background-color: var(--color-accent) !important;
  opacity: 0.5 !important;
  width: 40px !important;
  height: 3px !important;
  border-radius: 0 !important;
}

.el-carousel__indicator.is-active .el-carousel__button {
  opacity: 1 !important;
}

.el-carousel__arrow {
  background: rgba(26, 10, 10, 0.4) !important;
  color: #fff !important;
  font-size: 20px !important;
  border-radius: 0 !important;
  width: 44px !important;
  height: 60px !important;
}

.el-carousel__arrow:hover {
  background: rgba(139, 26, 26, 0.7) !important;
}

.el-table {
  font-family: var(--font-body) !important;
}

.el-table th.el-table__cell {
  font-family: var(--font-heading) !important;
  font-weight: 600 !important;
  color: var(--color-text) !important;
  background: var(--color-bg-alt) !important;
  border-bottom: 2px solid var(--color-primary) !important;
}

.el-pagination.is-background .el-pager li:not(.disabled).active {
  background-color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

.el-pagination.is-background .el-pager li:not(.disabled):hover {
  color: var(--color-primary) !important;
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
