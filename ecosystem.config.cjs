module.exports = {
  apps: [
    {
      name: 'bolaomax-railway',
      script: 'node',
      args: '--import tsx/esm server.js',
      cwd: '/home/user/webapp',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
