export default {
  modules: [
    '@nuxtjs/style-resources',
    'nuxt-mq',
    'nuxt-helmet',
    'nuxt-ssr-cache',
    'nuxt-compress'
  ],
  mq: {
    defaultBreakpoint: 'default',
    breakpoints: {
      mobile: 769,
      desktop: Infinity
    }
  },
  /*
   ** Helmet module configuration
   ** See https://helmetjs.github.io/docs/
   */
  helmet: {
    dnsPrefetchControl: true,
    expectCt: true,
    frameguard: true,
    hidePoweredBy: true,
    hsts: {
      // Must be at least 1 year to be approved
      maxAge: 31536000,

      // Must be enabled to be approved
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: true,
    referrerPolicy: true,
    xssFilter: true
  },
  /*
   ** Nuxt Compress module configuration
   ** See https://github.com/robcresswell/nuxt-compress
   */
  'nuxt-compress': {
    gzip: {
      cache: true
    },
    brotli: {
      threshold: 10240
    }
  },
  /*
   ** Nuxt SSR Cache module configuration
   ** See https://github.com/arash16/nuxt-ssr-cache
   */
  cache: {
    // if you're serving multiple host names (with differing
    // results) from the same server, set this option to true.
    // (cache keys will be prefixed by your host name)
    // if your server is behind a reverse-proxy, please use
    // express or whatever else that uses 'X-Forwarded-Host'
    // header field to provide req.hostname (actual host name)
    useHostPrefix: false,
    pages: [],
    // pages: ['/'],
    store: {
      type: 'memory',

      // maximum number of pages to store in memory
      // if limit is reached, least recently used page
      // is removed.
      max: 100,

      // number of seconds to store this page in cache
      ttl: 60
    }
  },
  /*
   ** Shared SCSS
   */
  styleResources: {
    scss: ['@/assets/styles/shared.scss']
  }
}
