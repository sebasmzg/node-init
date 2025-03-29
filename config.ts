export const config = {
    jwtsecret: process.env.JWT_SECRET as string || "My_Secret_Key",
    port: process.env.PORT as string || "4000",
}

export default config;