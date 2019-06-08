const fs = require('fs')
const mkdirp = require('mkdirp')
const fsdb = require('js-git/mixins/fs-db')
const modes = require('js-git/lib/modes')
const P = require('./tP')

export const emptyTreeHash = '4b825dc642cb6eb9a060e54bf8d69288fbee4904'

export const mkrepo = rootPath => {
  const repo = { rootPath, modes }
  fsdb(repo, gitfs)
  return {
    saveBlob: buffer =>
      P.p(o =>
        repo.saveAs('blob', buffer, (err, hash) => (err ? o(P.rError(err)) : o(P.rValue(hash))))
      ),
    saveTree: tree =>
      P.p(o => {
        const jstree = {}
        for (var name in tree) {
          const e = tree[name]
          jstree[name] = { mode: parseInt(e.mode, 8), hash: e.hash }
        }
        repo.saveAs('tree', jstree, (err, hash) => (err ? o(P.rError(err)) : o(P.rValue(hash))))
      }),
    saveCommit: commit =>
      P.p(o =>
        repo.saveAs('commit', commit, (err, hash) => (err ? o(P.rError(err)) : o(P.rValue(hash))))
      ),
    loadBlob: hash =>
      P.p(o =>
        repo.loadAs('blob', hash, (err, buffer) => {
          if (err) o(P.rError(err))
          else if (buffer) o(P.rValue(buffer))
          else o(P.rError(new Error(`hash ${hash} not found`)))
        })
      ),
    loadTree: hash =>
      P.p(o =>
        repo.loadAs('tree', hash, (err, jstree) => {
          if (err) o(P.rError(err))
          else if (jstree) {
            const tree = {}
            for (var name in jstree) {
              const e = jstree[name]
              tree[name] = { mode: e.mode.toString(8), hash: e.hash }
            }
            o(P.rValue(tree))
          } else o(P.rError(new Error(`hash ${hash} not found`)))
        })
      ),
    loadCommit: hash =>
      P.p(o =>
        repo.loadAs('commit', hash, (err, commit) => {
          if (err) o(P.rError(err))
          else if (commit) o(P.rValue(commit))
          else o(P.rError(new Error(`hash ${hash} not found`)))
        })
      )
  }
}

const gitfs = {
  rename: fs.rename,
  // - readFile(path) => binary
  //   Must also call callback() with no arguments if the file does not exist.
  readFile: (path, cb) =>
    fs.readFile(path, function(err, buffer) {
      if (err) return err.code === 'ENOENT' ? cb() : cb(err)
      cb(null, buffer)
    }),
  // - readChunk(path, start, end) => binary
  //   Must also call callback() with no arguments if the file does not exist.
  readChunk: (path, start, end, cb) =>
    fs.open(path, 'r', function(err, fd) {
      if (err) return err.code === 'ENOENT' ? cb() : cb(err)
      fs.fstat(fd, function(err, stats) {
        if (err) return cb(err)
        end = end < 0 ? stats.size + end : end
        var length = end - start
        var buffer = new Buffer(length)
        fs.read(fd, buffer, 0, length, start, function(err, bytesRead, buffer) {
          if (err) return cb(err)
          if (bytesRead !== length) return cb(new Error('fs.readChunk bytesRead !== length'))
          fs.close(fd, function(err) {
            if (err) return cb(err)
            cb(null, buffer)
          })
        })
      })
    }),
  // - writeFile(path, binary) =>
  //   Must also make every directory up to parent of path.
  writeFile: (path, binary, cb) =>
    mkdirp(
      path
        .split('/')
        .slice(0, -1)
        .join('/'),
      function(err) {
        if (err) return cb(err)
        fs.writeFile(path, binary, { flag: 'wx' }, function(err) {
          if (err) return cb(err)
          cb()
        })
      }
    ),
  // - readDir(path) => array<paths>
  //   Must also call callback() with no arguments if the file does not exist.
  readDir: (path, cb) =>
    fs.readdir(path, function(err, files) {
      if (err) return err.code === 'ENOENT' ? cb() : cb(err)
      cb(null, files)
    })
}
