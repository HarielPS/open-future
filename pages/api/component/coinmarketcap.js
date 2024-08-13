import axios from 'axios';

export default async function handler(req, res) {
  const apiKey = process.env.COINMARKET;
  const { convert } = req.query;

  try {
    const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
      },
      params: {
        start: 1,
        limit: 5000,
        convert: 'USD'
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching exchange rate:', error.message);
    res.status(500).json({ error: 'Failed to fetch exchange rate' });
  }
}
