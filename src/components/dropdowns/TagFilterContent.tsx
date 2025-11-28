interface TagFilterContentProps {
  selectedTags: Set<string>;
  onToggle: (tag: string) => void;
}

function TagFilterContent({ selectedTags, onToggle }: TagFilterContentProps) {
  const CheckboxIcon = ({ checked }: { checked: boolean }) => {
    if (checked) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 text-orange-400 group-hover:text-orange-300 flex-shrink-0 transition-colors">
          <path fill="currentColor" d="M384 32c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l320 0zM342 145.7c-10.7-7.8-25.7-5.4-33.5 5.3L189.1 315.2 137 263.1c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l72 72c5 5 11.9 7.5 18.8 7s13.4-4.1 17.5-9.8L347.3 179.2c7.8-10.7 5.4-25.7-5.3-33.5z"/>
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 text-gray-400 group-hover:text-gray-300 flex-shrink-0 transition-colors">
        <path fill="currentColor" d="M384 32c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l320 0zM64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l320 0c8.8 0 16-7.2 16-16l0-320c0-8.8-7.2-16-16-16L64 80zm230.7 89.9c7.8-10.7 22.8-13.1 33.5-5.3 10.7 7.8 13.1 22.8 5.3 33.5L211.4 366.1c-4.1 5.7-10.5 9.3-17.5 9.8-7 .5-13.9-2-18.8-6.9l-55.9-55.9c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l36 36 105.6-145.2z"/>
      </svg>
    );
  };

  // タグ一覧（JSONから見つかったタグ）
  const tags = [
    // 派閥系
    { value: '解放派', label: '解放派' },
    { value: '闘争派', label: '闘争派' },
    { value: '防衛派', label: '防衛派' },
    { value: '開放派', label: '開放派' },

    // デッキテーマ系
    { value: '夢限少女', label: '夢限少女' },
    { value: 'ゲート', label: 'ゲート' },
    { value: 'アンシエント・サプライズ', label: 'アンシエント・サプライズ' },
    { value: 'チームピース', label: 'チームピース' },
    { value: 'CardJockey', label: 'CardJockey' },
    { value: 'NoLimit', label: 'NoLimit' },
    { value: 'デウス・エクス・マキナ', label: 'デウス・エクス・マキナ' },
    { value: 'うちゅうのはじまり', label: 'うちゅうのはじまり' },
    { value: 'きゅるきゅるーん', label: 'きゅるきゅるーん' },
    { value: 'DIAGRAM', label: 'DIAGRAM' },

    // カード特性系
    { value: 'ディソナ', label: 'ディソナ' },
    { value: 'ライズ', label: 'ライズ' },
    { value: 'アタックフェイズ', label: 'アタックフェイズ' },

    // その他
    { value: 'サーバント', label: 'サーバント' },
    { value: '原子', label: '原子' },
    { value: '地獣', label: '地獣' },
    { value: '悪魔', label: '悪魔' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
      {tags.map((tag) => (
        <label key={tag.value} className="group flex items-center space-x-2 text-white cursor-pointer" onClick={() => onToggle(tag.value)}>
          <CheckboxIcon checked={selectedTags.has(tag.value)} />
          <span className="text-sm">{tag.label}</span>
        </label>
      ))}
    </div>
  );
}

export default TagFilterContent;
