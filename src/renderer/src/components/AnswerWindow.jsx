import { Button, ChakraProvider, Flex, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import postErrror from '../fetcher/errorReporter'
import KanaKeyboard from './HiraganaKeyboard'
const AnswerWindow = () => {
  const [roomCode, setRoomCode] = useState('A')
  const [difficulty, setDifficulty] = useState('')
  const [groupName, setGroupName] = useState('')
  const [errorOccured, setErrorState] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [groupId, setGroupId] = useState('')
  const [keyboardMode, setKeyboardMode] = useState(null) // キーボードモードのState

  const fetchRoomData = async () => {
    try {
      const response = await fetch(`http://192.168.1.237:3030/api/client/currentroom/${roomCode}`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      if (data.length === 0) {
        setErrorState(true)
        setErrorMessage('受付未完了エラーが発生しました。係員が参ります。しばらくお待ちください。')
        try {
          await postErrror('受付処理未完了エラー', 'A')
        } catch (error) {
          setErrorMessage(
            '受付処理未完了エラーが発生しました。エラーを送信できませんでした。係員をお呼びください。<br/> error:' +
              error
          )
        }
      } else {
        setErrorState(false)
        setDifficulty(data[0].Difficulty)
        setGroupName(data[0].GroupName)
        setGroupId(data[0].GroupId)
        setKeyboardMode('hiragana') // キーボードモードを「ひらがな」に設定
      }
    } catch (error) {
      console.error('Failed to fetch room data:', error)
      setErrorState(true)
      setErrorMessage('データの取得に失敗しました。もう一度お試しください。' + error)
    }
  }

  const handleKeyPress = (key) => {
    console.log('Key pressed:', key)
    // 必要に応じて、キーが押されたときの処理をここに追加
  }

  return (
    <ChakraProvider>
      <Flex
        height="100vh"
        width="100vw"
        alignItems="center"
        justifyContent="center"
        padding="4"
        bg="gray.100"
      >
        {keyboardMode === null && (
          <VStack>
            <Button
              size="lg"
              fontSize="2xl"
              width="300px"
              height="100px"
              colorScheme="blue"
              borderRadius="md"
              _hover={{ bg: 'blue.600' }}
              onClick={fetchRoomData}
            >
              ログイン
            </Button>
            {errorOccured ? (
              <Text color="red.500" dangerouslySetInnerHTML={{ __html: errorMessage }} />
            ) : (
              <Text>{`${roomCode} ${difficulty} ${groupName}`}</Text>
            )}
          </VStack>
        )}

        {keyboardMode === 'hiragana' && <KanaKeyboard onKeyPress={handleKeyPress} />}

        {keyboardMode === 'blank' && <Flex height="100%" width="100%" bg="white" />}
      </Flex>
    </ChakraProvider>
  )
}

export default AnswerWindow
