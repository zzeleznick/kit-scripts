// Menu: Kit Scripts
// Description: View + Copy Scripts
// Author: Zach Zeleznick
// Twitter: @zzxiv

const Prism = await npm('prismjs')
// Load per suggestion on https://github.com/PrismJS/prism/issues/1171#issuecomment-470929808
await npm('prismjs/plugins/custom-class/prism-custom-class')
// injects into Prism.plugins (e.g run 'console.log(Object.keys(Prism.plugins))' before + after)

const scriptsDB = db("kit-scripts", { scripts: [] });
const scriptsRef = scriptsDB.get("scripts");

const owner = `eggheadio`
const repo = `scriptkit.app`
const branch = `main`
const treepath = `public/scripts/johnlindquist`
const ref = `${branch}:${treepath}`

const fetchScript = async (name) => {
  const scriptUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${treepath}/${name}`;
  const response = await get(scriptUrl);
  const raw = response.data;
  return raw
}

// adapted from kit/cli/info.js
const getByMarker = marker => text => {
  const exp = new RegExp(`${marker}(.*)`);
  const match = text.match(exp)
  if (!match) return
  return match[1].trim()
}

const extractMetadata = (text) => {
  const mapping = {
    menu: 'Menu:',
    description: 'Description:',
    author: 'Author:',
    twitter: 'Twitter:',
  }
  return Object.entries(mapping)
      .reduce((a, [k,v]) => {
        return {...a, [k]: getByMarker(v)(text)}
  }, {});
}

const loadScript = async (name) => {
  const cached = scriptsRef.find({ name }).value();
  if (cached) {
    console.log(`Using cached for: ${name}`)
    return cached
  }
  const text = await fetchScript(name);
  const metadata = {...extractMetadata(text), name}
  const payload = { text, ...metadata}
  scriptsRef.insert(payload).write();
  return payload
}

// const options = {
//   name: 'hello-world',
//   description: 'Enter an name, speak it back',
//   author: 'John Lindquist',
//   social: '@johnlindquist',
// }

// The code snippet you want to highlight, as a string
// const code = `
// // Menu: Hello World
// // Description: Enter an name, speak it back
// // Author: John Lindquist
// // Twitter: @johnlindquist
// let {say} = await kit('speech')
// let name = await arg("What's your name?")
// say("Hello, " + "name" + "!")
// `


// see https://github.com/PrismJS/prism/blob/master/plugins/custom-class/prism-custom-class.js

// Prism.plugins.customClass.add(({language, type, content}) => {
//   if (language === 'javascript') {
//     return 'overflow-scroll';
//   }
// });

const buildCodeBlock = (code) => {
  const html = Prism.highlight(code, Prism.languages.javascript, 'javascript');
  return `<div class="h-full p-1 text-xs w-screen"><pre><code>${html}</code></pre></div>` 
}

const smallTextify = (field) => {
  return field ? `<div class="text-xs">${field}</div>` : ''
}

const buildCodeModal = (payload) => {
  let {name, text: code, description, author, twitter} = payload;
  const block = buildCodeBlock(code)
  name = name ? `<div class="text-lg text-bold">${name.split('.')[0]}</div>` : ''
  const meta = [name].concat([description, author, twitter].map(smallTextify)).join('\n');
  // ideally add some fancier styles like 'box-border border-4 bg-white' here
  const header = `<div class="h-full p-3">${meta}</div>`
  const style = "border: solid; border-width:2px; border-color:rgba(0, 0, 0, .025); overflow: scroll;"
  return `<div class="h-full w-full mb-2 p-1 pb-2" style="${style}">${header}${block}</div>`
}

const injectCss = (html) => {
  // see https://unpkg.com/prism-theme-night-owl@1.4.0/build/light.css
  // from https://github.com/SaraVieira/prism-theme-night-owl
  const css = `code[class*=language-],pre[class*=language-]{color:#403f53;font-family:Consolas,Monaco,"Andale Mono","Ubuntu Mono",monospace;text-align:left;white-space:pre;word-spacing:normal;word-break:normal;word-wrap:normal;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-hyphens:none;-moz-hyphens:none;-ms-hyphens:none;hyphens:none}code[class*=language-] ::-moz-selection,code[class*=language-]::-moz-selection,pre[class*=language-] ::-moz-selection,pre[class*=language-]::-moz-selection{text-shadow:none;background:#fbfbfb}code[class*=language-] ::selection,code[class*=language-]::selection,pre[class*=language-] ::selection,pre[class*=language-]::selection{text-shadow:none;background:#fbfbfb}@media print{code[class*=language-],pre[class*=language-]{text-shadow:none}}pre[class*=language-]{padding:1em;margin:.5em 0;overflow:auto}:not(pre)>code[class*=language-],pre[class*=language-]{color:#fff;background:#fbfbfb}:not(pre)>code[class*=language-]{padding:.1em;border-radius:.3em;white-space:normal}.token.cdata,.token.comment,.token.prolog{color:#989fb1;font-style:italic}.token.punctuation{color:#994cc3}.namespace{color:#0c969b}.token.deleted{color:rgba(239,83,80,.56);font-style:italic}.token.keyword,.token.operator,.token.property,.token.symbol{color:#0c969b}.token.tag{color:#994cc3}.token.boolean{color:#bc5454}.token.number{color:#aa0982}.language-css .token.string,.style .token.string,.token.builtin,.token.char,.token.constant,.token.entity,.token.string,.token.url{color:#4876d6}.token.doctype,.token.function,.token.selector{color:#994cc3;font-style:italic}.token.attr-name,.token.inserted{color:#4876d6;font-style:italic}.token.atrule,.token.attr-value,.token.class-name{color:#111}.token.important,.token.regex,.token.variable{color:#c96765}.token.bold,.token.important{font-weight:700}.token.italic{font-style:italic}`
  const style = `<style type="text/css">${css}</style>`
  return `${style}${html}`
}

const buildPage = async () => {
  const payload = await loadScript('anime-search.js');
  const modals = [buildCodeModal(payload), buildCodeModal(payload)].join('\n');
  const html = `<div style="overflow: hidden;">${modals}</div>`
  const page = injectCss(html)
  console.log(page);
  return page
}



const page = await(buildPage);

await arg("View page:", page)
