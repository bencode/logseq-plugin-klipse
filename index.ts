import '@logseq/libs'

const dott = '```'

const main = async () => {
  logseq.Editor.registerSlashCommand('Create Klipse snippet', async (e) => {
    await logseq.Editor.insertAtEditingCursor(`
${dott}js
{{renderer :klipse_${e.uuid}}}
`)
  })

  logseq.App.onMacroRendererSlotted(async ({ slot, payload: { uuid, arguments: args } }) => {
    const [type] = args
    if (type?.indexOf(':klipse_') !== 0) {
      return
    }

    const block = await logseq.Editor.getBlock(uuid)
    if (block) {
      const content = block.content
      const match = content.match(/```([a-zA-Z]*)\n([\s\S]*?)```/)
      const lang = match?.[1]
      const code = match?.[2]
      if (code && lang) {
        console.log('Extracted lang:', lang)
        console.log('Extracted code:', code)
        const result = 110
        logseq.provideUI({
          key: `klipse_${uuid}_${slot}`,
          slot,
          reset: true,
          template: `<div>${result}</div>`,
        })
      }
    }
  })
}

logseq.ready(main).catch(console.error)
