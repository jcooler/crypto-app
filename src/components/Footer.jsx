const sections = [
  {
    title: "Solutions",
    items: ["Marketing", "Analytics", "Commerce", "Data", "Cloud"],
  },
  {
    title: "Support",
    items: ["Pricing", "Documentation", "Guides", "API Status"],
  },
  {
    title: "Company",
    items: ["About", "Blog", "Jobs", "Press", "Partners"],
  },
  {
    title: "Legal",
    items: ["Claims", "Privacy", "Terms", "Policies", "Conditions"],
  },
];


const Footer = () => {
  return (
    <div className="w-full bg-gray-950 text-gray-300 py-10 px-8">
      <div className="max-w-[1240px] mx-auto grid grid-cols-2 md:grid-cols-6 border-b-2 border-gray-600 py-8">
        {sections.map((section, index) => (
          <div key={index}>
            <h2 className="font-bold uppercase pt-2">{section.title}</h2>
            <ul>
              {section.items.map((item, i) => (
                <li
                  key={i}
                  className="py-1 text-blue-400 hover:text-white">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="col-span-2 pt-8 md:pt-2">
          <p className="font-bold uppercase">Subscribe to our newsletter</p>

          <p className="py-4 text-blue-400">
            The latest news, articles, and resources, sent to your inbox weekly.
          </p>

          <form className="flex flex-col sm:flex-row">
            <input
              name="email"
              className="w-full p-2 mr-4 rounded-md mb-4 border-blue-400 border-2 focus:outline-none focus:border-blue-500 bg-gray-900 placeholder-blue-400 font-semibold"
              type="email"
              placeholder="Email"
              autoComplete="off"
              aria-label="Enter email.."
            />
            <button className="p-2 mb-4 bg-gray-800 text-blue-400 rounded-md focus:outline-none hover:bg-gray-900 hover:outline transition duration-300">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="flex flex-col max-w-[1240px] px-2 py-4 mx-auto justify-between sm:flex-row text-center text-blue-400">
        <p className="py-4">2024 QuantumVista, LLC. All rights reserved</p>
        
      </div>
    </div>
  );
};

export default Footer;
