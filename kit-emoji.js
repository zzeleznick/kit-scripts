// Menu: Kit Emojis
// Description: View + Copy Emojis
// Author: Zach Zeleznick
// Twitter: @zzxiv
// Shortcut: cmd e

const emojisDB = db("emojis", { emojis: {} });
const emojisRef = emojisDB.get("emojis");

// NOTE: Should extract this into a lib since emojis db used in kit-discussions ...
const fetchEmojis = async () => {
  // Could install and use as an npm package, but we just need a k-v map ...
  const emojiURL = 'https://raw.githubusercontent.com/omnidan/node-emoji/master/lib/emoji.json';
  const response = await get(emojiURL);
  const emojis = response.data;
  emojisDB.set("emojis", emojis).write();
}

const setupEmojis = async () => {
  const emojis = emojisRef.value();
  if (!emojis || !Object.keys(emojis).length) {
    await fetchEmojis()
  }
  return emojis
}

const createRegEx = (input = '') => {
  input = input.trim().toLowerCase()
  // NOTE: don't check length here for snappy ux
  // input = input.length < 3 ? '' : input
  let matcher = input
  try {
    matcher = new RegExp(input)
  } catch (err) {
    console.warn("Invalid expression", input)
  }
  return matcher
}

const showEmojis = (emojis) => (input) => {
  const matcher = createRegEx(input)
  const inner = Object.entries(emojis)
    .filter(([k,v]) => k.match(matcher) !== null)
    .map(([k,v]) => `<div class="flex h-10 w-full justify-start items-center">
        <div class="text-base font-bold font-sans mr-8"> ${v} </div>
        <div class="text-xs font-mono"> ${k} </div>
    </div>`).join('\n');
  const html = `
  <div class="grid grid-cols-1">
   ${inner}
  </div>`
  return html
}

const buildEmojisRxPanel = async () => {
  const emojis = await setupEmojis();
  await arg({
    message: "Search for emoji:",
    input: "",
  }, showEmojis(emojis));
}

const buildEmojisChoices = async () => {
  const emojis = await setupEmojis();
  const choices = Object.entries(emojis)
    .map(([k,v]) => {
    return {
      name: k,
      value: v,
      html: `<div> ${v} </div>`
    }
  });
  const emoji = await arg("Search for emoji:", choices);
  copy(emoji);
}

const panel = true // would be nice to set based on whether shift is pressed with shortcut cmd

panel ? await buildEmojisRxPanel() : await buildEmojisChoices();


// NOTE: tabs don't play nicely with choices + panels

// onTab("Choices", buildChoicesEmojis);
// onTab("Panel", buildReactivePrompt);

