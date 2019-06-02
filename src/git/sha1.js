// @flow strict
import crypto from 'crypto'

export function sha1(data: Buffer): string {
  const shasum = crypto.createHash('sha1')
  shasum.update(data)
  return shasum.digest('hex')
}
