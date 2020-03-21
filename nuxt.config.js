import webpack from 'webpack'

export default {
  mode: 'universal',
  /*
   ** Headers of the page
   */
  generate: {
    routes: [],
    fallback: ''
  },
  head: {
    title: 'nuxt-three',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: ''
      },
      {
        ref: `canonical`,
        href: ''
      },
      {
        hid: `og:title`,
        property: 'og:title',
        content: ''
      },
      {
        hid: `og:url`,
        property: 'og:url',
        content: ''
      },
      {
        hid: `og:image`,
        property: 'og:image',
        content: ''
      },
      {
        hid: `og:description`,
        property: 'og:description',
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
        href: '/fonts/Tobias-Light/Tobias-Light.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: 'anonymous'
      },
      {
        rel: 'preload',
        href: '/fonts/Tobias-Bold/Tobias-Bold.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: 'anonymous'
      },
      {
        rel: 'preload',
        href: '/fonts/Tobias-Heavy/Tobias-Heavy.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: 'anonymous'
      }
    ]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: ['@/assets/scss/index.scss'],
  styleResources: {
    scss: ['@/assets/scss/config.scss', '@/assets/scss/modules/index.scss']
  },
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    { src: '~/plugins/events.js', mode: 'client' },
    { src: '~/plugins/viewport.js', mode: 'client' },
    { src: '~/plugins/mouse.js', mode: 'client' },
    { src: '~/plugins/scroll.js', mode: 'client' },
    { src: '~/plugins/directives.js', mode: 'client' },
    { src: '~/webgl/webgl.js', mode: 'client' }
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    // Doc: https://github.com/nuxt-community/stylelint-module
    [
      '@nuxtjs/stylelint-module',
      {
        fix: true
      }
    ]
  ],
  /*
   ** Nuxt.js modules
   */
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
    '@nuxtjs/dotenv',
    '@nuxtjs/style-resources',
    '@nuxtjs/device'
  ],
  router: {
    // scrollBehavior(to, from, savedPosition) {
    //   return { x: 0, y: 0 }
    // }
  },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      config.plugins.push(new webpack.ProvidePlugin({ THREE: 'three' }))
    },
    babel: {
      presets({ isServer }) {
        return [
          [
            '@babel/preset-env',
            {
              targets: {
                edge: '17',
                firefox: '60',
                chrome: '67',
                safari: '11.1'
              }
            }
          ]
        ]
      }
    }
  }
}
