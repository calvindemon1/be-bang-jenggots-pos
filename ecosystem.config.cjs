module.exports = {
  apps: [
    {
      name: "be-bangjenggots-pos",
      script: "./node_modules/.bin/serve",
      args: ["-s", "dist", "-l", "8448"],
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
