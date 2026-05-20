import { motion } from "framer-motion";

const PageTransition = ({ children, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.22, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
