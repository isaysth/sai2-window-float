/**
 * launcher-float 插件契约测试（从工作台框架 tests/unit/launcher-float.test.ts 移植）。
 * 用 Node 内置 test runner，无外部依赖：node --test tests/
 */
'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')

const ROOT = resolve(__dirname, '..')
const plugin = require('../index.js')

function fakeCtx() {
  const out = {
    configured: null,
    cleaned: 0,
    statuses: [],
    events: new Map(),
    actions: [],
    floats: 0,
    cleanups: []
  }
  const wm = {
    configure: (getter) => { out.configured = getter },
    isFloat: () => out.floats > 0,
    enterFloat: () => { out.floats += 1 },
    toggleFloat: () => { out.floats += 1 }
  }
  const ctx = {
    id: 'launcher-float',
    log: { info: () => undefined, warn: () => undefined, error: () => undefined, debug: () => undefined },
    get: () => wm,
    effect: (fn) => { out.cleaned += 1; out.cleanups.push(fn) },
    setStatus: (text, level = 'ok') => out.statuses.push({ text, level }),
    on: (event, handler) => out.events.set(event, handler),
    addToolbarAction: (a) => out.actions.push(a)
  }
  return { ctx, out, wm }
}

describe('launcher-float 官方插件', () => {
  it('plugin.json 清单合法，依赖 window-manager 服务', () => {
    const m = JSON.parse(readFileSync(resolve(ROOT, 'plugin.json'), 'utf8'))
    assert.equal(m.id, 'launcher-float')
    assert.equal(m.apiVersion, 1)
    assert.equal(m.entry, 'index.js')
    assert.ok(m.inject.includes('window-manager'))
    assert.equal(m.system, false)
    assert.equal(m.name, '启动悬浮球')
    assert.equal(m.version, '1.1.0')
  })

  it('配置表单覆盖全部行为开关', () => {
    for (const key of ['autoFloatOnSai2', 'minimizeToTray', 'closeToTray', 'alwaysOnTop', 'ballSize', 'floatWidth', 'floatHeight']) {
      assert.ok(plugin.configSchema[key], key)
    }
    assert.equal(plugin.configSchema.autoFloatOnSai2.default, true)
    assert.equal(plugin.configSchema.closeToTray.default, false)
    // 悬浮球直径有界，废弃的宽高仍在（老配置不丢）
    assert.equal(plugin.configSchema.ballSize.default, 88)
    assert.equal(plugin.configSchema.ballSize.min, 48)
    assert.equal(plugin.configSchema.ballSize.max, 160)
    assert.match(plugin.configSchema.floatWidth.label, /已废弃/)
    assert.match(plugin.configSchema.floatHeight.hint, /废弃/)
  })

  it('apply 注入配置 getter、订阅启动事件与手动动作', () => {
    const { ctx, out } = fakeCtx()
    const config = { autoFloatOnSai2: true, minimizeToTray: true, closeToTray: false, alwaysOnTop: true, ballSize: 96, floatWidth: 320, floatHeight: 120 }
    plugin.apply(ctx, config)
    assert.equal(typeof out.configured, 'function')
    assert.deepEqual(
      { floatWidth: out.configured().floatWidth, autoFloatOnSai2: out.configured().autoFloatOnSai2, ballSize: out.configured().ballSize },
      { floatWidth: 320, autoFloatOnSai2: true, ballSize: 96 }
    )
    assert.equal(out.events.has('opener_after_launch'), true)
    assert.equal(out.actions[0]?.id, 'launcher-float.toggle')
    assert.ok(out.statuses.length > 0)
  })

  it('仅在 SAI2 启动时进入悬浮；关掉自动开关后不再触发', () => {
    const { ctx, out } = fakeCtx()
    const config = { autoFloatOnSai2: true, minimizeToTray: false, closeToTray: false, alwaysOnTop: true, floatWidth: 320, floatHeight: 120 }
    plugin.apply(ctx, config)
    const handler = out.events.get('opener_after_launch')
    handler({ openerId: 'opener-ps' })
    assert.equal(out.floats, 0)
    handler({ openerId: 'opener-sai2' })
    assert.equal(out.floats, 1)
    config.autoFloatOnSai2 = false
    handler({ openerId: 'opener-sai2' })
    assert.equal(out.floats, 1)
  })

  it('停用时通过 effect 把窗口管理器复位', () => {
    const { ctx, out } = fakeCtx()
    plugin.apply(ctx, { autoFloatOnSai2: true })
    for (const fn of out.cleanups) fn()
    assert.equal(out.configured, null)
  })
})
