module.exports = {
  staticFileGlobs: [
    'dist/ngx-schema-form-widgets-primeng-ultima-app/**.html',
    'dist/ngx-schema-form-widgets-primeng-ultima-app/**.js',
    'dist/ngx-schema-form-widgets-primeng-ultima-app/**.css',
    'dist/ngx-schema-form-widgets-primeng-ultima-app/assets/layout/**.css',
    'dist/ngx-schema-form-widgets-primeng-ultima-app/assets/layout/fonts/**',
    'dist/ngx-schema-form-widgets-primeng-ultima-app/assets/layout/images/**',
    'dist/ngx-schema-form-widgets-primeng-ultima-app/assets/layout/js/**',
    'dist/ngx-schema-form-widgets-primeng-ultima-app/assets/layout/css/**.css',
    'dist/ngx-schema-form-widgets-primeng-ultima-app/assets/pages/**',
    'dist/ngx-schema-form-widgets-primeng-ultima-app/assets/theme/**.css',
    'dist/ngx-schema-form-widgets-primeng-ultima-app/images/**',
    'dist/ngx-schema-form-widgets-primeng-ultima-app/images/icons/**'
  ],
  root: 'dist/ngx-schema-form-widgets-primeng-ultima-app',
  stripPrefix: 'dist/ngx-schema-form-widgets-primeng-ultima-app/',
  navigateFallback: '/index.html',
  runtimeCaching: [
    {
      urlPattern: /\/example\/api\/start/,
      handler: 'networkFirst'
    }
    ,
    {
      urlPattern: /\/example\/api\/get/,
      handler: 'networkFirst'
      , options: {
        cache: {
          maxEntries: 30,
          name: 'provider-list-cache'
        }
      }
    }
  ]
}
/** https://houssein.me/progressive-angular-applications */
