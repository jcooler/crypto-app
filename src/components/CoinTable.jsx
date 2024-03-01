/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import axios from 'axios';
import Coin from './Coin';
import { useMediaQuery } from 'react-responsive';

const CoinTable = ({ search }) => {
  const [coins, setCoins] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ itemCount: 0, pageCount: 0, hasPreviousPage: false, hasNextPage: false });
  const isSmallScreen = useMediaQuery({ maxWidth: 399 });

  useEffect(() => {
    const fetchCoins = () => {
      const options = {
        method: 'GET',
        url: 'https://openapiv1.coinstats.app/coins',
        params: { page: currentPage, limit: '10' },
        headers: {
          accept: 'application/json',
          'X-API-KEY': 'mjRnXJ0GFnNcxjZSslSZkZCCQNk/Vk2Zk7Os/JZM07c=',
        }
      };
  
      axios.request(options).then(function (response) {
        let fetchedCoins = response.data.result;
  
        // Apply search filter if search term is present
        if (search.trim() !== '') {
          fetchedCoins = fetchedCoins.filter(coin =>
            coin.name.toLowerCase().includes(search.toLowerCase())
          );
        }
  
        setCoins(fetchedCoins);
        setMeta(response.data.meta);
      }).catch(function (error) {
        console.error(error);
      });
    };
  
    fetchCoins();
  }, [currentPage, search]);

  const pageNumbers = [];
  for (let i = 1; i <= meta.pageCount; i++) {
    pageNumbers.push(i);
  }

  return (
    
    <div className="flex justify-center p-4">
      <div className="w-full max-w-6xl overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className={`min-w-full bg-zinc-950 shadow-md rounded-lg ${isSmallScreen ? 'coin-table-small' : ''}`}>
            <thead className={`bg-gray-950 sticky top-0 ${isSmallScreen ? 'hidden' : ''}`}>
              <tr>
            <th className="py-6 px-2 md:px-4 border-b-2 border-blue-300 text-center text-blue-300 font-bold md:text-left">Rank</th>
            <th className="py-6 px-2 md:px-4 border-b-2 border-blue-300 text-center text-blue-300 font-bold md:text-left">Name</th>
            <th className="py-6 px-2 md:px-4 border-b-2 border-blue-300 text-center text-blue-300 font-bold md:text-left">Volume</th>
            <th className="py-6 px-2 md:px-4 border-b-2 border-blue-300 text-center text-blue-300 font-bold md:text-left">Price</th>
            <th className="py-6 px-2 md:px-4 border-b-2 border-blue-300 text-center text-blue-300 font-bold md:text-left">Change Today</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((coin, index) => (
                <Coin key={index} {...coin} isSmallScreen={isSmallScreen} />
              ))}
            </tbody>
          </table>
          <div className="flex justify-center mt-4 mb-4">
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} 
              className={`px-4 py-2 mx-2 text-sm font-semibold rounded-lg hover:bg-gray-900 hover:outline transition duration-300 ${meta.hasPreviousPage ? 'bg-gray-800 text-blue-400' : 'bg-gray-500 text-gray-300'} cursor-pointer`} 
              disabled={!meta.hasPreviousPage}>
              Previous
            </button>
            <select 
  value={currentPage} 
  onChange={(e) => setCurrentPage(Number(e.target.value))}
  className="h-9 text-sm bg-gray-800 text-blue-300 border border-gray-600 rounded-md cursor-pointer py-1 px-2 focus:outline-none focus:border-blue-500"
>
  {pageNumbers.map(number => (
    <option key={number} value={number}>
      Page {number}
    </option>
  ))}
</select>
            <button 
              onClick={() => setCurrentPage(currentPage + 1)} 
              className={`px-7 py-2 mx-2 text-sm font-semibold rounded-lg hover:bg-gray-900 hover:outline transition duration-300 ${meta.hasNextPage ? 'bg-gray-800 text-blue-400' : 'bg-gray-500 text-gray-300'} cursor-pointer`} 
              
              disabled={!meta.hasNextPage}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinTable;
