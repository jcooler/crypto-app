import logo from "../assets/logo.png";

const Header = () => {
  return (
    <nav className="bg-black p-4 border-b-4 border-quantum">
      <div className="mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img src={logo} alt="QuantumVista logo" className="mr-2 h-8 w-8" />
          <div className="text-quantum font-bold text-lg">QuantumVista</div>
        </div>
        <ul className="flex space-x-4 justify-center">
          <li></li>
          <li className="p-4 bg-accent text-cyan-500 rounded-full w-12 h-12 flex justify-center items-center">
            Home
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;
