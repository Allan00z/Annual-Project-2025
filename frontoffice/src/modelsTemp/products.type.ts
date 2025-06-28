type Product = {
    name: string,
    image: string,
    price: number,
    stock: number
}

type CartProduct = {
    product: Product,
    quantity: number
}