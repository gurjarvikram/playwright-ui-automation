# Pinned to the Playwright image matching the version in package.json. The image ships the
# three browser engines and every system library they need, which is what makes a container
# run reproduce a CI run exactly — WebKit in particular will not launch without them.
#
# Keep this tag in step with the "playwright" dependency; Dependabot updates the package,
# not this line. The image also supplies the container's Node, so the tag governs whether the
# container satisfies the "engines" floor in package.json.
FROM mcr.microsoft.com/playwright:v1.47.0-jammy

WORKDIR /suite

# Copy the manifests first so the dependency layer is cached until they actually change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Headless, serial by default. Override at run time:
#   docker run --rm -e BROWSER=webkit -e CUCUMBER_WORKERS=4 playwright-ui-automation
ENV CI=true \
    HEADLESS=true \
    BROWSER=chromium \
    CUCUMBER_WORKERS=0

ENTRYPOINT ["npm", "test"]
