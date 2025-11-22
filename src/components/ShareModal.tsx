import { BaseModal } from './BaseModal';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ShareModal({ isOpen, onClose }: ShareModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="シェア"
    >
      <div className="text-gray-400">
        <p>シェア機能は実装中です...</p>
      </div>
    </BaseModal>
  );
}

export default ShareModal;
