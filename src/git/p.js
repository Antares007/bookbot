// @flow strict
import { join as pathJoin } from 'path'
import fs from 'fs'

const readdir = (path: string): Promise<Array<string>> =>
  new Promise((resolve, reject) => {
    fs.readdir(path, function(err, value) {
      if (err) reject(err)
      else resolve(value)
    })
  })

const readfile = (path: string): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    fs.readFile(path, function(err, value) {
      if (err) reject(err)
      else resolve(value)
    })
  })

const repo = { rootPath: '' }

function loadRawPacked(hash, callback) {
  var packDir = pathJoin(repo.rootPath, 'objects/pack')
  var packHashes = []
  fs.readdir(packDir, function(err, entries) {
    if (!entries) return callback(err)
    entries.forEach(function(name) {
      var match = name.match(/pack-([0-9a-f]{40}).idx/)
      if (match) packHashes.push(match[1])
    })
    start()
  })

  function start() {
    var packHash = packHashes.pop()
    var offsets
    if (!packHash) return callback()
    if (!cachedIndexes[packHash]) loadIndex(packHash)
    else onIndex()

    function loadIndex() {
      var indexFile = pathJoin(packDir, 'pack-' + packHash + '.idx')
      fs.readFile(indexFile, function(err, buffer) {
        if (!buffer) return callback(err)
        try {
          cachedIndexes[packHash] = parseIndex(buffer)
        } catch (err) {
          return callback(err)
        }
        onIndex()
      })
    }

    function onIndex() {
      var cached = cachedIndexes[packHash]
      var packFile = pathJoin(packDir, 'pack-' + packHash + '.pack')
      var index = cached.byHash[hash]
      if (!index) return start()
      offsets = cached.offsets
      loadChunk(packFile, index.offset, callback)
    }

    function loadChunk(packFile, start, callback) {
      var index = offsets.indexOf(start)
      if (index < 0) {
        var error = new Error("Can't find chunk starting at " + start)
        return callback(error)
      }
      var end = index + 1 < offsets.length ? offsets[index + 1] : -20
      fs.readChunk(packFile, start, end, function(err, chunk) {
        if (!chunk) return callback(err)
        var raw
        try {
          var entry = parsePackEntry(chunk)
          if (entry.type === 'ref-delta') {
            return loadRaw.call(repo, entry.ref, onBase)
          } else if (entry.type === 'ofs-delta') {
            return loadChunk(packFile, start - entry.ref, onBase)
          }
          raw = codec.frame(entry)
        } catch (err) {
          return callback(err)
        }
        callback(null, raw)

        function onBase(err, base) {
          if (!base) return callback(err)
          var object = codec.deframe(base)
          var buffer
          try {
            object.body = applyDelta(entry.body, object.body)
            buffer = codec.frame(object)
          } catch (err) {
            return callback(err)
          }
          callback(null, buffer)
        }
      })
    }
  }
}
