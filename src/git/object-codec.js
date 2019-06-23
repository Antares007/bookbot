// @flow strict

export opaque type Hash: string = string

export type Tree = {
  type: 'tree',
  body: Array<{
    mode: '40000' | '100644' | '100755' | '120000' | '160000',
    name: string,
    hash: Hash
  }>
}

export type Blob = { type: 'blob', body: Buffer }

export type Commit = {
  type: 'commit',
  body: {
    tree: Hash,
    parents: Array<Hash>,
    author: { name: string, email: string, date: { seconds: number, offset: number } },
    committer: { name: string, email: string, date: { seconds: number, offset: number } },
    message: string
  }
}

export const frame: (Tree | Blob | Commit) => Buffer = obj => {
  const buffer =
    obj.type === 'blob'
      ? obj.body
      : obj.type === 'tree'
      ? encodeTree(obj.body)
      : encodeCommit(obj.body)
  return Buffer.concat([Buffer.from(obj.type + ' ' + buffer.length + '\0', 'binary'), buffer])
}

export const deframe: Buffer => Tree | Blob | Commit = function(buffer) {
  var space = buffer.indexOf(0x20)
  if (space < 0) throw new Error('Invalid git object buffer')
  var nil = buffer.indexOf(0x00, space)
  if (nil < 0) throw new Error('Invalid git object buffer')
  var body = buffer.slice(nil + 1)
  var size = parseInt(buffer.slice(space + 1, nil).toString('binary'), 10)
  if (size !== body.length) throw new Error('Invalid body length.')
  var type = buffer.slice(0, space).toString('binary')
  if (type === 'tree') return { type: 'tree', body: decodeTree(body) }
  else if (type === 'blob') return { type: 'blob', body }
  else if (type === 'commit') return { type: 'commit', body: decodeCommit(body) }
  else throw new Error('never')
}

export const tree: ({
  [string]: {
    mode: '40000' | '100644' | '100755' | '120000' | '160000',
    hash: Hash
  }
}) => Tree = function(tree) {
  return {
    type: 'tree',
    body: Object.keys(tree)
      .sort((l, r) => {
        const a = tree[l].mode === '40000' ? l + '/' : l
        const b = tree[r].mode === '40000' ? r + '/' : r
        return a > b ? 1 : a < b ? -1 : 0
      })
      .map(name => ({ name, mode: tree[name].mode, hash: tree[name].hash }))
  }
}

export const decodeTree: Buffer => $PropertyType<Tree, 'body'> = function(buffer) {
  const tree = []
  var i = 0
  var start
  const length = buffer.length
  while ((start = i) < length) {
    i = buffer.indexOf(0x20, start)
    const mode = buffer.slice(start, i++).toString()
    if (
      mode !== '40000' &&
      mode !== '100644' &&
      mode !== '100755' &&
      mode !== '120000' &&
      mode !== '160000'
    )
      throw new Error('never')
    start = i
    i = buffer.indexOf(0x00, start)
    const name = buffer.slice(start, i++).toString()
    const hash = buffer.slice(i, (i += 20)).toString('hex')
    tree.push({ mode, name, hash })
  }
  return tree
}

export const encodeTree: ($PropertyType<Tree, 'body'>) => Buffer = function(tree) {
  return Buffer.concat(
    tree.map(entry =>
      Buffer.concat([
        Buffer.from(entry.mode + ' '),
        Buffer.from(entry.name + '\0'),
        Buffer.from(entry.hash, 'hex')
      ])
    )
  )
}

const encodeCommit: ($PropertyType<Commit, 'body'>) => Buffer = function(body) {
  var str = 'tree ' + body.tree
  for (var i = 0, l = body.parents.length; i < l; ++i) {
    str += '\nparent ' + body.parents[i]
  }
  str +=
    '\nauthor ' +
    formatPerson(body.author) +
    '\ncommitter ' +
    formatPerson(body.committer) +
    '\n\n' +
    body.message
  return Buffer.from(str, 'utf8')
}

const decodeCommit: Buffer => $PropertyType<Commit, 'body'> = function(body) {
  var i = 0
  var start
  var key
  var parents = []
  var tree
  var author
  var committer
  var message
  while (body[i] !== 0x0a) {
    start = i
    i = body.indexOf(0x20, start)
    if (i < 0) throw new SyntaxError('Missing space')
    key = body.slice(start, i++).toString('binary')
    start = i
    i = body.indexOf(0x0a, start)
    if (i < 0) throw new SyntaxError('Missing linefeed')
    var value = body.slice(start, i++).toString('utf8')
    if (key === 'tree') tree = value
    else if (key === 'parent') parents.push(value)
    else if (key === 'author') author = decodePerson(value)
    else if (key === 'committer') committer = decodePerson(value)
    else throw new Error('never')
  }
  i++
  message = body.slice(i, body.length).toString('utf8')
  if (!tree || !author || !committer) throw new Error('never')
  return { tree, parents, author, committer, message }
}

function formatPerson(person) {
  return safe(person.name) + ' <' + safe(person.email) + '> ' + formatDate(person.date)
}

function formatDate(date) {
  var seconds, offset
  seconds = date.seconds
  offset = date.offset
  var neg = '+'
  if (offset <= 0) offset = -offset
  else neg = '-'
  offset = neg + two(Math.floor(offset / 60)) + two(offset % 60)
  return seconds + ' ' + offset
}

function safe(string) {
  return string.replace(/(?:^[\.,:;<>"']+|[\0\n<>]+|[\.,:;<>"']+$)/gm, '')
}

function two(num) {
  return (num < 10 ? '0' : '') + num
}

function decodePerson(string) {
  var match = string.match(/^([^<]*) <([^>]*)> ([^ ]*) (.*)$/)
  if (!match) throw new Error('Improperly formatted person string')
  return {
    name: match[1],
    email: match[2],
    date: {
      seconds: parseInt(match[3], 10),
      offset: (parseInt(match[4], 10) / 100) * -60
    }
  }
}
