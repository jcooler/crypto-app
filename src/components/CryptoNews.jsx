/* eslint-disable react/prop-types */
import Slider from "react-slick";
import ReactLoading from 'react-loading';
import NewsCard from "./NewsCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
    cssEase: "linear",
  };

  if (data.length > 0) {
    return (
      <div className="slider-container">
        <Slider {...settings}>
          {data.map((newsData, index) => (
            <NewsCard key={index} {...newsData} />
          ))}
        </Slider>
      </div>
    );
  } else {
    // Directly return the loading indicator when there's no data
    return (
      <div className="flex justify-center items-center">
        <ReactLoading type="bars" color="#60a5fa" height={100} width={100} />
      </div>
    );
  }
}
export default CryptoNews;

