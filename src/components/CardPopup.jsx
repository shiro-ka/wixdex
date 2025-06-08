function CardPopup({ card, onClose, basePath }) {
  if (!card) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 p-8 rounded-xl w-[90vw] h-[90vh] max-w-4xl max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={`${basePath}/assets/cards_img/${card.image}`}
            className="max-w-full max-h-full object-contain"
            alt={card.name}
          />
        </div>
      </div>
    </div>
  );
}

export default CardPopup; 