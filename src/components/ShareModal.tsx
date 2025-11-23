import { useState, useEffect, useRef } from 'react';
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
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // プレビュー生成
  useEffect(() => {
    if (!isOpen || mainDeck.length === 0) {
      setPreviewUrl(null);
      return;
    }

    const generatePreview = async () => {
      try {
        const basePath = '/wixdex';
        const canvas = await generateStackDeckImage(deckName, mainDeck, lrigDeck, basePath);
        canvasRef.current = canvas;
        const url = canvas.toDataURL('image/png');
        setPreviewUrl(url);
      } catch (error) {
        console.error('Failed to generate preview:', error);
      }
    };

    generatePreview();
  }, [isOpen, deckName, mainDeck, lrigDeck]);

  const handleExportImage = async () => {
    if (isExporting || !canvasRef.current) return;

    setIsExporting(true);
    try {
      downloadCanvasAsImage(canvasRef.current, `${deckName || 'deck'}.${exportFormat}`, exportFormat);
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('画像のエクスポートに失敗しました。');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (isExporting || !canvasRef.current) return;

    setIsExporting(true);
    try {
      await copyCanvasToClipboard(canvasRef.current);
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
        {/* プレビュー */}
        {previewUrl && (
          <div className="border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900">
            <img src={previewUrl} alt="Deck Preview" className="w-full h-auto" />
          </div>
        )}

        {/* エクスポート形式選択 */}
        <div>
          <h4 className="text-white text-sm font-semibold mb-2">画像エクスポート</h4>
          <p className="text-gray-400 text-xs mb-3">スタック式デッキ画像 (16:9)</p>

          {/* フォーマット選択 */}
          <div className="flex gap-2 mb-3">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                exportFormat === 'png'
                  ? 'bg-orange-500 text-white'
                  : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
              }`}
              onClick={() => setExportFormat('png')}
            >
              PNG
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                exportFormat === 'jpg'
                  ? 'bg-orange-500 text-white'
                  : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
              }`}
              onClick={() => setExportFormat('jpg')}
            >
              JPG
            </button>
          </div>

          {/* エクスポートボタン */}
          <div className="flex gap-2">
            <button
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleExportImage}
              disabled={isExporting || mainDeck.length === 0}
            >
              {isExporting ? '生成中...' : '画像をダウンロード'}
            </button>
            <button
              className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCopyToClipboard}
              disabled={isExporting || mainDeck.length === 0}
            >
              {isExporting ? '生成中...' : 'クリップボードにコピー'}
            </button>
          </div>

          {mainDeck.length === 0 && (
            <p className="text-yellow-500 text-xs mt-2">※デッキにカードを追加してください</p>
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
