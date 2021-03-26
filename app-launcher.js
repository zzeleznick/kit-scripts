// Menu: App Launcher
// Description: Search for an app then launch it
// Author: Zach Zeleznick
// Twitter: @zzxiv
// Shortcut: Alt+A

const {Icns} = await npm('@fiahfy/icns');
const {decode} = await npm('@fiahfy/packbits');
const {PNG} = await npm('pngjs');

const sharp = await npm('sharp');

const {fileSearch} = await kit('file')

// see https://en.wikipedia.org/wiki/Apple_Icon_Image_format#Icon_types
const formatObjects = [
  { osType: 'icp6', size: 64, format: 'PNG' },
  { osType: 'ic07', size: 128, format: 'PNG' },
  { osType: 'ic08', size: 256, format: 'PNG' },
  { osType: 'ic09', size: 512, format: 'PNG' },
]

const formats = formatObjects.map(({osType}) => osType);
const iconSizes = {
  icp6: 64,
  ic07: 128,
  ic08: 256,
  ic09: 512,
}

const loadIconSet = async (filepath) => {
  const buf = await readFile(filepath);
  const icns = Icns.from(buf);
  const imgBuffers = icns.images.filter(({osType}) => formats.indexOf(osType) !== -1 );
  console.log("loadIconSet -", `filepath:${filepath} `, JSON.stringify(
    icns.images.map(({osType, bytes}) => { return {osType, bytes, size: iconSizes[osType] }}), null, 2)
  );
  // console.log("loadIconSet:", icns.images[0].osType);
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
  const tempLocation = imageOutLocation.replace(".png", "_tmp.png");
  const buf = imgBuffers[0]
  const decodedBuff = decode(buf.image, { format: 'icns' });

  console.log(`${filepath}, ${buf.size}, ${decodedBuff.length}`);

  const png = new PNG({
      width: buf.size,
      height: buf.size,
      colorType: 6,
      // filterType: -1
  });
  // new Jimp({ data: buffer, width: 1280, height: 768 }, (err, image) => { });

  for (var y = 0; y < png.height; y++) {
      for (var x = 0; x < png.width; x++) {
          var idx = (png.width * y + x) << 2;
          png.data[idx  ] = decodedBuff[idx  ]// 255; // red
          png.data[idx+1] = decodedBuff[idx]// 218; // green
          png.data[idx+2] = decodedBuff[idx]// 185; // blue
          png.data[idx+3] = decodedBuff[idx]// 128; // alpha (0 is transparent)
      }
  }
  // const options = { colorType: 6 };
  // var buffer = PNG.sync.write(png, options);
  await png.pack().pipe(createWriteStream(tempLocation));
  return

  await writeFile(tempLocation, image, 'binary');
  // try resizing
  // imgBuffers[0] : Input buffer contains unsupported image format
  // Cannot use same file for input and output
  // writing and then reading –> still unsupported image format
  // kit.png has weird encoding and cannot be read :/
  // Note: console.error is not piped
  if (filepath.match(/Kit.app/) || filepath.match(/Tunnelblick.app/) || filepath.match(/iMovie.app/)) {
    console.log(image);
    const metadata = await sharp(tempLocation).metadata()
                           .catch(err => { console.warn(`Failed to find metadata: ${tempLocation}, error: ${err}`) })
    console.log(`metadata:${JSON.stringify(metadata)}`);
  }
  await sharp(tempLocation).resize(128, 128).png().toFile(imageOutLocation)
        .catch(err => { console.warn(`Failed to decode: ${tempLocation}, error: ${err}`) })
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
  for (let i = iconSets.length - 1; i >= 0; i--) {
    await writeImage(iconSets[i]);
  }
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
    const img = value.startsWith('/Applications') ? `file://${kenvPath("tmp", "images", appName.replace(".app", ".png"))}` : null;
    img ? console.log(img) : null;
    return {
      name: appName.replace(/(\.app)$|(\.prefPane)$/, ''),
      value,
      description: value,
      img,
    }
  })
}


// kit image is broken :/
// should only display if it exists

// fetchIconSets();
// await loadIconSet('/Applications/Kit.app/Contents/Resources/Kit.icns'); // only found ic09
await saveIconSets();


let app = await arg('Select app:', choices, true)

let command = `open -a "${app}"`
if (app.endsWith('.prefPane')) {
  command = `open ${app}`
}
exec(command, {
  env: {}, //clear the env. Script NODE_PATH/NODE_OPTIONS may conflict.
})
