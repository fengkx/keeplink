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
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
} from '@chakra-ui/react';
import { Search } from './Search';
import { user_role } from '@prisma/client';
import { MdOutlineLogout, MdPersonOutline, MdOutlineSettings, MdMenu } from 'react-icons/md';

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

          <ButtonGroup variant="ghost" size="md" display={['none', 'block']}>
            <NextLink href="/user/settings" passHref>
              <Button leftIcon={<Icon as={MdOutlineSettings} />} >
                Setting
              </Button>
            </NextLink>
            {userRole === 'admin'
              && <NextLink href="/admin/users" passHref>
                <Button leftIcon={<Icon as={MdPersonOutline} />} >
                  Admin
                </Button>
              </NextLink>
            }
            <NextLink href="/logout" passHref>
              <Button leftIcon={<Icon as={MdOutlineLogout} />} aria-label="log out">
                Logout
              </Button>
            </NextLink>

          </ButtonGroup>
          <Box display={['block', 'none', 'none']}>
            <Menu isLazy>
              <MenuButton as={IconButton} icon={<Icon as={MdMenu} />} variant="ghost" />
              <Portal>
                <MenuList >
                  <NextLink href="/user/settings" passHref>
                    <MenuItem as={Link} icon={<Icon as={MdOutlineSettings} />}>
                      Setting
                    </MenuItem>
                  </NextLink>

                  {userRole === 'admin'
                    && <NextLink href="/admin/users" passHref>
                      <MenuItem as={Link} icon={<Icon as={MdPersonOutline} />}>
                        Admin
                      </MenuItem>
                    </NextLink>
                  }
                  <NextLink href="/logout" passHref>
                    <MenuItem as={Link} icon={<Icon as={MdOutlineLogout} />}>
                      Logout
                    </MenuItem>
                  </NextLink>
                </MenuList>
              </Portal>
            </Menu>
          </Box>

        </Flex>
      </Flex>
      {/* <div>MobileNavContent</div> */}
    </Box >
  );
}
