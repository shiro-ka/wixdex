function Navbar({ basePath }) {
  return (
    <nav className="flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-2">
        <img src={`${basePath}/wixdex.png`} alt="wixdex" className="h-7" />
        <button className="!bg-transparent !p-0 w-10 h-10 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
