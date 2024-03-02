/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";
import Coin from "./Coin";
import { useMediaQuery } from "react-responsive";
import ReactLoading from 'react-loading';

const CoinTable = ({ search }) => {
  const [allCoins, setAllCoins] = useState([]);
  const [displayedCoins, setDisplayedCoins] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // This could be adjusted if you want to show more/less items per page
  const [sortField, setSortField] = useState("rank");
  const [sortDirection, setSortDirection] = useState("asc");
  const isSmallScreen = useMediaQuery({ maxWidth: 445 }); // Adjusted to consider tablets and large mobile devices
  const [meta, setMeta] = useState({
    itemCount: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });
  const [isLoading, setIsLoading] = useState(true); // Initialize isLoading state to true

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const options = {
          method: "GET",
          url: "https://openapiv1.coinstats.app/coins",
          params: { limit: "200" },
          headers: {
            accept: "application/json",
            "X-API-KEY": "mjRnXJ0GFnNcxjZSslSZkZCCQNk/Vk2Zk7Os/JZM07c=",
          },
        };
        const response = await axios.request(options);
        setAllCoins(response.data.result);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false); // Stop loading when the data is fetched or on error
      }
    };

    fetchCoins();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      let processedCoins = [...allCoins];

      if (search.trim() !== "") {
        processedCoins = processedCoins.filter((coin) =>
          coin.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      processedCoins.sort((a, b) => {
        let valueA = a[sortField];
        let valueB = b[sortField];

        if (
          sortField === "changeToday" ||
          (!isNaN(parseFloat(valueA)) && !isNaN(parseFloat(valueB)))
        ) {
          valueA = parseFloat(valueA);
          valueB = parseFloat(valueB);
        }

        if (typeof valueA === "string") {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
          return sortDirection === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        } else {
          return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
        }
      });

      const start = (currentPage - 1) * itemsPerPage;
      const paginatedCoins = processedCoins.slice(start, start + itemsPerPage);

      setDisplayedCoins(paginatedCoins);
      setMeta({
        itemCount: processedCoins.length,
        pageCount: Math.ceil(processedCoins.length / itemsPerPage),
        hasPreviousPage: currentPage > 1,
        hasNextPage: currentPage * itemsPerPage < processedCoins.length,
      });
    }
  }, [allCoins, currentPage, search, sortField, sortDirection, isLoading]);

  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handlePageSelectChange = (event) => {
    setCurrentPage(Number(event.target.value));
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 container mx-auto">
      <div className="w-full">
        {isLoading ? (
          // Placeholder for loading state
          <div className="flex justify-center items-center">
            <ReactLoading type="bars" color="#60a5fa" height={100} width={100} />
          </div>
        ) : displayedCoins.length > 0 ? (
          isSmallScreen ? (
            displayedCoins.map((coin, index) => (
              <div
                key={index}
                className="bg-zinc-950 mb-4 p-4 rounded-lg shadow flex flex-col space-y-2 md:space-y-0 md:flex-row justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <img src={coin.icon} alt="icon" className="h-8 w-8" />
                  <div>
                    <p className="text-blue-500 font-bold">
                      {coin.name} ({coin.symbol})
                    </p>
                    <p className="text-blue-500">
                      #<span className="text-blue-500">{coin.rank}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between space-x-4">
                  <p className="text-blue-500">
                    <span className="text-blue-500 ml-10">
                      ${parseFloat(coin.price).toFixed(2)}
                    </span>
                  </p>
                  <p>
                    <span className={coin.priceChange1d < 0 ? "text-red-500" : "text-green-500"}>
                      {coin.priceChange1d}%
                    </span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <table className="min-w-full bg-zinc-950">
              <thead className="bg-gray-950">
                <tr>
                  {["rank", "name", "volume", "price", "Change Today"].map((field) => (
                    <th
                      key={field}
                      onClick={() => handleSortChange(field)}
                      className="py-2 px-4 border-b-2 border-blue-300 text-left text-blue-300 font-bold cursor-pointer hover:bg-gray-700"
                    >
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedCoins.map((coin, index) => (
                  <Coin key={index} {...coin} isSmallScreen={isSmallScreen} />
                ))}
              </tbody>
            </table>
          )
        ) : (
          <div className="text-center py-10">
            <p className="text-xl text-blue-400">No coins available.</p>
          </div>
        )}
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={!meta.hasPreviousPage}
            className="px-2 py-1 text-xs sm:text-sm md:px-4 md:py-2 md:text-base font-semibold rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:bg-gray-500 disabled:text-gray-300 transition duration-300"
          >
            Prev
          </button>
          <select
            onChange={handlePageSelectChange}
            value={currentPage}
            aria-label="Select a page"
            className="text-xs sm:text-sm md:text-base font-semibold rounded-lg bg-gray-800 text-white px-2 py-1 md:px-4 md:py-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
          >
            {Array.from({ length: meta.pageCount }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Page {i + 1} of {meta.pageCount}
              </option>
            ))}
          </select>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!meta.hasNextPage}
            className="px-2 py-1 text-xs sm:text-sm md:px-4 md:py-2 md:text-base font-semibold rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:bg-gray-500 disabled:text-gray-300 transition duration-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoinTable;
