'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function BackButton() {
  const router = useRouter()

  return (
    <Button variant="secondary" onClick={router.back} size="sm">
      <ArrowLeftIcon className="size-4" /> Back
    </Button>
  )
}
