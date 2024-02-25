import { useEffect, useState } from 'react';
import CryptoCarousel from './CryptoCarousel';  // Import CryptoCarousel
import axios from 'axios';

const Header = () => {
  const [cryptoData, setCryptoData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://openapiv1.coinstats.app/coins',
          {
            params: { limit: '10' },
            headers: {
              accept: 'application/json',
              'X-API-KEY': 'mjRnXJ0GFnNcxjZSslSZkZCCQNk/Vk2Zk7Os/JZM07c=',
            },
          }
        );
        setCryptoData(response.data.result);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <nav className="bg-zinc-950 p-2 sm:p-4 border-b-2 sm:border-b-4 border-quantum">
        <div className="mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-2 sm:mb-0">
            <div className="text-quantum font-bold text-base sm:text-lg lg:text-xl">
              QuantumVista
            </div>
          </div>
          <ul className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center">
            <li className="p-2 sm:p-4 text-blue-400 font-semibold rounded-full h-10 sm:h-12 flex justify-center items-center">
              Log In
            </li>
            <li className="p-2 sm:p-4 text-blue-400 font-semibold rounded-full h-10 sm:h-12 flex justify-center items-center border-blue-400 border-2">
              Create Account
            </li>
          </ul>
        </div>
      </nav>
      {/* Add CryptoCarousel as a header carousel */}
      <div className="bg-blue-950 p-4 md:p-2">
        <CryptoCarousel cryptoData={cryptoData} />
      </div>
    </>
  );
};

export default Header;
