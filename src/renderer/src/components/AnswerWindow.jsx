import { Button, ChakraProvider, Flex, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import postErrror from '../fetcher/errorReporter'
import KanaKeyboard from './HiraganaKeyboard'
import AlphabetKeyboard from './AlphabetKeyboard'
const AnswerWindow = () => {
  const [roomCode, setRoomCode] = useState('A')
  const [difficulty, setDifficulty] = useState('')
  const [groupName, setGroupName] = useState('')
  const [errorOccured, setErrorState] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [groupId, setGroupId] = useState('')
  const [keyboardMode, setKeyboardMode] = useState(null) // キーボードモードのState

  const [serverIP, setServerIP] = useState('')
  useEffect(() => {
    const fetchServerIP = async () => {
      try {
        const ip = await window.globalVariableHandler.getSharedData('server_IP')
        console.log(ip)
        setServerIP(ip)
      } catch (error) {
        console.error('Failed to fetch server IP:', error)
      }
    }
    fetchServerIP()
  }, [])

  const fetchRoomData = async () => {
    try {
      const response = await fetch(`http://${serverIP}/api/client/currentroom/${roomCode}`)
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
        await window.globalVariableHandler.setSharedData(
          'currentGroupDifficulty',
          data[0].Difficulty
        )
        setGroupName(data[0].GroupName)
        await window.globalVariableHandler.setSharedData('currentGroupName', data[0].GroupName)
        setGroupId(data[0].GroupId)
        await window.globalVariableHandler.setSharedData('currentGroupId', data[0].GroupId)
        let questionCount, clearQuestionCount
        if (data[0].Difficulty == 4) {
          questionCount = 1
          clearQuestionCount = 1
        } else if (data[0].Difficulty == 3) {
          questionCount = 6
          clearQuestionCount = 5
        } else if (data[0].Difficulty == 2) {
          questionCount = 7
          clearQuestionCount = 5
        } else if (data[0].Difficulty == 1) {
          questionCount = 7
          clearQuestionCount = 4
        }
        await window.globalVariableHandler.setSharedData('currentLastQuestion', questionCount)
        await window.globalVariableHandler.setSharedData(
          'currentLastQuestionToClear',
          clearQuestionCount
        )
        setKeyboardMode('blank')
      }
    } catch (error) {
      console.error('Failed to fetch room data:', error)
      setErrorState(true)
      setErrorMessage('データの取得に失敗しました。もう一度お試しください。' + error)
    }
  }
  useEffect(() => {
    const handleKeyDown = async (event) => {
      if (event.key === 'a') {
        let currentKeyboardType = await window.globalVariableHandler.getSharedData(
          'currentQuestionAnswerType'
        )
        setKeyboardMode(currentKeyboardType)
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleKeyPress = (key) => {
    console.log('Key pressed:', key)
    // 必要に応じて、キーが押されたときの処理をここに追加
  }

  const handleSubmissionComplete = () => {
    setKeyboardMode('blank')
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

        {keyboardMode === 'hiragana' && (
          <KanaKeyboard onKeyPress={handleKeyPress} onSubmitComplete={handleSubmissionComplete} />
        )}
        {keyboardMode === 'alphabet' && (
          <AlphabetKeyboard
            onKeyPress={handleKeyPress}
            onSubmitComplete={handleSubmissionComplete}
          />
        )}

        {keyboardMode === 'blank' && <Flex height="100%" width="100%" bg="white" />}
      </Flex>
    </ChakraProvider>
  )
}

export default AnswerWindow
