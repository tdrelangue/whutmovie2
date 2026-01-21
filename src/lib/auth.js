import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const SALT_ROUNDS = 12;
const SESSION_COOKIE_NAME = "whutmovie_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a secure random token
 */
function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Create a new session for a user
 */
export async function createSession(userId) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

/**
 * Set the session cookie (call from server action)
 */
export async function setSessionCookie(token, expiresAt) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

/**
 * Clear the session cookie
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get the current session from cookies
 */
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  // Check if session is expired
  if (new Date() > session.expiresAt) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  return session;
}

/**
 * Get session from token (for middleware - doesn't use cookies() helper)
 */
export async function getSessionFromToken(token) {
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;

  if (new Date() > session.expiresAt) {
    // Don't delete in middleware to avoid edge runtime issues
    return null;
  }

  return session;
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(token) {
  try {
    await prisma.session.delete({ where: { token } });
  } catch {
    // Session may already be deleted
  }
}

/**
 * Authenticate user with username and password
 */
export async function authenticateUser(username, password) {
  const user = await prisma.adminUser.findUnique({
    where: { username },
  });

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return user;
}

/**
 * Check if current request is authenticated (for server components)
 */
export async function isAuthenticated() {
  const session = await getSession();
  return session !== null;
}

/**
 * Get current user (for server components)
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}
