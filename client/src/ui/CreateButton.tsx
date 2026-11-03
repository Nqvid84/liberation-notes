import { Button } from './Button'
import { useUiStore } from '@/store/uiStore'

export function CreateButton() {
  const openCreate = useUiStore((s) => s.openCreate)

  return (
    <Button
      variant="primary"
      onClick={openCreate}
      style={{ boxShadow: '0 1px 6px rgba(90, 100, 140, 0.09)' }}
    >
      Leave a note
    </Button>
  )
}
