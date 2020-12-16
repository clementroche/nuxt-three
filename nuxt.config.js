import webpack from 'webpack'

import buildModules from './configuration/nuxt/build-modules'
import modules from './configuration/nuxt/modules'
import head from './configuration/nuxt/head'

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default {
  version: uuidv4(),
  target: 'static',
  ...buildModules,
  ...modules,
  ...head,
  generate: {
    routes: [],
    fallback: true
  },
  manifest: {
    orientation: 'portrait-primary',
    name: 'nuxt-three',
    short_name: 'nuxt-three',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    description: ''
  },
  components: [
    {
      path: '@/components',
      extensions: ['vue']
    },
    {
      path: '@/components/app',
      prefix: 'app',
      extensions: ['vue']
    },
    {
      path: '@/components/elements',
      prefix: 'e',
      extensions: ['vue']
    },
    {
      path: '@/components/blocks',
      prefix: 'block',
      extensions: ['vue']
    },
    {
      path: '@/components/webgl',
      prefix: 'webgl',
      extensions: ['vue']
    },
    {
      path: '@/components/svg',
      prefix: 'svg',
      extensions: ['vue']
    }
  ],
  pageTransition: {
    name: 'page',
    mode: 'out-in',
    beforeLeave(el) {
      // console.log('Before leave...')
      this.$events.emit('cursor:enter', { type: 'default' })
    },
    leave(el) {
      // console.log('Enter...')
      this.$events.emit('scroller:reset')
    },
    afterLeave(el) {
      // console.log('After leave...')
    },
    beforeEnter(el) {
      // console.log('Before enter...')
    },
    enter(el) {
      // console.log('Enter...')
    },
    afterEnter(el) {
      // console.log('After enter...')
    }
  },
  loading: false,
  css:
    process.env.NODE_ENV === 'development'
      ? ['@/assets/styles/debug.scss', '@/assets/styles/app.scss']
      : ['@/assets/styles/app.scss'],
  plugins: [
    { src: '~/plugins/polyfills.js', mode: 'client' },
    { src: '~/plugins/events.js', mode: 'client' },
    { src: '~/plugins/frame.js', mode: 'client' },
    { src: '~/plugins/viewport.js', mode: 'client' },
    { src: '~/plugins/mouse.js', mode: 'client' },
    { src: '~/plugins/directives.js', mode: 'client' },
    { src: '~/plugins/gsap.js', mode: 'client' }
  ],
  build: {
    extend(config, ctx) {
      config.plugins.push(new webpack.ProvidePlugin({ THREE: 'three' }))
      config.module.rules.push({
        test: /\.(glsl|vs|fs)$/,
        loader: 'raw-loader'
      })
    },
    babel: {
      plugins: [
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/proposal-class-properties'
      ],
      presets({ isServer }) {
        return [
          [
            '@babel/preset-env',
            {
              targets: '> 2%, not dead'
            }
          ]
        ]
      }
    }
  }
}
