export type ShopItem = {
    name: string
    id: string
    typeID: string
    price: number
}
export type Shop = {
    name: string
    items: ShopItem[]
}
export type item = {
    name: string
    id: string
    typeID: string
    price: number
    quantity: number
    durability: number
}