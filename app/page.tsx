import FormContainer from '@/components/FormContainer'

export default function Home() {
  return (
    <FormContainer title='Home'>
      <h1 className='text-gray-500 text-center'>
        <a href='/scheduler' target=''>
          <strong> Scheduler</strong>
        </a>
      </h1>
    </FormContainer>
  )
}
