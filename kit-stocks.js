// Menu: Kit Stocks
// Description: Display Stocks
// Author: Zach Zeleznick
// Twitter: @zzxiv

const {focusTab} = await kit('chrome')

const defaultSymbols = ["GME", "AMC", "SNAP"];
const apiUrl = `https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&symbols=`

const populateFrom = (symbols) => symbols.map((v, i) => {return {symbol: v, id: `id-${i}` }})

const tickersDB = db("tickers", { tickers: populateFrom(defaultSymbols) });
const tickersRef = tickersDB.get("tickers");

// helper in the case all tickers are removed – we should reinit or return empty result
const initDB = () => {
  const tickers = populateFrom(defaultSymbols);
  tickersDB.set("tickers", tickers).write();
}

const urlToOpen = (ticker) => {
  return `https://finance.yahoo.com/quote/${ticker}?p=${ticker}`
}

const getTickers = () => tickersRef.value()

const tickersToSymbols = () => getTickers().map(({symbol}) => symbol)

const tickersToChoices = () => {
  return getTickers().map(({symbol, id}) => {
    return {
      name: symbol,
      value: id,
    }
  });
}

const getStocks = async (stocks) => {
  stocks = stocks ? stocks : defaultSymbols;
  stocks = Array.isArray(stocks) ? stocks.join(",") : stocks;
  // TODO: ensure stocks is not empty string from empty array case
  const response = await get(`${apiUrl}${stocks}`);
  const { quoteResponse: { result, error } } = response.data;
  // TODO: handle errors 
  // console.log(JSON.stringify(result, null, 2));
  return result;
}

const buildHtml = ({price, priceChange, percentChange}) => {
  let color = 'gray';
  const significance = Math.abs(percentChange) > 0.25; //  arbitray 0.25% cutoff
  // TODO: should filter on significance based on volatility
  price = price.toFixed(2);
  const pct = percentChange.toFixed(2);
  const delta = ""; // priceChange.toFixed(2); // fix styless
  color = significance ? (Math.sign(percentChange) === -1 ? "red" : "green") : color;
  const arrow = Math.sign(percentChange) === -1 ? "↓" : "↑"; 
  return `<div class="h-full w-full p-1 text-xs flex flex-col justify-center items-center font-bold">
      <div>${price}</div>
      <div style="color:${color}">
        <span>${arrow} ${delta}</span>
        <span>${pct}%</span>
      </div>
</div>`
}

const quoteResponseToChoice = (quoteResponse) => {
  const { symbol, displayName, regularMarketPrice,
          regularMarketChange, regularMarketChangePercent,
  } = quoteResponse;
  try {
    return {
      name: symbol,
      value: symbol,
      description: displayName,
      html: buildHtml({
        price: regularMarketPrice,
        priceChange: regularMarketChange,
        percentChange: regularMarketChangePercent,
      }),
    }
  } catch(e) {
    console.error(e);
    return null
  }
}

const listTickers = async () => {
  let symbols = tickersToSymbols();
  if (!symbols || !symbols.length) {
    await arg("Search stocks:", [{
      name: "No Results",
      value: "__empty__",
      description: "Hit enter to reinit default stocks"
    }]);
    initDB();
    return await listTickers();
  }
  const stocks = await getStocks(symbols);
  const choices = stocks.map(quoteResponseToChoice).filter(x => x);
  const selectedTicker = await arg("Search stocks:", choices);
  focusTab(urlToOpen(selectedTicker)); // open tab for quote
}

const addTicker = async () => {
  const symbol = await arg("Select stock to add:");
  tickersRef.insert({ symbol }).write();
  return await addTicker();
};

const removeTicker = async () => {
  const choices = tickersToChoices();
  const id = await arg("Select stock to remove:", choices);
  tickersRef.remove({ id }).write();
  return await removeTicker();
};

onTab("List", listTickers)
onTab("Add", addTicker)
onTab("Remove", removeTicker)


// Feature Log
// v0
// - Basic Functionality
//   - [x] Fetch list of quotes w/ prices
//   - [x] include % change
//   - [x] conditional style of % change
//
// - Bells & Whistles
//   - [x] open selected quote in chrome tab
//
// v1
// - Read + Write Preferences
//   - [x] support create / delete / get saved stocks (e.g. lowdb)
//
// - Bells & Whistles
//   - [x] incorporate onTab API (e.g. onTab("Add", add))
//

// Todos List
// v_n
// - Improve data flow
//   - [ ] simple error checking
//   - [ ] condition values based on "marketState": "POST" / "PRE" / "REGULAR"
//
// - Advanced Styles
//   - [ ] add conditional styles based on marketState
//
// - Display preferences
//   - [ ] toggle between % and abs change
//
// - Read + Write Preferences
//   - [ ] support create / delete / get saved watchlists (e.g. lowdb)
//
// - Bells & Whistles
//   - [ ] toggle between watchlists
//   - [ ] toggle between % and abs change
//
