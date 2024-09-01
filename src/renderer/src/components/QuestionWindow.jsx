import { ChakraProvider, Img, Box } from '@chakra-ui/react'
import { useState } from 'react'

const QuestionWindow = () => {
  const [imageSrc, setImageSrc] = useState('http://192.168.1.237:3030/api/client/getFile/icon.png')

  const showQuestion = async (GroupId, level) => {
    try {
      const response = await fetch(
        `http://192.168.1.237:3030/api/client/${GroupId}/getQuestion/${level}`
      )
      if (response.ok) {
        const data = await response.json()
        if (data.FileName) {
          setImageSrc('http://192.168.1.237:3030/api/client/getFile/' + data.FileName)
        } else {
          console.error('Image URL not found in response')
        }
      } else {
        console.error('Failed to fetch the question image')
      }
    } catch (error) {
      console.error('Error fetching the question image:', error)
    }
  }

  return (
    <ChakraProvider>
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Img src={imageSrc} maxWidth="100%" maxHeight="100%" objectFit="contain" />
      </Box>
    </ChakraProvider>
  )
}

export default QuestionWindow
