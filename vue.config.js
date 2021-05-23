module.exports = {
    pluginOptions: {
      electronBuilder: {
        nodeIntegration: true,
        builderOptions: {
          productName: "Blueprint",
          appId: 'Blueprint',
          publish: ['github'],
          win: {
            "target": [
                "nsis"
            ],
            icon: 'public/blueprint.ico',
            // "requestedExecutionLevel": "requireAdministrator"
          },
          // "nsis": {
          //     "installerIcon": "public/favicon.ico",
          //     "uninstallerIcon": "public/favicon.ico",
          //     "uninstallDisplayName": "Blueprint",
          //     // "license": "license.txt",
          //     // "oneClick": false,
          //     // "allowToChangeInstallationDirectory": true
          // }
        },
      }
    },
    devServer: {
      proxy: 'http://localhost:8000/'
    }
  }