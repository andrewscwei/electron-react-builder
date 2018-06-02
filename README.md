# electron-react-builder

> Standalone build/development pipeline for Electron with a React front-end.

`electron-react-builder` is a CLI tool that comes packaged with everything you need to build and develop an Electron app with a React front-end. Why? So you can unbloat your project from extraneous build scripts and dev dependencies and focus on making your product awesome.

Notable features:

1. [React](https://reactjs.org/) + [Redux](https://redux.js.org/) + [React Router 4](https://github.com/ReactTraining/react-router)
2. [Styled Components](https://www.styled-components.com/)
3. [ESLint](https://eslint.org/) + [StyleLint](https://github.com/stylelint/stylelint) config
4. Hot module reloading with Webpack dev server
5. Multilingual setup
6. Continuous integration setup with [CircleCI](https://circleci.com)
7. Auto-publishing via GitHub releases
8. Auto-updating for distributed apps

## Quick Start

Follow these steps to quickly set up a project built with `electron-react-builder` and create your first release:

1. Install `electron-react-builder` globally:
    ```sh
    $ npm install -g https://github.com/andrewscwei/electron-react-builder
    ```
2. Generate the project with [`electron-react-builder`], then follow the on-screen instructions to install dependencies and run the dev server:
    ```sh
    $ electron-react-builder init
    ```
3. Set up [CircleCI](https://circleci.com):
    1. Push your project to GitHub.
    2. Log in to [CircleCI dashboard](https://circleci.com).
    3. **Projects** > **Add Project** > Find the GitHub repo for your project > **Setup project** > **Start building**.
    4. In your project settings > **Checkout SSH keys** > **Add user key**.
    5. In your project settings > **Environment Variables** > Create the following variables:
        1. `GH_TOKEN`: GitHub access token (for permission to create releases in a private repo).
        2. `WIN_CSC_LINK`: Windows code sign certificate `base64` string.
        3. `WIN_CSC_KEY_PASSWORD`: Password to unlock `WIN_CSC_LINK`.
    6. Trigger rebuild on CircleCI (your first build probably failed). Once complete, your app create a drafted release in its repo. Note that it is still a draft. Edit it to make it an official release.
4. Set up [Nuts](https://nuts.gitbook.com/) release server:
    1. Check the `README.md` of the generated project.
    2. Under **Publishing to Remote Client**, you'll find a **Deploy to Heroku** button, follow the instructions:
        1. Provide an app name, best to use `<repo_name>-nuts`.
        2. Select your region, leave it in the US.
        3. Provide the GitHub repo of your project in the format `<user>/<repo_name>`.
        4. Provide GitHub access token, either look for an existing one or [create your own](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/).
        5. Provide API username and password—these can be anything as long as you remember them, they are only used if you need to access the API of the Nuts server, which is almost never.
        6. Select **Deploy app** and that's that, take note of your Nuts server's URL, which should be `https://<repo_name>-nuts.herokuapp.com`.
5. Set up a GitHub webhook for your repo so that whenever a release is published, your Nuts server is notified and will pull the latest release:
    1. Go to your project settings in GitHub > **Webhooks** > **Add webhook**.
    2. Set **Payload URL** to `<nuts_server_url>/refresh`.
    3. Select `application/json` for **Content type**.
    4. Set **Secret** to `secret`.
    5. Select **Let me select individual events.** and only check **Release**.
6. In your app's `package.json` file, edit the field `build.publish[0].url`. It should be `<nuts_server_url>/download/latest`. This tells the published app where to look for updates.

## License

This software is released under the [MIT License](http://opensource.org/licenses/MIT).
