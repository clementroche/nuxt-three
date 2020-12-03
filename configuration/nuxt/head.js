export default {
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
  }
}
