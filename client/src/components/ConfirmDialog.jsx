import { useState } from 'react'
import Button from './Button'
import Dialog from './Dialog'

// A small "are you sure?" box. The safe choice (Cancel) gets the keyboard
// focus first, so pressing Enter by accident never deletes anything.
export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  return (
    <Dialog variant="center" labelledBy="confirm-title" onClose={onClose}>
      {({ close }) => {
        const confirm = async () => {
          setBusy(true)
          setError('')
          try {
            await onConfirm()
            close()
          } catch (err) {
            setError(err.message)
            setBusy(false)
          }
        }

        return (
          <div className="p-6">
            <h2 id="confirm-title" className="display text-2xl">
              {title}
            </h2>
            <p className="mt-3 text-muted">{message}</p>

            {error && (
              <p role="alert" className="mt-4 rounded-xl border-2 border-ink bg-brand-100 px-4 py-3 text-sm font-medium">
                {error}
              </p>
            )}

            <div className="mt-7 flex gap-3">
              <Button variant="dark" onClick={confirm} loading={busy} loadingText="Deleting…">
                {confirmLabel}
              </Button>
              <Button variant="outline" onClick={close} disabled={busy} data-autofocus>
                Cancel
              </Button>
            </div>
          </div>
        )
      }}
    </Dialog>
  )
}
