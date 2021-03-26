// Menu: App Launcher
// Description: Search for an app then launch it
// Author: Zach Zeleznick
// Twitter: @zzxiv
// Shortcut: Alt+A

const {Icns} = await npm('@fiahfy/icns');
const {fileSearch} = await kit('file')

// see https://en.wikipedia.org/wiki/Apple_Icon_Image_format#Icon_types
const formatObjects = [
  { osType: 'icp6', size: 64, format: 'PNG' },
  { osType: 'ic07', size: 128, format: 'PNG' },
  { osType: 'ic08', size: 256, format: 'PNG' },
  { osType: 'ic09', size: 512, format: 'PNG' },
]

const formats = formatObjects.map(({osType}) => osType);

const loadIconSet = async (filepath) => {
  const buf = await readFile(filepath);
  const icns = Icns.from(buf);
  const imgBuffers = icns.images.filter(({osType}) => formats.indexOf(osType) !== -1 );
  // console.log(icns.images[0].osType);
  imgBuffers.sort((a,b) => a.size > b.size ? -1 : a.size < b.size ? 1 : 0) // reverse sort
  return imgBuffers.map((icon) => icon.image);
}

const writeImage = async ({filepath, appName}) => {
  const imageOutLocation = kenvPath("tmp", "images", appName.replace(".app", ".png"));
  const imgBuffers = await loadIconSet(filepath);
  if (!imgBuffers || !imgBuffers.length) {
    console.warn(`Failed to find images for app ${appName} at ${filepath}`);
    return
  }
  await writeFile(imageOutLocation, imgBuffers[0]);
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
await saveIconSets();

let app = await arg('Select app:', choices, true)

let command = `open -a "${app}"`
if (app.endsWith('.prefPane')) {
  command = `open ${app}`
}
exec(command, {
  env: {}, //clear the env. Script NODE_PATH/NODE_OPTIONS may conflict.
})
