# actions-initiate-automated-deploy

## How to contribute to this repository

The actions in this repository are solely contained within the src/main.ts file. Make code changes here to modify/extend behavior.

## Include transpiled files with your source code

GitHub Actions requires that you include the transpiled files from Typescript to Javascript with your repository. To do this, run the following: `npm run build && npm run format && npm run package` and include the changes to the `dist` in your git commit.

## Pushing tags

GitHub Actions leverage the concept of tags. Once you push to main, you will have to tag your change. If you don't have a breaking change and don't want to update every consumer of this action, you can force-push the current tag and the consumers will get the new changes without any modification. To do this, use the following command (assuming your desired version is v1): `git tag -a -f v1 -m v1 && git push && git push origin -f v1`
