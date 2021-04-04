// Menu: Kit aww
// Description: Cute images from r/aww
// Author: Zach Zeleznick
// Twitter: @zzxiv
// Shortcut: cmd shift a

// over-engineering layouts
const { bestFitDecreasing } = await npm('bin-packer');

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
  // image/gif are lies! you need to visit the site to play the gifs (which are mp4s)
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

const buildArray = (n) => {
  let a = new Array(n);
  for (let i = 0; i < n; i++) {
    a[i] = i + 1;
  }
  return a
}

const computeAspectRatio = ({width, height}) => Math.floor(10 * height / width);

const groupImagesNaive = (images, columns) => {
  let groups = [];
  const sizes = images.map(computeAspectRatio);
  const totalHeight = sizes.reduce((a, b) => a + b, 0);
  const n = Math.floor(totalHeight / columns);
  for (let i = 0, j = 0, s = 0; i < images.length; i++) {
    s += sizes[i]
    groups[j] = groups[j] || []
    groups[j].push(images[i])
    if (s >= n) {
      s = 0;
      j++;
    }
  }
  return groups;
}

const sizeOf = ({size}) => size
const getSizes = (bins) => bins.map(v => v.slice().reduce((a, b) => a + sizeOf(b), 0))
const getMaxBin = (bins) => Math.max(...getSizes(bins))
const getMinBin = (bins) => Math.min(...getSizes(bins))
const getDelta = (bins) => getMaxBin(bins) - getMinBin(bins)

const multifit = (data, k) => {
  const total = data.reduce((a, b) => a + sizeOf(b), 0)
  let L = 1
  let U = total
  var i = 0
  var scores = {};
  const naive = Math.floor(total / k);
  const subroutine = (lowerCap, upperCap) => {
    const cap = Math.floor((lowerCap + upperCap) / 2)
    const { bins } = bestFitDecreasing(data, sizeOf, cap)
    const numBins = bins.length
    if (numBins > k) {
      lowerCap = cap + 1
    } else {
      upperCap = cap
    }
    return [lowerCap, upperCap, cap, bins]
  }
  while (L < U) {
    if (i > 100) break;
    console.log(`i: ${i}, L: ${L}, U:${U}`)
    const [l, u, c, bins] = subroutine(L, U)
    L = l
    U = u
    console.log(`Max: ${getMaxBin(bins)}, Delta: ${getDelta(bins)}, Sizes: ${getSizes(bins)}`)
    if (bins.length === k) {
      scores[c] = getDelta(bins)
    }
    i++;
  }
  console.log(JSON.stringify(scores))
  const [cap, score] = Object.entries(scores).reduce((a, b) => b[1] < a[1] ? b : a, [naive, total])
  console.log(cap, score)
  return Number(cap)
}

const groupImagesMultifit = (images, columns) => {
  images = images.map(v => { return {...v, size: computeAspectRatio(v)} })
  const cap = multifit(images, columns)
  const { bins } = bestFitDecreasing(images, sizeOf, cap)
  return bins
}

const injectCss = (html) => {
  // our tailwind build seems to be missing grid css
  // we add some custom styles as well
  const css = `
    .grid {display:grid}
    .grid-cols-2 {grid-template-columns: repeat(2, minmax(0, 1fr))}
    .grid-cols-3 {grid-template-columns: repeat(3, minmax(0, 1fr))}
    .grid div {place-items: center}
    /* hacky masonry layout */
    .grid.grid-cols-3 {column-count: 3; column-gap: 0px;}
    /* custom backgrounds for flair */
    .grid div:nth-child(1n) {background: aliceblue}
    .grid div:nth-child(2n) {background: floralwhite}
    .grid div:nth-child(3n) {background: ivory}
    /* hide input bar */
    input {display: none}
    /* hacky hide overflow */
    .grid div.spanner:nth-child(4n) {display: none}
  `
  const style = `<style type="text/css">${css}</style>`
  return `${style}${html}`
}

const Method = {
   COUNT: 'count',
   EST_SIZE: 'est_size',
   BEST_FIT: 'best_fit',
}


const groupImages = (images, columns, method) => {
  if (method === Method.COUNT) {
    return groupArray(images, Math.floor(images.length / columns))
  } else if (method === Method.EST_SIZE) { 
    return groupImagesNaive(images, columns)
  }
  return groupImagesMultifit(images, columns)
}

const buildPage = (imageObjects) => {
  const sizeOptions = buildArray(10).map(v => (v - 1) * 3 + 9);
  const maxSize = sizeOptions[Math.floor(Math.random() * sizeOptions.length)]
  console.log('maxSize:', maxSize)
  const subset = imageObjects
      .sort((a, b) => { // should already be sorted
        let [x,y] = [a.score, b.score]
        return x > y ? -1 : x < y ? 1 : 0
      })
      .slice(0, maxSize)

  const bins = groupImages(subset, 3, Method.BEST_FIT)
  const modals = bins
    .map(a => `<div class="spanner">${a.map(buildImageModal).join('\n')}</div>`)
    .join('\n')

  const html = `<div class="grid grid-cols-3 pt-1 m-1">${modals}</div>`
  const page = 0 ? html : injectCss(html)
  console.log(page);
  return page
}

const buildImagesPanel = async () => {
  const images = await fetchImages();
  console.log(`Found ${images.length} images`);
  await arg({
    // message: "Search for images:",
    input: " ",
  }, buildPage(images));
}

await buildImagesPanel()

