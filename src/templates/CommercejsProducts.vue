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
