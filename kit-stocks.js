// Menu: Kit Stocks
// Description: Display Stocks
// Author: Zach Zeleznick
// Twitter: @zzxiv

const {focusTab} = await kit('chrome')

const defaultTickers = ["GME", "AMC", "SNAP"];
const apiUrl = `https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&symbols=`

const tickersDB = db('tickers', { tickers: defaultTickers.map((v, i) => {return {symbol: v, id: i }}) });
const tickersRef = tickersDB.get("tickers");

// TODO: support create / delete / get saved stock watchlist

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
  stocks = stocks ? stocks : defaultTickers;
  stocks = Array.isArray(stocks) ? stocks.join(",") : stocks;
  const response = await get(`${apiUrl}${stocks}`);
  const { quoteResponse: { result, error } } = response.data;
  // TODO: handle errors 
  // console.log(JSON.stringify(result, null, 2));
  return result;
}

const buildHtml = ({price, percentChange}) => {
  let color = 'gray';
  const significance = Math.abs(percentChange) > 0.25; //  arbitray 0.25% cutoff
  // TODO: should filter on significance based on volatility
  const pct = percentChange.toFixed(2);
  color = significance ? (Math.sign(percentChange) === -1 ? "red" : "green") : color;
  return `<div class="h-full w-full p-1 text-xs flex flex-col justify-center items-center font-bold">
      <div>${price}</div>
      <div style="color:${color}">${pct}%</div>
</div>`
}

const quoteResponseToChoice = (quoteResponse) => {
  const { symbol, displayName, regularMarketPrice,
          regularMarketChange, regularMarketChangePercent,
  } = quoteResponse;
  return {
    name: symbol,
    value: symbol,
    description: displayName,
    html: buildHtml({price: regularMarketPrice, percentChange: regularMarketChangePercent}),
  }
}

const listTickers = async () => {
  const symbols = tickersToSymbols();
  const stocks = await getStocks(symbols);
  const choices = stocks.map(quoteResponseToChoice);
  const selectedTicker = await arg("Search stocks:", choices);
  focusTab(urlToOpen(selectedTicker)); // open tab for quote
}

const addTicker = async () => {
  const symbol = await arg("Select stock to add:");
  tickersRef.insert({ symbol }).write();
  return await listTickers();
};

const removeTicker = async () => {
  const choices = tickersToChoices();
  const id = await arg("Select stock to remove", choices);
  tickersRef.remove({ id }).write();
  return await listTickers();
};

onTab("List", listTickers)
onTab("Add", addTicker)
onTab("Remove", removeTicker)

// bad stock drops :/
// cannot remove default stocks

// Feature Log
// V0
// - Basic Functionality
//   - [x] Fetch list of quotes w/ prices
//   - [x] include % change
//   - [x] conditional style of % change
//
// - Bells & Whistles
//   - [x] open selected quote in chrome tab
//

// Todos List
// V0+
// - Improve data flow
//   - [ ] simple error checking
//   - [ ] condition values based on "marketState": "POST" / "PRE" / "REGULAR"
//
// - Read + Write Preferences
//   - [ ] support create / delete / get saved stock watchlist (e.g. lowdb)
//
// - Advanced Styles
//   - [ ] add conditional styles based on marketState
//
// - Display preferences
//   - [ ] toggle between % and abs change
//
// - Bells & Whistles
//   - [ ] toggle between watchlists
//   - [ ] toggle between % and abs change
//   - [ ] incorporate onTab API (e.g. onTab("Add", add))
