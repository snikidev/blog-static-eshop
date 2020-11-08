<template>
  <Layout :quantity="quantity" :checkout-link="checkoutLink">
    <h1 class="text-lg font-semibold mb-8 text-gray-700">All Products</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
  mounted() {
    commerce.cart.retrieve().then((cart) => {
      console.log(cart);
      this.quantity = cart.total_items;
      this.checkoutLink = cart.hosted_checkout_url
    });
  },
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
};
</script>
