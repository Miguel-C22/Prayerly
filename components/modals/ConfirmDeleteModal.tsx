interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onConfirm,
  onCancel,
  title = "Delete Prayer",
  message = "Are you sure you want to delete this prayer? This action cannot be undone.",
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg text-text-grayPrimary">{title}</h3>
        <p className="py-4 text-text-graySecondary">{message}</p>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn bg-red-500 hover:bg-red-600 text-white border-none" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onCancel}></div>
    </div>
  );
}
