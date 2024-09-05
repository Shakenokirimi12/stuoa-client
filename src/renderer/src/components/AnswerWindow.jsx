import { Button, ChakraProvider, Flex, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import KanaKeyboard from './HiraganaKeyboard'
import AlphabetKeyboard from './AlphabetKeyboard'
import postError from '../fetcher/errorReporter'

const AnswerWindow = () => {
  const [roomId, setRoomId] = useState('')
  const [errorOccured, setErrorState] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [keyboardMode, setKeyboardMode] = useState(null)

  const [serverIP, setServerIP] = useState('')

  useEffect(() => {
    const fetchServerIP = async () => {
      try {
        const ip = await window.globalVariableHandler.getSharedData('server_IP')
        setServerIP(ip)
        const code = await window.globalVariableHandler.getSharedData('roomId')
        setRoomId(code)
      } catch (error) {
        console.error('Failed to fetch server IP:', error)
      }
    }

    fetchServerIP()
  }, [])

  const fetchRoomData = async () => {
    try {
      const response = await fetch(`http://${serverIP}/api/client/currentroom/${roomId}`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      if (data.length === 0) {
        setErrorState(true)
        setErrorMessage('受付未完了エラーが発生しました。係員が参ります。しばらくお待ちください。')
        try {
          await postError('受付処理未完了エラー', roomId)
        } catch (error) {
          setErrorMessage(
            '受付処理未完了エラーが発生しました。エラーを送信できませんでした。係員をお呼びください。<br/> error:' +
              error
          )
        }
      } else {
        setErrorState(false)
        await window.globalVariableHandler.setSharedData(
          'currentGroupDifficulty',
          data[0].Difficulty
        )
        await window.globalVariableHandler.setSharedData('currentGroupName', data[0].GroupName)
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
        window.remoteFunctionHandler.executeFunction('InstructionWindow', 'playOpening')
        setKeyboardMode('blank')
      }
    } catch (error) {
      console.error('Failed to fetch room data:', error)
      setErrorState(true)
      setErrorMessage('データの取得に失敗しました。もう一度お試しください。' + error)
    }
  }

  const handleSubmissionComplete = () => {
    setKeyboardMode('blank')
  }

  window.remoteFunctionHandler.onInvokeFunction(async (functionName) => {
    if (functionName === 'showKeyboard') {
      let currentKeyboardType = await window.globalVariableHandler.getSharedData(
        'currentQuestionAnswerType'
      )
      setKeyboardMode(currentKeyboardType)
    } else if (functionName === 'waitForStaffControl') {
      setKeyboardMode('waitingForStaffControl')
    }
  })

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
        {(keyboardMode === 'waitingForStaffControl' || keyboardMode === null) && (
          <VStack>
            <Button
              size="sm"
              width="100px"
              height="100px"
              colorScheme="gray"
              borderRadius="md"
              onClick={() => setKeyboardMode('startButton')}
              position="absolute"
              top="10px"
              left="10px"
            ></Button>
          </VStack>
        )}
        {keyboardMode === 'startButton' && (
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
            {errorOccured && (
              <Text color="red.500" dangerouslySetInnerHTML={{ __html: errorMessage }} />
            )}
          </VStack>
        )}

        {keyboardMode === 'hiragana' && (
          <KanaKeyboard onSubmitComplete={handleSubmissionComplete} />
        )}
        {keyboardMode === 'alphabet' && (
          <AlphabetKeyboard onSubmitComplete={handleSubmissionComplete} />
        )}

        {keyboardMode === 'blank' && <Flex height="100%" width="100%" bg="white" />}
      </Flex>
    </ChakraProvider>
  )
}

export default AnswerWindow
