import { useState, useEffect } from 'react';
import { Button, Input, VStack, Center, Box, Img } from '@chakra-ui/react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Text
} from '@chakra-ui/react';

const NumberInput = ({ onSubmitComplete, onAnswerSubmitted }) => {
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

    const handleKeyDown = (e) => {
      const { key } = e;
      if (!isNaN(key) && inputText.length < maxLength) {
        // If the key is a number and within the max length
        setInputText((prev) => prev + key);
      } else if (key === 'Backspace' || key === '+') {
        // Handle backspace and "+" as backspace
        handleBackspace();
      } else if (key === 'Enter') {
        // Submit the answer on Enter
        onOpen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputText, maxLength]);

  const handleBackspace = () => {
    setInputText((prev) => prev.slice(0, -1));
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
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Img
            src={`http://${serverIP}/api/client/getFile/tenkey.png`}
            maxWidth="100%"
            maxHeight="100%"
            objectFit="contain"
          />
        </Box>
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

export default NumberInput;
