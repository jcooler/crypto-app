import { useEffect, useState } from "react";
import CoinTable from "./components/CoinTable";
import axios from "axios";
import Header from "./components/Header";
import "./App.css";
import background from "./assets/background.png";

function App() {
  const backgroundImage = {
    backgroundImage: `url(${background})`,
  };

  const [coinList, setCoinList] = useState([]);
  const [search, setSearch] = useState("");

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
      console.log(response.data);
      setCoinList(response.data.result);
    });
  }, []);

  const filteredCoins = coinList.filter((coin) => {
    return coin.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <Header />
      <div className="hero-banner-container bg-gray-900 p-8 md:p-36 min-h-screen" style={backgroundImage}>
        <div className="glassy-background relative py-16 px-8 md:py-32 md:px-20 lg:px-40 rounded-lg bg-opacity-30 shadow-quantum">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-quantum mb-4 animate__slideInLeft">
            QuantumVista
          </h1>
          <div className="neon-glow"></div>
          <div className="flex flex-col items-center md:flex-row md:justify-center">
            <h2 className="text-lg md:text-xl lg:text-2xl text-accent mb-2 md:mr-4 animate__slideInRight">
              The #1 crypto web app
            </h2>
          </div>
          <p className="text-sm md:text-md lg:text-lg text-gray-400 mb-2 md:mr-4 animate__slideInRight">
            QuantumVista is a rapidly expanding web application within the crypto
            
            space, making it a highly valuable resource for both cryptocurrency
            traders and investors.
          </p>
        </div>
      </div>

      <div className="bg-zinc-950">
        <div className="container mx-auto">
          <div className="bg-zinc-950 py-8">
            <div className="container mx-auto flex flex-col items-center">
              <label
                htmlFor="cryptoSearch"
                className="text-white text-lg mb-2 md:mr-4"
              >
                Search for a cryptocurrency below:
              </label>
              <input
                type="text"
                id="cryptoSearch"
                placeholder="Type here..."
                className="bg-white text-black px-4 py-3 rounded-md w-full md:w-2/3 lg:w-1/2"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <CoinTable data={filteredCoins} />
        </div>
      </div>
    </>
  );
}

export default App;
