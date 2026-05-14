module.exports = {
  apps: [
    {
      name: "be-bangjenggots-pos",
      script: "serve",
      args: ["-s", "dist", "-l", "8448"],
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
