import callSendAPI from "./send-requests";
import fx from "money";
import numbro from "numbro"
import transform from "../util/transform";
import fetchRates from "./web-scraper";

function generate(text) {
  let newText = text.split(" ");
  let currencyFromText = newText[2] ? newText[2].toUpperCase() : null;
  let currencyToText = newText[4] ? newText[4].toUpperCase() : null;
  let fromCurrency = transform(currencyFromText);
  let toCurrency = transform(currencyToText);
  let amount = newText[1];

  if (fromCurrency && toCurrency !== false && !isNaN(amount)) {
    const structure = {
      amount: amount,
      convertCurrencyFrom: fromCurrency,
      convertCurrencyTo: toCurrency
    }
    return structure;
  } else if (fromCurrency !== false && toCurrency === false && !isNaN(amount)) {
    const structure = {
      amount: amount,
      convertCurrencyFrom: fromCurrency
    }
    return structure;
  } else {
    return false;
  }
}

function listener(text) {
  return fetchRates.getRates(data => {

    const ratez = data;
    const rates = `Todays Rates \n\nUSD => ${ratez.usd} \nGBP => ${ratez.gbp} 
EUR => ${ratez.eur} \n\nCURRENCY => BUY / SELL \nData pulled from http://abokifx.com`;

    text = text.toLowerCase();
    if (text === "rates" || text === "rate") {
      return rates;
    } else {
      const response = generate(text);
      let value = "";
      fx.base = "NGN";
      fx.settings = { from: "NGN" };
      fx.rates = {
        "USD": ratez.usd.split(" ")[0],
        "GBP": ratez.gbp.split(" ")[0],
        "EUR": ratez.eur.split(" ")[0],
        "NGN": 1
      }
      if (response.convertCurrencyFrom && response.convertCurrencyTo) {
        value = fx.convert(response.amount, {
          to: response.convertCurrencyFrom,
          from: response.convertCurrencyTo
        });
      } else if (response.convertCurrencyFrom) {
        value = fx.convert(response.amount, {
          to: response.convertCurrencyFrom
        });

      } else {
        return "Sorry there was a problem processing your command \nPlease check the commands on the facebook page \n \
      @ https://facebook.com/fxbot0";
      }
      return numbro(value).format('0,0') + " naira, is what you will get on parallel market";
    }
  });
}

function sendTextMessage(recipientId, messageText) {
  const response = listener(messageText);
  const messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: response
    }
  };
  try {
    callSendAPI(messageData);
  } catch (error) {
    console.log("An error occured");
  }
}

export default sendTextMessage;
