/** @jsx jsx **/
import { Hono } from 'hono'
import { jsx, logger, poweredBy, serveStatic } from 'hono/middleware.ts'
import Html from './components/html.tsx'

const app = new Hono()

app.use('*', logger(), poweredBy())
app.use('/*', serveStatic({ root: '../' }))
app.use('/static/*', serveStatic({ root: './' }))

app.get('/', async (c) => {
  return c.html(<Html />)
})

Deno.serve(app.fetch)
