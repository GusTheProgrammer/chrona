import FormContainer from '@/components/FormContainer'

export default function Home() {
  return (
    <FormContainer title='Home'>
      <h1 className='text-gray-500 text-center'>
        <a href='/calendar' target=''>
          <strong> Calendar</strong>
        </a>
      </h1>
    </FormContainer>
  )
}
