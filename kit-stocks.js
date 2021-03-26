// Menu: Kit Stocks
// Description: Display Stocks
// Author: Zach Zeleznick
// Twitter: @zzxiv

let {focusTab} = await kit('chrome')

const makeRequest = async () => {
	const response = await get("https://httpbin.org/get");
	const data = response.data;
	console.log(JSON.stringify(data, null, 2));
	return data;
}

// makeRequest()

const baseUrl = `https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&symbols=` 
const openUrl = `https://finance.yahoo.com/quote/SNAP?p=SNAP`

const urlForTicker = (ticker) => {
	return `https://finance.yahoo.com/quote/${ticker}?p=${ticker}`
}

const getStocks = async (stocks) => {
	stocks = stocks ? stocks : ["GME", "AMC", "SNAP"].join(',');
	const response = await get(`${baseUrl}${stocks}`);
	const data = response.data;
	const { quoteResponse: { result, error } } = data;
	console.log(JSON.stringify(result, null, 2));
	return result;
}

const quoteToChoice = (quote) => {
	const { symbol, displayName, regularMarketPrice,
			regularMarketChange, regularMarketChangePercent,
	} = quote;
	const buildHtml = () => {
		let color = 'gray';
		const p = regularMarketChangePercent;
		const significance = Math.abs(p) > 0.25 // should filter on significance based on volatility; arbitray 0.25% cutoff  
		const pct = (p).toFixed(2)
		color = significance ? (Math.sign(p) === -1 ? "red" : "green") : color
		// className="flex flex-row"
		return `<div class="h-full w-full p-1 text-xs flex flex-col justify-center items-center font-bold">
      		<div>${regularMarketPrice}</div>
      		<div style="color:${color}">${pct}%</div>
      </div>`
	}
	return {
      name: quote.symbol,
      value: quote.symbol,
      description: quote.displayName,
      html: buildHtml(),
    }
}

const validate = async (input) => {
  if (!input) return []
  let results = await getStocks(input)
  return results.map(quoteToChoice);
}

const stocks = await getStocks();
console.log('stocks:', typeof(stocks), stocks.length);

const choices = stocks.map(quoteToChoice);

// ideally can pre-fill w/o args :/
 
let result = await arg(
{
    message: "Search stocks:",
    validate: getStocks,
},
  choices
);

// Add remove / add watch list and use save from minmist for stock list
// Price change and other options
// consider using "marketState": "POST" checks
// and pre / post html updates

console.log(`${result}: result`);
// maybe open in new tab with quote

// open tab for quote
focusTab(urlForTicker(result));

// Note: incorporate onTab API?

// onTab("Add", add)
// onTab("Toggle", toggle)

