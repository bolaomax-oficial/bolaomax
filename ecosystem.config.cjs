module.exports = {
  apps: [
    {
      name: 'bolaomax',
      script: 'npx',
      args: 'wrangler dev --ip 0.0.0.0 --port 3000 --local',
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
