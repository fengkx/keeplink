import React, {useRef} from 'react';
import {useClickAway} from 'react-use';
import Link from 'next/link';
import styles from '@/components/Navbar.module.css';
import {LogOut, Menu, Settings, User} from 'react-feather';
import type {user_role} from '@prisma/client';
import MainSearch from '@/components/Search';

export const Navbar: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    userRole: user_role;
  }
> = ({userRole, className}) => {
  const dropdownRef = useRef(null);
  const menuToggler = useRef<HTMLInputElement>(null);
  useClickAway(
    dropdownRef,
    () => {
      if (menuToggler?.current?.checked) {
        menuToggler.current.checked = false;
      }
    },
    ['click']
  );
  return (
    <nav className={`flex flex-row justify-between ${className ?? ''}`}>
      <style jsx>{`
        #nav-menu-toggler:checked ~ .dropdown {
          display: block;
        }

        .dropdown .menu {
          margin-right: -0.5rem;
        }
      `}</style>
      <div className="heading flex items-center">
        <Link href="/">
          <a className="flex items-center">
            <h1 className="ml-2">KeepLink</h1>
          </a>
        </Link>
      </div>
      <MainSearch />
      <div className="nav-items hidden sm:flex flex-row justify-end">
        <Link href="/user/settings">
          <a className={styles.navItem}>
            <Settings className="inline mr-1" size={'1em'} />
            Setting
          </a>
        </Link>
        {userRole === 'admin' && (
          <Link href="/admin/users">
            <a className={styles.navItem}>
              <User className="inline mr-1" size={'1em'} />
              Admin
            </a>
          </Link>
        )}
        <Link href="/logout">
          <a className={styles.navItem}>
            <LogOut className="inline mr-1" size={'1em'} />
            Logout
          </a>
        </Link>
      </div>
      <div className="nav-items flex sm:hidden flex-row justify-end">
        <Link href="/user/settings">
          <a className={`${styles.navItem} cursor-pointer`}>
            <Settings className="inline" size={'1em'} />
          </a>
        </Link>
        <div
          className={`nav-dropdown ${styles.navItem} relative`}
          style={{padding: 0}}
          ref={dropdownRef}
        >
          <input
            className="hidden"
            type="checkbox"
            id="nav-menu-toggler"
            ref={menuToggler}
          />
          <label
            className="px-2 py-0.5 cursor-pointer"
            htmlFor="nav-menu-toggler"
          >
            <a>
              <Menu className="inline" size={'1em'} />
            </a>
          </label>
          <ul className="dropdown hidden menu absolute right-2 top-14 shadow-md w-40 z-20 bg-white">
            {userRole === 'admin' && (
              <li>
                <Link href={'/admin/users'}>
                  <a className={`${styles.navItem} ${styles.dropdownItem}`}>
                    Admin
                  </a>
                </Link>
              </li>
            )}
            <li>
              <Link href={'/logout'}>
                <a className={`${styles.navItem} ${styles.dropdownItem}`}>
                  Logout
                </a>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
