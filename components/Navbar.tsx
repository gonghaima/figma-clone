"use client";

import React, {memo} from 'react';
import Image from 'next/image';
import { ActiveElement, NavbarProps } from '@/types/type';

import ActiveUsers from './users/ActiveUsers';
import { Button } from './ui/button';
import { navElements } from '@/constants';
import ShapesMenu from './ShapesMenu';
import { NewThread } from './comments/NewThread';


const Navbar = ({ activeElement, imageInputRef, handleImageUpload, handleActiveElement }: NavbarProps) => {
  return (
    <nav className='flex select-none items-center justify-between gap-4 bg-primary-black px-5 text-white'>
        <Image src='/assets/logo.svg' alt="FigPro Logo" width={58} height={20} />
        <ul className="flex flex-row">
        {navElements.map((item: ActiveElement | any) => (
          <li
            key={item.name}
            onClick={() => {
              if (Array.isArray(item.value)) return;
              handleActiveElement(item);
            }}
            className={`group px-2.5 py-5 flex justify-center items-center
            ${"hover:bg-primary-grey-200"}
            `}
          >
            {/* If value is an array means it's a nav element with sub options i.e., dropdown */}
            {Array.isArray(item.value) ? (
              <ShapesMenu
                item={item}
                activeElement={activeElement}
                imageInputRef={imageInputRef}
                handleActiveElement={handleActiveElement}
                handleImageUpload={handleImageUpload}
              />
            ) : item?.value === "comments" ? (
              // If value is comments, trigger the NewThread component
              <NewThread>
                <Button className="relative w-5 h-5 object-contain">
                  <Image
                    src={item.icon}
                    alt={item.name}
                    fill
                    className={ ""}
                  />
                </Button>
              </NewThread>
            ) : (
              <Button className="relative w-5 h-5 object-contain">
                <Image
                  src={item.icon}
                  alt={item.name}
                  fill
                  className={ ""}
                />
              </Button>
            )}
          </li>
        ))}
      </ul>
        <ActiveUsers/>
    </nav>
  )
}

export default memo(Navbar, (prevProps, nextProps)=> prevProps.activeElement === nextProps.activeElement); 