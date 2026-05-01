import { defineConfig } from 'vite'

export default defineConfig({
  base: '/hyperaion/',
  plugins: [
    {
      name: 'hyperaion-legacy-local-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || ''
          if (url === '/hyperaion/lp' || url.startsWith('/hyperaion/lp/')) {
            res.statusCode = 302
            res.setHeader('Location', '/hyperaion/')
            res.end()
            return
          }
          next()
        })
      },
    },
  ],
})
