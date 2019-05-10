// @flow
import * as S from './S'
import { div, button, h4 } from './N/ctors'
import { run } from './N/SN'
import { extend } from './N/rings'
import { linearPatcher } from './N/patchers'

const dlist = div((o, i) => {
  o(
    S.periodic(1000)
      .take(3)
      .map(i => h4(o => o(i + '')))
  )
})

const rootNode = document.getElementById('root-node')
if (!rootNode) throw new Error('cant find root')

run(linearPatcher(rootNode, 1000 / 60), {}, dlist).run(console.log.bind(console))
