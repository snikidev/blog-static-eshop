// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

module.exports = {
  siteName: "Static E-Shop",
  templates: {
    CommercejsProducts: "/products/:id",
  },
  plugins: [
    {
      use: "gridsome-plugin-tailwindcss",
    },
    {
      use: "gridsome-source-commercejs",
      options: {
        publicKey: "pk_184625ed86f36703d7d233bcf6d519a4f9398f20048ec",
      },
    },
  ],
};
