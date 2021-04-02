// Menu: Kit Colors
// Description: View CSS Colors
// Author: Zach Zeleznick
// Twitter: @zzxiv

// Inspired by colours.neilorangepeel.com
// Also see colors.commutercreative.com/grid

const colors = {"aliceblue":[240,248,255],"antiquewhite":[250,235,215],"aqua":[0,255,255],"aquamarine":[127,255,212],"azure":[240,255,255],"beige":[245,245,220],"bisque":[255,228,196],"black":[0,0,0],"blanchedalmond":[255,235,205],"blue":[0,0,255],"blueviolet":[138,43,226],"brown":[165,42,42],"burlywood":[222,184,135],"cadetblue":[95,158,160],"chartreuse":[127,255,0],"chocolate":[210,105,30],"coral":[255,127,80],"cornflowerblue":[100,149,237],"cornsilk":[255,248,220],"crimson":[220,20,60],"cyan":[0,255,255],"darkblue":[0,0,139],"darkcyan":[0,139,139],"darkgoldenrod":[184,134,11],"darkgray":[169,169,169],"darkgreen":[0,100,0],"darkgrey":[169,169,169],"darkkhaki":[189,183,107],"darkmagenta":[139,0,139],"darkolivegreen":[85,107,47],"darkorange":[255,140,0],"darkorchid":[153,50,204],"darkred":[139,0,0],"darksalmon":[233,150,122],"darkseagreen":[143,188,143],"darkslateblue":[72,61,139],"darkslategray":[47,79,79],"darkslategrey":[47,79,79],"darkturquoise":[0,206,209],"darkviolet":[148,0,211],"deeppink":[255,20,147],"deepskyblue":[0,191,255],"dimgray":[105,105,105],"dimgrey":[105,105,105],"dodgerblue":[30,144,255],"firebrick":[178,34,34],"floralwhite":[255,250,240],"forestgreen":[34,139,34],"fuchsia":[255,0,255],"gainsboro":[220,220,220],"ghostwhite":[248,248,255],"gold":[255,215,0],"goldenrod":[218,165,32],"gray":[128,128,128],"green":[0,128,0],"greenyellow":[173,255,47],"grey":[128,128,128],"honeydew":[240,255,240],"hotpink":[255,105,180],"indianred":[205,92,92],"indigo":[75,0,130],"ivory":[255,255,240],"khaki":[240,230,140],"lavender":[230,230,250],"lavenderblush":[255,240,245],"lawngreen":[124,252,0],"lemonchiffon":[255,250,205],"lightblue":[173,216,230],"lightcoral":[240,128,128],"lightcyan":[224,255,255],"lightgoldenrodyellow":[250,250,210],"lightgray":[211,211,211],"lightgreen":[144,238,144],"lightgrey":[211,211,211],"lightpink":[255,182,193],"lightsalmon":[255,160,122],"lightseagreen":[32,178,170],"lightskyblue":[135,206,250],"lightslategray":[119,136,153],"lightslategrey":[119,136,153],"lightsteelblue":[176,196,222],"lightyellow":[255,255,224],"lime":[0,255,0],"limegreen":[50,205,50],"linen":[250,240,230],"magenta":[255,0,255],"maroon":[128,0,0],"mediumaquamarine":[102,205,170],"mediumblue":[0,0,205],"mediumorchid":[186,85,211],"mediumpurple":[147,112,219],"mediumseagreen":[60,179,113],"mediumslateblue":[123,104,238],"mediumspringgreen":[0,250,154],"mediumturquoise":[72,209,204],"mediumvioletred":[199,21,133],"midnightblue":[25,25,112],"mintcream":[245,255,250],"mistyrose":[255,228,225],"moccasin":[255,228,181],"navajowhite":[255,222,173],"navy":[0,0,128],"oldlace":[253,245,230],"olive":[128,128,0],"olivedrab":[107,142,35],"orange":[255,165,0],"orangered":[255,69,0],"orchid":[218,112,214],"palegoldenrod":[238,232,170],"palegreen":[152,251,152],"paleturquoise":[175,238,238],"palevioletred":[219,112,147],"papayawhip":[255,239,213],"peachpuff":[255,218,185],"peru":[205,133,63],"pink":[255,192,203],"plum":[221,160,221],"powderblue":[176,224,230],"purple":[128,0,128],"rebeccapurple":[102,51,153],"red":[255,0,0],"rosybrown":[188,143,143],"royalblue":[65,105,225],"saddlebrown":[139,69,19],"salmon":[250,128,114],"sandybrown":[244,164,96],"seagreen":[46,139,87],"seashell":[255,245,238],"sienna":[160,82,45],"silver":[192,192,192],"skyblue":[135,206,235],"slateblue":[106,90,205],"slategray":[112,128,144],"slategrey":[112,128,144],"snow":[255,250,250],"springgreen":[0,255,127],"steelblue":[70,130,180],"tan":[210,180,140],"teal":[0,128,128],"thistle":[216,191,216],"tomato":[255,99,71],"turquoise":[64,224,208],"violet":[238,130,238],"wheat":[245,222,179],"white":[255,255,255],"whitesmoke":[245,245,245],"yellow":[255,255,0],"yellowgreen":[154,205,50]};
const colorGroups = {"pink":["pink","lightpink","hotpink","deeppink","palevioletred","mediumvioletred"],"purple":["lavender","thistle","plum","orchid","violet","fuchsia","magenta","mediumorchid","darkorchid","darkviolet","blueviolet","darkmagenta","purple","mediumpurple","mediumslateblue","slateblue","darkslateblue","rebeccapurple","indigo"],"red":["lightsalmon","salmon","darksalmon","lightcoral","indianred","crimson","red","firebrick","darkred"],"orange":["orange","darkorange","coral","tomato","orangered"],"yellow":["gold","yellow","lightyellow","lemonchiffon","lightgoldenrodyellow","papayawhip","moccasin","peachpuff","palegoldenrod","khaki","darkkhaki"],"green":["greenyellow","chartreuse","lawngreen","lime","limegreen","palegreen","lightgreen","mediumspringgreen","springgreen","mediumseagreen","seagreen","forestgreen","green","darkgreen","yellowgreen","olivedrab","darkolivegreen","mediumaquamarine","darkseagreen","lightseagreen","darkcyan","teal"],"cyan":["aqua","cyan","lightcyan","paleturquoise","aquamarine","turquoise","mediumturquoise","darkturquoise"],"blue":["cadetblue","steelblue","lightsteelblue","lightblue","powderblue","lightskyblue","skyblue","cornflowerblue","deepskyblue","dodgerblue","royalblue","blue","mediumblue","darkblue","navy","midnightblue"],"brown":["cornsilk","blanchedalmond","bisque","navajowhite","wheat","burlywood","tan","rosybrown","sandybrown","goldenrod","darkgoldenrod","peru","chocolate","olive","saddlebrown","sienna","brown","maroon"],"white":["white","snow","honeydew","mintcream","azure","aliceblue","ghostwhite","whitesmoke","seashell","beige","oldlace","floralwhite","ivory","antiquewhite","linen","lavenderblush","mistyrose"],"gray":["gainsboro","lightgray","silver","darkgray","dimgray","gray","lightslategray","slategray","darkslategray","black"]}
const allColors = Object.values(colorGroups).reduce((a,b) => a.concat(b), []);

const pickTextColor = ([r, g, b]) => { // Adapted from https://stackoverflow.com/a/3943023
  const L = r * 0.299 + g * 0.587 + b * 0.114;
  return (L > 186) ? "black" : "white";
}

const componentToHex = (v) => v.toString(16).padStart(2, 0)

const rgbToHex = ([r, g, b]) => `#${[r,g,b].map(componentToHex).join('').toUpperCase()}`

const formatRgb = ([r, g, b]) => `rgb(${r},${g},${b})`

const createRegEx = (input = '') => {
  input = input.trim().toLowerCase()
  input = input.length < 3 ? '' : input
  let matcher = input
  try {
    matcher = new RegExp(input)
  } catch (err) {
    console.warn("Invalid expression", input)
  }
  return matcher
}

const showCategory = (category) => (input) => {
  // console.log(`input: ${input}`)
  const dataset = category ? colorGroups[category] : allColors;
  // console.log(`category: ${category}, ${dataset}, ${allColors.length}`)
  const matcher = createRegEx(input)
  const inner = dataset.filter(name => name.match(matcher) !== null).map(name => {
    const rgb = colors[name]
    // console.log(`rgb: ${rgb}, name: ${name}`);
    const color = pickTextColor(rgb);
    return `<div class="flex flex-col h-20 w-full justify-center items-center" style="background: ${name}">
        <div style="color:${color}" class="text-base font-bold font-sans"> ${name.toUpperCase()} </div>
        <div style="color:${color}" class="text-xs font-mono"> ${rgbToHex(rgb)} ${formatRgb(rgb)} </div>
    </div>`
  }).join('\n');
 const html = `
  <div class="grid grid-cols-1">
   ${inner}
  </div>`
  // console.log(`category: ${category}`, html);
  return html
}

const buildReactivePrompt = (name) => async () => {
  await arg({
    message: "Enter a color:", // name, // prompt placeholder
    input: " ", // space set intentionally to trigger render
  }, showCategory(name === "all" ? "" : name))
}

const buildStaticPrompt = (name) => async () => await arg(name, showCategory(name === "all" ? "" : name)(""));

const reactive = false; // it appears that reactive currently has flicker due to a spurious clear panel call

const buildPrompt = reactive ? buildReactivePrompt : buildStaticPrompt;

const buildTabs = () => {
  const groups = Object.keys(colorGroups);
  let tabs = [ {
    name: "All",
    method: buildPrompt("all")
  }];
  groups.map(name => {
    tabs.push( { name, method: buildPrompt(name) } )
  });
  tabs.map(({name, method}) => {
   onTab(name, method);
  });
}

buildTabs();

// NOTE: There were a few options considered for a data source of css colors
// Elected to use `color-name` from https://github.com/colorjs/color-name
// Other contenders:
//   - https://github.com/bahamas10/css-color-names (uses hex codes)
//   - https://github.com/corysimmons/colors.json (archived repo, uses alpha channels + adds transparent color)

// CSS Color Names Confusion
// "140 colors supported by all" browsers: https://www.w3schools.com/colors/colors_names.asp
// "140 colors sorted by hex": https://www.w3schools.com/colors/colors_hex.asp
// yet each page has 148 colors :(
// > nodes = document.querySelectorAll("#main span.colornamespan") // 148
// This is confusing since there seems to be a mismatch between the full list of colors and the grouped colors  

// CSS Color Groupings
// For groups: https://www.w3schools.com/colors/colors_groups.asp
// > nodes = document.querySelectorAll("#main > div.w3-w3-responsive > table tr > td:nth-child(1) a")
// > names = [];
// > for (var i = 0; i < nodes.length; i++) { names.push(nodes[i].innerText.toLowerCase()) }
// > console.log(names); // 141 colors :/

// CSS Investigation
// After using Google Sheets to copy+paste the wiki + w3 grouped color tables and sorting names ...
// The difference is the multiple spelling of gray/grey variants!
// There are 7 pairs of gray colors that have the same color values
