import { useState, useEffect } from "react";
import axios from "axios";
import Header from "./components/Header";
import CryptoNews from "./components/CryptoNews";
import CoinTable from "./components/CoinTable";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  const [search, setSearch] = useState("");
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = () => {
      const options = {
        method: "GET",
        url: "https://openapiv1.coinstats.app/news",
        params: { limit: "5" },
        headers: {
          accept: "application/json",
          "X-API-KEY": import.meta.env.VITE_API_KEY,
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
    };

    fetchNews();
  }, []);

  return (
    <>
      <Header />
      <div className="bg-gray-950 p-4 md:p-8 lg:p-12 xl:p-16 2xl:p-20 flex items-center justify-center lg:min-h-screen">
        <div className="relative py-10 md:py-20 lg:py-28 xl:py-36 2xl:py-44 px-4 md:px-8 lg:px-12 xl:px-16 rounded-lg bg-opacity-25 shadow-custom-blue w-full md:w-4/5 lg:w-3/4 xl:w-2/3 mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-quantum mb-6 md:mb-8">
            QuantumVista
          </h1>
          <h2 className="text-xl md:text-3xl lg:text-4xl xl:text-5xl text-blue-500 font-semibold mb-4 md:mb-6">
            The #1 crypto web app
          </h2>
          <p className="text-md md:text-lg lg:text-xl xl:text-2xl text-blue-500 mb-6 md:mb-8">
            QuantumVista is the fastest way to get the latest crypto news and
            all things cryptocurrency.
          </p>
          <div className="mt-4 md:mt-6 lg:mt-8 xl:mt-10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <input
                type="email"
                id="email"
                autoComplete="off"
                placeholder="Your Email"
                className="py-2 px-4 w-full sm:w-auto rounded-lg border-2 border-blue-500 focus:ring-blue-500 focus:border-blue-500 bg-gray-900 placeholder-blue-300 text-white font-medium"
                aria-label="Your Email"
              />
              <button
                type="submit"
                className=" py-2.5 px-6 bg-gray-800 text-blue-400 rounded-md focus:outline-none hover:bg-gray-900 hover:outline transition duration-300">
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
      <div className="bg-zinc-950 py-8">
        <div className="container mx-auto flex flex-col items-center p-5">
          <label
            htmlFor="cryptoSearch"
            className="text-blue-400 text-lg mb-5">
            Search for a cryptocurrency below:
          </label>
          <input
            type="text"
            id="cryptoSearch"
            placeholder="eg. Bitcoin, Ethereum, etc.."
            className="bg-gray-900 text-blue-400 px-4 py-3 rounded-md w-full md:w-2/3 lg:w-1/2 placeholder-blue-400 font-semibold border-blue-400 focus:border-blue-700"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CoinTable search={search} />
      </div>
      <Footer />
    </>
  );
}

export default App;
