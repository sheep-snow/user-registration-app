FROM public.ecr.aws/lambda/nodejs:18

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./

# Default handler (will be overridden by CDK)
CMD ["create-payment-session.handler"]