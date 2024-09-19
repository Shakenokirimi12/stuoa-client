import { useState, useEffect } from 'react';
import { Button, Input, VStack, HStack, Grid, Center } from '@chakra-ui/react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Text
} from '@chakra-ui/react';

// eslint-disable-next-line react/prop-types
const AlphabetKeyboard = ({ onSubmitComplete, onAnswerSubmitted }) => {
  const [inputText, setInputText] = useState('');
  const maxLength = 10;
  const [serverIP, setServerIP] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchServerIP = async () => {
      const ip = await window.globalVariableHandler.getSharedData('server_IP');
      setServerIP(ip);
    };
    fetchServerIP();
  }, []);

  const handleCharClick = (char) => {
    setInputText((prev) => (prev.length < maxLength ? prev + char : prev));
  };

  const handleBackspace = () => {
    setInputText((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setInputText('');
  };

  const confirmSubmit = async () => {
    try {
      await onAnswerSubmitted(inputText);
      onClose(); // Close the modal after successful submission
      if (onSubmitComplete) {
        onSubmitComplete(); // Notify the parent component
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <Center h="100vh" w="100vw">
      <VStack p={4} spacing={6} w="full" h="full">
        <Input
          value={inputText}
          isReadOnly
          size="lg"
          h={'100px'}
          variant="filled"
          textAlign="center"
          mb={4}
          fontSize={'50px'}
          borderColor={inputText.length > maxLength ? 'red.500' : 'transparent'}
          borderWidth={inputText.length > maxLength ? '2px' : '1px'}
        />

        <HStack w="full" h="full" spacing={6} alignItems="flex-start">
          <VStack w="85%" spacing={4}>
            <Grid templateColumns="repeat(10, 1fr)" gap={4} w="full">
              {['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'].map((char, charIndex) => (
                <Button
                  key={`char-${char}-${charIndex}`}
                  onClick={() => handleCharClick(char)}
                  colorScheme="teal"
                  fontSize="70px"
                  h="25vh"
                  w="110px"
                >
                  {char}
                </Button>
              ))}
            </Grid>
            <Grid templateColumns="repeat(11, 1fr)" gap={4} w="full">
              {['', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ''].map((char, charIndex) => (
                <Button
                  key={`char-${char || 'empty'}-${charIndex}`}
                  onClick={() => handleCharClick(char)}
                  colorScheme={char === '' ? 'gray' : 'teal'}
                  fontSize="70px"
                  h="25vh"
                  w="110px"
                >
                  {char}
                </Button>
              ))}
            </Grid>
            <Grid templateColumns="repeat(11, 1fr)" gap={4} w="full">
              {['', '', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '', ''].map((char, charIndex) => (
                <Button
                  key={`char-${char || 'empty'}-${charIndex}`}
                  onClick={() => handleCharClick(char)}
                  colorScheme={char === '' ? 'gray' : 'teal'}
                  fontSize="70px"
                  h="25vh"
                  w="110px"
                >
                  {char}
                </Button>
              ))}
            </Grid>
          </VStack>

          <VStack w="15%" h="full" spacing={4}>
            <Button colorScheme="red" onClick={handleBackspace} h="full" w="full" fontSize={'50px'}>
              1文字
              <br />
              消す
            </Button>
            <Button colorScheme="yellow" onClick={handleClear} h="full" w="full" fontSize={'50px'}>
              すべて
              <br />
              消す
            </Button>
            <Button colorScheme="green" onClick={onOpen} h="full" w="full" fontSize={'50px'}>
              送信
            </Button>
          </VStack>
        </HStack>
        {inputText !== '' ? (
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
        ) : (
          <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent maxW="90vw" maxH="90vh" margin="auto" p={6} textAlign="center">
              <ModalBody>
                <Text fontSize="75px">解答が入力されていません！</Text>
              </ModalBody>
              <ModalFooter justifyContent="center">
                <Button variant="outline" fontSize="50px" w={'150px'} h={'100px'} onClick={onClose}>
                  閉じる
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </VStack>
    </Center>
  );
};

export default AlphabetKeyboard;
