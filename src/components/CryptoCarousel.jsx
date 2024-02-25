/* eslint-disable react/prop-types */
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const CryptoCarousel = ({ cryptoData }) => {
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
    responsive: [
      {
        breakpoint: 768,
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
    <Slider {...settings}>
      {cryptoData.map((crypto) => (
        <div key={crypto.rank} className="px-1/2 sm:px-2/5">
          <div className="flex items-center border-r border-blue-500 py-2 md:py-2">
            {/* Left Column */}
            <div className="flex-shrink-0">
              <img
                className="text-lg md:text-xl font-bold ml-1 h-8 w-8 md:h-10 md:w-10"
                alt=""
                src={crypto.icon}
              />
            </div>
            <div className="ml-2 md:ml-4"> 
              <p className="text-blue-400 font-semibold text-base md:text-lg">{crypto.name}</p>
              <p className="text-blue-200 text-sm md:text-base">{`(${crypto.symbol})`}</p>
            </div>
            {/* Right Column */}
            <div className="ml-4 md:ml-8"> 
              <p className="text-blue-400 text-base md:text-lg"> ${parseFloat(crypto.price).toFixed(2)}</p>
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
  );
};

export default CryptoCarousel;
