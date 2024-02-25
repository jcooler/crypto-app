/* eslint-disable react/prop-types */
import Slider from 'react-slick';
import NewsCard from './NewsCard';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


function CryptoNews({ data }) {
  const settings = {
    lazyLoad: true,
    arrows: false,
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 8000,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    cssEase: "linear"
   
  };

  return (
    <div className="slider-container">
      <Slider {...settings}>
        {data.map((newsData, index) => (
          <NewsCard key={index} {...newsData} />
        ))}
      </Slider>
    </div>
  );
}

export default CryptoNews;
