<template>
  <div class="max-w-sm rounded overflow-hidden shadow-lg relative">
    <a :href="`/products/${id}`">
      <img class="w-full" :src="image" :alt="name" />
    </a>
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
