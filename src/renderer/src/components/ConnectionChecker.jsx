import { Button, ChakraProvider, Center, Box, Text } from '@chakra-ui/react'
import { useState, useEffect } from 'react'

const ConnectionChecker = () => {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://192.168.1.237:3030/api/alive')
        if (response.ok) {
          setSuccess(true)
        } else {
          setSuccess(false)
        }
      } catch (error) {
        setSuccess(false)
      } finally {
        setLoading(false)
      }
    }

    checkConnection()
  }, [])

  const closeWindow = () => {
    window.close()
  }

  return (
    <ChakraProvider>
      <Center height="100vh">
        <Box textAlign="center">
          {loading ? (
            <Text fontSize="xl">読み込み中...</Text>
          ) : success ? (
            <Box>
              <Text fontSize="xl" mb={4}>
                接続成功！
              </Text>
              <Button colorScheme="teal" onClick={closeWindow}>
                閉じる
              </Button>
            </Box>
          ) : (
            <Text fontSize="xl" color="red.500">
              接続失敗
            </Text>
          )}
        </Box>
      </Center>
    </ChakraProvider>
  )
}

export default ConnectionChecker
