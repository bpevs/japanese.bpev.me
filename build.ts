import type { Format } from 'npm:esbuild@^0.23.0'
import * as esbuild from 'npm:esbuild@^0.23.0'
import { denoPlugins } from 'jsr:@luca/esbuild-deno-loader@^0.10.3'
import { resolve } from 'jsr:@std/path@^1.0.1'
import { solidPlugin } from 'npm:esbuild-plugin-solid'

const [denoResolver, denoLoader] = [...denoPlugins({
  nodeModulesDir: true,
  configPath: resolve('./deno.json'),
})]

const options = {
  plugins: [],
  entryPoints: [
    { in: './www/index.tsx', out: './index' },
  ],
  outdir: './www/static',
  bundle: true,
  platform: 'browser',
  format: 'esm' as Format,
  treeShaking: true,
}

options.plugins = [
  denoResolver,
  solidPlugin({ solid: { moduleName: 'npm:solid-js/web' } }),
  denoLoader,
]

if (Deno.args[0] === 'build') {
  await esbuild.build(options)
  esbuild.stop()
} else if (Deno.args[0] === 'dev') {
  const ctx = await esbuild.context(options)

  const { host } = await ctx.serve({
    servedir: '.',
    fallback: './index.html',
    port: 3000,
  })
  console.log(`serving on http://${host}/3000`)
}
