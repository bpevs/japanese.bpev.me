import { createResource } from 'solid-js'
import { render } from 'https://deno.land/x/gfm/mod.ts'

export default function Readme({ week }: { week?: string }) {
  const [readme] = createResource(async () => {
    const baseUrl = week ? `${window.location.origin}/${week}/` : window.location.origin + '/'
    const resp = await fetch(`${baseUrl}README.md`)
    return render(await resp.text(), { baseUrl })
  })

  return (
    <div class='readme'>
      <Show
        when={!readme.loading}
        fallback={
          <h1
            class='absolute f3 f2-m f1-l fw2 black-90 mv3'
            style='top: 50%; left: 50%; transform: translate(-50%, -50%);'
          >
            loading...
          </h1>
        }
      >
        <article class='pa3 pa5-ns'>
          <p class='measure lh-copy' style='margin: auto;' innerHTML={readme()} />
        </article>
      </Show>
    </div>
  )
}
