import React from 'react'
import Meta from '@/components/Meta'

// @ts-ignore
export const metadata = {
  ...Meta({
    title: 'Register',
  }),
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div>{children}</div>
}
