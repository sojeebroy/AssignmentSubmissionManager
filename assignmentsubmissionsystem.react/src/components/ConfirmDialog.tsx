type Props = {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({ open, title, message, onConfirm, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-3">{title ?? 'Confirm'}</h3>
        <p className="text-sm text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}
