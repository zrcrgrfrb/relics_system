<template>
  <button class="more-link" type="button" @click="handleClick">
    {{ text }}
    <span class="more-arrow">&rarr;</span>
  </button>
</template>

<script>
export default {
  name: 'MoreLink',
  props: {
    type: {
      type: [String, Number],
      required: true
    },
    text: {
      type: String,
      default: '查看更多'
    }
  },
  methods: {
    handleClick() {
      this.$router.push(`/more/${this.type}`)
    }
  }
}
</script>

<style scoped>
.more-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 12px;
  line-height: 1;
  padding: 4px 0;
  transition: all 0.2s ease;
}

.more-link:hover {
  color: var(--color-accent);
  gap: 6px;
}

.more-arrow {
  font-size: 14px;
  transition: transform 0.2s ease;
}

.more-link:hover .more-arrow {
  transform: translateX(3px);
}
</style>
