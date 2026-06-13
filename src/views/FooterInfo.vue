<template>
  <div class="info-page">
    <header class="info-hero">
      <div class="container info-hero-inner">
        <span class="info-kicker">{{ page.kicker }}</span>
        <h1>{{ page.title }}</h1>
        <p>{{ page.summary }}</p>
      </div>
      <div class="header-accent"></div>
    </header>

    <main class="container info-main">
      <section class="info-layout">
        <aside class="info-index">
          <span>栏目导航</span>
          <button
            v-for="item in navItems"
            :key="item.path"
            type="button"
            :class="{ active: $route.path === item.path }"
            @click="$router.push(item.path)"
          >
            {{ item.label }}
          </button>
        </aside>

        <article class="info-panel">
          <div class="panel-heading">
            <span>{{ page.enTitle }}</span>
            <h2>{{ page.heading }}</h2>
          </div>

          <div class="content-block" v-for="section in page.sections" :key="section.title">
            <h3>{{ section.title }}</h3>
            <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
          </div>

          <div v-if="page.cards" class="info-cards">
            <div v-for="card in page.cards" :key="card.title" class="info-card">
              <strong>{{ card.title }}</strong>
              <p>{{ card.text }}</p>
            </div>
          </div>

          <div class="info-actions">
            <button type="button" @click="$router.push('/')">返回首页</button>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script>
const pages = {
  about: {
    kicker: 'ABOUT ARCHIVE',
    title: '关于我们',
    summary: '这里用于介绍平台建设背景、服务对象和数字化保护方向，后续可替换为正式单位介绍。',
    enTitle: 'Platform Profile',
    heading: '红色文物数字化保护与展示平台',
    sections: [
      {
        title: '平台定位',
        paragraphs: [
          '本平台面向红色文物资料的整理、展示、检索与后台管理，围绕图文资料、馆藏信息、分类目录和发布流程建立统一的数据入口。',
          '平台当前内容以演示数据为主，后续可接入真实馆藏、研究成果、专题展陈和学习资源。'
        ]
      },
      {
        title: '建设目标',
        paragraphs: [
          '通过数字化方式提升红色文物资料的可见度、可维护性和传播效率，为教学展示、资料归档和公众浏览提供稳定支撑。',
          '系统坚持内容准确、来源可溯、管理可控的原则，逐步完善数据审核、权限管理和安全防护能力。'
        ]
      }
    ],
    cards: [
      { title: '资料整理', text: '统一管理标题、分类、年代、地点、图片与说明文字。' },
      { title: '数字展示', text: '面向前台提供分类浏览、详情展示和分页检索能力。' },
      { title: '后台维护', text: '支持管理员录入、上传、更新和基础运行监控。' }
    ]
  },
  feedback: {
    kicker: 'FEEDBACK',
    title: '意见反馈',
    summary: '这里用于承接用户建议、内容纠错、功能问题和合作线索，后续可接入正式表单或工单系统。',
    enTitle: 'Feedback Channel',
    heading: '欢迎提出改进意见',
    sections: [
      {
        title: '反馈范围',
        paragraphs: [
          '如果你发现文物信息、图片展示、分类归属、页面文字或访问体验存在问题，可以通过本栏目提交反馈。',
          '平台也欢迎围绕资料补充、专题建设、教学应用和数字展陈提出建设性建议。'
        ]
      },
      {
        title: '处理说明',
        paragraphs: [
          '收到反馈后，管理员会根据问题类型进行核验、记录和处理。涉及内容真实性的问题，将优先进行来源复核。',
          '当前页面为静态占位内容，正式上线时建议接入后端反馈接口，并增加联系方式、验证码和提交频率限制。'
        ]
      }
    ],
    cards: [
      { title: '内容纠错', text: '标题、年代、地点、说明文字、图片不匹配等问题。' },
      { title: '功能建议', text: '检索、筛选、上传、后台管理等使用体验建议。' },
      { title: '合作联系', text: '资料共建、专题展示、课程资源和研究项目合作。' }
    ]
  },
  statement: {
    kicker: 'PLATFORM NOTICE',
    title: '平台声明',
    summary: '这里用于说明内容来源、版权边界、使用规则和免责声明，后续应替换为正式法律文本。',
    enTitle: 'Use Statement',
    heading: '平台内容与使用声明',
    sections: [
      {
        title: '内容说明',
        paragraphs: [
          '平台展示的文物资料、图片与文字用于学习、研究、展示和资料管理场景。正式上线前，应逐条确认内容来源、授权范围和署名要求。',
          '如页面中存在演示图片、示例文字或待核验资料，应在上线前完成替换或标注，避免与真实馆藏信息混淆。'
        ]
      },
      {
        title: '版权与责任',
        paragraphs: [
          '未经授权，任何单位或个人不得擅自复制、改编、传播平台中受版权保护的图片、文字和数据。',
          '如权利人认为平台内容涉及权益问题，可通过意见反馈或正式联系方式提交材料，平台将在核验后及时处理。'
        ]
      }
    ],
    cards: [
      { title: '合理使用', text: '支持学习研究和非商业展示，引用时请注明来源。' },
      { title: '信息核验', text: '重要史料和馆藏数据应以正式发布版本为准。' },
      { title: '安全使用', text: '禁止批量抓取、破坏服务或绕过后台权限控制。' }
    ]
  },
  team: {
    kicker: 'PROJECT TEAM',
    title: '制作团队',
    summary: '这里用于展示平台建设团队、职责分工和技术支持信息，后续可替换为真实人员与单位。',
    enTitle: 'Production Team',
    heading: '平台设计与研发支持',
    sections: [
      {
        title: '团队构成',
        paragraphs: [
          '平台由内容整理、视觉设计、前端开发、后端开发、数据维护和系统运维等角色共同完成。',
          '当前页面为临时展示内容，后续可补充指导单位、参与人员、联系方式、项目批次和鸣谢信息。'
        ]
      },
      {
        title: '职责分工',
        paragraphs: [
          '内容团队负责资料采集、文字校对和分类规范；技术团队负责系统架构、页面开发、接口安全和部署维护。',
          '平台将持续根据实际使用反馈优化功能，提升数据录入效率、访问稳定性和内容展示质量。'
        ]
      }
    ],
    cards: [
      { title: '内容组', text: '负责文物资料整理、分类审核和文字校对。' },
      { title: '设计组', text: '负责视觉风格、页面结构和展示体验。' },
      { title: '技术组', text: '负责前后端开发、接口安全、部署和运维。' }
    ]
  }
}

export default {
  name: 'FooterInfo',
  data() {
    return {
      navItems: [
        { label: '关于我们', path: '/about' },
        { label: '意见反馈', path: '/feedback' },
        { label: '平台声明', path: '/statement' },
        { label: '制作团队', path: '/team' }
      ]
    }
  },
  computed: {
    page() {
      return pages[this.$route.meta.pageKey] || pages.about
    }
  }
}
</script>

<style scoped>
.info-page {
  min-height: 100vh;
  background:
    linear-gradient(135deg, rgba(139, 26, 26, 0.06), transparent 38%),
    var(--color-bg);
}

.info-hero {
  background: var(--color-footer-bg);
  color: #f0e8d8;
}

.info-hero-inner {
  padding-top: 58px;
  padding-bottom: 54px;
}

.info-kicker {
  color: var(--color-accent);
  font-size: 12px;
  letter-spacing: 5px;
}

.info-hero h1 {
  margin: 16px 0 12px;
  font-family: var(--font-heading);
  font-size: 42px;
  letter-spacing: 6px;
}

.info-hero p {
  max-width: 760px;
  color: rgba(240, 232, 216, 0.72);
  font-size: 15px;
  line-height: 1.9;
}

.header-accent {
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
  opacity: 0.5;
}

.info-main {
  padding-top: 42px;
  padding-bottom: 54px;
}

.info-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}

.info-index {
  position: sticky;
  top: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.info-index span {
  display: block;
  margin-bottom: 14px;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 3px;
}

.info-index button {
  width: 100%;
  display: block;
  padding: 12px 10px;
  border: 0;
  border-left: 2px solid transparent;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  text-align: left;
  font-size: 14px;
  transition: all 0.2s ease;
}

.info-index button:hover,
.info-index button.active {
  color: var(--color-primary);
  border-left-color: var(--color-primary);
  background: rgba(139, 26, 26, 0.04);
}

.info-panel {
  padding: 34px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
}

.panel-heading {
  padding-bottom: 22px;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--color-border);
}

.panel-heading span {
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.panel-heading h2 {
  margin-top: 8px;
  font-family: var(--font-heading);
  font-size: 28px;
  color: var(--color-text);
}

.content-block {
  margin-bottom: 28px;
}

.content-block h3 {
  margin-bottom: 12px;
  font-family: var(--font-heading);
  font-size: 20px;
  color: var(--color-text);
}

.content-block p {
  margin-bottom: 10px;
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 1.9;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 34px;
}

.info-card {
  padding: 20px;
  background: var(--color-bg);
  border: 1px solid var(--color-border-light);
}

.info-card strong {
  display: block;
  margin-bottom: 8px;
  font-family: var(--font-heading);
  color: var(--color-primary);
  font-size: 17px;
}

.info-card p {
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.8;
}

.info-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
}

.info-actions button {
  height: 42px;
  padding: 0 24px;
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: #fff7e8;
  cursor: pointer;
  font-family: var(--font-heading);
  letter-spacing: 2px;
  transition: all 0.2s ease;
}

.info-actions button:hover {
  background: var(--color-primary-dark);
}

@media (max-width: 900px) {
  .info-layout {
    grid-template-columns: 1fr;
  }

  .info-index {
    position: static;
  }

  .info-cards {
    grid-template-columns: 1fr;
  }

  .info-hero h1 {
    font-size: 34px;
  }
}
</style>
