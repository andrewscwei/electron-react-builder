# {{ name }}

This project is built by [electron-react-builder](https://github.com/andrewscwei/electron-react-builder). See its [README](https://github.com/andrewscwei/electron-react-builder/blob/master/README.md) for config details.

## TL;DR

Install project dependences and launch a dev instance locally.

```sh
$ yarn # or npm install, but yarn is *recommended*
$ npm run dev
```

## Building the App for Production

```sh
# Build for Mac
$ npm run build:mac

# Build for Windows
$ npm run build:win
```

## Publishing to Remote Client

You need a [Nuts](https://nuts.gitbook.com/) server to stage published releases. Click below to create one.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/GitbookIO/nuts/tree/master)

Then just run:

```sh
# Publish for Mac
$ npm run publish:mac

# Publish for Windows
$ npm run publish:win
```

## Production Logging

By default, logs are written to the following locations:

- on OS X: `~/Library/Logs/<app name>/log.log`
- on Windows: `%USERPROFILE%\AppData\Roaming\<app name>\log.log`
