/* eslint-disable react/prop-types */
import Slider from 'react-slick';
import NewsCard from './NewsCard';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function CryptoNews({ data }) {
  const settings = {
    lazyLoad: true,
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    dotsClass: "slick-dots slick-thumb",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
          dots: false
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false
        }
      }
    ]
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

const NextArrow = (props) => {
  const { className, onClick } = props;
  return (
    <div
      className={`${className} absolute top-1/2 transform -translate-y-1/2 right-0 cursor-pointer text-blue-500`}
      style={{ fontSize: '50px' }}
      onClick={onClick}
    >
      ›
    </div>
  );
};

const PrevArrow = (props) => {
  const { className, onClick } = props;
  return (
    <div
      className={`${className} absolute top-1/2 transform -translate-y-1/2 left-0 cursor-pointer text-blue-500`}
      style={{ fontSize: '50px' }}
      onClick={onClick}
    >
      ‹
    </div>
  );
};

export default CryptoNews;
