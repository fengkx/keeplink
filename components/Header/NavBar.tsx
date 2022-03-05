import React from 'react';
import NextLink from 'next/link';
import {
  chakra,

  Link,
  Box,
  Flex,
  useColorModeValue,
  Button,
  Heading,
  ButtonGroup,
} from '@chakra-ui/react';
import { Search } from './Search';
import { user_role } from '@prisma/client';
import { ArrowBackIcon, BellIcon, SettingsIcon } from '@chakra-ui/icons';

interface NavBarProps {
  userRole: user_role
}
export function NavBar({ userRole }: NavBarProps) {
  const bg = useColorModeValue('white', 'gray.800');

  return (
    <chakra.header
      w="full"
      overflowY="hidden"
      bg={bg}
      pos='sticky'
    >
      <NavContetent userRole={userRole} />

    </chakra.header >
  );
}

function NavContetent({ userRole }: NavBarProps) {

  const logoTextColor = useColorModeValue('brand.800', 'brand.800');

  return (
    <Box h="4.5rem" mx="auto" maxW="8xl">
      <Flex
        w="full"
        h="full"
        px="6"
        alignItems="center"
        justifyContent="space-between"
      >
        <Flex align="center">
          <NextLink href="/">
            <Link >
              <Heading as="h1" size="md" fontFamily='"Work Sans", sans-serif' color={logoTextColor}>KeepLink</Heading>
            </Link>
          </NextLink>
        </Flex>
        <Flex
          justify="flex-end"
          align="center"
          color="gray.400"
          w='100%'
        >
          <Flex justify="center" flex={1} >
            <Search maxW={'xl'} />
          </Flex>

          <ButtonGroup variant="ghost" size="md">
            <NextLink href="/user/settings">
              <Button leftIcon={<SettingsIcon />} >
                Setting
              </Button>
            </NextLink>
            {userRole === 'admin'
              && <NextLink href="/admin/users">
                <Button leftIcon={<BellIcon />} >
                  Admin
                </Button>
              </NextLink>
            }
            <NextLink href="/logout">
              <Button leftIcon={<ArrowBackIcon />} aria-label="log out">
                Logout
              </Button>
            </NextLink>

          </ButtonGroup>

        </Flex>
      </Flex>
      {/* <div>MobileNavContent</div> */}
    </Box >
  );
}
