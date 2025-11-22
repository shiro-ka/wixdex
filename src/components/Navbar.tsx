interface NavbarProps {
  basePath: string;
  deckName: string;
  onMenuClick: () => void;
  onSaveClick: () => void;
  onDeckClick: () => void;
}

function Navbar({ basePath, deckName, onMenuClick, onSaveClick, onDeckClick }: NavbarProps) {
  return (
    <nav className="flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-2">
        <img src={`${basePath}/wixdex.png`} alt="wixdex" className="h-7" />
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden">
            <button
              className="!bg-transparent !p-0 px-3 h-10 flex items-center justify-center hover:bg-gray-700/50 transition-colors"
              onClick={onDeckClick}
              aria-label="デッキ"
            >
              <span className="text-sm text-gray-400">{deckName || 'デッキ名未設定'}</span>
            </button>
            <div className="w-px h-6 bg-gray-600"></div>
            <button
              className="!bg-transparent !p-0 w-10 h-10 flex items-center justify-center hover:bg-gray-700/50 transition-colors"
              onClick={onSaveClick}
              aria-label="保存"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-5 h-5 text-gray-400" fill="currentColor">
                <path d="M160 144C151.2 144 144 151.2 144 160L144 480C144 488.8 151.2 496 160 496L480 496C488.8 496 496 488.8 496 480L496 237.3C496 233.1 494.3 229 491.3 226L416 150.6L416 240C416 257.7 401.7 272 384 272L224 272C206.3 272 192 257.7 192 240L192 144L160 144zM240 144L240 224L368 224L368 144L240 144zM96 160C96 124.7 124.7 96 160 96L402.7 96C419.7 96 436 102.7 448 114.7L525.3 192C537.3 204 544 220.3 544 237.3L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160zM256 384C256 348.7 284.7 320 320 320C355.3 320 384 348.7 384 384C384 419.3 355.3 448 320 448C284.7 448 256 419.3 256 384z"/>
              </svg>
            </button>
          </div>
          <button
            className="!bg-transparent !p-0 w-10 h-10 flex items-center justify-center hover:bg-gray-700/50 rounded-lg transition-colors"
            onClick={onMenuClick}
            aria-label="メニュー"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
