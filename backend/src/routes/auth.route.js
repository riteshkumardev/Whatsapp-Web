import express from "express";
import trimRequest from "trim-request";
import {
  login,
  logout,
  refreshToken,
  register,
} from "../controllers/auth.controller.js";

const router = express.Router();

// Register Route
router.route("/register").post(trimRequest.all, register);

// Login Route
router.route("/login").post(trimRequest.all, login);

// Logout Route
router.route("/logout").post(trimRequest.all, logout);

// Refresh Token Route
router.route("/refreshtoken").post(trimRequest.all, refreshToken);

export default router;