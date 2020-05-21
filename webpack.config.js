module.exports = {
    context: __dirname,
        entry: "./app.js",
        output : {

        path: __dirname + "/dist",
        filename : "bundle.js"
    },
    watch: true,
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['babel-preset-env', 'babel-preset-react']
                       
                    }
                }

            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                
                test: /\.(jpe?g|png|gif|svg)$/i,
                loader: "url-loader?name=app/images/[name].[ext]"
            
            }
            //{
            //    test: /\.(png|jpe?g|gif)$/i,
            //    use: [
            //        {
            //            loader: 'file-loader',
            //        },
            //    ],
            //},
            
        ]


    }

}