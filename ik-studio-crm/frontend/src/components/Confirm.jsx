import Modal from './Modal';
import { Btn } from './ui';

export default function Confirm({ open, title, body, confirmLabel = 'Delete', danger = true, onConfirm, onClose, busy }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<><Btn onClick={onClose}>Cancel</Btn><Btn variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={busy}>{busy ? 'Working…' : confirmLabel}</Btn></>}>
      <p className="text-[14px] leading-relaxed text-ink/80">{body}</p>
    </Modal>
  );
}
