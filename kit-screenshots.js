// Menu: Kit Screenshots
// Description: View Screenshots
// Author: Zach Zeleznick
// Twitter: @zzxiv
// Shortcut: cmd shift l

const { bestFitDecreasing } = await npm('bin-packer');

const LIMIT = 1000;

// NOTE: options to use "-ctime -90d" / "-atime -90d"
// can read with stat -f "%a" / stat -f "%c"

const DIR = "~/Desktop"
const TYPE = "png"
const MAX_DEPTH = "1"

const FINDER = {
  FIND: "find",
  MDFIND: "mdfind",
}

const mdfindCommand = `mdfind "kMDItemFSName = '*.${TYPE}'" -onlyin ${DIR}`

const findCommand = `find ${DIR} -name "*.${TYPE}" -maxdepth ${MAX_DEPTH}`

const findSortedCommand = `${findCommand} -print0 | xargs -0 ls -at`

const getImages = () => {
  return exec(findSortedCommand, { silent: true }).toString().split("\n").filter(v => v)
}

// See https://github.com/shelljs/shelljs#execcommand--options--callback
const execAsync = (cmd, options = {}) => {
  return new Promise((resolve, reject) => {
    // Execute the command, reject if we exit non-zero (i.e. error)
    exec(cmd, options, (code, stdout, stderr) => {
      if (code) return reject(new Error(stderr || code));
      return resolve(stdout);
    });
  });
}

const testAsync = async () => {
  const commands = [
    'echo "id:2 $(date)" && sleep 2 && echo "id:2 $(date) - did sleep for 2"',
    'echo "id:1 $(date)" && sleep 1 && echo "id:1 $(date) - did sleep for 1"',
    'echo "id:3 $(date)" && sleep 3 && echo "id:3 $(date) - did sleep for 3"',
  ]

  await Promise.all( commands.map(v => execAsync(v)) )
}

// mdls is about 2x slower
// const buildCommand = (file) => `mdls -name kMDItemPixelHeight -name kMDItemPixelWidth '${file}'`
// | awk -F"=" '{print $2}' | tr '\n' ' '`

const extractMetadata = async (file) => {
  const cmd = `sips -g pixelHeight -g pixelWidth '${file}' && stat -f "time: %c" '${file}'`
  let stdout
  try {
    stdout = await execAsync(cmd, {silent: true})
  } catch(err) {
    console.warn(`File: "${file}" failed with error: ${err}`);
  }
  const [height, width, created] = stdout.trim().split("\n")
          .slice(1,) // toss first line of sips
          .map(v => Number(v.split(":")[1].trim()))
          .slice(0, 3)
  return {
    file,
    height,
    width,
    created: new Date(created * 1000),
  }
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

const consumeBatch = async (files) => await Promise.all(files.map(f => extractMetadata(f)))

// Adapted from https://github.com/rxaviers/async-pool/blob/master/lib/es7.js
async function asyncPool(poolLimit, array, iteratorFn) {
  const ret = [];
  const executing = [];
  for (const item of array) {
    const p = Promise.resolve().then(() => iteratorFn(item, array));
    ret.push(p);

    if (poolLimit <= array.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= poolLimit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}

const getImagesAndMetadataBatched = async () => {
  const files = getImages().slice(0, LIMIT)
  const groups = groupArray(files, 12) // max of 12 per go (should use a pool)
  let results = []
  var i = 1;
  for (var g of groups) {
    console.log(`Batch: ${i}`);
    i++;
    results = results.concat(await consumeBatch(g))
  }
  console.log('Results', JSON.stringify(results, null, 2))
  return results
}

const getImagesAndMetadata = async () => {
  let files = getImages()
  console.log(`Found ${files.length} files, limiting to ${LIMIT}`);
  files = files.slice(0, LIMIT)
  let results;
  console.log('getImagesAndMetadata: Pool start')
  try {
    results = await asyncPool(32, files, extractMetadata)
  } catch (err) {
    console.warn(err);
  }
  console.log('getImagesAndMetadata: Finished')
  // console.log('Results', JSON.stringify(results, null, 2))
  return results
}

const buildImageModal = (payload) => {
  let {file} = payload;
  const img = `<img src="${file}">`
  return `<div>${img}</div>`
}

const computeAspectRatio = ({width, height}) => Math.floor(100 * height / width);

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
    .grid-cols-4 {grid-template-columns: repeat(4, minmax(0, 1fr))}
    .grid-cols-5 {grid-template-columns: repeat(5, minmax(0, 1fr))}
    .grid div {place-items: center; padding: clamp(1px, 4%, 25px);}
    /* hacky masonry layout */
    .grid.grid-cols-3 {column-count: 3; column-gap: 0px;}
    .grid.grid-cols-4 {column-count: 4; column-gap: 0px;}
    .grid.grid-cols-5 {column-count: 5; column-gap: 0px;}
    /* custom backgrounds for flair */
    /* prevent jagged space */
    .grid div.spanner {display: flex; flex-direction: column; justify-content: space-between;}
  `
  const style = `<style type="text/css">${css}</style>`
  return `${style}${html}`
}

const buildPage = (imageObjects) => {
  const maxLength = LIMIT; // fake limit
  const subset = imageObjects
      .filter(v => computeAspectRatio(v) <= 200)
      .slice(0, maxLength)

  const columns = subset.length > 32 ? (subset.length > 64 ? 5 : 4) : 3
  const bins = groupImagesMultifit(subset, columns)

  const modals = bins
    .map(a => `<div class="spanner">
      ${a.sort((a, b) => { // sort desc along the column
        let [x,y] = [a.created, b.created]
        return x > y ? -1 : x < y ? 1 : 0
      }).map(buildImageModal).join('\n')}
      </div>`)
    .join('\n')

  const html = `<div class="grid grid-cols-${columns} pt-1 m-1">${modals}</div>`
  const page = 0 ? html : injectCss(html)
  // console.log(page);
  console.log('buildPage: Done')
  return page
}

const buildImagesPanel = async () => {
  console.log('getImagesAndMetadata')
  const images = await getImagesAndMetadata();
  console.log(`Found ${images.length} images`);
  await arg({
    // message: "Search for images:",
    input: " ",
  }, buildPage(images));
}

await buildImagesPanel()
