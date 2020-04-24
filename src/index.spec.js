
const requireUncached = (moduleName) => {
  delete require.cache[require.resolve(moduleName)]
  return require(moduleName)
}

it('can be loaded without throwing exceptions', () => {
  expect(() => {
    requireUncached(`./index`)
  }).not.toThrow()
})
