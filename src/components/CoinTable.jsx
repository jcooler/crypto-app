/* eslint-disable react/prop-types */
import Coin from './Coin';
// If the data array is empty, display a message to the user
const CoinTable = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="text-white text-center py-4">
        No coins found. Please try a different search term.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-zinc-950">
        <thead>
          <tr>
            <th className="py-6 px-2 md:px-4 border-b-2 border-blue-300 text-center text-blue-300 font-bold  md:text-left">Rank</th>
            <th className="py-6 px-2 md:px-4 border-b-2 border-blue-300 text-center text-blue-300 font-bold  md:text-left">Name</th>
            <th className="py-6 px-2 md:px-4 border-b-2 border-blue-300 text-center text-blue-300 font-bold  md:text-left">Volume</th>
            <th className="py-6 px-2 md:px-4 border-b-2 border-blue-300 text-center text-blue-300 font-bold  md:text-left">Price</th>
            <th className="py-6 px-2 md:px-4 border-b-2 border-blue-300 text-center text-blue-300 font-bold  md:text-left">Change Today</th>
          </tr>
        </thead>
        <tbody>
          {/* Map over the data array and display a Coin component for each item */}
          {data.map((coinData, index) => (
            <Coin key={index} {...coinData} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoinTable;
