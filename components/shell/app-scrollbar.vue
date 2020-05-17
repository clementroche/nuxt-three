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
  width: 8px;

  &__bar {
    background-color: var(--color-white);
    width: 100%;
  }
}
</style>
