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
  // lcass="h-full w-full p-1"
  return `<div>${img}</div>`
}

const injectCss = (html) => {
  // our tailwind build seems to be missing grid css
  const css = `
    .grid {display:grid}
    .grid-cols-2 {grid-template-columns: repeat(2, minmax(0, 1fr))}
    .grid-center {place-items: center}
  `
  const style = `<style type="text/css">${css}</style>`
  return `${style}${html}`
}

const buildPage = (imageObjects) => (input) => {
  const modals = imageObjects.slice(0,9).map(buildImageModal)
  // can't figure out how to get column heights to match
  // grid grid-cols-2 grid-center
  const html = `<div class="">${modals.join('\n')}</div>`
  const page = injectCss(html)
  console.log(page);
  return page
}

// .filter(({name}) => name.match(matcher) !== null)

// .map(({views, score, link, id, title}) => { 
//   return 
// })

const buildImagesRxPanel = async () => {
  const images = await fetchImages();
  console.log(`Found ${images.length} images`);
  await arg({
    message: "Search for images:",
    input: " ",
  }, buildPage(images));
}

await buildImagesRxPanel()

