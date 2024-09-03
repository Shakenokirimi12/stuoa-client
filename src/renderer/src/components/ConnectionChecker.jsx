import { Button, ChakraProvider, Center, Box, Text } from '@chakra-ui/react'
import { useState, useEffect } from 'react'

const ConnectionChecker = () => {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [serverIP, setServerIP] = useState('')

  useEffect(() => {
    const fetchServerIP = async () => {
      try {
        console.log(window.globalVariableHandler.getSharedData)
        const ip = await window.globalVariableHandler.getSharedData('server_IP')
        console.log(ip)
        setServerIP(ip)
      } catch (error) {
        console.error('Failed to fetch server IP:', error)
      }
    }
    fetchServerIP()
  }, [])

  useEffect(() => {
    if (!serverIP) return // serverIP が取得される前にチェックしないようにする

    const checkConnection = async () => {
      try {
        const response = await fetch(`http://${serverIP}/api/alive`)
        if (response.ok) {
          setSuccess(true)
        } else {
          setSuccess(false)
        }
      } catch (error) {
        setSuccess(false)
        console.error('Connection check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkConnection()
  }, [serverIP]) // serverIPが更新されるたびに接続をチェック

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
