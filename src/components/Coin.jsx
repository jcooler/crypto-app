import { useMediaQuery } from 'react-responsive';

/* eslint-disable react/prop-types */
const formatVolume = (volume, isSmallScreen) => {
  const num = parseInt(volume, 10);
  if (isSmallScreen && num > 1e6) {
    const suffixes = ['m', 'm', 'm', 'm', 'm', 'm', 'm', 'm', 'm', 'm'];
    const index = Math.floor(Math.log10(num) / 3);
    const formattedValue = (num / Math.pow(10, index * 3)).toFixed(0);
    return `${formattedValue}${suffixes[index]}${formattedValue < 1000 ? '+' : ''}`;
  } else {
    return num.toFixed(0);
  }
};

const Coin = ({ name, symbol, icon, volume, rank, price, priceChange1d }) => {
  // Determine if the price change is positive or negative
  const priceChangeColor = priceChange1d < 0 ? 'text-red-500' : 'text-green-500';

  // Check if it's a small screen
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });

  // Convert volume to a readable format
  const formattedVolume = formatVolume(volume, isSmallScreen);

  // Keep the cents portion for price
  const parsedPrice = parseFloat(price).toFixed(2);

  return (
    <tr className="border-b border-blue-500">
      <td className="py-2 px-2 md:px-4 text-blue-500 text-center md:text-left md:flex">
        {`#${rank} `}
        <img className={`${isSmallScreen ? 'h-6 w-6' : 'h-12 w-12'} object-cover ml-2`} alt="" src={icon} />
      </td>
      <td className="py-2 px-2 md:px-4 text-blue-500 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div>{name}</div>
          <span className={`block mt-1 md:inline-block md:mt-0 md:ml-1 text-blue-300`}>
            ({symbol})
          </span>
        </div>
      </td>
      <td className="py-2 px-2 md:px-4 text-blue-500 text-center md:text-left">{formattedVolume}</td>
      <td className="py-2 px-2 md:px-4 text-blue-500 text-center md:text-left">${parsedPrice}</td>
      <td className={`py-2 px-2 md:px-4 ${priceChangeColor} text-center md:text-left`}>{priceChange1d}%</td>
    </tr>
  );
};

export default Coin;

