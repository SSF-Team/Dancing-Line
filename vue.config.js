/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */

module.exports = {
    devServer: {
        client: {
            overlay: false
        }
    },
    transpileDependencies: true,
    configureWebpack: {
        devtool: 'source-map'
    }
}