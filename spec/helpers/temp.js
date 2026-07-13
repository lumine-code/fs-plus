const fs = require('fs')
const os = require('os')
const path = require('path')
const crypto = require('crypto')

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fs-plus-spec-'))

process.once('exit', () => {
  fs.rmSync(dir, {recursive: true, force: true})
})

module.exports = {
  dir,
  mkdirSync(prefix = 'temp-') {
    return fs.mkdtempSync(path.join(dir, prefix))
  },
  path() {
    return path.join(dir, crypto.randomUUID())
  },
  track() {}
}
