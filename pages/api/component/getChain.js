import path from 'path';
import fs from 'fs';

export default function handler(req, res) {
  const { chainId } = req.query;
  const filePath = path.resolve(process.cwd(), '_data/chains', `eip155-${chainId}.json`);

  console.log(`Fetching chain data for chainId: ${chainId}`);
  console.log(`Resolved file path: ${filePath}`);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return res.status(404).json({ error: 'File not found' });
    }

    try {
      const jsonData = JSON.parse(data);
      res.status(200).json(jsonData);
    } catch (parseError) {
      console.error('Error parsing JSON file:', parseError);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}
