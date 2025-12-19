'use client'
import PageContainer from '@/components/PageContainer'
import { useToken } from '@/hooks/useToken'
export default function Home() {
  const token = useToken();
  return (
    <PageContainer>
      <h2>Dashboard</h2>
      <p>Welcome to Stock Admin Dashboard.</p>
      <p>Token: {token}</p>
    </PageContainer>
  )
}
