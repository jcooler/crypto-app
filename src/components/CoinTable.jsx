/* eslint-disable react/prop-types */
import Coin from './Coin';
import { useMediaQuery } from 'react-responsive';

const CoinTable = ({ data }) => {
  const isSmallScreen = useMediaQuery({ maxWidth: 374 });

  if (data.length === 0) {
    return (
      <div className="text-blue-400 font-bold text-center py-4">
        No coins found. Please try a different search term.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
    <table className={`min-w-full bg-zinc-950 ${isSmallScreen ? 'coin-table-small' : ''}`}>
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
        {data.map((coinData, index) => (
          <Coin key={index} {...coinData} isSmallScreen={isSmallScreen} />
        ))}
      </tbody>
    </table>
  </div>
  );
};

export default CoinTable;
