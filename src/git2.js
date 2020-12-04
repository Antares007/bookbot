const { B, C } = require("./abc");
const purry = require("./purry2");
const { join, dirname } = require("path");
const pako = require("../lib/pako");

const emptyTreeHash = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";
const numtype2strtype = ["", "commit", "tree", "blob", "tag"];
const strtype2numtype = { commit: 1, tree: 2, blob: 3, tag: 4 };

const decodepackoffset = B(({ n: [off], f: [read], o: [buffer] }) => (o) => {
  var offset = 0;
  var byte = buffer[offset++];
  const type = (byte >> 4) & 0x7;
  var size = byte & 0xf;
  var left = 4;
  while (byte & 0x80) {
    byte = buffer[offset++];
    size |= (byte & 0x7f) << left;
    left += 7;
  }
  size = size >>> 0;
  var ref;
  var hash;
  if (type === 7) {
    hash = buffer.slice(offset, (offset += 20));
  } else if (type === 6) {
    byte = buffer[offset++];
    ref = byte & 0x7f;
    while (byte & 0x80) {
      byte = buffer[offset++];
      ref = ((ref + 1) << 7) | (byte & 0x7f);
    }
  }
  const done = B(({ o: [decompressedData] }) => (o) => {
    decompressedData.length !== size
      ? C(o, "error", "Size mismatch")
      : C(o, Buffer.from(decompressedData), type, hash, ref);
  });
  const deflateheaderlength = 13;
  if (offset + size + deflateheaderlength > buffer.length)
    return C(purry, C(decompress, read, off + offset, new pako.Inflate()), done)(o);
  else return C(done, pako.inflate(buffer.slice(offset)))(o);
});
const decompress = B(({ n: [off], f: [read], o: [i] }) =>
  C(
    purry,
    C(read, off),
    B(({ o: [b] }) => (o) => {
      i.push(b, 2);
      if (i.result) return C(o, i.result);
      if (i.error) return C(o, "error", "pako errorno: " + i.error);
      if (b.length === 0) return C(o, "error", "decompress b.length===0");
      C(decompress, read, off + b.length, i)(o);
    })
  )
);
const readInx = B(({ o: [buffer, hash] }) => (o) => {
  var offset, lastCmp, L, R;
  const fanOutTable = 8;
  const hashTable = fanOutTable + 256 * 4;
  const n = buffer.readUInt32BE(fanOutTable + 255 * 4);
  const crcTable = hashTable + n * 20;
  const offsetTable = crcTable + n * 4;
  const largeTable = offsetTable + n * 4;
  //logIndexFile( buffer, fanOutTable, hashTable, crcTable, offsetTable, largeTable);
  offset = fanOutTable + hash[0] * 4;
  R = buffer.readUInt32BE(offset);
  L = 0;
  do offset -= 4;
  while ((L = offset < fanOutTable ? 0 : buffer.readUInt32BE(offset)) === R);
  while (L <= R) {
    const m = ((L + R) / 2) | 0;
    const rez = buffer
      .slice((offset = hashTable + m * 20), offset + 20)
      .compare(hash);
    if (rez < 0) L = m + 1;
    else if (rez > 0) R = m - 1;
    else {
      offset = buffer.readUInt32BE(offsetTable + m * 4);
      if (offset & 0x80000000)
        offset = buffer.readUIntBE(
          largeTable + (offset & 0x7fffffff) * 8 + 2,
          6
        );
      const crc = buffer.readUInt32BE(crcTable + m * 4);
      return C(o, offset, crc);
    }
  }
  return C(o, "error", "hash not in package");
});
const map = B(({ s: [packdir, indexfilename], f: [fs], o: [hash] }) => {
  const length = 2 << 13;
  const read = B(({ n: [fd, off] }) =>
    C(
      purry,
      C(fs, "read", fd, Buffer.allocUnsafe(length), 0, length, off),
      B(({ n: [bytesRead], o: [buffer] }) => (o) =>
        C(o, buffer.slice(0, bytesRead))
      )
    )
  );
  return C(
    purry,
    C(
      purry,
      C(fs, "readFile", join(packdir, indexfilename)),
      B(({ o: [b] }) => C(readInx, b, hash))
    ),
    B(({ n: [off, crc] }) =>
      C(
        purry,
        C(fs, "open", join(packdir, indexfilename.slice(0, -4) + ".pack"), "r"),
        B(({ n: [fd] }) => {
          const rec = ({ n: [off] }) =>
            C(
              purry,
              C(read, fd, off),
              B(({ o: [buffer] }) =>
                C(
                  purry,
                  C(
                    decodepackoffset,
                    B(({ n: [off] }) => C(read, fd, off)),
                    off,
                    buffer
                  ),
                  B(
                    ({
                      n: [type, baseoff = null],
                      o: [b, hash = null],
                    }) => (o) =>
                      type === 6
                        ? C(
                            purry,
                            C(rec, off - baseoff),
                            B(({ n: [type], o: [base] }) => (o) =>
                              C(o, applyDelta(b, base), type)
                            )
                          )(o)
                        : type === 7
                        ? C(
                            purry,
                            C(readRaw, fs, dirname(dirname(packdir)), hash),
                            B(({ n: [t], o: [b] }) => (o) =>
                              C(o, b, strtype2numtype[t])
                            )
                          )(o)
                        : C(o, b, type)
                  )
                )
              )
            );
          return C(
            purry,
            C(rec, off),
            B(({ n: [t], o: [b] }) =>
              C(
                purry,
                C(fs, "close", fd),
                B(() => (o) => C(o, b, t))
              )
            )
          );
        })
      )
    )
  );
});
const readPackedRaw = B(({ s: [packdir], f: [fs], o: [hash] }) => {
  return C(
    purry,
    C(fs, "readdir", packdir),
    B(({ o: [names] }) =>
      C(
        purry,
        "race",
        ...names
          .filter((n) => n.endsWith(".idx"))
          .map((n) => C(map, packdir, n, fs, hash))
      )
    )
  );
});
const readRaw = B(({ s: [gitdir], f: [fs], o: [hash] }) => {
  const filename = join(
    gitdir,
    "objects",
    hash.toString("hex", 0, 1),
    hash.toString("hex", 1)
  );
  return C(
    purry,
    C(
      purry,
      "catch",
      C(
        purry,
        C(fs, "readFile", filename),
        B(function ({ o: [b] }) {
          return (o) => {
            var offset;
            const buffer = Buffer.from(pako.inflate(b));
            const type = buffer.toString(
              "binary",
              0,
              (offset = buffer.indexOf(0x20))
            );
            const value = buffer.slice(buffer.indexOf(0x00, offset) + 1);
            C(o, value, type);
          };
        })
      ),
      B(function ({ s: [t = "error", ...ss], o: [e] }) {
        return (o) => (e.code === "ENOENT" ? C(o) : o(this));
      })
    ),
    B(
      function ({ s: [t], o: [b] }) {
        return (o) => o(this);
      },
      function ({}) {
        return C(
          purry,
          C(readPackedRaw, fs, join(gitdir, "objects", "pack"), hash),
          B(({ n: [t], o: [b] }) => (o) => C(o, b, numtype2strtype[t]))
        );
      }
    )
  );
});
module.exports = readRaw;
function applyDelta(delta, base) {
  var deltaOffset = 0;

  if (base.length !== readLength()) {
    throw new Error("Base length mismatch");
  }

  // Create a new output buffer with length from header.
  var outOffset = 0;
  var out = Buffer.allocUnsafe(readLength());

  while (deltaOffset < delta.length) {
    var byte = delta[deltaOffset++];
    // Copy command.  Tells us offset in base and length to copy.
    if (byte & 0x80) {
      var offset = 0;
      var length = 0;
      if (byte & 0x01) offset |= delta[deltaOffset++] << 0;
      if (byte & 0x02) offset |= delta[deltaOffset++] << 8;
      if (byte & 0x04) offset |= delta[deltaOffset++] << 16;
      if (byte & 0x08) offset |= delta[deltaOffset++] << 24;
      if (byte & 0x10) length |= delta[deltaOffset++] << 0;
      if (byte & 0x20) length |= delta[deltaOffset++] << 8;
      if (byte & 0x40) length |= delta[deltaOffset++] << 16;
      if (length === 0) length = 0x10000;
      // copy the data

      base.slice(offset, offset + length).copy(out, outOffset);
      outOffset += length;
    }
    // Insert command, opcode byte is length itself
    else if (byte) {
      delta.slice(deltaOffset, deltaOffset + byte).copy(out, outOffset);
      deltaOffset += byte;
      outOffset += byte;
    } else throw new Error("Invalid delta opcode");
  }

  if (outOffset !== out.length) {
    throw new Error("Size mismatch in check");
  }

  return out;

  // Read a variable length number our of delta and move the offset.
  function readLength() {
    var byte = delta[deltaOffset++];
    var length = byte & 0x7f;
    var shift = 7;
    while (byte & 0x80) {
      byte = delta[deltaOffset++];
      length |= (byte & 0x7f) << shift;
      shift += 7;
    }
    return length;
  }
}
