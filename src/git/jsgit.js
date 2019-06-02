// @flow strict
import fs from 'fs'
import { sha1 } from './sha1'

const file = fs.readFileSync(
  __dirname + '/../../.git/objects/pack/pack-6cfd028ca12b7ba1d533f14774045b11dcdb8903.idx'
)
console.log(parseIndex(file))

export function parseIndex(buffer: Buffer) {
  if (readUint32(buffer, 0) !== 0xff744f63 || readUint32(buffer, 4) !== 0x00000002) {
    throw new Error('Only v2 pack indexes supported')
  }

  // Get the number of hashes in index
  // This is the value of the last fan-out entry
  var hashOffset = 8 + 255 * 4
  const length = readUint32(buffer, hashOffset)
  hashOffset += 4
  const crcOffset = hashOffset + 20 * length
  const lengthOffset = crcOffset + 4 * length
  const largeOffset = lengthOffset + 4 * length
  var checkOffset = largeOffset
  const indexes = new Array(length)
  for (var i = 0; i < length; i++) {
    var start = hashOffset + i * 20
    const hash = buffer.slice(start, start + 20)
    const crc = readUint32(buffer, crcOffset + i * 4)
    var offset = readUint32(buffer, lengthOffset + i * 4)
    if (offset & 0x80000000) {
      offset = largeOffset + (offset & 0x7fffffff) * 8
      checkOffset = Math.max(checkOffset, offset + 8)
      offset = readUint64(buffer, offset)
    }
    indexes[i] = {
      hash: hash,
      offset: offset,
      crc: crc
    }
  }
  var packChecksum = buffer.slice(checkOffset, checkOffset + 20).toString('hex')
  var checksum = buffer.slice(checkOffset + 20, checkOffset + 40).toString('hex')

  if (checksum !== sha1(buffer.slice(0, checkOffset + 20))) {
    throw new Error('Checksum mistmatch')
  }

  var byHash: { [string]: { offset: number, crc: number } } = {}
  indexes.sort(function(a, b) {
    return a.offset - b.offset
  })
  indexes.forEach(function(data) {
    byHash[data.hash.toString('hex')] = {
      offset: data.offset,
      crc: data.crc
    }
  })
  var offsets: Array<number> = indexes
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

function readUint32(buffer, offset) {
  return (
    ((buffer[offset] << 24) |
      (buffer[offset + 1] << 16) |
      (buffer[offset + 2] << 8) |
      (buffer[offset + 3] << 0)) >>>
    0
  )
}

// Yes this will lose precision over 2^53, but that can't be helped when
// returning a single integer.
// We simply won't support packfiles over 8 petabytes. I'm ok with that.
function readUint64(buffer, offset) {
  var hi =
    ((buffer[offset] << 24) |
      (buffer[offset + 1] << 16) |
      (buffer[offset + 2] << 8) |
      (buffer[offset + 3] << 0)) >>>
    0
  var lo =
    ((buffer[offset + 4] << 24) |
      (buffer[offset + 5] << 16) |
      (buffer[offset + 6] << 8) |
      (buffer[offset + 7] << 0)) >>>
    0
  return hi * 0x100000000 + lo
}
