<template>
  <div v-if="isLoggedIn" class="agent-shell" :class="{ open: drawerOpen }">
    <button
      class="agent-launcher"
      type="button"
      aria-label="打开苏区红数字文物大模型"
      title="苏区红数字文物大模型"
      @click="openDrawer"
    >
      <span class="launcher-icon" aria-hidden="true">
        <span class="launcher-mark">AI</span>
      </span>
      <span class="launcher-copy">
        <strong>苏区红</strong>
        <span>数字文物大模型</span>
      </span>
      <span class="launcher-arrow" aria-hidden="true">›</span>
    </button>

    <transition name="agent-fade">
      <div v-if="drawerOpen" class="agent-mask" @click="closeDrawer"></div>
    </transition>

    <aside class="agent-drawer" aria-label="苏区红数字文物大模型">
      <header class="agent-header">
        <div>
          <span class="agent-kicker">DIGITAL RELIC MODEL</span>
          <h2>"苏区红"数字文物大模型</h2>
        </div>
        <button class="icon-button" type="button" title="关闭" @click="closeDrawer">×</button>
      </header>

      <div ref="messageList" class="agent-messages">
        <article
          v-for="message in messages"
          :key="message.id"
          class="agent-message"
          :class="message.role"
        >
          <div class="message-role">{{ message.role === 'assistant' ? '"苏区红"数字文物大模型' : '我' }}</div>
          <div class="message-bubble" v-html="renderMarkdown(message.content)"></div>
        </article>
        <div v-if="streaming" class="typing-line">正在生成回复...</div>
      </div>

      <div class="agent-prompts">
        <button
          v-for="prompt in quickPrompts"
          :key="prompt"
          type="button"
          @click="usePrompt(prompt)"
        >
          {{ prompt }}
        </button>
      </div>

      <footer class="agent-composer">
        <textarea
          v-model="draft"
          rows="3"
          placeholder="向“苏区红”数字文物大模型提问..."
          @keydown.enter.exact.prevent="sendMessage"
        ></textarea>
        <div class="composer-actions">
          <span class="composer-hint">Shift + Enter 换行</span>
          <button v-if="streaming" class="stop-button" type="button" @click="stopStream">停止</button>
          <button v-else class="send-button" type="button" :disabled="!draft.trim()" @click="sendMessage">发送</button>
        </div>
      </footer>
    </aside>
  </div>
</template>

<script>
import { streamAgentChat } from '@/api/agent'
import { clearAdminSession, isValidAdminToken } from '@/utils/auth'

const WELCOME_MESSAGE = '您好，我是“苏区红”数字文物大模型。可以帮您理解红色文物、整理展陈说明、润色文物描述、辅助分类与录入。有什么问题可以直接问我。'

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderInlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

function closeOpenList(output, listType) {
  if (!listType) return null
  output.push(`</${listType}>`)
  return null
}

export default {
  name: 'AgentSidebar',
  data() {
    return {
      isLoggedIn: false,
      drawerOpen: false,
      streaming: false,
      draft: '',
      controller: null,
      messages: [
        { id: 1, role: 'assistant', content: WELCOME_MESSAGE }
      ],
      quickPrompts: [
        '帮我润色一段文物说明',
        '如何给这件文物分类？',
        '生成一段展陈讲解词',
        '你是什么模型？'
      ]
    }
  },
  watch: {
    $route() {
      this.refreshLoginState()
    }
  },
  mounted() {
    this.refreshLoginState()
    window.addEventListener('storage', this.refreshLoginState)
    window.addEventListener('focus', this.refreshLoginState)
  },
  beforeDestroy() {
    this.stopStream()
    window.removeEventListener('storage', this.refreshLoginState)
    window.removeEventListener('focus', this.refreshLoginState)
  },
  methods: {
    refreshLoginState() {
      const valid = isValidAdminToken()
      this.isLoggedIn = valid
      if (!valid) {
        this.drawerOpen = false
        this.stopStream()
      }
    },
    openDrawer() {
      this.refreshLoginState()
      if (this.isLoggedIn) {
        this.drawerOpen = true
        this.$nextTick(this.scrollToBottom)
      }
    },
    closeDrawer() {
      this.drawerOpen = false
    },
    usePrompt(prompt) {
      this.draft = prompt
      this.$nextTick(() => {
        const textarea = this.$el.querySelector('textarea')
        if (textarea) textarea.focus()
      })
    },
    renderMarkdown(content) {
      const lines = String(content || '').replace(/\r\n/g, '\n').split('\n')
      const output = []
      let paragraph = []
      let listType = null

      const flushParagraph = () => {
        if (!paragraph.length) return
        output.push(`<p>${paragraph.map(renderInlineMarkdown).join('<br>')}</p>`)
        paragraph = []
      }

      lines.forEach(line => {
        const trimmed = line.trim()

        if (!trimmed) {
          flushParagraph()
          listType = closeOpenList(output, listType)
          return
        }

        const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/)
        if (headingMatch) {
          flushParagraph()
          listType = closeOpenList(output, listType)
          const level = headingMatch[1].length + 2
          output.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`)
          return
        }

        const unorderedMatch = line.match(/^\s*[-*+]\s+(.+)$/)
        if (unorderedMatch) {
          flushParagraph()
          if (listType !== 'ul') {
            listType = closeOpenList(output, listType)
            output.push('<ul>')
            listType = 'ul'
          }
          output.push(`<li>${renderInlineMarkdown(unorderedMatch[1])}</li>`)
          return
        }

        const orderedMatch = line.match(/^\s*\d+[.)]\s+(.+)$/)
        if (orderedMatch) {
          flushParagraph()
          if (listType !== 'ol') {
            listType = closeOpenList(output, listType)
            output.push('<ol>')
            listType = 'ol'
          }
          output.push(`<li>${renderInlineMarkdown(orderedMatch[1])}</li>`)
          return
        }

        listType = closeOpenList(output, listType)
        paragraph.push(line)
      })

      flushParagraph()
      closeOpenList(output, listType)
      return output.join('')
    },
    async sendMessage() {
      const content = this.draft.trim()
      if (!content || this.streaming) return

      const userMessage = { id: Date.now(), role: 'user', content }
      const assistantMessage = { id: Date.now() + 1, role: 'assistant', content: '' }
      this.messages.push(userMessage, assistantMessage)
      this.draft = ''
      this.streaming = true
      this.controller = new AbortController()
      this.$nextTick(this.scrollToBottom)

      try {
        await streamAgentChat({
          messages: this.messages
            .filter(item => item.content.trim())
            .map(item => ({ role: item.role, content: item.content })),
          context: {
            route: this.$route.path,
            pageTitle: document.title || '',
            currentPanel: this.$route.path === '/admin' ? 'admin' : 'front'
          },
          signal: this.controller.signal,
          onDelta: delta => {
            assistantMessage.content += delta
            this.$nextTick(this.scrollToBottom)
          },
          onError: message => {
            assistantMessage.content = message || '智能体暂时无法回复，请稍后重试。'
          }
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          assistantMessage.content = error.message || '智能体暂时无法回复，请稍后重试。'
          if (assistantMessage.content.includes('登录状态')) {
            clearAdminSession()
            this.refreshLoginState()
          }
        }
      } finally {
        this.streaming = false
        this.controller = null
        if (!assistantMessage.content.trim()) {
          assistantMessage.content = '已停止生成。'
        }
      }
    },
    stopStream() {
      if (this.controller) {
        this.controller.abort()
        this.controller = null
      }
      this.streaming = false
    },
    scrollToBottom() {
      const list = this.$refs.messageList
      if (list) list.scrollTop = list.scrollHeight
    }
  }
}
</script>

<style scoped>
.agent-shell {
  position: relative;
  z-index: 1600;
}

.agent-launcher {
  position: fixed;
  right: 0;
  top: 50%;
  width: 58px;
  height: 58px;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  overflow: hidden;
  padding: 0 14px 0 10px;
  border: 1px solid rgba(201, 168, 106, 0.5);
  border-right: 0;
  border-radius: 8px 0 0 8px;
  background: rgba(26, 10, 10, 0.92);
  color: #fff7e6;
  box-shadow: 0 18px 40px rgba(26, 10, 10, 0.22), inset 0 1px 0 rgba(255, 247, 230, 0.08);
  cursor: pointer;
  transform: translateY(-50%);
  transition: width 0.28s ease, background 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease;
}

.agent-launcher:hover,
.agent-launcher:focus-visible {
  width: min(248px, calc(100vw - 18px));
  background: #1a0a0a;
  box-shadow: 0 24px 52px rgba(26, 10, 10, 0.3), inset 0 1px 0 rgba(255, 247, 230, 0.1);
  transform: translateY(-50%) translateX(-6px);
  outline: none;
}

.launcher-icon {
  position: relative;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
}

.launcher-icon::before,
.launcher-icon::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.launcher-icon::before {
  inset: 0;
  border: 1px solid rgba(201, 168, 106, 0.7);
}

.launcher-icon::after {
  right: 1px;
  top: 5px;
  width: 6px;
  height: 6px;
  background: #f1c86f;
  box-shadow: -25px 18px 0 rgba(241, 200, 111, 0.72);
}

.launcher-mark {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #f6dfaa, #c9a86a);
  color: #1a0a0a;
  font-weight: 800;
  font-size: 12px;
  line-height: 1;
}

.launcher-copy {
  min-width: 150px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  opacity: 0;
  transform: translateX(8px);
  transition: opacity 0.22s ease, transform 0.22s ease;
  white-space: nowrap;
}

.agent-launcher:hover .launcher-copy,
.agent-launcher:focus-visible .launcher-copy {
  opacity: 1;
  transform: translateX(0);
}

.launcher-copy strong {
  font-family: var(--font-heading);
  font-size: 15px;
  line-height: 1.1;
  color: #f7deb0;
  font-weight: 700;
}

.launcher-copy span {
  margin-top: 3px;
  font-size: 14px;
  line-height: 1.1;
  letter-spacing: 0;
  color: rgba(255, 247, 230, 0.86);
}

.launcher-arrow {
  margin-left: auto;
  opacity: 0;
  transform: translateX(-4px);
  color: #c9a86a;
  font-size: 24px;
  line-height: 1;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.agent-launcher:hover .launcher-arrow,
.agent-launcher:focus-visible .launcher-arrow {
  opacity: 1;
  transform: translateX(0);
}

.agent-mask {
  position: fixed;
  inset: 0;
  background: rgba(26, 10, 10, 0.28);
}

.agent-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: min(430px, 100vw);
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fbf7ef;
  border-left: 1px solid rgba(201, 168, 106, 0.45);
  box-shadow: -24px 0 60px rgba(26, 10, 10, 0.22);
  transform: translateX(100%);
  transition: transform 0.26s ease;
}

.agent-shell.open .agent-drawer {
  transform: translateX(0);
}

.agent-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 24px;
  background: #1a0a0a;
  color: #f8ecd2;
}

.agent-kicker {
  display: block;
  margin-bottom: 8px;
  color: #c9a86a;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}

.agent-header h2 {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 20px;
  line-height: 1.35;
}

.icon-button {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(201, 168, 106, 0.4);
  background: transparent;
  color: #f8ecd2;
  cursor: pointer;
  font-size: 24px;
  line-height: 1;
}

.agent-messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 22px;
}

.agent-message {
  margin-bottom: 18px;
}

.agent-message.user {
  text-align: right;
}

.message-role {
  margin-bottom: 6px;
  color: #8c7a6b;
  font-size: 12px;
}

.message-bubble {
  display: inline-block;
  max-width: 88%;
  padding: 12px 14px;
  border: 1px solid #eadcc4;
  background: #fff;
  color: #2c1810;
  text-align: left;
  word-break: break-word;
  line-height: 1.7;
  font-size: 14px;
}

.message-bubble::v-deep p {
  margin: 0 0 10px;
}

.message-bubble::v-deep p:last-child,
.message-bubble::v-deep ul:last-child,
.message-bubble::v-deep ol:last-child {
  margin-bottom: 0;
}

.message-bubble::v-deep h3,
.message-bubble::v-deep h4,
.message-bubble::v-deep h5 {
  margin: 12px 0 6px;
  color: #2c1810;
  font-family: var(--font-heading);
  font-size: 15px;
  line-height: 1.45;
}

.message-bubble::v-deep h3:first-child,
.message-bubble::v-deep h4:first-child,
.message-bubble::v-deep h5:first-child {
  margin-top: 0;
}

.message-bubble::v-deep ul,
.message-bubble::v-deep ol {
  margin: 6px 0 12px;
  padding-left: 20px;
}

.message-bubble::v-deep li {
  margin: 4px 0;
}

.message-bubble::v-deep strong {
  color: #5f1414;
  font-weight: 700;
}

.message-bubble::v-deep code {
  padding: 1px 5px;
  border: 1px solid #eadcc4;
  background: #fbf7ef;
  color: #6b1212;
  font-family: Consolas, "Courier New", monospace;
  font-size: 12px;
}

.message-bubble::v-deep a {
  color: #8b1a1a;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.agent-message.user .message-bubble {
  background: #8b1a1a;
  border-color: #8b1a1a;
  color: #fff8e8;
}

.agent-message.user .message-bubble::v-deep strong,
.agent-message.user .message-bubble::v-deep a {
  color: #fff1c9;
}

.typing-line {
  color: #8b1a1a;
  font-size: 13px;
}

.agent-prompts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 0 20px 16px;
}

.agent-prompts button {
  min-height: 36px;
  border: 1px solid #e0d5c1;
  background: #fff;
  color: #5a4032;
  cursor: pointer;
  font-size: 12px;
}

.agent-prompts button:hover {
  border-color: #8b1a1a;
  color: #8b1a1a;
}

.agent-composer {
  padding: 18px 20px 20px;
  border-top: 1px solid #eadcc4;
  background: #f5f0e8;
}

.agent-composer textarea {
  width: 100%;
  resize: none;
  border: 1px solid #d8c9ad;
  background: #fff;
  color: #2c1810;
  padding: 12px;
  outline: none;
  line-height: 1.6;
  font-family: var(--font-body);
}

.agent-composer textarea:focus {
  border-color: #8b1a1a;
}

.composer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.composer-hint {
  color: #9a8979;
  font-size: 12px;
}

.send-button,
.stop-button {
  min-width: 78px;
  height: 34px;
  border: 0;
  color: #fff8e8;
  cursor: pointer;
}

.send-button {
  background: #8b1a1a;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stop-button {
  background: #2c1810;
}

.agent-fade-enter-active,
.agent-fade-leave-active {
  transition: opacity 0.2s ease;
}

.agent-fade-enter,
.agent-fade-leave-to {
  opacity: 0;
}

@media (max-width: 560px) {
  .agent-launcher {
    top: auto;
    right: 0;
    bottom: 88px;
    transform: none;
  }

  .agent-launcher:hover,
  .agent-launcher:focus-visible {
    width: min(236px, calc(100vw - 14px));
    transform: translateX(-4px);
  }

  .agent-header {
    padding: 20px;
  }

  .agent-prompts {
    grid-template-columns: 1fr;
  }
}
</style>
