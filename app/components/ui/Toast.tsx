import { useEffect } from 'react'
import { useToast, type Toast as ToastType } from '~/contexts/ToastContext'

type ToastItemProps = {
  toast: ToastType
  onRemove: (id: string) => void
}

const ToastItem = ({ toast, onRemove }: ToastItemProps) => {
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-600 border-green-700'
      case 'error':
        return 'bg-red-600 border-red-700'
      case 'warning':
        return 'bg-yellow-600 border-yellow-700'
      case 'info':
        return 'bg-blue-600 border-blue-700'
      default:
        return 'bg-card-muted border-stroke'
    }
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
        return 'ℹ'
      default:
        return ''
    }
  }

  return (
    <div
      className={`${getToastStyles()} border rounded-lg shadow-lg p-4 mb-2 flex items-center gap-3 text-white min-w-[300px] max-w-[400px] animate-slide-in-right`}
      role="alert"
    >
      <div className="text-xl flex-shrink-0">{getIcon()}</div>
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-white hover:text-gray-200 text-lg leading-none"
        aria-label="Fechar"
      >
        ×
      </button>
    </div>
  )
}

const Toast = () => {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </div>
  )
}

export default Toast
