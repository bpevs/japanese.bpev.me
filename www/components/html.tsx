/** @jsx jsx **/
import { jsx } from 'hono/middleware.ts'
import { html } from 'hono/helper.ts'

export default function Html() {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="expires" content="43200" />
        <title>Japanese from First Principles</title>

        <meta name="author" content="Ben Pevsner" />
        <meta name="description" content="Learning Japanese" />

        <meta property="og:title" content="Japanese from First Principles" />
        <meta property="og:url" content="https://japanese.bpev.me" />
        <meta property="og:description" content="For learning Japanese" />
        <meta property="og:image" content="/static/favicon.png" />

        <link rel="icon" type="image/png" href="/static/favicon.png">
        <link rel="apple-touch-icon" type="image/png" href="/static/favicon.png">
      </head>
      <body class="no-script">
        <h1>Learning Japanese</h1>
      </body>
    </html>
  `
}