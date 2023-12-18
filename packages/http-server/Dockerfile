# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

# NOTE: due to use of pnpm workspace, this dockerfile needs to be built
# from the repository root context.

ARG NODE_VERSION=18.14.0
ARG PNPM_VERSION=8.7.6

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Set working directory for all build stages.
COPY . /app
WORKDIR /app

################################################################################
# Create a stage for building the application.
FROM base AS build
# Download additional development dependencies before building, as some projects require
# "devDependencies" to be installed to build. If you don't need this, remove this step.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
      pnpm install \
      --filter "@docmaps/http-server" \
      --frozen-lockfile

# Build the dependencies from this workspace
RUN pnpm --filter @docmaps/sdk --filter @docmaps/http-client run build
# Build the application
RUN pnpm --filter @docmaps/http-server run build

################################################################################
# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.local/share/pnpm/store to speed up subsequent builds.
# Leverage bind mounts to package.json and pnpm-lock.yaml to avoid having to copy them
# into this layer.
FROM base AS prod

RUN npm i -g typescript@4.9.5

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
      pnpm install \
      --filter "@docmaps/http-server" \
      --prod \
      --frozen-lockfile

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.

# FIXME: build from Prod instead, once we have resolved the prepare script issue:
#   https://github.com/Docmaps-Project/docmaps/issues/118
FROM prod AS runtime

# Copy the production dependencies from the deps stage and also
# the built application from the build stage into the image.
COPY --from=build /app/packages/http-server/dist /app/packages/http-server/dist

# Copy built sub-dependencies from this same package
COPY --from=build /app/packages/http-client/dist /app/packages/http-server/node_modules/@docmaps/http-client/dist
COPY --from=build /app/packages/sdk/dist /app/packages/http-server/node_modules/@docmaps/sdk/dist
WORKDIR /app/packages/http-server

# Use production node environment by default.
ENV NODE_ENV production

# Run the application as a non-root user.
USER node

# Expose the port that the application listens on.
EXPOSE 8000

# Run the application.
ENTRYPOINT [ "pnpm", "start" ]
