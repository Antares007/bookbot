// @flow strict
import * as crypto from 'crypto'

export const sha1: Buffer => string = buffer => {
  const sha1 = crypto.createHash('sha1')
  sha1.update(buffer)
  return sha1.digest('hex')
}

export const parseIndex: Buffer => {
  offsets: Array<number>,
  byHash: { [string]: { offset: number, crc: number } },
  checksum: string
} = function(buffer) {
  if (buffer.readUInt32BE(0) !== 0xff744f63 || buffer.readUInt32BE(4) !== 0x00000002)
    throw new Error('Only v2 pack indexes supported')
  if (sha1(buffer.slice(0, -20)) !== buffer.slice(-20).toString('hex'))
    throw new Error('Checksum mistmatch')
  const packChecksum = buffer.slice(buffer.length - 40, buffer.length - 20).toString('hex')
  const totalObjects = buffer.readUInt32BE(8 + 255 * 4)
  const objectNamesOffset = 8 + 256 * 4
  const crcOffset = objectNamesOffset + 20 * totalObjects
  const offsetsOffset = crcOffset + 4 * totalObjects
  const largeOffsetsOffset = offsetsOffset + 4 * totalObjects
  const indexes = new Array(totalObjects)
  for (var i = 0; i < totalObjects; i++) {
    const start = objectNamesOffset + i * 20
    const hash = buffer.slice(start, start + 20).toString('hex')
    const crc = buffer.readUInt32BE(crcOffset + i * 4)
    var offset = buffer.readUInt32BE(offsetsOffset + i * 4)
    if (offset & 0x80000000) {
      offset = largeOffsetsOffset + (offset & 0x7fffffff) * 8
      offset = buffer.readUIntBE(offset + 2, 6)
    }
    indexes[i] = {
      hash: hash,
      offset: offset,
      crc: crc
    }
  }

  var byHash = {}
  indexes.sort(function(a, b) {
    return a.offset - b.offset
  })
  indexes.forEach(function(data) {
    byHash[data.hash] = {
      offset: data.offset,
      crc: data.crc
    }
  })
  var offsets = indexes
    .map(function(entry) {
      return entry.offset
    })
    .sort(function(a, b) {
      return a - b
    })

  return {
    offsets: offsets,
    byHash: byHash,
    checksum: packChecksum
  }
}
