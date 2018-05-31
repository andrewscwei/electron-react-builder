# electron-react-builder

> Standalone build/development pipeline for Electron with a React front-end.

`electron-react-builder` is a CLI tool that comes packaged with everything you need to build and develop an Electron app with a React front-end. Why? So you can unbloat your project from extraneous build scripts and dev dependencies and focus on making your product awesome.

Notable features:

1. Hot module reloading with Webpack dev server
2. ESLint config
3. Multilingual setup
4. Client-side router setup
5. Continuous integration setup with [CircleCI](https://circleci.com)
6. Auto-publishing via GitHub releases
7. Auto-updating for distributed apps

## Quick Start

Follow these steps to quickly set up a project built with `electron-react-builder` and create your first release:

1. Generate the project with [`vue-cli`](https://github.com/vuejs/vue-cli), install dependencies and run the dev server:
    ```sh
    $ vue init andrewscwei/electron-react-builder#<release_tag> <project_dir> --clone
    $ cd <project_dir>
    $ yarn
    $ yarn dev
    ```
2. Set up CircleCI:
    1. Push your project to GitHub
    2. Log in to [CircleCI dashboard](https://circleci.com)
    3. **Projects** > **Add Project** > Find the GitHub repo for your project > **Setup project** > **Start building**
    4. In your project settings > **Checkout SSH keys** > **Add user key**
    5. In your project settings > **Environment Variables** > Create the following variables:
        1. `GH_TOKEN`: [@bamcombot](https://github.com/bamcombot)'s GitHub access token (for permission to create releases in a private repo)
        2. `WIN_CSC_LINK`: Windows code sign certificate `base64` string
        3. `WIN_CSC_KEY_PASSWORD`: Password to unlock `WIN_CSC_LINK`
3. Trigger rebuild on CircleCI (your first build probably failed). Once complete, your app create a drafted release in its repo. Note that it is still a draft. Edit it to make it an official release.

## License

This software is released under the [MIT License](http://opensource.org/licenses/MIT).
