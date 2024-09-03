import { ChakraProvider, Img, Box } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

const QuestionWindow = () => {
  const [imageSrc, setImageSrc] = useState(`http://${serverIP}/api/client/getFile/icon.png`)

  const [serverIP, setServerIP] = useState('')

  useEffect(() => {
    const fetchServerIP = async () => {
      const ip = await window.globalVariableHandler.getSharedData('server_IP')
      setServerIP(ip)
    }
    fetchServerIP()
  }, [])

  const showQuestion = async (GroupId, level) => {
    try {
      const response = await fetch(`http://${serverIP}/api/client/${GroupId}/getQuestion/${level}`)
      if (response.ok) {
        const data = await response.json()
        //? set current question value
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
        showQuestion('d1bfdb31-45fc-4fe4-8bf3-4f50e942a400', '2') // 適切なGroupIdとlevelを渡してください
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    // クリーンアップ関数を追加
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <ChakraProvider>
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Img src={imageSrc} maxWidth="100%" maxHeight="100%" objectFit="contain" />
      </Box>
    </ChakraProvider>
  )
}

export default QuestionWindow
