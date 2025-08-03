import { APIGatewayProxyEvent } from 'aws-lambda';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const userPoolId = process.env.COGNITO_USER_POOL_ID!;
const clientId = process.env.COGNITO_CLIENT_ID!;

const verifier = CognitoJwtVerifier.create({
  userPoolId,
  tokenUse: 'id',
  clientId,
});

export interface AuthenticatedUser {
  userId: string;
  email: string;
  name?: string;
}

export async function verifyJwtToken(token: string): Promise<AuthenticatedUser | null> {
  try {
    const payload = await verifier.verify(token);
    return {
      userId: payload.sub,
      email: payload.email as string,
      name: payload.name as string
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export function extractTokenFromEvent(event: APIGatewayProxyEvent): string | null {
  const authHeader = event.headers.Authorization || event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function getUserFromContext(event: APIGatewayProxyEvent): AuthenticatedUser | null {
  const claims = event.requestContext.authorizer?.claims;
  if (!claims) return null;
  
  return {
    userId: claims.sub,
    email: claims.email,
    name: claims.name
  };
}