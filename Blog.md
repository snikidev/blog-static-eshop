# Static e-comemrce website with Gridsome, Commerce.js and Vercel

In this post I’m going to talk about how to build a very performant e-commerce site for a rather simple purpose.

## Situation

My wife is a pastry chef who has a blog where she shares her best recipes. It’s currently a bit outdated and hosted on WordPress. Recently she decided to start selling a digital product - e-books, collection of her best recipes. For that, we’d need an ecommerce solution, obviously.

Normally, if you have a WordPress site already, you’d go with something like WooCommerce or maybe Shopify plugin for WordPress or some other plugin solution, which I don’t like for multiple reasons:

1. **Performance:** wordpress sites are not known for their best time to load speeds
2. **Maintenance:**
   - I’d need to write in php which I, personally, don’t enjoy as a Front-end JS developer
   - To update something on a website, I’d need to go through a complicated and lengthy process of updating a theme, building locally css and js assets with webpack (because I’m also using Vue on her WP site, long story), packaging it into .zip folder, naming it differently from what it’s currently is, and then uploading it through ftp and activating that theme. Then if I find something wrong with it, I’d need to go back to fix it and do this whole process all over again.
3. **Customization:**
   - Same as 2a
   - If you want to create a custom functionality, then you’d either need a plugin, which would mean a cost of a third party service, and it will damage your performance, or I’d need to do a lot of hacking to make WP do something it wasn’t supposed to, which is not ideal.
4. **Cost:**
   - I’m currently paying US\$5-10/month to host wordpress site on AWS LightSail service, which isn’t a lot, but if it could be nothing, why don’t I use it?
   - Same as 3b, since my wife has me, ie her personal developer, we don’t need to pay for a plugin and overload our site with more scripts/css, I could just put together quickly a lambda function that would do what we need through a rest api, eg syncing users to a free CRM of choice to start with, such as [CapsuleCRM](https://capsulecrm.com), who seems to have quite a good [API Docs](https://developer.capsulecrm.com). [I might do another post on how to create a lambda function to sync your commercejs data with CapsuleCRM for your static e-shop]

## Solution

To have an easy deployment, freedom in customization, and enjoy the dev process in general, I’ve decided to move away from WordPress once and for all. In the new version of the site for content management we’ll be using [Sanity.io](https://www.sanity.io), for commerce part - headless [Commerce.js](https://commercejs.com) (obviously) and host it all on [Vercel](http://vercel.com).

I like working with Vue on my side projects, since on my full-time job I work a lot with React, so I went with [Gridsome](https://gridsome.org) for a static site generator.

## Setup

Following tbe [Getting Started](https://gridsome.org/docs/) guide, let's install Gridsome and create a project

```
npm install --global @gridsome/cli
gridsome create static-eshop
cd static-eshop
```

To launch out dev server we'll need to run

```
yarn develop
```

Now let's add TailwindCSS for nice and easy styling. For that we'll need [tailwind gridsome plugin](https://gridsome.org/plugins/gridsome-plugin-tailwindcss), and it will initialise global styles for us and give us a script to generate a `tailwind.config.js` in case we'll want to customise anything.

```
yarn add -D gridsome-plugin-tailwindcss
./node_modules/.bin/tailwind init
```

Our `gridsome.config.js` should be aware that we're using tailwind, so let's put this in our `plugins` property

```js
{
  use: "gridsome-plugin-tailwindcss";
}
```

Now when we run `yarn develop`, we can see that styling has changed to default tailwindcss.

Before we get to styling and outputting items on a page, let’s get the content first. For that, I put together a [gridsome source plugin](https://gridsome.org/plugins/gridsome-source-commercejs) that will helo you query all your products from your commercejs store.

```
yarn add -D gridsome-source-commercejs
```

For now we'll also use commercejs demo key that they provide in their docs to avoid creating products on our own, and put code for commercejs source plugin setup in `gridsome.config.js`.

```js
{
    use: "gridsome-source-commercejs",
      options: {
        publicKey: "pk_184625ed86f36703d7d233bcf6d519a4f9398f20048ec",
      },
    },
}
```

_NOTE: in production, you better keep your keys in a separate `.env` file or elsewhere safe._

## Query the data

So now we can launch our dev server, go to `http://localhost:8080/___explore` and query our products with properties that we need. For current purpose I'll only need a few.

```
query {
    allCommercejsProducts {
        edges {
            node {
                price {
                    formatted
                }
                name
                description
                id
                media {
                    source
                }
            }
        }
    }
}
```

Insert the same query on our `Index.vue` page in `<static-query></static-query>`.

To query each products info on a single page, we'll need to use `<page-query></page-query>` which allows use of dynamic data, ie product id in our case. To setup a single page, we'll need to use templates. In `gatsby.config.js` we'll put

```js
templates: {
  CommercejsProducts: "/products/:id",
},
```

*Note: in templates, the property should always be named `CommercejsProducts` because that's the name for it in `gatsby-source-plugin`.*

So now, when we go to `/products/product_id` we'll use `CommercejsProducts.vue` page in `templates` folder.

Page query for a single page would look like this 

```
query ($id: ID!) {
  commercejsProducts(id: $id) {
    price {
      formatted_with_code
    }
    name
    description
    id
    media {
      source
    }
  }
}
```

Now let's put all this data on a page, and create designs.

## Design

For that we'll need a `<Product />` component with tailwindcss styiling (only!).

```js
<template>
  <div class="max-w-sm rounded overflow-hidden shadow-lg relative">
    <img class="w-full" :src="image" :alt="name" />
    <div class="px-6 py-4">
      <div class="flex justify-between align-center mb-2">
        <div class="font-bold text-lg" v-html="name"></div>
        <div class="font-semibold text-gray-800" v-html="`$${price}`"></div>
      </div>
      <p class="text-gray-700 text-base mb-8" v-html="description"></p>
      <button
        class="text-sm bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 w-full absolute bottom-0 left-0"
        @click="onAddToCart(id)"
      >
        Add to cart
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Product",
  props: {
    description: String,
    id: String,
    image: String,
    name: String,
    onAddToCart: Function,
    price: String,
  },
};
</script>

```

And modify the layout a bit. Add margins at the bottom to make it look a bit better. And use our `<Product />` component

```js
<template>
  <Layout :quantity="quantity" :checkout-link="checkoutLink">
    <h1 class="text-lg font-semibold mb-8 text-gray-700">All Products</h1>

    <div class="grid grid-cols-3 gap-4">
      <Product
        v-for="product in $static.allCommercejsProducts.edges"
        :key="product.node.id"
        :name="product.node.name"
        :image="product.node.media.source"
        :description="product.node.description"
        :id="product.node.id"
        :price="product.node.price.formatted"
        :onAddToCart="addToCart"
      />
    </div>
  </Layout>
</template>

<static-query>
query {
  allCommercejsProducts {
    edges {
      node {
        price {
          formatted
        }
        name
        description
        id
        media {
          source
        }
      }
    }
  }
}
</static-query>

<script>
import Product from "../components/Product";
import commerce from "../utils";

export default {
  metaInfo: {
    title: "Hello, world!",
  },
  components: {
    Product,
  },
  data: () => ({
    quantity: 0,
    checkoutLink: null,
  }),
};
</script>
```

We'll also need a `<Cart />` component to have a checkout button and display number of items in a basket.

```js
<template>
  <div
    class="font-sans block mt-4 lg:inline-block lg:mt-0 lg:ml-6 align-middle text-black hover:text-gray-700"
  >
    <a :href="checkoutLink" target="_blank" class="relative flex">
      <svg
        class="flex-1 w-8 h-8 fill-current text-green-300"
        viewbox="0 0 24 24"
      >
        <path
          d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z"
        />
      </svg>
      <span
        class="absolute right-0 top-0 rounded-full bg-gray-600 w-4 h-4 top right p-0 m-0 text-white font-mono text-sm  leading-tight text-center"
        >{{ quantity }}
      </span>
    </a>
  </div>
</template>

<script>
export default {
  name: "Cart",
  props: {
    quantity: Number,
    checkoutLink: String,
  },
};
</script>
```

## Cart

`<static-query/>` and `gridsome-source-commercejs` plugin allows us only to query the data. To actually create a cart, add, delete and remove items from it and create a checkout process, we'll need a `@chec/commerce.js` SDK. Let's install it, intialize and export it from a separate `utils/index.js` file so that we could reuse it across different componenets.

```
yarn add @chec/commerce.js
```

```js
// utils/index.js
import Commerce from "@chec/commerce.js";
export default new Commerce(
    "pk_184625ed86f36703d7d233bcf6d519a4f9398f20048ec"
  );
```

Now let's get a number of items in a cart (which will be 0 at first, obviously). In our `Index.vue` page:

```js
// up top
import commerce from '../utils.js'

// down in Vue
mounted() {
    commerce.cart.retrieve().then((cart) => {
      console.log(cart);
      this.quantity = cart.total_items;
      this.checkoutLink = cart.hosted_checkout_url
    });
},
```

We'll pass this info to our `<Layout />` component (just because I want to, no particular reason) where our `<Cart />` component is. So our `<Layout />` component would look like this

```js
<template>
  <div class="layout">
    <header class="header">
      <strong>
        <g-link to="/">{{ $static.metadata.siteName }}</g-link>
      </strong>
      <nav class="flex align-center">
        <g-link class="nav__link" to="/">Home</g-link>
        <Cart :quantity="quantity" :checkout-link="checkoutLink" />
      </nav>
    </header>
    <slot />
  </div>
</template>

<static-query>
query {
  metadata {
    siteName
  }
}
</static-query>

<script>
import Cart from "../components/Cart";

export default {
  name: "Layout",
  components: { Cart },
  props: {
    quantity: Number,
    checkoutLink: String,
  },
};
</script>

<style>
body {
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  margin: 0;
  padding: 0;
  line-height: 1.5;
}

.layout {
  max-width: 760px;
  margin: 2em auto;
  padding-left: 20px;
  padding-right: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  height: 80px;
}

.nav__link {
  margin-left: 20px;
}
</style>
```

Since we already have `Commerce.js` SDK initialized, we can add our `addToCart` method for our `<Product />` component We'll keep it in `Index.vue` though, and pass it down to Product component as a prop.

```js
methods: {
    addToCart(id) {
      commerce.cart
        .add(id, 1)
        .then((response) => {
          console.log(response);
          this.quantity = response.cart.total_items;
        })
        .catch((e) => console.log(e));
    },
},
```

*Note: I’m being very lazy here and doing console.logs, when in real e-com store we should probably setup something like [vue-notifications](https://www.npmjs.com/package/vue-notification) to have a better feedback for the user.*

Let's not forget the single `CommercejsProducts.vue` template. Together with styling and query, it'll look like this.

```js
<template>
  <Layout :quantity="quantity" :checkoutLink="checkoutLink">
    <div class="w-full py-8 px-6 bg-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 rounded shadow-lg">
      <div class="col-span-1">
        <img :src="this.$page.commercejsProducts.media.source" />
      </div>
      <div class="col-span-1 md:col-span-2 relative">
        <div class="flex justify-between mb-8">
          <div>
            <div
              class="text-2xl font-bold text-gray-800"
              v-html="this.$page.commercejsProducts.name"
            ></div>
            <div
              class="text-gray-700 text-sm italic"
              v-html="this.$page.commercejsProducts.id"
            ></div>
          </div>
          <div
            class="text-gray-700 text-lg"
            v-html="this.$page.commercejsProducts.price.formatted_with_code"
          ></div>
        </div>
        <div class="font-semibold text-gray-800 mb-2">Description</div>
        <div
          class="mb-16 md:mb-6"
          v-html="this.$page.commercejsProducts.description"
        ></div>
        <button
          class="text-sm bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 mx-auto rounded absolute right-0 bottom-0 w-full"
          @click="onAddToBasket($page.commercejsProducts.id)"
        >
          Add to basket
        </button>
      </div>
    </div>
  </Layout>
</template>

<page-query>
query ($id: ID!) {
  commercejsProducts(id: $id) {
    price {
      formatted_with_code
    }
    name
    description
    id
    media {
      source
    }
  }
}
</page-query>

<script>
import commerce from "../utils";

export default {
  name: "Product",
  data: () => ({
    quantity: 0,
    checkoutLink: null,
  }),
  mounted() {
    commerce.cart.retrieve().then((cart) => {
      console.log(cart);
      this.quantity = cart.total_items;
      this.checkoutLink = cart.hosted_checkout_url;
    });
  },
  methods: {
    onAddToBasket(id) {
      commerce.cart
        .add(id, 1)
        .then((response) => {
          console.log(response);
          this.quantity = response.cart.total_items;
        })
        .catch((e) => console.log(e));
    },
  },
};
</script>
```

*Note: I'm copy/pasting `onAddToBasket` method, but you can probably abstract it into a util function and import and reuse it.*

## Checkout

To save some time I’m going to use a `hosted_checkout_link` to finish the checkout process. (PS Did you know Commerce.js had a hosted checkout page? I just learned it now!). We get it from the `cart` object in our `mounted()` method together with the quantity.

Getting ahead of myself, I've already added that link to the `<Cart />` component named `checkoutLink`. So now, when you click on a cart icon, it opens a new tab for a hosted checkout. After filling in all the fields and submitting the form, we can return to our site, refresh, and we'll have 0 items in a basket. Magic! 

## Deploy

Deploying is rather simple. We just need push this code to any git repo. Then link that repo in our Vercel admin area, and deploy from there. Vercel even recognizes gridsome and applies predefined build script, which you can always overwrite if you need. 

And we'll have our shop online at

## Last few words

All of this is hosted on Vercel for free (for small projects), gives us a lot of freedom to do any checkout experience and any other features we want. For example, we can:

- create our own checkout form
- create a custom thank you page
- create a custom lambda function to sync user data/info through API with other services, like a CRM, Loyalty Program/System after the user checkout.

And if we're updating products in commerce.js admin area, we simply need a webhook to tell Vercel to rebuild the site everytime that happens.

The final project is my [GitHub repo](https://github.com/snikidev/blog-static-eshop).