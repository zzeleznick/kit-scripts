// Menu: Kit aww
// Description: Cute images from r/aww
// Author: Zach Zeleznick
// Twitter: @zzxiv

let clientId = env.IMGUR_CLIENT_ID;

if (!clientId) {
  const element = `
  <div class="flex flex-col justify-center">
    <div class="p-2">
      <a href="https://api.imgur.com/oauth2/addclient">Create an imgur API client</a> to get started.
    </div>
    <div class="p-2">
      Then, copy + paste your client id above or set <code>IMGUR_CLIENT_ID</code> inside <code>~/.kenv/.env</code>
    </div>
  </div>`

  clientId = await env("IMGUR_CLIENT_ID", {
    info: `Create and enter your client id`,
    choices: element,
  });
}

const config = {
  headers: {
    "Authorization": `Client-ID ${clientId}`,
    "Content-Type": "application/json",
  }
}

const subreddit = "aww";
const sort = "top";
const range = "day";

const fetchGalleryEntries = async () => {
  const endpoint = `https://api.imgur.com/3/gallery/r/${subreddit}/${sort}/${range}`;
  let response;
  try {
    response = await get(endpoint, config);
  } catch (err) {
    console.warn("fetchGalleryEntries failed:", err);
    return
  }
  const { status, data: {success, data} = {} } = response;
  if (!success) {
    console.warn("fetchGalleryEntries bad response:",
       `success: ${success}, status: ${status}`);
    return
  }
  if (!data || !data.length) {
    console.warn("Malformed data", typeof(data), data)
  }
  return data
}

const fetchImages = async () => {
  const galleryEntries = await fetchGalleryEntries()
  // // image/gif
  // const filtered = galleryEntries.filter(({type}) => type && type.match(/image/))
  return galleryEntries.filter(({type}) => type && type.match(/image\/jpeg/))
}

const buildImageModal = (payload) => {
  let {views, score, link, id, title} = payload;
  const img = `<img src="${link}">`
  return `<div>${img}</div>`
}

const groupArray = (data, n) => {
  let groups = [];
  for (let i = 0, j = 0; i < data.length; i++) {
    if (i >= n && i % n === 0) {
      j++;
    }
    groups[j] = groups[j] || [];
    groups[j].push(data[i])
  }
  return groups;
}



const injectCss = (html) => {
  // our tailwind build seems to be missing grid css
  const css = `
    .grid {display:grid}
    .grid-cols-2 {grid-template-columns: repeat(2, minmax(0, 1fr))}
    .grid-cols-3 {grid-template-columns: repeat(3, minmax(0, 1fr))}
    .grid div {place-items: center}
    .grid.grid-cols-3 {column-count: 3; column-gap: 0px;}
    .grid div:nth-child(1n) {background: aliceblue}
    .grid div:nth-child(2n) {background: floralwhite}
    .grid div:nth-child(3n) {background: ivory}
  `
  const style = `<style type="text/css">${css}</style>`
  return `${style}${html}`
}

const buildPage = (imageObjects) => (input) => {
  let modals = imageObjects
      .sort((a, b) => { // should already be sorted
        let [x,y] = [a.score, b.score]
        return x > y ? -1 : x < y ? 1 : 0
      })
      .slice(0,9)
      .map(buildImageModal)
  modals = groupArray(modals, 3)
      .map(v => `<div class="spanner">${v.join('\n')}</div>`)
  // can't figure out how to get column heights to match
  const html = `<div class="grid grid-cols-3">${modals.join('\n')}</div>`
  const page = 0 ? html : injectCss(html)
  console.log(page);
  return page
}

const buildImagesRxPanel = async () => {
  const images = await fetchImages();
  console.log(`Found ${images.length} images`);
  await arg({
    message: "Search for images:",
    input: " ",
  }, buildPage(images));
}

await buildImagesRxPanel()

