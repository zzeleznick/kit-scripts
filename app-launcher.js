// Menu: App Launcher
// Description: Search for an app then launch it
// Author: Zach Zeleznick
// Twitter: @zzxiv
// Shortcut: Alt+A

const {Icns} = await npm('@fiahfy/icns');
const sharp = await npm('sharp');

const {fileSearch} = await kit('file')

// see https://en.wikipedia.org/wiki/Apple_Icon_Image_format#Icon_types
const iconSizes = {
  icp6: 64,
  ic07: 128,
  ic08: 256,
  ic09: 512,
}

const loadIconSet = async (filepath) => {
  const buf = await readFile(filepath);
  const icns = Icns.from(buf);
  const imgBuffers = icns.images.filter(({osType}) => iconSizes[osType]);
  // console.log("loadIconSet -", `filepath:${filepath} `, JSON.stringify(
  //   icns.images.map(({osType, bytes}) => { return {osType, bytes, size: iconSizes[osType] }}), null, 2)
  // );
  imgBuffers.sort((a,b) => a.size > b.size ? -1 : a.size < b.size ? 1 : 0) // reverse sort
  return imgBuffers.map(({image, osType}) => {return {image, size: iconSizes[osType]}});
}

const writeImage = async ({filepath, appName}) => {
  const imageOutLocation = kenvPath("tmp", "images", appName.replace(".app", ".png"));
  const imgBuffers = await loadIconSet(filepath);
  if (!imgBuffers || !imgBuffers.length) {
    console.warn(`Failed to find images for app ${appName} at ${filepath}`);
    return
  }
  const image = imgBuffers[0].image;
  await writeFile(imageOutLocation, image); // specifying 'binary' does not fix
  // try resizing
  // imgBuffers[0] : Input buffer contains unsupported image format
  // Cannot use same file for input and output
  // writing and then reading –> still unsupported image format
  // kit.png has weird encoding and cannot be read :/
  // Note: console.error is not piped
  // if (filepath.match(/Kit.app/) || filepath.match(/Tunnelblick.app/) || filepath.match(/iMovie.app/)) {
  const metadata = await sharp(imageOutLocation).metadata()
                           .catch(err => { console.warn(`metadata failure: ${imageOutLocation}, error: ${err}`) })
  // console.log(`metadata:${JSON.stringify(metadata)}`);
  // await sharp(tempLocation).resize(128, 128).png().toFile(imageOutLocation)
  //       .catch(err => { console.warn(`Failed to decode: ${tempLocation}, error: ${err}`) })
  // NOTE: metadata contains nice properties like width, height, space, format, 
  return { img: imageOutLocation, success: metadata ? true : false }
}

const createOutDir = () => {
  const imageDir = kenvPath("tmp", "images");
  const cmd = `stat -x ${imageDir} > /dev/null 2>&1 || mkdir -p ${imageDir}`
  exec(cmd, { silent: true });
}

const fetchIconSets = () => {
  // NOTE: could do `find /Applications /System/Applications`
  // but would also miss /System/Library apps and the like
  const cmd = `find /Applications -name "*.icns" -maxdepth 4 2> /dev/null | sort`;
  const out = exec(cmd, { silent: true }).toString().split("\n").filter(v => v)
  let iconSets = out.map((filepath) => {
    return {
      filepath,
      appName: filepath.split('/')[2],
      iconSetName: filepath.split('/').pop()
    }
  });
  iconSets = iconSets.filter((o, i) => !i || (o.appName !== iconSets[i-1].appName));
  console.log(JSON.stringify(iconSets, null, 2));
  return iconSets
}

const saveIconSets = async () => {
  createOutDir();
  const iconSets = fetchIconSets();
  const results = await Promise.all(iconSets.map(v => writeImage(v)));
  // for (let i = iconSets.length - 1; i >= 0; i--) {
  //   await writeImage(iconSets[i]);
  // }
  console.log(JSON.stringify(results, null, 2));
  return results
}


let choices = async () => {
  let apps = await fileSearch('', {
    onlyin: '/',
    kind: 'application',
  })

  let prefs = await fileSearch('', {
    onlyin: '/',
    kind: 'preferences',
  })

  let group = (path) => (apps) =>
    apps
      .filter((app) => app.match(path))
      .sort((a, b) => {
        let aName = a.replace(/.*\//, '')
        let bName = b.replace(/.*\//, '')

        return aName > bName ? 1 : aName < bName ? -1 : 0
      })

  return [
    ...group(/^\/Applications\/(?!Utilities)/)(apps),
    ...group(/\.prefPane$/)(prefs),
    ...group(/^\/Applications\/Utilities/)(apps),
    ...group(/System/)(apps),
    ...group(/Users/)(apps),
  ].map((value) => {
     const appName = value.split('/').pop();
     const imgPath = kenvPath("tmp", "images", appName.replace(".app", ".png"));
     const img = imageMap[imgPath] ? `file://${imgPath}` : null;
     img ? console.log(img) : null;
     return {
       name: appName.replace(/(\.app)$|(\.prefPane)$/, ''),
       value,
       description: value,
       img,
    }
  })
}

// via https://dev.to/afewminutesofcode/how-to-convert-an-array-into-an-object-in-javascript-25a4
const convertArrayToObject = (array, key) => {
  const initialValue = {};
  return array.reduce((obj, item) => {
    return {
      ...obj,
      [item[key]]: item,
    };
  }, initialValue);
};


// kit image is broken :/
// should only display if it exists

// fetchIconSets();
// await loadIconSet('/Applications/Kit.app/Contents/Resources/Kit.icns'); // only found ic09
const imageResults = await saveIconSets();
const imageMap = imageResults.filter(({success}) => success).reduce(
  (obj, item) => {
    return {...obj, [item["img"]]: true}
  }, {} // initial value
);

let app = await arg('Select app:', choices, true)

let command = `open -a "${app}"`
if (app.endsWith('.prefPane')) {
  command = `open ${app}`
}
exec(command, {
  env: {}, //clear the env. Script NODE_PATH/NODE_OPTIONS may conflict.
})
