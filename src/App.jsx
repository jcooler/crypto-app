import { useEffect, useState } from "react";
import CoinTable from "./components/CoinTable";
import axios from "axios";
import Header from "./components/Header";
import "./App.css";
import CryptoNews from "./components/CryptoNews";
import Footer from "./components/Footer";

function App() {
  const [coinList, setCoinList] = useState([]);
  const [search, setSearch] = useState("");
  const [news, setNews] = useState([]);

  useEffect(() => {
    const options = {
      method: "GET",
      url: "https://openapiv1.coinstats.app/news",
      params: { limit: "10" },
      headers: {
        accept: "application/json",
        "X-API-KEY": "mjRnXJ0GFnNcxjZSslSZkZCCQNk/Vk2Zk7Os/JZM07c=",
      },
    };

    axios
      .request(options)
      .then(function (response) {
        setNews(response.data.result);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    const options = {
      method: "GET",
      url: "https://openapiv1.coinstats.app/coins",
      params: { limit: "10" },
      headers: {
        accept: "application/json",
        "X-API-KEY": "mjRnXJ0GFnNcxjZSslSZkZCCQNk/Vk2Zk7Os/JZM07c=",
      },
    };

    axios.request(options).then((response) => {
      setCoinList(response.data.result);
    });
  }, []);

  const filteredCoins = coinList.filter((coin) => {
    return coin.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <Header />
      {/* Hero Section */}
      <div className="bg-gray-950 p-8 md:p-12 lg:p-16 xl:p-20 2xl:p-24 lg:min-h-lvh flex items-center justify-center md:min-l-lvh">
        <div className="relative py-12 md:py-24 lg:py-32 xl:py-40 2xl:py-48 px-4 md:px-8 lg:px-16 rounded-lg bg-opacity-30 shadow-quantum w-full md:w-3/5 lg:w-4/5 mx-auto text-center">
          <h1 className="text-2xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-quantum mb-4 md:mb-6 lg:mb-8 animate__slideInLeft">
            QuantumVista
          </h1>
          <div className="flex flex-col items-center md:flex-row md:justify-center">
            <h2 className="text-quantum text-lg md:text-xl lg:text-4xl xl:text-5xl 2xl:text-6xl text-accent mb-2 md:mr-4 animate__slideInRight">
              The #1 crypto web app
            </h2>
          </div>
          <p className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-blue-400 mb-2 md:mr-4 animate__slideInRight">
            QuantumVista is the fastest way to get the latest crypto news and
            all things cryptocurrency.
          </p>
          <div className="mt-8 md:mt-12 lg:mt-16 xl:mt-20 2xl:mt-24 flex justify-center">
            <div className="flex flex-col md:flex-row items-center mx-auto animate__slideInLeft">
              <input
                type="email"
                id="email"
                placeholder="Email"
                className="py-1.5 px-4 mb-2 md:mb-0 md:mr-2 w-full md:w-auto rounded-md border-blue-400 border-2 focus:outline-none focus:border-blue-200 bg-gray-950 placeholder-blue-300 font-semibold text-blue-300"
                aria-label="Your Email"
              />
              <button
                type="submit"
                className="bg-gray-800 text-blue-400 py-2 px-4 rounded-md focus:outline-none hover:bg-gray-900 hover:outline transition duration-300 w-full">
                Notify Me
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950">
        <div className="container mx-auto">
          <h2 className="text-blue-400 font-semibold text-3xl md:text-4xl lg:text-5xl text-center mb-6 md:mb-10">
            The Latest in Crypto
          </h2>
          <CryptoNews data={news} />
        </div>
      </div>

      <div className="bg-zinc-950">
        <div className="container mx-auto">
          <div className="bg-zinc-950 py-8">
            <div className="container mx-auto flex flex-col items-center p-5">
              {/* Search bar feature */}
              <label
                htmlFor="cryptoSearch"
                className="text-blue-400 text-lg mb-5 md:mr-4">
                Search for a cryptocurrency below:
              </label>
              <input
                type="text"
                id="cryptoSearch"
                placeholder="eg. Bitcoin, Ethereum, etc..."
                className="bg-gray-900 text-blue-400 px-4 py-3 rounded-md w-full md:w-2/3 lg:w-1/2 placeholder-blue-400 font-semibold border-blue-400 focus:border-blue-700"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          {/* Coin data */}
          <CoinTable data={filteredCoins} />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default App;
