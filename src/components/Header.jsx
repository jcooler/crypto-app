const Header = () => {
  return (
    <nav className="bg-zinc-950 p-4 border-b-4 border-quantum">
      <div className="mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-quantum font-bold text-lg">QuantumVista</div>
        </div>
        <ul className="flex space-x-4 justify-center">
          <li className="p-4 text-blue-400 font-semibold rounded-full h-12 flex justify-center items-center">
            Log In
          </li>
          <li className="p-4 text-blue-400 font-semibold rounded-full h-12 flex justify-center items-center border-blue-400 border-2">
            Create Account
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;
