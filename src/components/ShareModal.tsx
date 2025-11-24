import { useState } from 'react';
import { BaseModal } from './BaseModal';
import type { Card } from '../types';
import { generateStackDeckImage, downloadCanvasAsImage, copyCanvasToClipboard } from '../utils/deckImageExport';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckName: string;
  mainDeck: Card[];
  lrigDeck: Card[];
}

function ShareModal({ isOpen, onClose, deckName, mainDeck, lrigDeck }: ShareModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportImage = async (format: 'png' | 'jpg') => {
    if (isExporting || mainDeck.length === 0) return;

    setIsExporting(true);
    try {
      const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
      const canvas = await generateStackDeckImage(deckName, mainDeck, lrigDeck, basePath);
      downloadCanvasAsImage(canvas, `${deckName || 'deck'}.${format}`, format);
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('画像のエクスポートに失敗しました。');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (isExporting || mainDeck.length === 0) return;

    setIsExporting(true);
    try {
      const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
      const canvas = await generateStackDeckImage(deckName, mainDeck, lrigDeck, basePath);
      await copyCanvasToClipboard(canvas);
      alert('画像をクリップボードにコピーしました。');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('クリップボードへのコピーに失敗しました。');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="シェア"
    >
      <div className="space-y-4">
        {/* 画像エクスポート */}
        <div>
          <h4 className="text-white text-sm font-semibold mb-2">画像エクスポート</h4>
          <p className="text-gray-400 text-xs mb-3">スタック式デッキ画像 (16:9)</p>

          <div className="flex h-10 gap-3">
            {/* JPG */}
            <div className="flex flex-1 px-1 bg-zinc-800 rounded-lg border border-zinc-700">
              <div className="flex flex-1 text-white font-medium text-sm items-center justify-center">JPG</div>
              <button
                className="w-8 !p-0 !bg-transparent hover:bg-zinc-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCopyToClipboard}
                disabled={isExporting || mainDeck.length === 0}
                title="クリップボードにコピー"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-white">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                  <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                </svg>
              </button>
              <button
                className="w-8 !p-0 !bg-transparent hover:bg-zinc-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleExportImage('jpg')}
                disabled={isExporting || mainDeck.length === 0}
                title="ダウンロード"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-white">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                  <path d="M7 11l5 5l5 -5" />
                  <path d="M12 4l0 12" />
                </svg>
              </button>
            </div>

            {/* PNG */}
            <div className="flex flex-1 px-1 bg-zinc-800 rounded-lg border border-zinc-700">
              <div className="flex flex-1 text-white font-medium text-sm items-center justify-center">PNG</div>
              <button
                className="w-8 !p-0 !bg-transparent hover:bg-zinc-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCopyToClipboard}
                disabled={isExporting || mainDeck.length === 0}
                title="クリップボードにコピー"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-white">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                  <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                </svg>
              </button>
              <button
                className="w-8 !p-0 !bg-transparent hover:bg-zinc-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleExportImage('png')}
                disabled={isExporting || mainDeck.length === 0}
                title="ダウンロード"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-white">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                  <path d="M7 11l5 5l5 -5" />
                  <path d="M12 4l0 12" />
                </svg>
              </button>
            </div>
          </div>

          {mainDeck.length === 0 && (
            <p className="text-yellow-500 text-xs mt-3">※デッキにカードを追加してください</p>
          )}
          {isExporting && (
            <p className="text-gray-400 text-xs mt-3">生成中...</p>
          )}
        </div>

        {/* 今後実装予定の機能 */}
        <div className="pt-4 border-t border-zinc-700">
          <p className="text-gray-500 text-xs">リスト式、テキストエクスポートは今後実装予定です。</p>
        </div>
      </div>
    </BaseModal>
  );
}

export default ShareModal;
