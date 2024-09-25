import 'npm:core-js/actual/array/to-sorted'
import { render } from 'solid-js/web'
import { Route, Router } from 'solid-js/router'
import { useLocation } from 'solid-js/router'
import { Badge, Icon, IconButton, Loader, Multiselect } from '@inro/ui'

import Readme from '$/components/readme.tsx'

customElements.define('ui-badge', Badge)
customElements.define('ui-icon', Icon)
customElements.define('ui-icon-button', IconButton)
customElements.define('ui-loader', Loader)
customElements.define('ui-multiselect', Multiselect)

declare global {
  interface HTMLElementTagNameMap {
    'ui-badge': Badge
    'ui-icon': Icon
    'ui-loader': Loader
    'ui-icon-button': IconButton
    'ui-multiselect': Multiselect
  }
}

import Hiragana from '$tools/hiragana/site/main.tsx'
import Katakana from '$tools/katakana/site/main.tsx'
import Journal from '$tools/journal/site/main.tsx'
import Listify from '$tools/listify/site/main.tsx'

function Link({ name, href }) {
  const location = useLocation()
  const className = () => {
    let className = 'link dim white dib mr3'
    if (
      (location.pathname === href) ||
      (location.pathname === (href + '/'))
    ) className += ' underline'
    return className
  }
  return <a class={className()} href={href} title={name}>{name}</a>
}

function Layout(props) {
  return (
    <div>
      <header class='bg-black w-100 ph3 pv3 pv4-ns ph4-m ph5-l'>
        <nav class='f6 fw6 ttu tracked'>
          <Link href='/' name='Home' />
          <Link href='/tools/journal' name='Journal' />
          <Link href='/tools/hiragana' name='Hiragana' />
          <Link href='/tools/katakana' name='Katakana' />
          <Link href='/tools/listify' name='Listify' />
        </nav>
      </header>
      {props.children}
    </div>
  )
}

function App() {
  return (
    <div>
      <Router root={Layout}>
        <Route path='/' component={Readme} />
        <Route path='/tools/hiragana' component={Hiragana} />
        <Route path='/tools/journal' component={Journal} />
        <Route path='/tools/katakana' component={Katakana} />
        <Route path='/tools/listify' component={Listify} />
      </Router>
    </div>
  )
}

const main = document.getElementById('main')
if (main) render(() => <App />, main)
