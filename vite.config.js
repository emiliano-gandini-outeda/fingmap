export default defineConfig({
  plugins: [
    vue(),
    lightningcss({
      minify: true
    })
  ],
  build: {
    minify: 'lightningcss'
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['fing.ego-services.com']
  }
})
