/**
 * 构建 sai2-window-float 安装包（Windows / Python 3）。
 * 用法：npm run build
 * 产物：dist/sai2-window-float-<version>.zip，顶层目录为 sai2-window-float/。
 */
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { execFileSync } = require('node:child_process')

const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const STAGE = path.join(DIST, 'stage')
const PKG = path.join(STAGE, 'sai2-window-float')
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'plugin.json'), 'utf8'))
const zipPath = path.join(DIST, `sai2-window-float-${manifest.version}.zip`)

function removeDir(target) {
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true })
}

function main() {
  removeDir(STAGE)
  fs.mkdirSync(PKG, { recursive: true })
  for (const file of ['plugin.json', 'index.js', 'README.md']) {
    fs.copyFileSync(path.join(ROOT, file), path.join(PKG, file))
  }

  if (fs.existsSync(zipPath)) fs.rmSync(zipPath, { force: true })
  fs.mkdirSync(DIST, { recursive: true })
  execFileSync('python', [path.join(__dirname, 'make_zip.py'), PKG, zipPath], { stdio: 'inherit' })

  const bytes = fs.readFileSync(zipPath)
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex')
  console.log(`built: ${zipPath}`)
  console.log(`bytes: ${bytes.length}`)
  console.log(`sha256: ${sha256}`)
}

main()
