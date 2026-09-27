import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";

const getOAuthClient = () => {
  const cid = process.env.GOOGLE_CLIENT_ID;
  if (!cid) return null;
  return new OAuth2Client(cid);
};

const isProd = process.env.NODE_ENV === "production";
const cookieOpts = (maxAge) => ({
  httpOnly: true,
  secure: isProd, // false on localhost dev so cookie isn't dropped
  sameSite: isProd ? "none" : "lax",
  maxAge,
  path: "/",
});

export const register = async (req, res) => {
  const { name, email, password, organization, role } = req.body;
  // Role policy (also mirrored in the signup UI copy):
  // - Brand-new workspace (no members yet) → first registrant becomes its Admin (founder).
  // - Existing workspace → staff/manager honored, admin is never self-granted
  //   (downgraded to staff with an explanatory `notice`).

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email and password are required" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ success: false, message: "Invalid email address" });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  }

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const domain = normalizedEmail.split('@')[1];
    const defaultOrg = domain === 'gmail.com' ? 'Personal Workspace' : domain;
    const finalOrg = (organization ? String(organization).trim() : defaultOrg) || defaultOrg;

    const requestedRole = ['staff', 'manager', 'admin'].includes(role) ? role : 'staff';
    const membersInOrg = await User.countDocuments({ organization: finalOrg });

    let finalRole = 'staff';
    let notice = null;
    if (membersInOrg === 0) {
      // Founder: nobody can promote you if the workspace is brand new.
      finalRole = 'admin';
      notice = requestedRole === 'admin'
        ? `Workspace "${finalOrg}" created — you're its Admin.`
        : `No workspace named "${finalOrg}" existed, so one was created and you're its Admin.`;
    } else if (requestedRole === 'admin') {
      finalRole = 'staff';
      notice = 'Admin access needs approval from a workspace admin — you joined as Staff.';
    } else {
      finalRole = requestedRole;
    }

    const newUser = new User({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: finalRole,
      organization: finalOrg
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully, please log in",
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, organization: newUser.organization },
      notice,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ success: false, message: "Server misconfigured" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, message: "Please log in using Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, cookieOpts(7 * 24 * 60 * 60 * 1000));

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role, organization: user.organization },
      token: token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    });

    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        organization: req.user.organization,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const googleAuth = async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ success: false, message: "No credential provided" });
  }
  const client = getOAuthClient();
  if (!client || !process.env.JWT_SECRET) {
    return res.status(500).json({ success: false, message: "Server misconfigured" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload?.email_verified) {
      return res.status(401).json({ success: false, message: "Google email not verified" });
    }
    const { email, name, sub: googleId } = payload;
    const normalizedEmail = email.toLowerCase().trim();
    const domain = normalizedEmail.split('@')[1];
    const org = domain === 'gmail.com' ? 'Personal Workspace' : domain;

    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        if (!user.organization) user.organization = org;
        await user.save();
      }
    } else {
      // Founder rule (same as email register): first member of a new
      // workspace becomes its Admin so the org is never admin-less.
      const membersInOrg = await User.countDocuments({ organization: org });
      user = new User({
        name,
        email: normalizedEmail,
        googleId,
        role: membersInOrg === 0 ? 'admin' : 'staff',
        organization: org
      });
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, cookieOpts(7 * 24 * 60 * 60 * 1000));

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role, organization: user.organization },
      token: token
    });

  } catch (error) {
    console.error("Google auth error:", error?.message || error);
    res.status(500).json({ success: false, message: "Google authentication failed" });
  }
};
