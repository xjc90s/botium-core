const path = require('path')
const assert = require('chai').assert
const DefaultCapabilities = require('../../src/Defaults').Capabilities
const ScriptingProvider = require('../../src/scripting/ScriptingProvider')

describe('tree.buildconversationtreeview', function () {
  it('should build shared convo node on messageText', async function () {
    const scriptingProvider = new ScriptingProvider(DefaultCapabilities)
    await scriptingProvider.Build()
    await scriptingProvider.ReadScriptsFromDirectory(path.resolve(__dirname, 'convos', 'tree', 'simpletree'))

    const tree = scriptingProvider.GetConversationFlowView()
    assert.equal(tree.length, 1)
    assert.equal(tree[0].convos.length, 2)
    assert.equal(tree[0].childNodes.length, 1)
    assert.equal(tree[0].childNodes[0].childNodes.length, 2)
  })
  it('should build shared convo node on userInput buttons', async function () {
    const scriptingProvider = new ScriptingProvider(DefaultCapabilities)
    await scriptingProvider.Build()
    await scriptingProvider.ReadScriptsFromDirectory(path.resolve(__dirname, 'convos', 'tree', 'withuserinput'))

    const tree = scriptingProvider.GetConversationFlowView()
    assert.equal(tree.length, 1)
    assert.equal(tree[0].convos.length, 2)
    assert.equal(tree[0].childNodes.length, 1)
    assert.equal(tree[0].childNodes[0].childNodes.length, 2)
  })
  it('should detect loops', async function () {
    const scriptingProvider = new ScriptingProvider(DefaultCapabilities)
    await scriptingProvider.Build()
    await scriptingProvider.ReadScriptsFromDirectory(path.resolve(__dirname, 'convos', 'tree', 'withloop'))

    const tree = scriptingProvider.GetConversationFlowView({ detectLoops: true, summarizeMultiSteps: false })
    assert.equal(tree.length, 1)
    assert.equal(tree[0].convos.length, 2)
    assert.equal(tree[0].convos[0].header.name, 'convo1')
    assert.deepEqual(tree[0].convos[0].convoStepIndices, [0, 3])
    assert.equal(tree[0].convos[1].header.name, 'convo2')
    assert.deepEqual(tree[0].convos[1].convoStepIndices, [0, 3])
    assert.equal(tree[0].childNodes[0].childNodes[0].childNodes[0].ref, tree[0].hash)
  })
  it('should build dot file', async function () {
    const scriptingProvider = new ScriptingProvider(DefaultCapabilities)
    await scriptingProvider.Build()
    await scriptingProvider.ReadScriptsFromDirectory(path.resolve(__dirname, 'convos', 'tree', 'withloop'))

    const dot = scriptingProvider.GetConversationFlowDot({ detectLoops: true, summarizeMultiSteps: false })
    assert.include(dot, '[label="#bot - Welcome BUTTONS(path1,path2)"]')
    assert.include(dot, '[label="#bot - This is path 2"]')
  })
})
