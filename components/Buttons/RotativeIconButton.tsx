import { motion } from 'framer-motion';
import React from 'react';
type RotativeIconButtonProps = {
  active: boolean;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
  rotation?: number;
  icon: React.ReactNode;
  styling?: string;
};
function RotativeIconButton({
  active,
  setActive,
  rotation = 180,
  icon,
  styling = 'flex items-center justify-center min-w-fit text-primary-foreground',
}: RotativeIconButtonProps) {
  return (
    <motion.button
      animate={active ? 'active' : 'inactive'}
      variants={{
        inactive: {
          rotate: 0,
        },
        active: {
          rotate: rotation,
        },
      }}
      onClick={() => setActive((prev) => !prev)}
      className={styling}
    >
      {icon}
    </motion.button>
  );
}

export default RotativeIconButton;
