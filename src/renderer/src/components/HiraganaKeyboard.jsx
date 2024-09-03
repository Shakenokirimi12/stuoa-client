import { useState, useEffect } from 'react'
import { Button, Grid, Input, VStack, HStack } from '@chakra-ui/react'

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

const KanaKeyboard = () => {
  const [inputText, setInputText] = useState('')
  const maxLength = 10
  const [serverIP, setServerIP] = useState('')

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
    let currentQuestionId = 'lv1_q1'
    const response = await fetch(
      `http://${serverIP}/api/client/getQuestionById/${currentQuestionId}`
    )
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    let ans = data.Answer
    if (ans == inputText) {
      //! put code into this range to update the data and inst window
    } else {
      //! put code into this range to update the data and inst window
    }
    //TODO: Update the database stats and update the question and clear number.
    //TODO: The API does not provide the data of how much questions have answered. So, You have to save it to local data, or make API endpoint and alter database to do so.
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
        <Grid templateColumns={`repeat(${kanaList.length}, 1fr)`} gap={2} w="70%" h="full">
          {kanaList.map((column, index) => (
            <VStack key={index} spacing={2} h="full">
              {column.map((char) => (
                <Button
                  key={char}
                  fontSize="60px"
                  onClick={() => handleKanaClick(char)}
                  colorScheme="teal"
                  h="full"
                  w="full"
                >
                  {char}
                </Button>
              ))}
            </VStack>
          ))}
        </Grid>

        <VStack w="30%" h="full" spacing={2}>
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
          <Button colorScheme="green" onClick={handleSubmit} h="full" w="full" fontSize={'40px'}>
            送信
          </Button>
        </VStack>
      </HStack>
    </VStack>
  )
}

export default KanaKeyboard
