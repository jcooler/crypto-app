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
        <div className="flex items-center justify-center">
          <ReactLoading type="bars" color="#60a5fa" height={58} width={58} />
        </div>
      ) : (
        <Slider {...settings}>
          {cryptoData.map((crypto) => (
            <div key={crypto.rank}>
              <div className="flex items-center border-r border-blue-500 py-2 px-2">
                {/* Left Column */}
                <div className="flex-shrink-0 ml-2">
                  <img
                    className="h-6 w-6 md:h-8 md:w-8"
                    alt={crypto.rank}
                    src={crypto.icon}
                  />
                </div>
                <div className="ml-2">
                  <p className="text-blue-400 font-semibold text-xs md:text-sm">{crypto.name}</p>
                  <p className="text-blue-300 text-xs md:text-sm">{`(${crypto.symbol})`}</p>
                </div>
                {/* Right Column */}
                <div className="ml-2">
                  <p className="text-blue-400 text-xs md:text-sm">${parseFloat(crypto.price).toFixed(2)}</p>
                  <p
                    className={`text-blue-400 ${crypto.priceChange1d < 0 ? 'text-red-500' : 'text-green-500'} text-xs md:text-sm`} // Adjusted text size
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
