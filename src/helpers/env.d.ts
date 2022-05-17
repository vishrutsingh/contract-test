declare global {
    namespace NodeJS {
        interface ProcessEnv {
            HOME: "./";
        }
    }
}

export { }