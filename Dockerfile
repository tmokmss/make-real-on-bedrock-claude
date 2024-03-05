FROM public.ecr.aws/lambda/nodejs:20 AS builder
ARG BUILD_ENV=production
ARG APP_HOST=localhost:3000
ARG LINK_HOST=localhost:3000
ENV NEXT_PUBLIC_ENV=${BUILD_ENV}
ENV NEXT_PUBLIC_APP_HOST=${APP_HOST}
ENV NEXT_PUBLIC_LINK_HOST=${LINK_HOST}

WORKDIR /build
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY ./ ./
RUN --mount=type=cache,target=/build/.next/cache npm run build

FROM public.ecr.aws/lambda/nodejs:20 AS runner
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.7.1 /lambda-adapter /opt/extensions/lambda-adapter
ENV AWS_LWA_PORT=3000
ENV AWS_LWA_READINESS_CHECK_PATH="/api/health"
# ENV RUST_LOG=debug # enable LWA debug logging

COPY --from=builder /build/next.config.js ./
COPY --from=builder /build/public ./public
COPY --from=builder /build/.next/static ./.next/static
COPY --from=builder /build/.next/standalone ./
COPY --from=builder /build/run.sh ./run.sh

# Create a symlink to redirect .next/cache to a /tmp, which is the only writable directory in Lambda
RUN ln -s /tmp/cache ./.next/cache

ENTRYPOINT ["sh"]
CMD ["run.sh"]
