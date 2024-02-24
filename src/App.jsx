import { useEffect, useState } from "react";
import CoinTable from "./components/CoinTable";
import axios from "axios";
import Header from "./components/Header";
import "./App.css";
import CryptoNews from "./components/CryptoNews";

function App() {

  const [coinList, setCoinList] = useState([]);
  const [search, setSearch] = useState("");
  const [news, setNews] = useState([]);

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
        console.log(response.data);
        setNews(response.data.result);
      })
      .catch(function (error) {
        console.error(error);
      });
  }, []);

  const filteredCoins = coinList.filter((coin) => {
    return coin.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <Header />
      {/*Hero Section */}
      <div
        className="hero-banner-container bg-gray-950 p-8 md:p-36 min-h-fit bg-no-repeat">
        <div className="glassy-background relative py-16 px-8 md:py-32 md:px-20 lg:px-40 rounded-lg bg-opacity-30 shadow-quantum">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-quantum mb-4 animate__slideInLeft">
            QuantumVista
          </h1>
          <div className="flex flex-col items-center md:flex-row md:justify-center">
            <h2 className="text-lg md:text-xl lg:text-2xl text-accent mb-2 md:mr-4 animate__slideInRight">
              The #1 crypto web app
            </h2>
          </div>
          <p className="text-sm md:text-md lg:text-lg text-gray-400 mb-2 md:mr-4 animate__slideInRight">
            QuantumVista is a rapidly expanding web application within the
            crypto space, making it a highly valuable resource for both
            cryptocurrency traders and investors.
          </p>
        </div>
      </div>
      <div className="bg-zinc-950">
        <div className="container mx-auto">
          <h2 className="text-blue-400 font-semibold text-5xl text-center mb-10">
            The Latest in Crypto
          </h2>
          <CryptoNews data={news} />
        </div>
      </div>

      <div className="bg-zinc-950">
        <div className="container mx-auto">
          <div className="bg-zinc-950 py-8">
            <div className="container mx-auto flex flex-col items-center px-5">
              {/*search bar feature */}
              <label
                htmlFor="cryptoSearch"
                className="text-blue-400 text-lg mb-5 md:mr-4">
                Search for a cryptocurrency below:
              </label>
              <input
                type="text"
                id="cryptoSearch"
                placeholder="eg. Bitcoin, Ethereum, etc..."
                className="bg-gray-600 text-blue-400 px-4 py-3 rounded-md w-full md:w-2/3 lg:w-1/2 placeholder-blue-400 font-semibold border-blue-400"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          {/* Coindata */}
          <CoinTable data={filteredCoins} />
        </div>
      </div>
    </>
  );
}

export default App;
