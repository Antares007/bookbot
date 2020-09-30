// @flow strict
const pako = require("../../lib/pako");
const { static_cast } = require("../utils/static_cast");
const { inflate } = pako;
const p = require("../purry");
const { join, dirname } = require("path");

const chartotype: Array<1 | 2 | 3 | 4> = Array(115);
chartotype[111] = 1;
chartotype[114] = 2;
chartotype[108] = 3;
chartotype[97] = 4;
const emptyTreeHash = "4b825dc642cb6eb9a060e54bf8d69288fbee4904";

export type mode_t = "40000" | "100644" | "100755" | "120000" | "160000";
export type object_t = 1 | 2 | 3 | 4;
export type commit_t = {|
  tree: string,
  parents: Array<string>,
  author: string,
  committer: string,
  message: string,
|};
export type tree_t = {| [string]: {| mode: mode_t, hash: hash_t |} |};
export type tag_t = {
  object: string,
  type: object_t,
  tag: string,
  tagger: string,
  message: string,
};
export opaque type hash_t: Buffer = Buffer;
export function hashFrom(sha1: string): hash_t {
  if (/^[A-Fa-f0-9]{40}$/.test(sha1)) return Buffer.from(sha1, "hex");
  throw new Error("invalid sha1 string");
}
export type fs_t = {
  readdir: (string) => (p.pith_t<ErrnoError, Array<string>>) => void,
  open: (string, string) => (p.pith_t<ErrnoError, number>) => void,
  read: (
    number,
    Buffer,
    number,
    number,
    ?number
  ) => (p.pith_t<ErrnoError, number, Buffer>) => void,
  close: (number) => (p.pith_t<ErrnoError>) => void,
  readFile: (string) => (p.pith_t<ErrnoError, Buffer>) => void,
};
export function readRaw(
  fs: fs_t,
  gitdir: string,
  hash: hash_t
): (
  p.pith_t<
    DecompressError | ErrnoError | Error | p.RaceError,
    Buffer,
    1 | 2 | 3 | 4
  >
) => void {
  const filename = join(
    gitdir,
    "objects",
    hash.toString("hex", 0, 1),
    hash.toString("hex", 1)
  );
  return p.purry(
    p.pcatch(
      p.trycatch(
        p.purry(
          p.purry(fs.readFile(filename), (b) => (o) =>
            o.value(Buffer.from(pako.inflate(b)))
          ),
          deframe
        )
      ),
      (e) => (o) => {
        if (e.code === "ENOENT") o.value();
        else o.error(e);
      }
    ),
    (b, t) => (o) => {
      if (b && t) o.value(b, t);
      else readPackedRaw(fs, join(gitdir, "objects", "pack"), hash)(o);
    }
  );
}
function deframe(
  buffer: Buffer
): (p.pith_t<empty, Buffer, 1 | 2 | 3 | 4>) => void {
  return (o) =>
    o.value(buffer.slice(buffer.indexOf(0x00) + 1), chartotype[buffer[1]]);
}
function readPackedRaw(fs: fs_t, packdir: string, hash: hash_t) {
  return p.purry(fs.readdir(packdir), (names) =>
    p.race(
      names
        .filter((n) => n.endsWith(".idx"))
        .map(map.bind(null, fs, packdir, hash))
    )
  );
}
function map(
  fs: fs_t,
  packdir: string,
  hash: hash_t,
  indexfilename: string
): (
  p.pith_t<DecompressError | Error | ErrnoError, Buffer, 1 | 2 | 3 | 4>
) => void {
  const length = 2 << 13;
  const read = (fd, off) =>
    p.purry(
      fs.read(fd, Buffer.allocUnsafe(length), 0, length, off),
      (bytesRead, buffer) => (o) => o.value(buffer.slice(0, bytesRead))
    );
  return p.purry(
    p.purry(
      fs.readFile(join(packdir, indexfilename)),
      readInx.bind(null, hash)
    ),
    (off, crc) =>
      p.purry(
        fs.open(join(packdir, indexfilename.slice(0, -4) + ".pack"), "r"),
        (fd) => {
          const rec = (off) =>
            p.purry(read(fd, off), (buffer) =>
              p.purry(
                decodepackoffset(read.bind(null, fd), off, buffer),
                (buffer, type, hash, baseoff) => (o) =>
                  type === 6
                    ? p.purry(rec(off - baseoff), (base, type) =>
                        p.trycatch((o) =>
                          o.value(applyDelta(buffer, base), type)
                        )
                      )(o)
                    : type === 7
                    ? readRaw(fs, dirname(dirname(packdir)), hash)(o)
                    : o.value(buffer, type)
              )
            );
          return p.purry(rec(off), (buffer, type) =>
            p.purry(fs.close(fd), () => (o) => o.value(buffer, type))
          );
        }
      )
  );
}
export class DecompressError extends Error {}
function decodepackoffset(
  read: (number) => (p.pith_t<ErrnoError, Buffer>) => void,
  off: number,
  buffer: Buffer
): (
  p.pith_t<
    DecompressError | ErrnoError | Error,
    Buffer,
    1 | 2 | 3 | 4 | 6 | 7,
    hash_t,
    number
  >
) => void {
  return p.trycatch((o) => {
    var offset = 0;
    var byte = buffer[offset++];
    const type = static_cast<1 | 2 | 3 | 4 | 6 | 7>((byte >> 4) & 0x7);
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
    const done = (decompressedData) => (o) =>
      decompressedData.length !== size
        ? o.error(new DecompressError("Size mismatch"))
        : o.value(Buffer.from(decompressedData), type, hash, ref);
    const deflateheaderlength = 13;
    if (offset + size + deflateheaderlength > buffer.length)
      return p.purry(decompress(read, off + offset), done)(o);
    else return done(pako.inflate(buffer.slice(offset)))(o);
  });
}
function decompress(
  read,
  off,
  i = new pako.Inflate()
): (p.pith_t<DecompressError | ErrnoError, Uint8Array>) => void {
  return p.purry(read(off), (b) => (o) => {
    i.push(b, 2);
    if (i.result) return o.value((i.result: Uint8Array));
    if (i.error)
      return o.error(new DecompressError("pako errorno: " + i.error));
    if (b.length === 0)
      return o.error(new DecompressError("decompress b.length===0"));
    decompress(read, off + b.length, i)(o);
  });
}
export class HashNotFoundError extends Error {}
function readInx(
  hash: hash_t,
  buffer: Buffer
): (p.pith_t<HashNotFoundError | Error, number, number>) => void {
  return p.trycatch((o) => {
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
        return o.value(offset, crc);
      }
    }
    return o.error(new HashNotFoundError("hash not in package"));
  });
}
function applyDelta(delta: Buffer, base: Buffer): Buffer {
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
export function decodeCommit<E>(body: Buffer): (p.pith_t<E, commit_t>) => void {
  var i = 0;
  var key;
  var tree = emptyTreeHash;
  const parents = [];
  var author = "";
  var committer = "";
  while ((key = body[i]) !== 0x0a) {
    if (key === 112 /*parent*/) {
      parents.push(body.toString("binary", (i += 7), (i += 40)));
    } else if (key === 97 /*author*/) {
      author = body.toString("utf8", (i += 7), (i = body.indexOf(0x0a, i)));
    } else if (key === 99 /*committer*/) {
      committer = body.toString("utf8", (i += 10), (i = body.indexOf(0x0a, i)));
    } /*tree*/ else {
      tree = body.toString("binary", (i += 5), (i += 40));
    }
    i++;
  }
  const message = body.toString("utf8", ++i);
  return (o) => o.value({ tree, parents, author, committer, message });
}
export function decodeTree(buffer: Buffer): (p.pith_t<empty, tree_t>) => void {
  const length = buffer.length;
  const entries = {};
  var i = 0;
  while (i < length) {
    const mode = buffer.toString("binary", i, (i = buffer.indexOf(0x20, i)));
    const name = buffer.toString("utf8", ++i, (i = buffer.indexOf(0x00, i)));
    const hash = buffer.slice(++i, (i += 20));
    entries[name] = { mode, hash };
  }
  return (o) => o.value(entries);
}
export function decodeTag(buffer: Buffer): (p.pith_t<empty, tag_t>) => void {
  const tag = {};
  var i = 0;
  while (buffer[i] !== 0x0a)
    (tag[
      buffer.toString("binary", i, (i = buffer.indexOf(0x20, i)))
    ] = buffer.toString("utf8", ++i, (i = buffer.indexOf(0x0a, i)))),
      i++;
  i++;
  tag.message = buffer.toString("utf8", i, buffer.length);
  return (o) => o.value(tag);
}
function logIndexFile(
  buffer,
  fanOutTable,
  hashTable,
  crcTable,
  offsetTable,
  largeTable
) {
  for (let i = 0; i < 256; i++)
    console.log(
      i.toString(16).padStart(2, "0"),
      buffer.readUInt32BE(fanOutTable + i * 4)
    );
  const table = [];
  var t;
  for (let i = 0, l = buffer.readUInt32BE(fanOutTable + 255 * 4); i < l; i++) {
    table.push([
      buffer.slice(hashTable + i * 20, hashTable + i * 20 + 20).toString("hex"),
      buffer.readUInt32BE(crcTable + i * 4),
      (t = buffer.readUInt32BE(offsetTable + i * 4)),
      t & 0x80000000
        ? (t = buffer.slice(
            largeTable + (t & 0x7fffffff) * 8,
            largeTable + (t & 0x7fffffff) * 8 + 8
          )).toString("hex")
        : (t = null),
      t && t.readUIntBE(2, 6),
    ]);
  }
  console.log(table.filter((r) => r[2] & 0x80000000));
  console.log(table.filter((r) => !(r[2] & 0x80000000))[0]);
  console.log(table.filter((r) => r[0].slice(0, 2) === "f9"));
}
