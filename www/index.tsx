import { lazy } from 'solid-js'
import { render } from 'solid-js/web'
import { A, Route, Router } from 'solid-js/router'
import { useLocation } from 'solid-js/router'
import { Badge, Icon, IconButton, Multiselect } from '@inro/ui'

customElements.define('ui-badge', Badge)
customElements.define('ui-icon', Icon)
customElements.define('ui-icon-button', IconButton)
customElements.define('ui-multiselect', Multiselect)

declare global {
  interface HTMLElementTagNameMap {
    'ui-badge': Badge
    'ui-icon': Icon
    'ui-icon-button': IconButton
    'ui-multiselect': Multiselect
  }
}

import Home from './routes/home.tsx'
import Week1 from './routes/week_1.tsx'

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
      <header class='bg-black-90 w-100 ph3 pv3 pv4-ns ph4-m ph5-l'>
        <nav class='f6 fw6 ttu tracked'>
          <Link href='/' name='Home' />
          <Link href='/week-1' name='Week 1' />
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
        <Route path='/' component={Home} />
        <Route path='/week-1' component={Week1} />
      </Router>
    </div>
  )
}

const main = document.getElementById('main')
if (main) render(() => <App />, main)
