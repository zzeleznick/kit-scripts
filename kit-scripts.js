// Menu: Kit Scripts
// Description: View + Copy Scripts
// Author: Zach Zeleznick
// Twitter: @zzxiv

const Prism = await npm('prismjs')
// Load per suggestion on https://github.com/PrismJS/prism/issues/1171#issuecomment-470929808
await npm('prismjs/plugins/custom-class/prism-custom-class')

// The code snippet you want to highlight, as a string
const code = `
// Menu: Hello World
// Description: Enter an name, speak it back
// Author: John Lindquist
// Twitter: @johnlindquist
let {say} = await kit('speech')
let name = await arg("What's your name?")
say("Hello, " + "name" + "!")
`

console.log(Prism.plugins);
console.log(Object.keys(Prism.plugins));
// see https://github.com/PrismJS/prism/blob/master/plugins/custom-class/prism-custom-class.js

// Prism.plugins.customClass.add(({language, type, content}) => {
//   if (language === 'javascript') {
//     return 'block';
//   }
// });

// Returns a highlighted HTML string
const html = Prism.highlight(code, Prism.languages.javascript, 'javascript');

// see https://unpkg.com/prism-theme-night-owl@1.4.0/build/light.css
// from https://github.com/SaraVieira/prism-theme-night-owl
const css = `code[class*=language-],pre[class*=language-]{color:#403f53;font-family:Consolas,Monaco,"Andale Mono","Ubuntu Mono",monospace;text-align:left;white-space:pre;word-spacing:normal;word-break:normal;word-wrap:normal;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-hyphens:none;-moz-hyphens:none;-ms-hyphens:none;hyphens:none}code[class*=language-] ::-moz-selection,code[class*=language-]::-moz-selection,pre[class*=language-] ::-moz-selection,pre[class*=language-]::-moz-selection{text-shadow:none;background:#fbfbfb}code[class*=language-] ::selection,code[class*=language-]::selection,pre[class*=language-] ::selection,pre[class*=language-]::selection{text-shadow:none;background:#fbfbfb}@media print{code[class*=language-],pre[class*=language-]{text-shadow:none}}pre[class*=language-]{padding:1em;margin:.5em 0;overflow:auto}:not(pre)>code[class*=language-],pre[class*=language-]{color:#fff;background:#fbfbfb}:not(pre)>code[class*=language-]{padding:.1em;border-radius:.3em;white-space:normal}.token.cdata,.token.comment,.token.prolog{color:#989fb1;font-style:italic}.token.punctuation{color:#994cc3}.namespace{color:#0c969b}.token.deleted{color:rgba(239,83,80,.56);font-style:italic}.token.keyword,.token.operator,.token.property,.token.symbol{color:#0c969b}.token.tag{color:#994cc3}.token.boolean{color:#bc5454}.token.number{color:#aa0982}.language-css .token.string,.style .token.string,.token.builtin,.token.char,.token.constant,.token.entity,.token.string,.token.url{color:#4876d6}.token.doctype,.token.function,.token.selector{color:#994cc3;font-style:italic}.token.attr-name,.token.inserted{color:#4876d6;font-style:italic}.token.atrule,.token.attr-value,.token.class-name{color:#111}.token.important,.token.regex,.token.variable{color:#c96765}.token.bold,.token.important{font-weight:700}.token.italic{font-style:italic}`
const style = `<style type="text/css">${css}</style>`
const container = `<div class="h-full w-full p-1 text-xs"><pre><code>${html}</code></pre></div>`
const page = `${style}${container}`
console.log(page);

await arg("View page:", page)
