import express from "express";
import authRoutes from "./auth.route.js";
import userROutes from "./user.route.js";
import ConversationRoutes from "./conversation.route.js";
import MessageRoutes from "./message.route.js";

const router = express.Router();

// --- यह रूट टेस्ट करने के लिए जोड़ें ---
router.get("/", (req, res) => {
  res.status(200).json({ message: "API V1 is working fine! Use specific endpoints like /auth or /user." });
});
// ----------------------------------

router.use("/auth", authRoutes);
router.use("/user", userROutes);
router.use("/conversation", ConversationRoutes);
router.use("/message", MessageRoutes);

export default router;