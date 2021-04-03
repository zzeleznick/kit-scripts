// Menu: Kit Scripts
// Description: View + Copy Scripts
// Author: Zach Zeleznick
// Twitter: @zzxiv

const Prism = await npm('prismjs')

const scriptsDB = db("kit-scripts", { scripts: [] });
const scriptsRef = scriptsDB.get("scripts");

const owner = `eggheadio`
const repo = `scriptkit.app`
const branch = `main`
const author = `johnlindquist`
const treepath = `public/scripts/${author}`
const ref = `${branch}:${treepath}`

const githubURL = "https://api.github.com/graphql";

let token = env.GITHUB_ACCESS_TOKEN;

const config = {
  headers: {
    "Authorization": `Bearer ${token}`,
  }
}

if (!token) {
  const element = `
  <div class="flex flex-col justify-center">
    <div>
      <a href="https://github.com/settings/tokens/new">Create a token</a> with "public_repo" enabled.
    </div>
    <br>
    <div>
      Then, copy + paste the token above or set <code>GITHUB_REPO_TOKEN</code> inside <code>~/.kenv/.env</code>
    </div>
  </div>`

  token = await env("GITHUB_ACCESS_TOKEN", {
    info: `Create and enter your personal access token`,
    choices: element,
  });
}

const repoTreeQuery = `
query {
  repository(owner: "${owner}", name: "${repo}") {
    object(expression: "${ref}") {
      ... on Tree {
        entries {
          name,
          oid,
        }
      }
    }
  }
}`

const fetchTreeObjects = async () => {
  let response;
  try {
    response = await post(githubURL,
      {
        query: repoTreeQuery
      },
      config
    );
  }
  catch (err) {
    console.warn("fetchTreeObjects failed:", err);
    return
  }
  const graphqlResponse = response.data;
  // console.log(repoTreeQuery, graphqlResponse);
  const {
    data: {
      repository: {
        object: {
          entries
        }
      }
    }
  } = graphqlResponse;
  return entries
}

const fetchScript = async (name) => {
  const scriptUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${treepath}/${name}`;
  // NOTE: https://scriptkit.app/scripts/${author}/${name} should also work by design
  const response = await get(scriptUrl);
  return response.data;
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


const loadScriptBundle = async (name, oid) => {
  const entry = scriptsRef.find({ name });
  const cached = entry.value();
  if (cached) {
    console.log(`Found cached for: ${name}`);
    const localOid = cached.oid;
    if (localOid === oid) {
      console.log(`No remote changes for: ${name}`);
      return cached
    }
    console.log(`Git object mismatch for: ${name} – local:${localOid} != remote:${oid}`);
  }
  console.log(`Fetching remote ${name}`);
  const text = await fetchScript(name);
  const metadata = extractMetadata(text);
  console.log(`Fetched remote ${name} with metadata: ${JSON.stringify(metadata)}`);
  const payload = { ...metadata, text, name, oid}
  // TODO: should probably remove old files
  // TODO: should clean up this function – doing too much
  if (cached) {
    entry.assign(payload).write()
  } else {
    scriptsRef.insert(payload).write();
  }
  return payload
}

// MARK: currently unused
const injectCustomClass = async () => {
  // Load per suggestion on https://github.com/PrismJS/prism/issues/1171#issuecomment-470929808
  // Source: https://github.com/PrismJS/prism/blob/master/plugins/custom-class/prism-custom-class.js
  await npm('prismjs/plugins/custom-class/prism-custom-class')
  // injects into Prism.plugins (e.g run 'console.log(Object.keys(Prism.plugins))' before + after)
  Prism.plugins.customClass.add(({language, type, content}) => {
    if (language === 'javascript') {
      return 'overflow-scroll';
    }
  });
}

const buildCodeBlock = (code) => {
  const html = Prism.highlight(code, Prism.languages.javascript, 'javascript');
  return `<div class="h-full p-1 pt-2 pb-2 text-xs w-screen"><pre><code>${html}</code></pre></div>` 
}

const smallTextify = (field) => {
  return field ? `<div class="text-xs">${field}</div>` : ''
}

// NOTE: couldn't trigger the app.on('open-url') and would instead get the app in a bad state ...
// const buildUrl = (name) => `kit://${name.split('.')[0]}?url=https://${repo}/scripts/${author}/${name}`

const buildUrl = (name) => `https://${repo}/scripts/${author}/${name.split('.')[0]}`

const buildCodeModal = (payload) => {
  let {name, text: code, description, author, twitter} = payload;
  const block = buildCodeBlock(code)
  const download = `<a class="group font-mono font-bold inline-flex" href="${buildUrl(name)}">Install</a>`
  name = name ? `<div class="text-lg font-mono font-bold">${name.split('.')[0]}</div>` : ''
  const row = `<div class="flex w-full justify-between">${name}${download}</div>`
  const meta = [row].concat([description, author, twitter].map(smallTextify)).join('\n');
  // ideally add some fancier styles like 'box-border border-4 bg-white' here
  const metaStyle = "border-bottom: 2px solid rgba(0, 0, 0, .025)"
  const header = `<div class="h-full p-3" style="${metaStyle}">${meta}</div>`
  const style = "border: 2px solid rgba(0, 0, 0, .05); overflow: scroll;"
  return `<div class="h-full w-full p-1 pb-2 mb-2 " style="${style}">${header}${block}</div>`
}

const injectCss = (html) => {
  // see https://unpkg.com/prism-theme-night-owl@1.4.0/build/light.css
  // source: https://github.com/SaraVieira/prism-theme-night-owl
  const css = `code[class*=language-],pre[class*=language-]{color:#403f53;font-family:Consolas,Monaco,"Andale Mono","Ubuntu Mono",monospace;text-align:left;white-space:pre;word-spacing:normal;word-break:normal;word-wrap:normal;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-hyphens:none;-moz-hyphens:none;-ms-hyphens:none;hyphens:none}code[class*=language-] ::-moz-selection,code[class*=language-]::-moz-selection,pre[class*=language-] ::-moz-selection,pre[class*=language-]::-moz-selection{text-shadow:none;background:#fbfbfb}code[class*=language-] ::selection,code[class*=language-]::selection,pre[class*=language-] ::selection,pre[class*=language-]::selection{text-shadow:none;background:#fbfbfb}@media print{code[class*=language-],pre[class*=language-]{text-shadow:none}}pre[class*=language-]{padding:1em;margin:.5em 0;overflow:auto}:not(pre)>code[class*=language-],pre[class*=language-]{color:#fff;background:#fbfbfb}:not(pre)>code[class*=language-]{padding:.1em;border-radius:.3em;white-space:normal}.token.cdata,.token.comment,.token.prolog{color:#989fb1;font-style:italic}.token.punctuation{color:#994cc3}.namespace{color:#0c969b}.token.deleted{color:rgba(239,83,80,.56);font-style:italic}.token.keyword,.token.operator,.token.property,.token.symbol{color:#0c969b}.token.tag{color:#994cc3}.token.boolean{color:#bc5454}.token.number{color:#aa0982}.language-css .token.string,.style .token.string,.token.builtin,.token.char,.token.constant,.token.entity,.token.string,.token.url{color:#4876d6}.token.doctype,.token.function,.token.selector{color:#994cc3;font-style:italic}.token.attr-name,.token.inserted{color:#4876d6;font-style:italic}.token.atrule,.token.attr-value,.token.class-name{color:#111}.token.important,.token.regex,.token.variable{color:#c96765}.token.bold,.token.important{font-weight:700}.token.italic{font-style:italic}`
  const style = `<style type="text/css">${css}</style>`
  return `${style}${html}`
}


const createRegEx = (input = '') => {
  input = input.trim().toLowerCase()
  let matcher = input
  try {
    matcher = new RegExp(input)
  } catch (err) {
    console.warn("Invalid expression", input)
  }
  return matcher
}

const fetchAllFileObjects = async () => {
  const entries = await fetchTreeObjects();
  const limit = 50; // fake limit
  const promises = entries.slice(0,limit).map(({name, oid}) => loadScriptBundle(name, oid));
  return await Promise.all(promises);
}

const buildPage = (fileObjects) => (input) => {
  const matcher = createRegEx(input)
  const modals = fileObjects
     .filter(({name}) => name.match(matcher) !== null)
     .map(buildCodeModal)
  const results = `<div style="overflow: hidden;">${modals.join('\n')}</div>`
  const metaPanel = `<div class="text-xl font-semibold font-mono pb-2">Found ${modals.length} hits</div>`
  const html = `<div>${metaPanel}${results}</div>`
  const page = injectCss(html)
  console.log(page);
  return page
}

const buildScriptRxPanel = async () => {
  const objects = await fetchAllFileObjects();
  await arg({
    message: "Search for scripts:",
    input: "",
  }, buildPage(objects));
}

await buildScriptRxPanel()

// const page = await(buildPage);

// await arg("View page:", page)
