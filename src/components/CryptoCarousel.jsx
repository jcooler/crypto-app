/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ReactLoading from 'react-loading';

const CryptoCarousel = ({ cryptoData }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const delay = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(delay);
  }, []);

  const settings = {
    lazyLoad: true,
    arrows: false,
    dots: false,
    infinite: true,
    autoplay: true,
    speed: 8000,
    autoplaySpeed: 0,
    slidesToShow: 6,
    cssEase: 'linear',
    draggable: false,
    responsive: [
      {
        breakpoint: 650,
        settings: {
          slidesToShow: 1,
        },
        
      },
      
      {
        breakpoint: 1920,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 1550,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  };
  

  return (
    <div>
      {loading ? (
        // Display loader while carousel is loading
        <div className="flex items-center justify-center">
        <ReactLoading type="spin" color="#3498db" height={60} width={60} />
        <div className="spinner"></div>
        </div>
      ) : (
        // Display carousel when it's done loading
        <Slider {...settings}>
          {cryptoData.map((crypto) => (
            <div key={crypto.rank}>
              <div className="flex items-center border-r border-blue-500 py-2 md:py-2">
                {/* Left Column */}
                <div className="flex-shrink-0">
                  <img
                    className="text-lg font-bold ml-1 h-8 w-8 md:h-10 md:w-10"
                    alt=""
                    src={crypto.icon}
                  />
                </div>
                <div className="ml-2 md:ml-2 mr-20">
                  <p className="text-blue-400 font-semibold text-base md:text-md">{crypto.name}</p>
                  <p className="text-blue-200 text-sm md:text-base">{`(${crypto.symbol})`}</p>
                </div>
                {/* Right Column */}
                <div className="ml-4 md:ml-2">
                  <p className="text-blue-400 text-base md:text-md">${parseFloat(crypto.price).toFixed(2)}</p>
                  <p
                    className={`text-blue-400 ${crypto.priceChange1d < 0 ? 'text-red-500' : 'text-green-500'} text-sm md:text-base`}
                  >
                    {crypto.priceChange1d}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
};

export default CryptoCarousel;
