import { motion } from "framer-motion";

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
        scale: 0.98,
    },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
    },
    exit: {
        opacity: 0,
        y: -20,
        scale: 1.02,
        transition: {
            duration: 0.3
        }
    },
};

const pageTransition = {
    duration: 0.5,
    ease: [0.43, 0.13, 0.23, 0.96], // Premium cubic-bezier
};

const PageWrapper = ({ children }) => {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
        >
            {children}
        </motion.div>
    );
};

export default PageWrapper;
