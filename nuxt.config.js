import webpack from 'webpack'

import buildModules from './configuration/nuxt/build-modules'
import modules from './configuration/nuxt/modules'

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default {
  version: uuidv4(),
  mode: 'universal',
  ...buildModules,
  ...modules,
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
  loading: false,
  css: ['@/assets/styles/app.scss'],
  plugins: [
    { src: '~/plugins/events.js', mode: 'client' },
    { src: '~/plugins/viewport.js', mode: 'client' },
    { src: '~/plugins/mouse.js', mode: 'client' },
    { src: '~/plugins/directives.js', mode: 'client' }
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
