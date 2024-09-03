import { ChakraProvider, Img, Box } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

const QuestionWindow = () => {
  const [serverIP, setServerIP] = useState('')
  const [imageSrc, setImageSrc] = useState('')

  useEffect(() => {
    const fetchServerIP = async () => {
      const ip = await window.globalVariableHandler.getSharedData('server_IP')
      setServerIP(ip)
      setImageSrc(`http://${ip}/api/client/getFile/icon.png`)
    }
    fetchServerIP()
  }, [])

  const showQuestion = async (GroupId, level) => {
    try {
      const response = await fetch(`http://${serverIP}/api/client/${GroupId}/getQuestion/${level}`)
      if (response.ok) {
        const data = await response.json()
        if (data[0].FileName) {
          setImageSrc(`http://${serverIP}/api/client/getFile/` + data[0].FileName)
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'a') {
        showQuestion('d1bfdb31-45fc-4fe4-8bf3-4f50e942a400', '2')
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [serverIP])

  return (
    <ChakraProvider>
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Img
          src={imageSrc || '/fallback-image.png'}
          maxWidth="100%"
          maxHeight="100%"
          objectFit="contain"
        />
      </Box>
    </ChakraProvider>
  )
}

export default QuestionWindow
