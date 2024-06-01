import type { Format } from 'npm:esbuild'
import * as esbuild from 'npm:esbuild'
import { denoPlugins } from 'jsr:@luca/esbuild-deno-loader@0.9.0'
import { resolve } from 'jsr:@std/path@0.215.0'
import { solidPlugin } from 'npm:esbuild-plugin-solid'

const [denoResolver, denoLoader] = [...denoPlugins({
  nodeModulesDir: true,
  importMapURL: 'file://' + resolve('./import_map.json'),
})]

const options = {
  plugins: [
    denoResolver,
    solidPlugin({ solid: { moduleName: 'npm:solid-js/web' } }),
    denoLoader,
  ],
  entryPoints: [
    { in: './www/index.tsx', out: './index' },
  ],
  outdir: './www/static',
  bundle: true,
  platform: 'browser',
  format: 'esm' as Format,
  treeShaking: true,
}

if (Deno.args[0] === 'build') {
  await esbuild.build(options)
  esbuild.stop()
} else if (Deno.args[0] === 'dev') {
  const ctx = await esbuild.context(options)

  const { host, port } = await ctx.serve({
    servedir: '.',
    fallback: './index.html',
    port: 3000,
  })
  console.log('http://' + host + ':' + port)
}
