// Menu: Kit Stocks
// Description: Display Stocks
// Author: Zach Zeleznick
// Twitter: @zzxiv

const {focusTab} = await kit('chrome')

const apiUrl = `https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&symbols=` 
const defaultTickers = ["GME", "AMC", "SNAP"];

// TODO: support create / delete / get saved stock watchlist

const urlToOpen = (ticker) => {
  return `https://finance.yahoo.com/quote/${ticker}?p=${ticker}`
}
const getStocks = async (stocks) => {
  stocks = stocks ? stocks : defaultTickers.join(',');
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

const validate = async (input) => {
  if (!input) return []
  let results = await getStocks(input)
  return results.map(quoteResponseToChoice);
}

const main = async () => {
  const stocks = await getStocks();
  const choices = stocks.map(quoteResponseToChoice);
  let selectedTicker = await arg("Search stocks:", choices);
  focusTab(urlToOpen(selectedTicker)); // open tab for quote
}

main();



// Feature Log
// V0
// - Basic Functionality
//    - [x] Fetch list of quotes w/ prices
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
