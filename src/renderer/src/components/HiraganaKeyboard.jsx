import { useState, useEffect } from 'react'
import {
  Button,
  Grid,
  Input,
  VStack,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Text
} from '@chakra-ui/react'

const kanaList = [
  ['あ', 'い', 'う', 'え', 'お'],
  ['か', 'き', 'く', 'け', 'こ'],
  ['さ', 'し', 'す', 'せ', 'そ'],
  ['た', 'ち', 'つ', 'て', 'と'],
  ['な', 'に', 'ぬ', 'ね', 'の'],
  ['は', 'ひ', 'ふ', 'へ', 'ほ'],
  ['ま', 'み', 'む', 'め', 'も'],
  ['や', '', 'ゆ', '', 'よ'],
  ['ら', 'り', 'る', 'れ', 'ろ'],
  ['わ', '', 'を', '', 'ん']
]

const smallKanaMap = {
  あ: 'ぁ',
  い: 'ぃ',
  う: 'ぅ',
  え: 'ぇ',
  お: 'ぉ',
  や: 'ゃ',
  ゆ: 'ゅ',
  よ: 'ょ',
  つ: 'っ',
  わ: 'ゎ'
}

const dakutenMap = {
  か: 'が',
  き: 'ぎ',
  く: 'ぐ',
  け: 'げ',
  こ: 'ご',
  さ: 'ざ',
  し: 'じ',
  す: 'ず',
  せ: 'ぜ',
  そ: 'ぞ',
  た: 'だ',
  ち: 'ぢ',
  つ: 'づ',
  て: 'で',
  と: 'ど',
  は: 'ば',
  ひ: 'び',
  ふ: 'ぶ',
  へ: 'べ',
  ほ: 'ぼ'
}

const handakutenMap = {
  は: 'ぱ',
  ひ: 'ぴ',
  ふ: 'ぷ',
  へ: 'ぺ',
  ほ: 'ぽ'
}

// eslint-disable-next-line react/prop-types
const KanaKeyboard = ({ onSubmitComplete }) => {
  const [inputText, setInputText] = useState('')
  const maxLength = 10
  const [serverIP, setServerIP] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    const fetchServerIP = async () => {
      const ip = await window.globalVariableHandler.getSharedData('server_IP')
      setServerIP(ip)
    }
    fetchServerIP()
  }, [])

  const handleKanaClick = (char) => {
    setInputText((prev) => (prev.length < maxLength ? prev + char : prev))
  }

  const handleTransform = (map) => {
    setInputText((prev) => {
      const lastChar = prev.slice(-1)
      const transformedChar = map[lastChar] || lastChar
      return prev.slice(0, -1) + transformedChar
    })
  }

  const handleSmallKana = () => {
    handleTransform(smallKanaMap)
  }

  const handleDakuten = () => {
    handleTransform(dakutenMap)
  }

  const handleHandakuten = () => {
    handleTransform(handakutenMap)
  }

  const handleBackspace = () => {
    setInputText((prev) => prev.slice(0, -1))
  }

  const handleClear = () => {
    setInputText('')
  }

  const handleSubmit = async () => {
    window.remoteFunctionHandler.executeFunction('QuestionWindow', 'clearWindow')
    let ans = await window.globalVariableHandler.getSharedData('currentQuestionAnswer')

    let currentQuestionId = await window.globalVariableHandler.getSharedData('currentQuestionId')
    let currentGroupId = await window.globalVariableHandler.getSharedData('currentGroupId')
    let result = ans === inputText ? 'Correct' : 'Wrong'

    const data = {
      GroupId: currentGroupId,
      QuestionId: currentQuestionId,
      Result: result,
      ChallengerAnswer: inputText
    }

    try {
      const response = await fetch(`http://${serverIP}/api/client/answer/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const resultData = await response.json()
      if (resultData.success) {
        console.log('Success:', resultData.message)
      } else {
        console.error('Error:', resultData.message)
      }
    } catch (error) {
      console.error('Network error:', error)
    }

    let currentLastQuestionToClear = await window.globalVariableHandler.getSharedData(
      'currentLastQuestionToClear'
    )
    let currentLastQuestion =
      await window.globalVariableHandler.getSharedData('currentLastQuestion')

    if (result === 'Correct') {
      if (currentLastQuestionToClear === 1) {
        await window.globalVariableHandler.setSharedData('isCleared', true)
        window.remoteFunctionHandler.executeFunction('InstructionWindow', `playEnding`)
      } else {
        await window.globalVariableHandler.setSharedData(
          'currentLastQuestionToClear',
          currentLastQuestionToClear - 1
        )
        await window.globalVariableHandler.setSharedData(
          'currentLastQuestion',
          currentLastQuestion - 1
        )
        window.remoteFunctionHandler.executeFunction('InstructionWindow', `PlayCorrectMovie`)
      }
    } else {
      if (currentLastQuestion === currentLastQuestionToClear) {
        await window.globalVariableHandler.setSharedData('isCleared', false)
        window.remoteFunctionHandler.executeFunction('InstructionWindow', `playEnding`)
      } else {
        await window.globalVariableHandler.setSharedData(
          'currentLastQuestion',
          currentLastQuestion - 1
        )
        window.remoteFunctionHandler.executeFunction('InstructionWindow', `PlayWrongMovie`)
      }
    }
  }
  const confirmSubmit = async () => {
    try {
      await handleSubmit()
      onClose() // Close the modal after successful submission
      if (onSubmitComplete) {
        onSubmitComplete() // Notify the parent component
      }
    } catch (error) {
      console.error('Submission error:', error)
    }
  }
  return (
    <VStack h="100vh" w="100vw" p={4} spacing={4}>
      <Input
        value={inputText}
        isReadOnly
        size="lg"
        variant="filled"
        textAlign="center"
        mb={4}
        fontSize={'50px'}
        borderColor={inputText.length > maxLength ? 'red.500' : 'transparent'}
        borderWidth={inputText.length > maxLength ? '2px' : '1px'}
      />

      <HStack w="full" h="full" spacing={5} alignItems="flex-start">
        <Grid templateColumns={`repeat(${kanaList.length}, 1fr)`} gap={2} w="85%" h="full">
          {kanaList.map((column, index) => (
            <VStack key={index} spacing={2} h="full">
              {column.map((char, charIndex) =>
                char === '' ? (
                  <Button
                    key={`empty-${index}-${charIndex}-${index}-${charIndex}`}
                    colorScheme="gray"
                    fontSize="60px"
                    h="full"
                    w="full"
                    isDisabled
                  >
                    {char}
                  </Button>
                ) : (
                  <Button
                    key={`kana-${char}-${index}-${charIndex}-${index}-${charIndex}`}
                    colorScheme="teal"
                    fontSize="60px"
                    onClick={() => handleKanaClick(char)}
                    h="full"
                    w="full"
                  >
                    {char}
                  </Button>
                )
              )}
            </VStack>
          ))}
        </Grid>

        <VStack w="15%" h="full" spacing={2}>
          <Button colorScheme="blue" onClick={handleSmallKana} h="full" w="full" fontSize={'40px'}>
            小文字
          </Button>
          <Button colorScheme="blue" onClick={handleDakuten} h="full" w="full" fontSize={'40px'}>
            ゛
          </Button>
          <Button colorScheme="blue" onClick={handleHandakuten} h="full" w="full" fontSize={'40px'}>
            ゜
          </Button>
          <Button colorScheme="red" onClick={handleBackspace} h="full" w="full" fontSize={'40px'}>
            1文字消す
          </Button>
          <Button colorScheme="yellow" onClick={handleClear} h="full" w="full" fontSize={'40px'}>
            すべて消す
          </Button>
          <Button colorScheme="green" onClick={onOpen} h="full" w="full" fontSize={'40px'}>
            送信
          </Button>
        </VStack>
      </HStack>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent maxW="90vw" maxH="90vh" margin="auto" p={6} textAlign="center">
          <ModalBody>
            <Text fontSize="75px">送信しますか？</Text>
            <Text fontSize="60px">入力内容: {inputText}</Text>
          </ModalBody>
          <ModalFooter justifyContent="center">
            <Button
              colorScheme="blue"
              mr={3}
              fontSize="50px"
              w={'150px'}
              h={'100px'}
              onClick={confirmSubmit}
            >
              はい
            </Button>
            <Button variant="outline" fontSize="50px" w={'150px'} h={'100px'} onClick={onClose}>
              いいえ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  )
}

export default KanaKeyboard
