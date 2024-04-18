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
              'X-API-KEY': import.meta.env.VITE_API_KEY,
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
      <nav className="p-2 border-b-2 bg-zinc-950 sm:p-4 sm:border-b-4 border-quantum">
        <div className="flex flex-col items-center justify-between mx-auto sm:flex-row">
          <div className="flex items-center mb-2 sm:mb-0">
            <div className="text-base font-bold text-quantum md:text-3xl lg:text-3xl">
              QuantumVista
            </div>
          </div>
          <ul className="flex flex-col justify-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
            <li className="flex items-center justify-center h-10 p-2 font-semibold text-blue-400 rounded-full sm:p-4 sm:h-12">
              Log In
            </li>
            <li className="flex items-center justify-center h-10 p-2 font-semibold text-blue-400 border-2 border-blue-400 rounded-full sm:p-4 sm:h-12">
              Create Account
            </li>
          </ul>
        </div>
      </nav>
      {/* Add CryptoCarousel as a header carousel */}
      <div className="p-4 bg-gray-900 md:p-2">
        <CryptoCarousel cryptoData={cryptoData} />
      </div>
    </>
  );
};

export default Header;
