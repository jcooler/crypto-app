/* eslint-disable react/prop-types */
//* used to shorten title of news
const truncateText = (text, wordsCount) => {
  const words = text.split(' ');
  if (words.length <= wordsCount) {
    return text;
  }
  const truncated = words.slice(0, wordsCount).join(' ');
  return `${truncated}...`;
};
//* keep undefined depending on user location
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

const NewsCard = ({ title, imgUrl, link, feedDate }) => {
  return (
    <div className="bg-gray-900 overflow-hidden border-b-8 border-blue-300 w-4/5 ml-11">
      <img src={imgUrl} alt={title} className="w-full object-cover h-32 sm:h-48 md:h-64" />
      <div className="p-4 md:p-6">
        <p className="text-blue-300 font-semibold text-xs mb-1 leading-none">News</p>
        <h3 className="font-semibold mb-2 text-md leading-tight sm:leading-normal text-blue-500">
          {truncateText(title, 6)}
        </h3>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-300 hover:underline"
        >
          Full Article
        </a>
      </div>
      <div className="text-sm flex items-center mb-2 ml-2">
        <svg
          className="mr-2 h-4 w-4 fill-current text-blue-300"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          version="1.1"
          id="Capa_1"
          x="0px"
          y="0px"
          width="12"
          height="12"
          viewBox="0 0 97.16 97.16"
          style={{ enableBackground: 'new 0 0 97.16 97.16' }}
          xmlSpace="preserve"
        >
          <path d="M48.58,0C21.793,0,0,21.793,0,48.58s21.793,48.58,48.58,48.58s48.58-21.793,48.58-48.58S75.367,0,48.58,0z M48.58,86.823    c-21.087,0-38.244-17.155-38.244-38.243S27.493,10.337,48.58,10.337S86.824,27.492,86.824,48.58S69.667,86.823,48.58,86.823z"/>
          <path d="M73.898,47.08H52.066V20.83c0-2.209-1.791-4-4-4c-2.209,0-4,1.791-4,4v30.25c0,2.209,1.791,4,4,4h25.832    c2.209,0,4-1.791,4-4S76.107,47.08,73.898,47.08z"/>
        </svg>
        <p className="leading-none text-blue-300">{formatDate(feedDate)}</p>
      </div>
    </div>
  );
};

export default NewsCard;
