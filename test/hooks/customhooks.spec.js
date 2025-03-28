const nock = require('nock')
const assert = require('chai').assert
const BotDriver = require('../../').BotDriver
const Capabilities = require('../../').Capabilities

const echoConnector = ({ queueBotSays }) => {
  return {
    UserSays (msg) {
      const botMsg = { sender: 'bot', sourceData: msg.sourceData, messageText: msg.messageText, testInput: msg.testInput }
      queueBotSays(botMsg)
    }
  }
}

const buildDriver = async (mergeCaps) => {
  const myCaps = Object.assign({
    [Capabilities.PROJECTNAME]: 'customhooks',
    [Capabilities.CONTAINERMODE]: echoConnector
  }, mergeCaps)

  const result = {}
  result.driver = new BotDriver(myCaps)
  result.container = await result.driver.Build()
  return result
}

describe('customhooks.hookfromsrc', function () {
  it('should call hooks from code', async function () {
    let onBuildCalled = false
    let onStartCalled = false
    let onUserSaysCalled = false
    let onBotResponseCalled = false
    let onStopCalled = false
    let onCleanCalled = false
    const { container } = await buildDriver({
      [Capabilities.CUSTOMHOOK_ONBUILD]: () => {
        onBuildCalled = true
      },
      [Capabilities.CUSTOMHOOK_ONSTART]: () => {
        onStartCalled = true
      },
      [Capabilities.CUSTOMHOOK_ONUSERSAYS]: () => {
        onUserSaysCalled = true
      },
      [Capabilities.CUSTOMHOOK_ONBOTRESPONSE]: () => {
        onBotResponseCalled = true
      },
      [Capabilities.CUSTOMHOOK_ONSTOP]: () => {
        onStopCalled = true
      },
      [Capabilities.CUSTOMHOOK_ONCLEAN]: () => {
        onCleanCalled = true
      }
    })
    await container.Start()
    await container.UserSaysText('hallo')
    await container.WaitBotSays()
    await container.Stop()
    await container.Clean()

    assert.isTrue(onBuildCalled)
    assert.isTrue(onStartCalled)
    assert.isTrue(onUserSaysCalled)
    assert.isTrue(onBotResponseCalled)
    assert.isTrue(onStopCalled)
    assert.isTrue(onCleanCalled)
  })
  it('should change meMsg from hook', async function () {
    const { container } = await buildDriver({
      [Capabilities.CUSTOMHOOK_ONUSERSAYS]: ({ meMsg }) => {
        meMsg.testInput = 1
      }
    })
    await container.Start()
    await container.UserSaysText('hallo')
    const botMsg = await container.WaitBotSays()
    await container.Stop()
    await container.Clean()

    assert.equal(botMsg.testInput, 1)
  })
  it('should change botMsg from hook', async function () {
    const { container } = await buildDriver({
      [Capabilities.CUSTOMHOOK_ONBOTRESPONSE]: ({ botMsg }) => {
        botMsg.fromHook = 1
      }
    })
    await container.Start()
    await container.UserSaysText('hallo')
    const botMsg = await container.WaitBotSays()
    await container.Stop()
    await container.Clean()

    assert.equal(botMsg.fromHook, 1)
  })
  it('should call http api from function', async function () {
    const scope = nock('https://gettoken.com')
      .get('/get')
      .reply(200, {
        token: 'thisisausertoken'
      })
      .persist()

    const { container } = await buildDriver({
      [Capabilities.CUSTOMHOOK_ONSTART]: async ({ container, request }) => {
        return fetch('https://gettoken.com/get')
          .then(response => response.json())
          .then(body => {
            container.caps.MYTOKEN = body.token
          })
      }
    })
    await container.Start()
    assert.equal(container.caps.MYTOKEN, 'thisisausertoken')
    scope.persist(false)
  })
})
