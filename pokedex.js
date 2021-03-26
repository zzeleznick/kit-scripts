// Menu: Pokedex
// Description: Display pokemon
// Author: Zach Zeleznick
// Twitter: @zzxiv

const {focusTab} = await kit('chrome')

// pulled from https://pokeapi.co/api/v2/generation/1 ($.pokemon_species)
const pokemon = [
    {
      "name": "bulbasaur",
      "id": "1"
    },
    {
      "name": "charmander",
      "id": "4"
    },
    {
      "name": "squirtle",
      "id": "7"
    },
    {
      "name": "caterpie",
      "id": "10"
    },
    {
      "name": "weedle",
      "id": "13"
    },
    {
      "name": "pidgey",
      "id": "16"
    },
    {
      "name": "rattata",
      "id": "19"
    },
    {
      "name": "spearow",
      "id": "21"
    },
    {
      "name": "ekans",
      "id": "23"
    },
    {
      "name": "sandshrew",
      "id": "27"
    },
    {
      "name": "nidoran♀",
      "id": "29"
    },
    {
      "name": "nidoran♂",
      "id": "32"
    },
    {
      "name": "vulpix",
      "id": "37"
    },
    {
      "name": "zubat",
      "id": "41"
    },
    {
      "name": "oddish",
      "id": "43"
    },
    {
      "name": "paras",
      "id": "46"
    },
    {
      "name": "venonat",
      "id": "48"
    },
    {
      "name": "diglett",
      "id": "50"
    },
    {
      "name": "meowth",
      "id": "52"
    },
    {
      "name": "psyduck",
      "id": "54"
    },
    {
      "name": "mankey",
      "id": "56"
    },
    {
      "name": "growlithe",
      "id": "58"
    },
    {
      "name": "poliwag",
      "id": "60"
    },
    {
      "name": "abra",
      "id": "63"
    },
    {
      "name": "machop",
      "id": "66"
    },
    {
      "name": "bellsprout",
      "id": "69"
    },
    {
      "name": "tentacool",
      "id": "72"
    },
    {
      "name": "geodude",
      "id": "74"
    },
    {
      "name": "venusaur",
      "id": "3"
    },
    {
      "name": "charmeleon",
      "id": "5"
    },
    {
      "name": "charizard",
      "id": "6"
    },
    {
      "name": "wartortle",
      "id": "8"
    },
    {
      "name": "blastoise",
      "id": "9"
    },
    {
      "name": "metapod",
      "id": "11"
    },
    {
      "name": "butterfree",
      "id": "12"
    },
    {
      "name": "kakuna",
      "id": "14"
    },
    {
      "name": "beedrill",
      "id": "15"
    },
    {
      "name": "pidgeotto",
      "id": "17"
    },
    {
      "name": "pidgeot",
      "id": "18"
    },
    {
      "name": "raticate",
      "id": "20"
    },
    {
      "name": "fearow",
      "id": "22"
    },
    {
      "name": "arbok",
      "id": "24"
    },
    {
      "name": "pikachu",
      "id": "25"
    },
    {
      "name": "raichu",
      "id": "26"
    },
    {
      "name": "sandslash",
      "id": "28"
    },
    {
      "name": "nidorina",
      "id": "30"
    },
    {
      "name": "nidoqueen",
      "id": "31"
    },
    {
      "name": "nidorino",
      "id": "33"
    },
    {
      "name": "nidoking",
      "id": "34"
    },
    {
      "name": "clefairy",
      "id": "35"
    },
    {
      "name": "clefable",
      "id": "36"
    },
    {
      "name": "ninetales",
      "id": "38"
    },
    {
      "name": "jigglypuff",
      "id": "39"
    },
    {
      "name": "wigglytuff",
      "id": "40"
    },
    {
      "name": "golbat",
      "id": "42"
    },
    {
      "name": "gloom",
      "id": "44"
    },
    {
      "name": "vileplume",
      "id": "45"
    },
    {
      "name": "parasect",
      "id": "47"
    },
    {
      "name": "venomoth",
      "id": "49"
    },
    {
      "name": "dugtrio",
      "id": "51"
    },
    {
      "name": "persian",
      "id": "53"
    },
    {
      "name": "golduck",
      "id": "55"
    },
    {
      "name": "primeape",
      "id": "57"
    },
    {
      "name": "arcanine",
      "id": "59"
    },
    {
      "name": "poliwhirl",
      "id": "61"
    },
    {
      "name": "poliwrath",
      "id": "62"
    },
    {
      "name": "kadabra",
      "id": "64"
    },
    {
      "name": "alakazam",
      "id": "65"
    },
    {
      "name": "machoke",
      "id": "67"
    },
    {
      "name": "machamp",
      "id": "68"
    },
    {
      "name": "weepinbell",
      "id": "70"
    },
    {
      "name": "victreebel",
      "id": "71"
    },
    {
      "name": "tentacruel",
      "id": "73"
    },
    {
      "name": "graveler",
      "id": "75"
    },
    {
      "name": "ponyta",
      "id": "77"
    },
    {
      "name": "slowpoke",
      "id": "79"
    },
    {
      "name": "magnemite",
      "id": "81"
    },
    {
      "name": "farfetchd",
      "id": "83"
    },
    {
      "name": "doduo",
      "id": "84"
    },
    {
      "name": "seel",
      "id": "86"
    },
    {
      "name": "grimer",
      "id": "88"
    },
    {
      "name": "shellder",
      "id": "90"
    },
    {
      "name": "gastly",
      "id": "92"
    },
    {
      "name": "onix",
      "id": "95"
    },
    {
      "name": "drowzee",
      "id": "96"
    },
    {
      "name": "krabby",
      "id": "98"
    },
    {
      "name": "voltorb",
      "id": "100"
    },
    {
      "name": "exeggcute",
      "id": "102"
    },
    {
      "name": "cubone",
      "id": "104"
    },
    {
      "name": "lickitung",
      "id": "108"
    },
    {
      "name": "koffing",
      "id": "109"
    },
    {
      "name": "rhyhorn",
      "id": "111"
    },
    {
      "name": "tangela",
      "id": "114"
    },
    {
      "name": "kangaskhan",
      "id": "115"
    },
    {
      "name": "horsea",
      "id": "116"
    },
    {
      "name": "goldeen",
      "id": "118"
    },
    {
      "name": "staryu",
      "id": "120"
    },
    {
      "name": "scyther",
      "id": "123"
    },
    {
      "name": "pinsir",
      "id": "127"
    },
    {
      "name": "tauros",
      "id": "128"
    },
    {
      "name": "magikarp",
      "id": "129"
    },
    {
      "name": "lapras",
      "id": "131"
    },
    {
      "name": "ditto",
      "id": "132"
    },
    {
      "name": "eevee",
      "id": "133"
    },
    {
      "name": "porygon",
      "id": "137"
    },
    {
      "name": "omanyte",
      "id": "138"
    },
    {
      "name": "kabuto",
      "id": "140"
    },
    {
      "name": "aerodactyl",
      "id": "142"
    },
    {
      "name": "articuno",
      "id": "144"
    },
    {
      "name": "zapdos",
      "id": "145"
    },
    {
      "name": "moltres",
      "id": "146"
    },
    {
      "name": "dratini",
      "id": "147"
    },
    {
      "name": "mewtwo",
      "id": "150"
    },
    {
      "name": "rapidash",
      "id": "78"
    },
    {
      "name": "slowbro",
      "id": "80"
    },
    {
      "name": "magneton",
      "id": "82"
    },
    {
      "name": "dodrio",
      "id": "85"
    },
    {
      "name": "dewgong",
      "id": "87"
    },
    {
      "name": "muk",
      "id": "89"
    },
    {
      "name": "cloyster",
      "id": "91"
    },
    {
      "name": "haunter",
      "id": "93"
    },
    {
      "name": "gengar",
      "id": "94"
    },
    {
      "name": "hypno",
      "id": "97"
    },
    {
      "name": "kingler",
      "id": "99"
    },
    {
      "name": "electrode",
      "id": "101"
    },
    {
      "name": "exeggutor",
      "id": "103"
    },
    {
      "name": "marowak",
      "id": "105"
    },
    {
      "name": "hitmonlee",
      "id": "106"
    },
    {
      "name": "hitmonchan",
      "id": "107"
    },
    {
      "name": "weezing",
      "id": "110"
    },
    {
      "name": "rhydon",
      "id": "112"
    },
    {
      "name": "chansey",
      "id": "113"
    },
    {
      "name": "seadra",
      "id": "117"
    },
    {
      "name": "seaking",
      "id": "119"
    },
    {
      "name": "starmie",
      "id": "121"
    },
    {
      "name": "mr-mime",
      "id": "122"
    },
    {
      "name": "jynx",
      "id": "124"
    },
    {
      "name": "electabuzz",
      "id": "125"
    },
    {
      "name": "magmar",
      "id": "126"
    },
    {
      "name": "gyarados",
      "id": "130"
    },
    {
      "name": "vaporeon",
      "id": "134"
    },
    {
      "name": "jolteon",
      "id": "135"
    },
    {
      "name": "flareon",
      "id": "136"
    },
    {
      "name": "omastar",
      "id": "139"
    },
    {
      "name": "kabutops",
      "id": "141"
    },
    {
      "name": "snorlax",
      "id": "143"
    },
    {
      "name": "dragonair",
      "id": "148"
    },
    {
      "name": "dragonite",
      "id": "149"
    },
    {
      "name": "mew",
      "id": "151"
    },
    {
      "name": "ivysaur",
      "id": "2"
    },
    {
      "name": "golem",
      "id": "76"
    }
]

const translations = {
  "mr-mime": "Mr._Mime",
  "farfetchd": "Farfetch'd"
}

const toTitleCase = (str) => {
  return str.split(' ').map(s => s.charAt(0).toUpperCase() + s.substr(1).toLowerCase()).join(' ');
}

const buildImageUrl = (id) => {
  // e.g. https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png
  const baseUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon"
  return `${baseUrl}/${id}.png`
}

const buildOpenUrl = (name) => {
  // e.g. https://bulbapedia.bulbagarden.net/wiki/Nidoran%E2%99%80_(Pok%C3%A9mon)
  const baseUrl = "https://bulbapedia.bulbagarden.net/wiki"
  let translated = translations[name] ? translations[name] : toTitleCase(name);
  return encodeURI(`${baseUrl}/${translated}_(Pokémon)`);
}

const buildChoices = () => {
  return pokemon.map(({name, id}) => {
    return {
      name: toTitleCase(name),
      value: name,
      description: `Pokedex entry: ${id.padStart(3, 0)}`,
      img: buildImageUrl(id)
    }
  });
}

const name = await arg("View Gen 1 Pokemon:", buildChoices());
focusTab(buildOpenUrl(name));
