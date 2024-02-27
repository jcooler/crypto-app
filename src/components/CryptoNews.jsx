/* eslint-disable react/prop-types */
import Slider from "react-slick";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
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

  return (
    <div className="slider-container">
      <Slider {...settings}>
        {data.length > 0 ? (
          data.map((newsData, index) => (
            <NewsCard
              key={index}
              {...newsData}
            />
          ))
        ) : (
          // Display a single skeleton block centered on the page
          <div className="skeleton-container">
            <div className="skeleton-centered glow flex-1">
              <SkeletonTheme
                baseColor="#202020"
                highlightColor="#444">
                <Skeleton count={1} />
              </SkeletonTheme>
              <SkeletonTheme
                baseColor="#202020"
                highlightColor="#444">
                <Skeleton count={1} />
              </SkeletonTheme>
              <SkeletonTheme
                baseColor="#202020"
                highlightColor="#444">
                <Skeleton count={1} />
              </SkeletonTheme>
            </div>
          </div>
        )}
      </Slider>
    </div>
  );
}
export default CryptoNews;
