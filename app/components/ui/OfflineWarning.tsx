import { useOnlineStatus } from '~/hooks/useOnlineStatus'

const OfflineWarning = () => {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-600 text-white py-2 px-4 z-[9998] shadow-lg">
      <div className="max-w-[95vw] mx-auto flex items-center justify-center gap-2 text-sm font-semibold">
        <span className="text-lg">⚠</span>
        <span>Você está offline. As alterações serão salvas quando a conexão for restaurada.</span>
      </div>
    </div>
  )
}

export default OfflineWarning
