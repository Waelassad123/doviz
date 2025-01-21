// API Anahtarınız
const apiKey = '44527f5e4012bc2b5b9e824e'; // Exchangerate-API veya CurrencyLayer API anahtarınız

// Exchangerate-API URL'si
const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/TRY`;

// Para birimlerinin isimlerini tanımlayan bir nesne
const currencyNames = {
  'USD': 'Amerikan Doları $',
  'EUR': 'Euro €',
  'GBP': 'İngiliz Sterlini £',
  'AUD': 'Avustralya Doları $',
  'CAD': 'Kanada Doları $',
  'TRY': 'Türk Lirası ₺',
  'SAR': 'Suudi Riyali ﷼',
  'AED': 'Birleşik Arap Emirlikleri Dirhemi د.إ',
  'JPY': 'Japon Yeni ¥',
  'INR': 'Hindistan Rupisi',
  'CHF': 'İsviçre Frangı CHF',
  'CNY': 'Çin Yuanı ¥',
  'NZD': 'Yeni Zelanda Doları $',
  'RUB': 'Rus Rublesi руб',
  'MXN': 'Meksika Pesosu $',
  'SYP': 'Suriye Parası ليرة',
  'EGP': 'Mısır Lirası جنيه'
};

// Döviz Kurlarını Almak
async function getCurrencyRates() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.result === "success" || data.success) {
      console.log('Döviz Kurları:', data);
      updateCurrencyRates(data);
      updateCurrencyOptions(data);
    } else {
      console.log('Döviz Kurları alınamadı');
    }
  } catch (error) {
    console.error('API isteği hatası:', error);
  }
}

// Döviz Kurlarını HTML'ye Yerleştirme (Sadece Popüler Döviz Kurları)
function updateCurrencyRates(data) {
  const currencyRatesDiv = document.getElementById('currency-rates');
  const rates = data.conversion_rates || data.quotes; // Exchangerate-API'de conversion_rates, CurrencyLayer'de quotes
  let ratesHTML = '<ul>';

  // Popüler döviz kurlarını buraya ekliyoruz (USD, EUR, GBP vb.)
  const popularCurrencies = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SAR', 'AED', 'JPY', 'INR', 'CHF', 'CNY', 'NZD', 'RUB', 'MXN','SYP','EGP'];

  popularCurrencies.forEach(currency => {
    const rate = rates[currency];
    if (rate) {
      ratesHTML += `<li><strong>${currency} - ${currencyNames[currency] || currency} =</strong> ${(1 / rate).toFixed(4)} TRY</li>`;
    }
  });

  ratesHTML += '</ul>';
  currencyRatesDiv.innerHTML = ratesHTML;
}

// Döviz Kuru Seçeneklerini Güncelleme (Dönüştürme için)
function updateCurrencyOptions(data) {
  const currencyList = Object.keys(data.conversion_rates || data.quotes).map(currency => currency.slice(3)); // USD, EUR, GBP vb.
  const fromCurrencySelect = document.getElementById('from-currency');
  const toCurrencySelect = document.getElementById('to-currency');

  // Seçenekleri temizle
  fromCurrencySelect.innerHTML = '';
  toCurrencySelect.innerHTML = '';

  // Popüler dövizler ve TRY'yi ekle
  const popularCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'TRY', 'CNY', 'SAR', 'AED', 'NZD', 'INR', 'RUB', 'MXN','SYP','EGP'];

  popularCurrencies.forEach(currency => {
    const optionFrom = document.createElement('option');
    optionFrom.value = currency;
    optionFrom.textContent = `${currency} - ${currencyNames[currency] || currency}`;
    fromCurrencySelect.appendChild(optionFrom);

    const optionTo = document.createElement('option');
    optionTo.value = currency;
    optionTo.textContent = `${currency} - ${currencyNames[currency] || currency}`;
    toCurrencySelect.appendChild(optionTo);
  });

  // Başlangıçta Türk Lirası (TRY) seçilsin
  fromCurrencySelect.value = 'TRY';
  toCurrencySelect.value = 'USD';
}

// Döviz Dönüştürme İşlemi
document.getElementById('convert').addEventListener('click', convertCurrency);

function convertCurrency() {
  const fromCurrency = document.getElementById('from-currency').value;
  const toCurrency = document.getElementById('to-currency').value;
  const amount = document.getElementById('amount').value;

  const currencyLayerUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;

  fetch(currencyLayerUrl)
    .then(response => response.json())
    .then(data => {
      if (data.result === "success" || data.success) {
        const fromRate = data.conversion_rates[fromCurrency];
        const toRate = data.conversion_rates[toCurrency];

        let exchangeRate = 0;

        // TRY'den döviz dönüşümü
        if (fromCurrency === 'TRY') {
          exchangeRate = (toRate).toFixed(4);
        }

        // Diğer dövizden TRY'ye dönüşüm
        else if (toCurrency === 'TRY') {
          exchangeRate = (1 / fromRate).toFixed(4);
        }

        // Diğer dövizler arasında dönüşüm
        else {
          exchangeRate = (toRate / fromRate).toFixed(4);
        }

        // Dönüştürülmüş miktarın hesaplanması
        const convertedAmount = (amount * exchangeRate).toFixed(2);

        // TRY'ye dönüşümde eksik işlem yapılması durumunu düzeltme
        if (fromCurrency === 'TRY' && toCurrency === 'TRY') {
          document.getElementById('result').innerHTML = `${amount} ${currencyNames[fromCurrency] || fromCurrency} = ${amount} ${currencyNames[toCurrency] || toCurrency} (Döviz Kuru: 1)`;
        } else {
          document.getElementById('result').innerHTML = `${amount} ${fromCurrency} - ${currencyNames[fromCurrency] || fromCurrency} = ${convertedAmount} ${toCurrency} - ${currencyNames[toCurrency] || toCurrency} (Döviz Kuru: ${exchangeRate})`;
        }
      } else {
        document.getElementById('result').innerHTML = 'Dönüşüm yapılamadı!';
      }
    });
}

// Sayfa yüklendiğinde API'den döviz verilerini al
document.addEventListener('DOMContentLoaded', getCurrencyRates);
