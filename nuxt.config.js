import webpack from 'webpack'

export default {
  mode: 'universal',
  generate: {
    routes: [],
    fallback: ''
  },
  head: {
    htmlAttrs: {
      lang: 'en'
    },
    title: 'nuxt-three',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'Nuxt.js - Three.js starter'
      },
      {
        hid: `og:title`,
        property: 'og:title',
        content: 'nuxt-three'
      },
      {
        hid: `og:description`,
        property: 'og:description',
        content: 'Web app starter built on Nuxt.js and Three.js'
      },
      {
        hid: 'og:type',
        property: 'og:type',
        content: 'website'
      },
      {
        hid: `og:url`,
        property: 'og:url',
        content: 'https://github.com/clementroche/nuxt-three'
      },
      {
        hid: `og:image`,
        property: 'og:image',
        content: ''
      }
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico'
      },
      {
        rel: 'preload',
        href: '/fonts/GothamUltra/GothamUltra.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: 'anonymous'
      }
    ]
  },
  loading: false,
  css: ['@/assets/scss/index.scss'],
  styleResources: {
    scss: ['@/assets/scss/config.scss', '@/assets/scss/modules/index.scss']
  },
  plugins: [
    { src: '~/plugins/events.js', mode: 'client' },
    { src: '~/plugins/viewport.js', mode: 'client' },
    { src: '~/plugins/mouse.js', mode: 'client' },
    { src: '~/plugins/directives.js', mode: 'client' },
    { src: '~/plugins/components.js' }
  ],
  buildModules: [
    '@nuxtjs/eslint-module',
    [
      '@nuxtjs/stylelint-module',
      {
        fix: true
      }
    ]
  ],
  modules: [
    '@nuxtjs/pwa',
    [
      'nuxt-compress',
      {
        gzip: {
          cache: true
        },
        brotli: {
          threshold: 10240
        }
      }
    ],
    '@nuxtjs/style-resources'
  ],
  router: {},
  build: {
    extend(config, ctx) {
      config.plugins.push(new webpack.ProvidePlugin({ THREE: 'three' }))
      config.module.rules.push({
        test: /\.(glsl|vs|fs)$/,
        loader: 'raw-loader'
      })
    },
    babel: {
      plugins: ['@babel/plugin-proposal-object-rest-spread'],
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
