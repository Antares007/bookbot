// @flow strict
import * as G from './G'
import * as P from './P'

const repo = G.mkrepo(__dirname + '/../.git')

const hash = G.treeBark(function rec(o, dir) {
  console.log(dir)
  for (var name in dir) {
    const e = dir[name]
    if (e.mode === 'tree') o({ R: 'tree', name, b: G.treeBark(rec) })
    else o({ R: e.mode, name, b: () => P.right(e.hash) })
  }
  o({
    R: 'blob',
    name: 'ls.json',
    b: r => r.saveBlob(Buffer.from(JSON.stringify(dir, null, '  ')))
  })
})(repo, 'b79d3e44cf22cdc015ac154d244944560aab0cfb')(console.log.bind(console))
