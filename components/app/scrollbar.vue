<template>
  <div class="appScrollbar">
    <div
      :style="{ height: `${scrollProgress.y * 100}%` }"
      class="appScrollbar__bar"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState({
      scrollProgress: (state) => state.scroll.progress
    })
  }
}
</script>

<style lang="scss">
.appScrollbar {
  width: 4px;

  &__bar {
    background-color: var(--c-secondary);
    width: 100%;
  }
}
</style>
