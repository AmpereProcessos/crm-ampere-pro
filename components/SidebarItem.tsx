import Link from 'next/link'
import React from 'react'
import { motion } from 'framer-motion'

const sidebarItemVariant = {}
const paragraphVariant = {
  true: {
    opacity: 1,
    transition: {
      duration: 1,
    },
  },
  false: {
    opacity: 0,
    display: 'none',
    transition: {
      duration: 1,
    },
  },
}
type SiderbarItemProps = {
  isOpen: boolean
  icon: React.ReactNode
  text: string
  url: string
}
function SidebarItem({ isOpen, icon, text, url }: SiderbarItemProps) {
  return (
    <>
      <Link title={text} href={url}>
        <motion.div
          initial={`${isOpen}`}
          animate={`${isOpen}`}
          variants={sidebarItemVariant}
          className={`mt-2 flex cursor-pointer items-center ${
            isOpen ? 'justify-start' : 'justify-center '
          } rounded  p-2 duration-300 ease-in  hover:bg-blue-100`}
        >
          {icon}
          {isOpen ? (
            <motion.p variants={paragraphVariant} className={`pl-3 text-[0.65rem] text-gray-600 `}>
              {text}
            </motion.p>
          ) : null}
        </motion.div>
      </Link>
    </>
  )
}

export default SidebarItem
