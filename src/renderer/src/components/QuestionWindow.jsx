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
          await window.globalVariableHandler.setSharedData('currentQuestionId', data[0].ID)
          await window.globalVariableHandler.setSharedData('currentQuestionAnswer', data[0].Answer)
          await window.globalVariableHandler.setSharedData(
            'currentQuestionAnswerType',
            data[0].Type
          )
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
    const handleKeyDown = async (event) => {
      if (event.key === 'a') {
        let currentGroupId = await window.globalVariableHandler.getSharedData('currentGroupId')
        let currentGroupDifficulty =
          await window.globalVariableHandler.getSharedData('currentGroupDifficulty')
        showQuestion(currentGroupId, currentGroupDifficulty)
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [serverIP])

  return (
    <ChakraProvider>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        width={'100vw'}
      >
        <Img
          src={imageSrc}
          objectFit="contain" // Ensures the image maintains its aspect ratio within the container
          width="100vw" // Allows the image to scale up or down depending on its original size
          height="100vh"
        />
      </Box>
    </ChakraProvider>
  )
}

export default QuestionWindow
