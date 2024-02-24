/* eslint-disable react/prop-types */
const Coin = ({ name, symbol, icon, volume, rank, price, priceChange1d }) => {
  // Determine if the price change is positive or negative
  const priceChangeColor = priceChange1d < 0 ? 'text-red-500' : 'text-green-500';

  // Convert volume to a whole number
  const parsedVolume = parseInt(volume, 10);

  // Keep the cents portion for price
  const parsedPrice = parseFloat(price).toFixed(2);

  return (
    <tr className="border-b border-blue-500">
      <td className="py-2 px-2 md:px-4 text-blue-500 text-center md:text-left md:flex">
        {`#${rank} `}
        <img className="text-lg md:text-xl font-bold ml-1" alt="" src={icon} />
      </td>
      <td className="py-2 px-2 md:px-4 text-blue-500 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div>{name}</div>
          <span className={`block mt-1 md:inline-block md:mt-0 md:ml-1 text-blue-300`}>
            ({symbol})
          </span>
        </div>
      </td>
      <td className="py-2 px-2 md:px-4 text-blue-500 text-center md:text-left">{parsedVolume}</td>
      <td className="py-2 px-2 md:px-4 text-blue-500 text-center md:text-left">${parsedPrice}</td>
      <td className={`py-2 px-2 md:px-4 ${priceChangeColor} text-center md:text-left`}>{priceChange1d}%</td>
    </tr>
  );
};

export default Coin;
