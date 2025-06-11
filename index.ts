import '@logseq/libs'

const dott = '```'

const main = async () => {
  logseq.Editor.registerSlashCommand('Create Klipse snippet', async (e) => {
    await logseq.Editor.insertAtEditingCursor(`{{renderer :klipse_${e.uuid}}}`)
    await logseq.Editor.insertBlock(
      e.uuid,
      `${dott}javascript
console.log("Hello Klipse!");
${dott}`,
      {
        sibling: false,
        before: false,
      },
    )
  })

  logseq.App.onMacroRendererSlotted(async ({ slot, payload: { uuid, arguments: args } }) => {
    const [type] = args
    if (!type || !type.startsWith(':klipse_')) {
      return
    }

    const id = `klipse-renderer-${uuid}-${slot}`
    const codeData = await getKlipseCodeAndLang(uuid)

    if (codeData) {
      const { lang, code } = codeData
      const escapedCode = escapeHtml(code)

      const klipseTemplate = `
          <div id="${id}">
            <pre class="klipse"><code class="language-${lang}">${escapedCode}</code></pre>
          </div>
        `

      logseq.provideUI({
        key: id,
        slot,
        reset: true,
        template: klipseTemplate,
      })
    }
  })
}

logseq.ready(main).catch(console.error)

async function getKlipseCodeAndLang(uuid: string) {
  const parentBlock = await logseq.Editor.getBlock(uuid, {
    includeChildren: true,
  })
  if (!parentBlock || !parentBlock.children || parentBlock.children.length === 0) {
    console.warn(`logseq-klipse-plugin: Parent block with UUID ${uuid} not found or has no children.`)
    return null
  }

  const cid = parentBlock.children[0].uuid
  const codeBlock = await logseq.Editor.getBlock(cid)

  if (!codeBlock || !codeBlock.content) {
    console.warn(`logseq-klipse-plugin: Code block with UUID ${cid} not found or has no content.`)
    return null
  }

  const codeBlockMatch = codeBlock.content.match(/^```(\S+)\s*\n([\s\S]*?)\n```$/)
  if (codeBlockMatch && codeBlockMatch.length === 3) {
    const lang = codeBlockMatch[1]
    const code = codeBlockMatch[2]
    return { lang, code }
  }

  console.warn(
    `logseq-klipse-plugin: Code block content for ${cid} does not match expected format: ${codeBlock.content}`,
  )
  return null
}

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
