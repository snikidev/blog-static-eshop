<template>
  <Layout :quantity="cart.total_items">
    <h1 class="text-lg font-semibold mb-8 text-gray-700">Checkout</h1>
    <div>

    </div>
  </Layout>
</template>

<script>
import commerce from "../utils";

export default {
  metaInfo: {
    title: "Hello, world!",
  },
  data: () => ({
    cart: {
      total_items: 0,
    },
    checkoutToken: null,
    form: {
      customer: {
        firstName: "Jane",
        lastName: "Doe",
        email: "janedoe@email.com",
      },
      shipping: {
        name: "Jane Doe",
        street: "123 Fake St",
        city: "San Francisco",
        stateProvince: "CA",
        postalZipCode: "94107",
        country: "US",
      },
      fulfillment: {
        shippingOption: "",
      },
      payment: {
        cardNum: "4242 4242 4242 4242",
        expMonth: "01",
        expYear: "2023",
        ccv: "123",
        billingPostalZipCode: "94107",
      },
    },
  }),
  async mounted() {
    try {
      this.cart = await commerce.cart.retrieve();
      this.checkoutToken = await commerce.checkout.generateToken(this.cart.id, {
        type: "cart",
      });
      console.log(this.cart)
    } catch (e) {
      console.log(e);
    }
  },
  methods: {
    placeOrder() {},
  },
};
</script>
