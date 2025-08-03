import { Amplify } from '@aws-amplify/core';
import { signIn, signOut, getCurrentUser, fetchAuthSession } from '@aws-amplify/auth';

const API_ENDPOINT = import.meta.env.PUBLIC_API_ENDPOINT;

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.PUBLIC_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.PUBLIC_COGNITO_CLIENT_ID,
      loginWith: {
        oauth: {
          domain: import.meta.env.PUBLIC_COGNITO_DOMAIN,
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [import.meta.env.PUBLIC_FRONTEND_CALLBACK_URL],
          redirectSignOut: ['http://localhost:4321/'],
          responseType: 'code'
        }
      }
    }
  }
});

export async function signInWithGoogle() {
  try {
    await signIn({ provider: 'Google' });
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function signOutUser() {
  try {
    await signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export async function getAuthToken() {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
  } catch (error) {
    console.error('Get token error:', error);
    return null;
  }
}

export async function getAccessToken() {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString();
  } catch (error) {
    console.error('Get access token error:', error);
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    const session = await fetchAuthSession();
    return !!(user && session.tokens?.idToken);
  } catch {
    return false;
  }
}

export async function getUserInfo() {
  try {
    const user = await getCurrentUser();
    const session = await fetchAuthSession();
    return {
      userId: user.userId,
      username: user.username,
      email: session.tokens?.idToken?.payload?.email,
      name: session.tokens?.idToken?.payload?.name
    };
  } catch (error) {
    console.error('Get user info error:', error);
    return null;
  }
}

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }
  
  const response = await fetch(`${API_ENDPOINT}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    throw new Error('Authentication failed');
  }

  return response;
}