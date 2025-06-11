import express from 'express'
import { authenticateUser, loginUser, logoutUser, oauthCallback, oauthLogin, registerUser, resendEmail, verifyEmail } from '../controllers/authController';
import { authenticate } from '../middlewares/authenticate';
const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Register or login user via Google OAuth
router.get("/oauth/google", oauthLogin);

// Handle OAuth callback
router.get("/oauth/callback", oauthCallback);

// Login user
router.post("/login", loginUser);

// Check if user is authenticated
router.get("/authenticate", authenticate, authenticateUser);

// Logout user
router.post("/logout", logoutUser);

// Verify user's email
router.get("/verify/:token", verifyEmail);

// Resend verification email
router.post("/resend-email", resendEmail);



export default router;