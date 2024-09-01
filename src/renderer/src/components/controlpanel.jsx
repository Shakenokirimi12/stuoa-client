import { ChakraProvider, Button, Box, VStack, Heading, Select, HStack } from '@chakra-ui/react'

const ControlPanel = () => {
  const openInstructionWindow = () => window.myAPI.openInstructionWindow()
  const openAnswerWindow = () => window.myAPI.openAnswerWindow()
  const openQuestionWindow = () => window.myAPI.openQuestionWindow()
  const showScreenNumbers = () => window.myAPI.showScreenNumbers()
  const showConnectionChecker = () => window.myAPI.showConnectionChecker()
  return (
    <ChakraProvider>
      <Box p={6} maxW="md" mx="auto">
        <VStack spacing={6} align="center">
          <Heading as="h1" size="lg" mb={4}>
            Save the UoA Client App
          </Heading>
          <Heading as="h2" size="md" color="gray.600">
            Control Panel
          </Heading>
          <VStack spacing={4} w="full">
            <Button colorScheme="blue" size="lg" variant="solid" onClick={showConnectionChecker}>
              Check Server Connection
            </Button>
            <HStack w={'full'}>
              <Button
                colorScheme="teal"
                width="500px"
                size="lg"
                variant="solid"
                onClick={openInstructionWindow}
              >
                Open Instruction Window
              </Button>
              <Select>
                <option>Display 1</option>
                <option>Display 2</option>
                <option>Display 3</option>
                <option>Display 4</option>
              </Select>
            </HStack>
            <HStack w={'full'}>
              <Button
                colorScheme="teal"
                width="500px"
                size="lg"
                variant="solid"
                onClick={openAnswerWindow}
              >
                Open Answer Window
              </Button>
              <Select>
                <option>Display 1</option>
                <option>Display 2</option>
                <option>Display 3</option>
                <option>Display 4</option>
              </Select>
            </HStack>
            <HStack w={'full'}>
              <Button
                colorScheme="teal"
                width="500px"
                size="lg"
                variant="solid"
                onClick={openQuestionWindow}
              >
                Open Question Window
              </Button>
              <Select>
                <option>Display 1</option>
                <option>Display 2</option>
                <option>Display 3</option>
                <option>Display 4</option>
              </Select>
            </HStack>
            <Button colorScheme="orange" size="lg" variant="solid" onClick={showScreenNumbers}>
              Show Screen Numbers
            </Button>
          </VStack>
        </VStack>
      </Box>
    </ChakraProvider>
  )
}

export default ControlPanel
